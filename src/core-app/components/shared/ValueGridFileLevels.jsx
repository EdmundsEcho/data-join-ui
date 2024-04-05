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
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useSelector } from 'react-redux';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// Levels store lookup context
import LevelsContextProvider, {
  CONTEXTS,
  useLevelsApiContext,
} from '../../contexts/LevelsDataContext';
// 📡 Note: does not use actions (levels is outside of redux scope)
import { fetchFileLevels as fetchLevelsInner } from '../../services/api';

import { fileLevelsRequest } from '../../lib/filesToEtlUnits/levels-request';
import { InvalidStateError } from '../../lib/LuciErrors';
import { FIELD_TYPES } from '../../lib/sum-types';

import {
  // getSelectionModelFile,
  getSelectionModelEtl,
  selectFieldInHeader as selectorFileField,
  selectEtlField as selectorEtlField,
} from '../../ducks/rootSelectors';
import ValueGridCore, { filterOperators, ROW_HEIGHT } from './ValueGridCore';
import useAbortController from '../../../hooks/use-abort-controller';

// import fieldData_ from './temp_field.json';
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
};
// export for debugging
export const columns = [
  { field: 'id', headerName: 'ID', hide: true },
  {
    field: 'level',
    headerName: 'Level',
    cellClassName: clsx('Luci-ValueGrid-cell', 'level'),
    sortable: true,
    filterOperators,
    flex: 1,
    disableColumnMenu: true,
    hide: false,
  },
  {
    field: 'newSymbol',
    headerName: 'Change to...',
    cellClassName: clsx('Luci-ValueGrid-cell', 'newLevel'),
    hide: true,
  },
  {
    field: 'count',
    headerName: 'Count',
    cellClassName: clsx('Luci-ValueGrid-cell', 'count'),
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
//-------------------------------------------------------------------------------
/**
 *
 * @function
 * @param {Object} edge
 * @return {GridRowModel} grid row model
 *
 */
export const edgeToGridRowFn = (edge) => ({
  id: edge.node.level,
  level: edge.node.level,
  count: edge.node.count,
  newSymbol: edge?.newSymbol ?? '',
});
export const edgeToIdFn = (edge) => edge.node.level;
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
      console.debug(
        '📥 calling fetchLevels: projectId, signal, filter, rest',
        projectId,
        signal,
        filter,
        rest,
      );
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
 * Local selector for the "map-symbols" prop.  map-symbols is used to
 * to scrub levels data.
 *
 * Returns a store selector. Not all branches depend on state (i.e. are
 * constant functions).
 *
 *
 * @param {FIELD_TYPES} fieldType
 * @param {function} getFieldValue
 * @returns {Object} selectionModel
 * @private
 */
const mapSymbolsSelectorCreator = ({ fieldType, getFieldValue: getValue }) => {
  return (state) => {
    switch (fieldType) {
      case FIELD_TYPES.FILE:
        // field.map-symbols
        return {
          totalCount: getValue('nlevels'),
          selectionModel: {
            __ALL__: {
              value: '__ALL__',
              request: true,
            },
          },
          type: 'selectionModel',
        };

      case FIELD_TYPES.ETL:
        // etlField.map-symbols (recall: etlField is information driven, not
        // source driven abstraction)
        return getSelectionModelEtl(state, getValue('name'));

      case FIELD_TYPES.WIDE:
        return {
          totalCount: getValue('levels').length,
          selectionModel: getValue('levels'),
          type: 'levels',
        };

      default:
        throw new InvalidStateError(`Unsupported fieldType: ${fieldType}`);
    }
  };
};
/**
 * Local selector for the "selectionModel".  It unifies reading data from the
 * store, from the backend levels.
 *
 * Returns a store selector.
 *
 * @param {FIELD_TYPES} fieldType
 * @param {function} getFieldValue
 * @returns {Object} selectionModel
 * @private
 */
const selectionModelSelectorCreator = ({ fieldType, getFieldValue: getValue }) => {
  return (state) => {
    switch (fieldType) {
      case FIELD_TYPES.FILE:
        return {
          totalCount: getValue('nlevels'),
          selectionModel: {
            __ALL__: {
              value: '__ALL__',
              request: true,
            },
          },
          type: 'selectionModel',
        };

      case FIELD_TYPES.ETL:
        return getSelectionModelEtl(state, getValue('name'));

      case FIELD_TYPES.WIDE:
        return {
          totalCount: getValue('levels').length,
          selectionModel: getValue('levels'),
          type: 'levels',
        };

      default:
        throw new InvalidStateError(`Unsupported fieldType: ${fieldType}`);
    }
  };
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
  const { getFieldValue: getValue, fieldType } = useLevelsApiContext();
  //
  // baseline selectAll levels
  //
  const selectAll = useMemo(
    () => fileLevelsRequest(getValue, fieldType),
    [fieldType, getValue],
  );

  const { projectId } = useParams();
  const abortController = useAbortController();

  // source of the selected levels data
  const selectionModel = useSelector(
    selectionModelSelectorCreator({ fieldType, getFieldValue: getValue }),
  );

  // source of the selected levels data
  const mapSymbols = useSelector(
    mapSymbolsSelectorCreator({ fieldType, getFieldValue: getValue }),
  );
  //
  // group-by-file | wide-to-long-field
  //
  // ⬜ does not consider wide-to-long data in the ETL context
  // ... more generally, unify the wide etl view with what it
  //     the data presents when stacked with RAW
  //
  const hasGroupByFileValues = getValue('map-files')?.arrows ?? false;

  // two paths to being a derived field
  let isDerivedField = hasGroupByFileValues || fieldType === FIELD_TYPES.WIDE;

  // only derived fields have
  isDerivedField = selectionModel.type === 'levels';

  return (
    <div className='stack'>
      <Title fieldType={fieldType} />
      <ValueGridCore
        className='Luci-ValueGrid-fileLevels'
        columns={columns}
        sortModel={sortModel}
        // 📖 both FILE and WIDE use the field-alias prop
        identifier={
          fieldType === FIELD_TYPES.ETL ? getValue('name') : getValue('field-alias')
        }
        purpose={getValue('purpose')}
        baseSelectAll={selectAll}
        fetchFn={fetchLevels(projectId, abortController.signal)}
        abortController={abortController}
        limitGridHeight={limitGridHeight}
        normalizer={parseRespData}
        edgeToGridRowFn={edgeToGridRowFn}
        edgeToIdFn={edgeToIdFn}
        // required to determine the height of the grid
        selectionModel={selectionModel}
        // version of the grid
        feature='LIMIT'
        checkboxSelection={false}
        pageSize={PAGE_SIZE}
        // when data is a derivedField 📖
        // 🦀 weird reference to the selectionModel
        derivedDataRows={
          isDerivedField ? selectionModel.selectionModel.map(rowFromLevel) : undefined
        }
        DEBUG={DEBUG}
        {...gridOptions}
      />
    </div>
  );
};

// ValueGridFileLevels.whyDidYouRender = true;
ValueGridFileLevels.propTypes = {
  // getValue: PropTypes.func.isRequired,
  // fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
};

ValueGridFileLevels.defaultProps = {};

function Title({ fieldType }) {
  return (
    <Grid container className={clsx('Luci-ValueGrid-header', fieldType)}>
      <Grid item>
        <Typography className={clsx('Luci-ValueGrid-title')} variant='h6'>
          Frequency count
        </Typography>
      </Grid>
    </Grid>
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
  // pull data from redux to generate the levels request using a mapped selector
  // check for wideToLongFields
  let field;
  switch (fieldType) {
    case FIELD_TYPES.ETL:
      field = {
        selector: selectorEtlField,
        selectorProps: [getValue('name')],
      };
      break;

    case FIELD_TYPES.FILE:
      field = {
        selector: selectorFileField,
        selectorProps: [getValue('filename'), getValue('header-idx')],
      };
      break;

    case FIELD_TYPES.WIDE:
      field = {
        selector: () => {
          return new Proxy(
            {},
            {
              get: (_, prop) => getValue(prop),
            },
          );
        },
        selectorProps: [],
      };
      break;

    default:
      throw new InvalidStateError(`Unsupported fieldType: ${fieldType}`);
  }

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
