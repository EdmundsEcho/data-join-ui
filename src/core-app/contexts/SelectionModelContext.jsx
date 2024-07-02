// src/core-app/contexts/SelectionModelContext.jsx
/**
 * Wraps the use-selection-model hook into a context accessbile
 * throught the etlUnit component used in the workbench.
 *
 * see EtlUnitParameter.
 *
 */

import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { getMaybeSelectionModel } from '../ducks/rootSelectors';
import {
  COMPUTATION_TYPES,
  eqSelectionModels,
  useSelectionModel,
} from '../hooks/use-selection-model';
import { setSelectionModel } from '../ducks/actions/workbench.actions';
import { PURPOSE_TYPES } from '../lib/sum-types';
import { colors } from '../constants/variables';

export { COMPUTATION_TYPES };

/*
  const toggleSwitchOn = useCallback(
    (label) => {
      setSwitchOn(label);
      if (typeof switchCallback !== 'undefined') {
        // send true when label is series
        switchCallback(label === 'series');
      }
    },
    [setSwitchOn, switchCallback],
  );
  const [switchOn, setSwitchOn] = usePersistedState(
    `${stateId}|switchOn|ToolContext`,
    dataProps.switchOn ? 'series' : 'rollup',
  );

  const setSwitchCallback = useCallback((newFn) => {
    setSwitchCallback_(() => newFn);
  }, []);
  */
// -----------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_LEVELS === 'true' ||
  process.env.REACT_APP_DEBUG_WORKBENCH === 'true' ||
  process.env.REACT_APP_DEBUG_MATRIX === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

export const SelectionModelDataContext = createContext({});
SelectionModelDataContext.displayName = 'Context - SelectionModelData';

export const SelectionModelApiContext = createContext({});
SelectionModelApiContext.displayName = 'Context - SelectionModelApi';

// ---------------------------------------------------------------------------
// 📌  Entry point
//
const Provider = ({ children, config }) => {
  // ---------------------------------------------------------------------------
  //
  if (DEBUG) {
    console.debug(`%cSelectionModel context loading`, colors.orange);
  }

  const [turnOn, setTurnOn] = useState(() => config?.rowCountTotal ?? false);
  if (!turnOn) {
    console.log(
      '🦀 The selection model context has missing rowCountTotal config value',
    );
  }
  const dispatch = useDispatch();

  // ---------------------------------------------------------------------------
  // 📖 get the selectionModel from redux
  const selectionModel = useSelector((state) => {
    return getMaybeSelectionModel(state, config);
  });

  // ---------------------------------------------------------------------------
  // Build the messaging to redux used by the selectionModel hook
  const handleSetSelectionModel = useCallback(
    (model) => {
      if (DEBUG) {
        console.debug('👉 handle set selection model with model:', model);
      }
      if (model && !eqSelectionModels(selectionModel, model)) {
        dispatch(
          setSelectionModel({
            ...config,
            model,
          }),
        );
      }
    },
    [config, dispatch, selectionModel],
  );

  // ---------------------------------------------------------------------------
  // Fire-up the selectionModel hook with the required configs
  const { reset, onRowClick, onToggleAll, onSetReduceComputation } = useSelectionModel({
    selectionModel, // previously saved/initialized from redux
    handleSetSelectionModel, // send machine context to redux
    rowCountTotal: selectionModel?.rowCountTotal ?? config.rowCountTotal,
    meta: {
      identifier: config.identifier,
      purpose: config.purpose,
      measurementType: config?.measurementType,
      valueIdx: config?.valueIdx,
    },
    DEBUG,
    turnOn,
  });

  // ---------------------------------------------------------------------------
  // Prepare API and data objects for context providers
  //
  const api = useMemo(
    () => ({
      setTurnOn,
      reset,
      onRowClick,
      onToggleAll,
      onSetReduceComputation: (label) => {
        // send  the machine true when label is series
        const msg = label === 'rollup';
        if (DEBUG) {
          console.debug(
            '📬  SelectionModel Context onSetReduceComputation:',
            label,
            msg,
          );
        }
        onSetReduceComputation(msg);
      },
    }),
    [reset, onRowClick, onToggleAll, onSetReduceComputation],
  );

  const data = useMemo(
    () => ({
      selectionModel,
      seriesComputation: selectionModel.computationType === COMPUTATION_TYPES.SERIES,
    }),
    [selectionModel],
  );

  if (DEBUG) {
    console.debug('%c----------------------------------------', colors.blue);
    console.debug(`%c📋 SelectionModel Context state summary:`, colors.blue, {
      selectionModel,
      turnOn,
      data,
      configProp: config,
    });
  }

  return (
    <SelectionModelApiContext.Provider value={api}>
      <SelectionModelDataContext.Provider value={data}>
        {children}
      </SelectionModelDataContext.Provider>
    </SelectionModelApiContext.Provider>
  );
};

Provider.displayName = 'Provider - SelectionModelContext';
Provider.propTypes = {
  children: PropTypes.node.isRequired,
  config: PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    purpose: PropTypes.oneOf(Object.values(PURPOSE_TYPES)).isRequired,
    measurementType: PropTypes.string,
    valueIdx: PropTypes.number,
    rowCountTotal: PropTypes.number,
  }).isRequired,
};
Provider.defaultProps = {};

export const useSelectionModelDataContext = () => useContext(SelectionModelDataContext);
export const useSelectionModelApiContext = () => useContext(SelectionModelApiContext);
export default Provider;
