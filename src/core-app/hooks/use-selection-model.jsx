import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { PURPOSE_TYPES } from '../lib/sum-types';
import {
  useMachine,
  newSelectionModel,
  mkGridSelectionModelFilter,
  COMPUTATION_TYPES,
  REQUEST_TYPES,
  EVENT_TYPES,
} from '../lib/dataGridSelectionLib';
import { colors } from '../constants/variables';

//-----------------------------------------------------------------------------
const DEBUG_MODULE =
  process.env.REACT_APP_DEBUG_LEVELS === 'true' ||
  process.env.REACT_APP_DEBUG_WORKBENCH === 'true' ||
  process.env.REACT_APP_DEBUG_MATRIX === 'true';
//-----------------------------------------------------------------------------
/* eslint-disable no-console */

export { mkGridSelectionModelFilter };
export { COMPUTATION_TYPES };

const noop = () => {};

export function useSelectionModel({
  selectionModel: initialSelectionModel, // initialization value when defined
  handleSetSelectionModel, // hook will call this to send data to redux
  rowCountTotal: rowCountTotalProp,
  meta,
  turnOn, // todo work out how to minimize footprint when not required.
  DEBUG: debugProp,
}) {
  const DEBUG = debugProp || DEBUG_MODULE;

  // Local state management within the hook
  const [rowCountTotal, setRowCountTotal] = useState(() =>
    initialSelectionModel ? initialSelectionModel.rowCountTotal : rowCountTotalProp,
  );
  // use the prop to set the initial value only.  After that, it becomes a
  // controlled value.
  const hasReadInitialSelectionModel = useRef(false);
  // state machine that manages the configruation of the selection model driven
  // by the user interacting with the data grid.
  const [send, machine] = useMachine({
    handleSetSelectionModel,
    turnOn,
    initialSelectionModel,
  });

  // subscribe to logging when in DEBUG mode
  useEffect(() => {
    if (turnOn && machine) {
      if (DEBUG) {
        const subscription = machine.subscribe((machineState) => {
          console.debug(
            `%cSelection Model:\n${JSON.stringify(
              machineState.context.selectionModel,
              null,
              2,
            )}`,
            colors.lightPurple,
          );
          console.debug(
            `%cState:\n${JSON.stringify(
              machineState?.historyValue?.states?.active?.current,
              null,
              2,
            )}`,
            colors.lightPurple,
          );
        });

        return () => subscription.unsubscribe();
      }
    }
    return () => {};
  }, [turnOn, machine, DEBUG]);

  // ---------------------------------------------------------------------------
  // Initialize the selection model machine once the backend has resolved
  // Read from prop meta to get the computationType.
  //
  // Depends on either having a valid selectionModel (with rowCountTotal), or
  // rowCountTotal so that it can make a new selectionModel.
  //
  // The hook provides a setRowCountTotal function to set the value in the event the
  // initialSelectionModel is missing one.
  //
  useEffect(() => {
    if (turnOn) {
      if (rowCountTotal && !hasReadInitialSelectionModel.current) {
        if (DEBUG) {
          console.debug(
            `🦀 ${
              initialSelectionModel ? 'RESUME' : 'INIT'
            } the selectionModel with rowCountTotal`,
            initialSelectionModel?.rowCountTotal ?? rowCountTotal,
          );
        }
        send({
          // resume when provided a model
          type: initialSelectionModel ? EVENT_TYPES.RESUME : EVENT_TYPES.INIT,
          selectionModel:
            initialSelectionModel ||
            newSelectionModel({
              rowCountTotal,
              purpose: meta.purpose,
              reduced: meta?.reduced,
              ...meta,
            }),
        });
        hasReadInitialSelectionModel.current = true;
      }
    }
    // Note the useMachine hook will properly shut-down the machine
    return () => {
      if (turnOn && DEBUG) {
        console.debug('🟡 Shutting down the selectionModel machine with meta:', meta);
      }
    };
  }, [DEBUG, turnOn, rowCountTotal, send, meta, initialSelectionModel]);

  /**
   * Information flow: from grid to machine
   *
   * 1. set the grid prop value to this function
   * 2. take the data from the grid and forward it to the machine
   *
   *  from the grid onRowClick({
   *    id: rowModel.id,
   *    level: rowModel.level,
   *    isSelected: apiRef.current.isRowSelected(rowModel.id),
   *  });
   */
  const onRowClick = useCallback(
    ({ id, isSelected }) => {
      send({ type: EVENT_TYPES.onRowClick, id, isSelected });
    },
    [send],
  );
  const onToggleAll = useCallback(
    (isSelected) => {
      send({ type: EVENT_TYPES.onToggleAll, isSelected });
    },
    [send],
  );
  const onSetReduceComputation = useCallback(
    (isSelected) => {
      send({ type: EVENT_TYPES.onSetReduceComputation, isSelected });
    },
    [send],
  );

  if (!turnOn) {
    return {
      reset: noop,
      setRowCountTotal: noop,
      onRowClick: noop,
      onToggleAll: noop,
      onSetReduceComputation: noop,
    };
  }
  // Hook api
  return {
    reset: noop,
    setRowCountTotal,
    // assign the grid prop values with these functions
    onRowClick,
    onToggleAll,
    // assign to levels context where hosts reduce/series toggle
    onSetReduceComputation,
  };
}

useSelectionModel.propTypes = {
  meta: PropTypes.shape({
    purpose: PropTypes.oneOf(Object.values(PURPOSE_TYPES)).isRequired,
    reduced: PropTypes.bool.isRequired,
  }),
  turnOn: PropTypes.bool,
  selectionModel: PropTypes.shape({
    rowCountTotal: PropTypes.number.isRequired,
    requestType: PropTypes.oneOf(Object.values(REQUEST_TYPES)).isRequired,
    computationType: PropTypes.oneOf(Object.values(COMPUTATION_TYPES)).isRequired,
    values: PropTypes.shape({
      [PropTypes.string]: PropTypes.string,
    }).isRequired,
  }),
  handleSetSelectionModel: PropTypes.func,
  DEBUG: PropTypes.bool,
};
useSelectionModel.defaultProps = {
  turnOn: false,
  selectionModel: undefined,
  handleSetSelectionModel: undefined,
  DEBUG: false,
};

export default useSelectionModel;
