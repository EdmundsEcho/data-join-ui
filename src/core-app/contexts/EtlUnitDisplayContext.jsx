// src/core-app/contexts/EtlUnitToolsContext.jsx

import React, {
  useContext,
  useState,
  useMemo,
  createContext,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import usePersistedState from '../hooks/use-persisted-state';
import { colors } from '../constants/variables';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_LEVELS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const noop = () => {};

/**
 * Declare and provide initializing props to the contexts.
 *
 */
export const EtlUnitDisplayDataContext = createContext({});
EtlUnitDisplayDataContext.displayName = 'Context - EtlUnitDisplayData';

const EtlUnitDisplayApiContext = createContext({});
EtlUnitDisplayApiContext.displayName = 'Context - EtlUnitDisplayApi';

/**
 * @component
 *
 * The context hosts the following data (pass-through props)
 *
 * data: {
 *  showDetail: false,
 *  switchOn: false,
 *  disableSwitch: false,
 *  showSwitch: true,
 * }
 *
 */
const Provider = ({ children, data: dataProp, stateId, identifier }) => {
  if (DEBUG) {
    console.debug(`%cTool context loading: ${identifier}`, colors.orange);
  }
  const {
    showDetail: showDetailProp,
    disableSwitch = false,
    showSwitch = true,
    switchOn,
    ...passThroughProps
  } = dataProp;
  // ---------------------------------------------------------------------------
  // Public interface - Data
  const [showDetail, toggleShowDetail_] = usePersistedState(
    `${stateId}|showDetail|DisplayContext`,
    showDetailProp,
  );

  // indirection is required for consistent use
  const toggleShowDetail = useCallback(() => {
    console.debug('EtlUnitDisplayContext togleShowDetail will toggle to:', !showDetail);
    toggleShowDetail_(!showDetail);
  }, [toggleShowDetail_, showDetail]);

  // Public interface - Data
  // use the switchOn data prop as the initial value
  const [switchOnLocalState, toggleSwitchOnLocalState] = useState(() => switchOn);

  const data = useMemo(
    () => ({
      showDetail,
      switchOnLocalState,
      disableSwitch,
      showSwitch,
      identifier,
      ...passThroughProps,
    }),
    [
      passThroughProps,
      switchOnLocalState,
      showDetail,
      showSwitch,
      identifier,
      disableSwitch,
    ],
  );

  // ---------------------------------------------------------------------------
  // Public interface - api shared functions
  // ---------------------------------------------------------------------------
  // const toggleShowDetail = useCallback(() => {
  //   setShowDetail(!showDetail);
  // }, [setShowDetail, showDetail]);

  const api = useMemo(
    () => ({
      toggleShowDetail,
      toggleSwitchOnLocalState,
    }),
    [toggleShowDetail],
  );

  return (
    <EtlUnitDisplayApiContext.Provider value={api}>
      <EtlUnitDisplayDataContext.Provider value={data}>
        {children}
      </EtlUnitDisplayDataContext.Provider>
    </EtlUnitDisplayApiContext.Provider>
  );
};

Provider.displayName = 'Provider - EtlUnitDisplay';
Provider.propTypes = {
  data: PropTypes.shape({
    showDetail: PropTypes.bool,
    switchOn: PropTypes.bool,
    disableSwitch: PropTypes.bool,
    showSwitch: PropTypes.bool,
  }),
  stateId: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
Provider.defaultProps = {
  data: {
    showDetail: false,
    switchOn: false,
    disableSwitch: false,
    showSwitch: true,
  },
};
//
//
export const useDisplayDataContext = () => useContext(EtlUnitDisplayDataContext);
export const useDisplayApiContext = () => useContext(EtlUnitDisplayApiContext);
export default Provider;
