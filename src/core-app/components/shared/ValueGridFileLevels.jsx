// src/components/Workbench/components/shared/ValueGridFileLevels.jsx
/**
 * This is one of 4 views of the level data.
 *  1. quality | mcomp | mspan pre-time-config: this view [[level, count]]
 *  2. mvalue: SummaryView for mvalue
 *  3. mspan post-time-config: mspan chip view (time ranges)
 *  4. subject: Only reports on the number of null values
 *
 * Level data is relevant in several contexts.
 *  1. file field (headerView), source: [file-field] (singleton entry)
 *  2. etlField (post pivot, aka stacking): [file-field] (entry for every source)
 *  3. workbench (post production of the project-warehouse): graphql
 *  4. matrix: matrix file
 *
 * ETL: The etlField view abstracts over sources.  So we only care about the field
 * name. There are two types of etlFields in regards to source of data
 *
 *   * sources only
 *   * sources + map-files, a derived data source where the field values (levels)
 *     are derived from the filenames found in sources. When extracting the data
 *     we introduce a IMPLIED_OTHER source to map the extraction process. The
 *     name is to distinguish from IMPLIED_MVALUE.
 *
 * FILE | WIDE | IMPLIED: The file field view abstracts over the shape of the sources.  So it unifies
 * RAW, WIDE, and IMPLIED sources.  However, it hosts the unification in
 * different ways: A configuration for the WIDE and IMPLIED.  So sources of
 * configurations are as follows.
 *
 *   * RAW: headerViews[filename].field[headerIdx]
 *   * WIDE: headerViews[filename].wideToLongFields.fields[name]
 *   * IMPLIED: headerViews[filename][implied-mvalue].field
 *
 * We don't see IMPLIED in the levels data in either of the file field or etl
 * views because the data is synthetic and displayed in a SummaryView.
 *
 * 🚧 In the future it may be worthwhile to have the project-warehouse
 *    host levels in the levels-service cache.  Right now the levels are
 *    materialized in the warehouse as part of the graphql configuration.
 *
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useSelector } from 'react-redux';

import Typography from '@mui/material/Typography';

// Levels store lookup context
import LevelsContextProvider, {
  CONTEXTS,
  useLevelsApiContext,
  useLevelsDataContext,
} from '../../contexts/LevelsDataContext';
// 📡 Note: does not use actions (levels is outside of redux scope)
import { fetchFileLevels as fetchLevelsInner } from '../../services/api';

import { fileLevelsRequest } from '../../lib/filesToEtlUnits/levels-request';
import { InvalidStateError } from '../../lib/LuciErrors';
import { FIELD_TYPES } from '../../lib/sum-types';

import { fieldSelectorCreatorCfg } from '../../ducks/selectors/fieldSelectorCreator';
import { mapSymbolsSelectorCreator } from '../../ducks/mapSymbol.selectors';
import ValueGridCore, { filterOperators, ROW_HEIGHT, SERVICES } from './ValueGridCore';
import useAbortController from '../../../hooks/use-abort-controller';

//------------------------------------------------------------------------------
//
const DEBUG = process.env.REACT_APP_DEBUG_LEVELS === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//-----------------------------------------------------------------------------
const PAGE_SIZE =
  parseInt(process.env.REACT_APP_DEFAULT_VALUE_GRID_PAGE_SIZE, 10) || 90;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//
// ⚙️  for the value grid
//
const limitGridHeight = 9 * ROW_HEIGHT;
//
const gridOptions = {
  disableSelectionOnClick: true,
  columnHeaderHeight: 45,
};
// export for debugging
export const columns = [
  { field: 'id', headerName: 'ID', hide: true },
  {
    field: 'level',
    headerName: 'Level',
    cellClassName: clsx('Luci-DataGrid-cell', 'level'),
    sortable: true,
    filterOperators,
    flex: 1,
    disableColumnMenu: true,
    hide: false,
  },
  {
    field: 'newSymbol',
    headerName: 'Change to...',
    cellClassName: clsx('Luci-DataGrid-cell', 'newLevel'),
    hide: false,
  },
  {
    field: 'count',
    headerName: 'Count',
    cellClassName: clsx('Luci-DataGrid-cell', 'count'),
    type: 'number',
    flex: 0.7,
    disableColumnMenu: true,
    hide: false,
  },
];
const sortModel = [
  {
    field: 'count',
    sort: 'desc',
  },
];
/**
 * Example of a filterModel
const filterModel = {
  items: [
    {
      field: 'level',
      operator: 'contains',
      value: 'Intermediate',
    },
    {
      field: 'count',
      operator: '>',
      value: 10,
    },
  ],
  logicOperator: 'and', // This means both conditions must be true for a row to be included
}; */
//-------------------------------------------------------------------------------
/**
 * Must align with the columns configuration
 *
 * @function
 * @param {Object} edge
 * @return {GridRowModel} grid row model
 *
 */
const edgeToGridRowFn = (edge) => ({
  id: edge.node.level,
  level: edge.node.level,
  count: edge.node.count,
  newSymbol: edge?.newSymbol ?? '',
});
/**
 * Used to count unique row values (and elsewhere, to build the selection model)
 */
const edgeToGridRowIdFn = (edge) => edge.node.level;
//-------------------------------------------------------------------------------
// api data -> grid
//
// 🔖 Calls the api directly
//    (i.e., without generating a redux action
//           thereby does not invoke middleware, nor reducers)
//
const fetchLevels =
  (projectId, signal) =>
  ({ filter, ...rest }) => {
    if (DEBUG) {
      console.debug('📥 calling fetchLevels: projectId, signal, filter, rest');
      console.debug(projectId, signal, filter, rest);
    }
    return fetchLevelsInner({ projectId, signal, ...filter, ...rest });
  };

