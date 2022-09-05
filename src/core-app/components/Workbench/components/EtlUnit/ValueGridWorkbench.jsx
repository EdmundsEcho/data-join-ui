// src/components/Workbench/components/EtlUnit/ValueGridWorkbench.jsx

import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import clsx from 'clsx';

// api
import { fetchLevels as fetchLevelsInner } from '../../../../services/api';

// import { SearchField } from './ValueSearchToolbar';
// ☎️  Update state
import {
  toggleValue,
  setCompValues,
} from '../../../../ducks/actions/workbench.actions';
import { /* debug */ useTraceUpdate } from '../../../../constants/variables';
import {
  getIsCompReducedMap,
  getSelectionModel,
} from '../../../../ducks/rootSelectors';
import { InputTypeError } from '../../../../lib/LuciErrors';

// import { ToolContext } from './ToolContext';
import ValueGridCore, { filterOperators } from '../../../shared/ValueGridCore';
import { PURPOSE_TYPES } from '../../../../lib/sum-types';

//------------------------------------------------------------------------------
const DEBUG = false;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const columns = [
  { field: 'id', headerName: 'ID', hide: true },
  {
    field: 'level',
    className: ['level'],
    sortable: true,
    filterOperators,
    flex: 0.5,
    // renderHeader: () => <SearchField />,
  },
];

//-------------------------------------------------------------------------------
// api data -> grid
//
// 🔖 Calls the api directly
//    (i.e., without generating a redux action
//           thereby does not invoke middleware, nor reducers)
//
const fetchLevels = (projectId) => (request) => {
  return fetchLevelsInner({ projectId, ...request });
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
 * Features
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
 * @component
 *
 */
function ValueGridWorkbench(props) {
  /* eslint-disable react/jsx-props-no-spreading */

  const { type, identifier, measurementType, nodeId } = props;

  const { projectId } = useParams();

  if (!['txtValues', 'intValues'].includes(type)) {
    throw new InputTypeError(
      `EtlUnitValueGrid received the wrong data type: ${type}`,
    );
  }

  useTraceUpdate(props);

  const dispatch = useDispatch();

  const PAGE_SIZE = 30;

  // baseline selectAll levels
  const [selectAll, isQuality] = useMemo(() => {
    return typeof measurementType === 'undefined'
      ? [{ qualityName: identifier }, true]
      : [{ componentName: identifier, measurementType }, false];
  }, [identifier, measurementType]);

  const selectionModel = useSelector((state) =>
    getSelectionModel(state, nodeId, identifier),
  );

  const reduced = useSelector((state) =>
    getIsCompReducedMap(state, nodeId, identifier),
  );

  return (
    <ValueGridCore
      className={clsx('EtlUnit-ValueGrid', type)}
      columns={columns}
      // 📖
      identifier={identifier}
      purpose={isQuality ? PURPOSE_TYPES.QUALITY : PURPOSE_TYPES.MCOMP}
      baseSelectAll={selectAll}
      fetchFn={fetchLevels(projectId)}
      normalizer={parseResponse}
      edgeToGridRowFn={edgeToGridRowFn}
      selectionModel={selectionModel}
      reduced={reduced}
      // handlers
      // will recieve column values for the toggled record
      handleToggleValue={({ level, isSelected }) =>
        dispatch(toggleValue(nodeId, level, identifier, isSelected))
      }
      handleSetAllValues={(values) =>
        dispatch(setCompValues(nodeId, identifier, values))
      }
      // version of the grid
      feature='SCROLL'
      checkboxSelection
      pageSize={PAGE_SIZE}
      DEBUG={DEBUG}
    />
  );
}

ValueGridWorkbench.whyDidYouRender = true;
ValueGridWorkbench.propTypes = {
  nodeId: PropTypes.number.isRequired,
  identifier: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['txtValues', 'intValues']).isRequired,
  measurementType: PropTypes.string,
};

ValueGridWorkbench.defaultProps = {
  measurementType: undefined,
};

//-------------------------------------------------------------------------------
/**
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
//
export default ValueGridWorkbench;
