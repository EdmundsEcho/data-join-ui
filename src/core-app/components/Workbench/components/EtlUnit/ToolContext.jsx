// src/components/Workbench/components/ToolContext.jsx

import React, { useMemo, useCallback, createContext } from 'react';
import PropTypes from 'prop-types';

import usePersistedState from '../../../../hooks/use-persisted-state';

/* eslint-disable no-console */
const noop = () => {};
/**
 * Context with default settings that only serve for testing
 */
export const ToolContext = createContext({
  showDetail: false,
  toggleShowDetail: () => noop,
  setShowDetail: () => noop,
  switchOn: false,
  toggleSwitchOn: () => noop,
  setSwitchOn: () => noop,
  disableSwitch: false,
});

/**
 * Context provider that shares the user-driven state changes in the tools
 */
const Provider = ({
  children,
  showDetail: showDetailProp,
  switchOn: switchOnProp,
  disableSwitch: disableSwitchProp,
  switchCallback,
  showSwitch,
  stateId,
}) => {
  const [showDetail, setShowDetail] = usePersistedState(
    `${stateId}|showDetail|TooContext`,
    showDetailProp,
  );
  const [switchOn, setSwitchOn] = usePersistedState(
    `${stateId}|switchOn|TooContext`,
    switchOnProp,
  );
  const [disableSwitch, setDisableSwitch] = usePersistedState(
    `${stateId}|disableSwitch|TooContext`,
    disableSwitchProp,
  );

  const toggleShowDetail = useCallback(() => {
    setShowDetail(!showDetail);
  }, [setShowDetail, showDetail]);

  const toggleSwitchOn = useCallback(() => {
    setSwitchOn(!switchOn);
    if (typeof switchCallback !== 'undefined') {
      switchCallback(!switchOn);
    }
  }, [setSwitchOn, switchCallback, switchOn]);

  const state = useMemo(
    () => ({
      showDetail,
      toggleShowDetail,
      switchOn,
      toggleSwitchOn,
      setSwitchOn,
      setShowDetail,
      disableSwitch,
      setDisableSwitch,
      showSwitch,
    }),
    [
      showDetail,
      toggleShowDetail,
      switchOn,
      toggleSwitchOn,
      setSwitchOn,
      setShowDetail,
      disableSwitch,
      setDisableSwitch,
      showSwitch,
    ],
  );

  return <ToolContext.Provider value={state}>{children}</ToolContext.Provider>;
};

Provider.propTypes = {
  switchOn: PropTypes.bool,
  disableSwitch: PropTypes.bool,
  showDetail: PropTypes.bool,
  switchCallback: PropTypes.func,
  showSwitch: PropTypes.bool,
  stateId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
Provider.defaultProps = {
  switchOn: false,
  disableSwitch: false,
  showDetail: false,
  switchCallback: undefined,
  showSwitch: true,
};
export default Provider;
