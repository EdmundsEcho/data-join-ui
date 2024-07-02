// src/components/HeaderViewContext.jsx

import React, { useMemo, useCallback, createContext } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import usePersistedState from '../hooks/use-persisted-state';
import { headerView as prefs } from '../display.config';
import { selectMvalueMode } from '../ducks/rootSelectors';

import { updateHeaderView } from '../ducks/actions/headerView.actions';
import { MVALUE_MODE } from '../lib/sum-types';

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
Context.displayName = 'Context - HeaderView';

/**
 * 📌  Default export
 *
 * Context provider that shares the user-driven state changes in the tools
 */
const Provider = ({
  children,
  showDetail: showDetailProp,
  hideInactive: hideInactiveProp,
  filename,
  stateId,
  ...rest
}) => {
  // set the mvalueMode
  const dispatch = useDispatch();

  const [showDetail, setShowDetail] = usePersistedState(
    `${stateId}|showDetail|Context`,
    showDetailProp,
  );
  const [hideInactive, setHideInactive] = usePersistedState(
    `${stateId}|hideInactive|Context`,
    hideInactiveProp,
  );

  //-------------------------------------------------------------------------------
  // mvalueMode read here; wideMode sets the switch position where wideMode
  // aligns with the second-label in the switch.
  const mvalueMode = useSelector((state) => selectMvalueMode(state, filename));
  const wideMode = mvalueMode === MVALUE_MODE.WIDE;
  const last = filename.lastIndexOf('/');
  console.debug('Context', filename.substring(last), mvalueMode, wideMode);

  // mvalueMode set here; switch toggle dispatches the new value
  // (which triggers a new read)
  const toggleMvalueMode = useCallback(
    (switchValue) => {
      dispatch(
        updateHeaderView({
          filename,
          key: 'mvalueMode',
          value:
            switchValue === 'multi-value-wide'
              ? MVALUE_MODE.WIDE
              : MVALUE_MODE.MULTIPLE,
        }),
      );
    },
    [dispatch, filename],
  );
  //-------------------------------------------------------------------------------

  const toggleShowDetail = useCallback(() => {
    setShowDetail(!showDetail);
  }, [setShowDetail, showDetail]);

  const toggleHideInactive = useCallback(() => {
    setHideInactive(!hideInactive);
  }, [hideInactive, setHideInactive]);

  const state = useMemo(
    () => ({
      filename,
      mvalueMode,
      stateId,
      showDetail,
      toggleShowDetail,
      toggleHideInactive,
      toggleMvalueMode,
      hideInactive,
      wideMode,
      setHideInactive,
      setShowDetail,
      ...rest,
    }),
    [
      filename,
      mvalueMode,
      stateId,
      showDetail,
      toggleShowDetail,
      toggleHideInactive,
      toggleMvalueMode,
      hideInactive,
      wideMode,
      setHideInactive,
      setShowDetail,
      rest,
    ],
  );

  return <Context.Provider value={state}>{children}</Context.Provider>;
};
Provider.displayName = 'Provider - HeaderView';

Provider.propTypes = {
  hideInactive: PropTypes.bool,
  showDetail: PropTypes.bool,
  switchCallback: PropTypes.func,
  showSwitch: PropTypes.bool,
  stateId: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
Provider.defaultProps = {
  hideInactive: false,
  showDetail: prefs.showDetail,
  switchCallback: undefined,
  showSwitch: true,
};
export default Provider;
