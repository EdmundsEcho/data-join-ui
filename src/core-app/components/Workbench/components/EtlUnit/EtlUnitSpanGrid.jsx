// src/components/Workbench/components/EtlUnit/EtlUnitSpanGrid.jsx

import React, { useCallback } from 'react';
import { PropTypes } from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import Typography from '@mui/material/Typography';

// 📖
import {
  getEtlUnitTimeProp,
  getSpanLevelsFromNode,
} from '../../../../ducks/rootSelectors';

// ☎️
import {
  setSpanValue,
  toggleValue,
} from '../../../../ducks/actions/workbench.actions';

import SpanInput from '../../../shared/SpanInput';

/* eslint-disable no-console */

/**
 * Displays either a singleton or a group of span values.
 * The collection shares the timeProp for all span values.
 *
 * ⚠️  Retrieving the time prop requires visiting a different state
 *    fragment and "piecing-together" the required lookup values.
 *
 * @component
 *
 */
const EtlUnitSpanGrid = ({ nodeId }) => {
  const dispatch = useDispatch();
  /*

  const mspanName = useSelector((state) =>
    selectEtlUnit(state, mea.measurementType),
  );
  */

  // 📖
  const { displayName: etlUnitName, value: spanData } = useSelector((state) =>
    getSpanLevelsFromNode(state, nodeId),
  );
  // retrieve the timeProp to enable data format based on relative data
  const { time: timeProp, formatOut } = useSelector((state) =>
    getEtlUnitTimeProp(state, etlUnitName),
  );

  // from Quality: (valueIdx)
  // from Component: (valueIdx, componentName)
  const handleToggleValue = useCallback(
    (valueIdx) => () => {
      dispatch(toggleValue(nodeId, valueIdx, 'time'));
    },
    [dispatch, nodeId],
  );

  const handleUpdate = useCallback(
    (spanId, newSpan) => {
      dispatch(
        setSpanValue(
          nodeId,
          'time', // 🦀
          spanId,
          newSpan,
        ),
      );
    },
    [dispatch, nodeId],
  );

  const displayType =
    Object.keys(spanData.values).length > 1 ? 'toggle' : 'icon';

  const ready = [timeProp, spanData].every(
    (data) => typeof data !== 'undefined',
  );

  return !ready ? (
    <Typography>...loading</Typography>
  ) : (
    Object.entries(spanData.values).map(([spanId, spanObject]) => {
      const { value: span, request } = spanObject;
      return (
        <SpanInput
          key={`SpanLevel-${spanId}`}
          span={span}
          timeProp={timeProp}
          formatOut={formatOut}
          handleUpdate={(newSpan) => handleUpdate(spanId, newSpan)}
          handleToggleValue={handleToggleValue(spanId)}
          displayType={displayType}
          request={request}
        />
      );
    })
  );
};

EtlUnitSpanGrid.propTypes = {
  nodeId: PropTypes.number.isRequired,
};

export default EtlUnitSpanGrid;