// 💥 coordinate with headerview.middelware
export const parseRespData = (data) => data.data;

//-------------------------------------------------------------------------------
// When data :: derivedField
//
//     levels -> grid
//
const rowFromLevel = ([value, count]) => ({
  id: value,
  level: value,
  count,
  newSymbol: '',
});
/**
 * Local getter for the totalRowCount. Returns an optional value.
 * @function
 * @param {string} FIELD_TYPES.value
 * @param {function} getFieldValue
 * @returns {number|undefined}
 * @private
 */
const maybeTotalRowCountValue = ({ fieldType, getFieldValue: getValue }) => {
  switch (fieldType) {
    // headerView
    case FIELD_TYPES.FILE:
    case FIELD_TYPES.WIDE:
      return getValue('nlevels');

    // etlView
    case FIELD_TYPES.ETL:
      return getValue('sources').length === 1
        ? getValue('sources')[0].nlevels
        : undefined;

    default:
      throw new InvalidStateError(`Unsupported fieldType: ${fieldType}`);
  }
};
//
//------------------------------------------------------------------------------
// 📌 The main component
//------------------------------------------------------------------------------
/**
 *
 * @component
 *
 */
const ValueGridFileLevels = () => {
  const { fieldType } = useLevelsDataContext();
  const { getFieldValue: getValue } = useLevelsApiContext();
  //
  // Reset the filter value when the params for the levels request changes.
  //
  // baseline filter to retrieve values
  const filter = fileLevelsRequest(getValue, fieldType, false /* includeMapSymbols */);
  console.debug('filter', filter);

  const mapSymbols = useSelector(
    mapSymbolsSelectorCreator({ fieldType, getFieldValue: getValue }),
  );
  console.debug('mapSymbols', mapSymbols);

  // inject into the fetch function
  const { projectId } = useParams();
  const abortController = useAbortController();

  //
  // group-by-file | wide-to-long-field
  //
  // ⬜ does not consider wide-to-long data in the ETL context
  // ... more generally, unify the wide etl view with what it
  //     the data presents when stacked with RAW
  //
  const hasGroupByFileValues = getValue('map-files')?.arrows ?? false;
  const maybeTotalRowCount = maybeTotalRowCountValue({
    fieldType,
    getFieldValue: getValue,
  });

  // two paths to being a derived field
  const isDerivedField = hasGroupByFileValues || fieldType === FIELD_TYPES.WIDE;

  const derivedRowsWithTotal = isDerivedField
    ? {
        totalCount: getValue('levels').length,
        rows: getValue('levels').map(rowFromLevel),
      }
    : undefined;

  if (derivedRowsWithTotal) {
    console.debug('📥 DERIVED data', derivedRowsWithTotal.rows);
  }

  // 📖 both FILE and WIDE use the field-alias prop
  const identifier =
    fieldType === FIELD_TYPES.ETL ? getValue('name') : getValue('field-alias');

  return (
    <div className='stack'>
      <Title fieldType={fieldType} />
      <ValueGridCore
        className={clsx('Luci-DataGrid-fileLevels', identifier)}
        columns={columns}
        sortModel={sortModel}
        mapSymbols={mapSymbols}
        // when data is a derivedField 📖
        derivedDataRows={derivedRowsWithTotal ? derivedRowsWithTotal.rows : undefined}
        // derived and when in headerView
        rowCountTotal={
          derivedRowsWithTotal ? derivedRowsWithTotal.totalRows : maybeTotalRowCount
        }
        identifier={identifier}
        purpose={getValue('purpose')}
        filter={filter} // 📖
        fetchFn={fetchLevels(projectId, abortController.signal)}
        abortController={abortController}
        limitGridHeight={limitGridHeight}
        normalizer={parseRespData}
        edgeToGridRowFn={edgeToGridRowFn}
        edgeToGridRowIdFn={edgeToGridRowIdFn}
        // version of the grid
        service={SERVICES.LEVELS}
        checkboxSelection={false}
        pageSize={PAGE_SIZE}
        DEBUG={DEBUG}
        {...gridOptions}
      />
    </div>
  );
};

ValueGridFileLevels.propTypes = {};

ValueGridFileLevels.defaultProps = {};

function Title({ fieldType }) {
  return (
    <div className={clsx('Luci-DataGrid-header', fieldType)}>
      <Typography className={clsx('Luci-DataGrid-title')} variant='h6'>
        Frequency count
      </Typography>
    </div>
  );
}
Title.propTypes = {
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
};

// utility for ValueGridFileLevels
const createSelectorWithProps = (selector, selectorProps) => {
  return (state) => {
    return selector(state, ...selectorProps);
  };
};

export default function ValueGridFileLevelsWithContext({ fieldType, getValue }) {
  //
  // pull data from redux to generate the levels request using a mapped
  // selector check for wideToLongFields
  //
  const field = fieldSelectorCreatorCfg(fieldType, getValue);
  const fieldData = useSelector(
    createSelectorWithProps(field.selector, field.selectorProps),
  );
  return (
    fieldData && (
      <LevelsContextProvider
        context={
          fieldType === FIELD_TYPES.ETL ? CONTEXTS.ETL_UNIT : CONTEXTS.HEADER_VIEW
        }
        purpose={getValue('purpose')}
        getFieldValue={(prop) => fieldData[prop]}
        fieldType={fieldType}
      >
        <ValueGridFileLevels />
      </LevelsContextProvider>
    )
  );
}
ValueGridFileLevelsWithContext.propTypes = {
  getValue: PropTypes.func.isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
};
