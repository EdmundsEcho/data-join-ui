// src/components/Workbench/components/EtlUnit/ValueGridWorkbench.jsx

import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import clsx from 'clsx';
import invariant from 'invariant';

// api
import { fetchLevels as fetchLevelsInner } from '../../../../services/api';
import LevelsContextProvider, {
  CONTEXTS,
} from '../../../../contexts/LevelsDataContext';

// import { SearchField } from './ValueSearchToolbar';
// ☎️  Update state
import { /* debug */ useTraceUpdate } from '../../../../constants/variables';
import { InputTypeError } from '../../../../lib/LuciErrors';
import useAbortController from '../../../../../hooks/use-abort-controller';

import ValueGridCore, {
  filterOperators,
  ROW_HEIGHT,
  SERVICES,
} from '../../../shared/ValueGridCore';
import { PURPOSE_TYPES } from '../../../../lib/sum-types';

//------------------------------------------------------------------------------
const DEBUG = true;
//-----------------------------------------------------------------------------
const PAGE_SIZE =
  parseInt(process.env.REACT_APP_DEFAULT_VALUE_GRID_PAGE_SIZE, 10) || 200;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const limitGridHeight = 9 * ROW_HEIGHT;

const columns = [
  {
    field: 'id',
    headerName: 'ID',
    headerClassName: 'Luci-DataGrid-workbench--header',
    hide: true,
  },
  {
    field: 'level',
    headerName: 'Level',
    cellClassName: 'Luci-DataGrid-workbench--level',
    headerClassName: 'Luci-DataGrid-workbench--header',
    sortable: true,
    filterOperators,
    flex: 0.5,
    disableColumnMenu: true,
    hide: false,
  },
];
const sortModel = [
  {
    field: 'level',
    sort: 'asc',
  },
];

const rowToIdFn = (rowModel) => rowModel.id;

//-------------------------------------------------------------------------------
// api data -> grid
//
// 🔖 Calls the api directly
//    (i.e., without generating a redux action
//           thereby does not invoke middleware, nor reducers)
//
const fetchLevels = (projectId, signal) => (request) => {
  return fetchLevelsInner({ projectId, signal, request });
};
const parseResponse = (response) => response.data.levels;

//------------------------------------------------------------------------------
// The main component
//------------------------------------------------------------------------------
/**
 *
 * Provide a view of a Quality or Component's levels
 *
 * 👉 nodeId,
 * 👉 identifier
 * 👉 measurementType when component
 *
 * services
 *
 *   ✅ does not store values, only records the "net request"
 *
 *   ✅ "on-demand" view as the user scrolls down
 *
 *   ✅ filter levels
 *
 * Formatting: See the theme overrides under `MuiDataGrid` & `EtlUnit-ValueGrid`
 * Pagination: use-pagination
 *
 * 📖 What the user has selected: selectValuesFromNode
 *    (node ~ tree context and not the pagination context)
 *
 * 📖 A paged/scrolling view of the levels pulled from obs/mms graphql
 *
 * User input: request true/false
 *
 * Content is one of two types
 * - Quality (intValues or txtValues)
 * - Component (intValues or txtValues)
 *
 * @component
 *
 */
function ValueGridWorkbench(props) {
  /* eslint-disable react/jsx-props-no-spreading */

  const { identifier, type, purpose, measurementType } = props;

  invariant(
    purpose === PURPOSE_TYPES.QUALITY || typeof measurementType !== 'undefined',
    `Failed invariant purpose: ${purpose} with measurementType: ${measurementType}`,
  );

  if (!['txtValues', 'intValues'].includes(type)) {
    throw new InputTypeError(`EtlUnitValueGrid received the wrong data type: ${type}`);
  }

  useTraceUpdate(props);

  // augment the fetch request
  const { projectId } = useParams();
  const abortController = useAbortController();

  // retrieve all of the levels (starting point for filtering)
  // :: filter used in the datagrid
  const filter = useMemo(() => {
    return purpose === PURPOSE_TYPES.QUALITY
      ? { qualityName: identifier }
      : { componentName: identifier, measurementType };
  }, [identifier, purpose, measurementType]);

  return (
    <ValueGridCore
      className={clsx('Luci-DataGrid-etlUnits', type, identifier)}
      columns={columns}
      checkboxSelection
      sortModel={sortModel}
      // 📖
      identifier={identifier}
      purpose={purpose}
      filter={filter}
      fetchFn={fetchLevels(projectId, abortController.signal)}
      abortController={abortController}
      normalizer={parseResponse}
      edgeToGridRowFn={edgeToGridRowFn}
      // selection model related
      rowToIdFn={rowToIdFn}
      limitGridHeight={limitGridHeight}
      // version of the grid
      service={SERVICES.GRAPHQL}
      pageSize={PAGE_SIZE}
      rowHeight={25}
      gridHeightAdjustment={10}
      columnHeaderHeight={45}
      DEBUG={DEBUG}
    />
  );
}

ValueGridWorkbench.whyDidYouRender = true;
ValueGridWorkbench.propTypes = {
  identifier: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['txtValues', 'intValues']).isRequired,
  measurementType: PropTypes.string,
  purpose: PropTypes.oneOf([PURPOSE_TYPES.MCOMP, PURPOSE_TYPES.QUALITY]).isRequired,
};

ValueGridWorkbench.defaultProps = {
  measurementType: undefined,
};

//-------------------------------------------------------------------------------
/**
 *
 * depends on grid-specific columns configuration
 *
 * @function
 * @param {Object} edge
 * @return {GridRowModel} grid row model
 *
 */
function edgeToGridRowFn(edge) {
  return {
    id: edge.node.level,
    count: 0,
    level: edge.node.level,
    newSymbol: edge?.newSymbol ?? '',
  };
}

//------------------------------------------------------------------------------
/**
 * Augment the context with the getFieldValue and other values derived
 * from props.
 *
 * @component
 * props available in getFieldValue
 *    measurementType,
 *    identifier,
 *    valueIdx,
 *    nodeId,
 *    purpose,
 */
export default function ValueGridWorkbenchWithContext(props) {
  const { purpose, tag: type, valueIdx } = props;
  if (purpose === PURPOSE_TYPES.MCOMP) {
    invariant(
      typeof valueIdx !== 'undefined',
      'ValueGridWorkbenchWithContext: valueIdx must be specified for components',
    );
  }
  const getFieldValue = useCallback(
    (key) => {
      const values = {
        ...props,
        type,
      };
      return values?.[key] ?? undefined;
    },
    [props, type],
  );
  console.debug('🦀 ValueGridWorkbenchWithContext: ', valueIdx);
  return (
    <LevelsContextProvider
      context={CONTEXTS.WORKBENCH}
      purpose={purpose}
      fieldType='etl-field'
      getFieldValue={getFieldValue}>
      <ValueGridWorkbench {...props} />
    </LevelsContextProvider>
  );
}
// set the PropTypes for ValueGridWorkbenchWithContext
ValueGridWorkbenchWithContext.propTypes = {
  nodeId: PropTypes.number.isRequired,
  identifier: PropTypes.string.isRequired,
  valueIdx: PropTypes.number, // not required for quality
  tag: PropTypes.oneOf(['txtValues', 'intValues']).isRequired,
  measurementType: PropTypes.string,
  purpose: PropTypes.oneOf([PURPOSE_TYPES.MCOMP, PURPOSE_TYPES.QUALITY]).isRequired,
};
// set the default props for ValueGridWorkbenchWithContext
ValueGridWorkbenchWithContext.defaultProps = {
  measurementType: undefined,
  valueIdx: undefined,
};
