// src/components/HeaderViewContext.jsx

import React, { useMemo, useCallback, createContext } from 'react';
import PropTypes from 'prop-types';

import usePersistedState from '../hooks/use-persisted-state';
import { headerView as prefs } from '../display.config';

/* eslint-disable no-console */
const noop = () => {};
/**
 * Context
 * default settings *only serves tests*
 */
export const Context = createContext({
  identifier: undefined,
  showDetail: false,
  toggleShowDetail: () => noop,
  setShowDetail: () => noop,
  switchOn: false,
  toggleSwitchOn: () => noop,
  setSwitchOn: () => noop,
  disableSwitch: false,
});

/**
 * 📌  Default export
 *
 * Context provider that shares the user-driven state changes in the tools
 */
const Provider = ({
  children,
  showDetail: showDetailProp,
  hideInactive: hideInactiveProp,
  stateId,
  ...rest
}) => {
  const [showDetail, setShowDetail] = usePersistedState(
    `${stateId}|showDetail|Context`,
    showDetailProp,
  );
  const [hideInactive, setHideInactive] = usePersistedState(
    `${stateId}|hideInactive|Context`,
    hideInactiveProp,
  );

  const toggleShowDetail = useCallback(() => {
    setShowDetail(!showDetail);
  }, [setShowDetail, showDetail]);

  const toggleHideInactive = useCallback(() => {
    setHideInactive(!hideInactive);
  }, [hideInactive, setHideInactive]);

  // ⬜ figure out memo
  const state = useMemo(
    () => ({
      stateId,
      showDetail,
      toggleShowDetail,
      toggleHideInactive,
      hideInactive,
      setHideInactive,
      setShowDetail,
      ...rest,
    }),
    [
      stateId,
      showDetail,
      toggleShowDetail,
      toggleHideInactive,
      hideInactive,
      setHideInactive,
      setShowDetail,
      rest,
    ],
  );

  return <Context.Provider value={state}>{children}</Context.Provider>;
};

Provider.propTypes = {
  hideInactive: PropTypes.bool,
  showDetail: PropTypes.bool,
  switchCallback: PropTypes.func,
  showSwitch: PropTypes.bool,
  stateId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
Provider.defaultProps = {
  hideInactive: false,
  showDetail: prefs.showDetail,
  switchCallback: undefined,
  showSwitch: true,
};
export default Provider;
