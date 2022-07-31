// src/components/Workbench/components/EtlUnitGroupContext.jsx

import React, { useState, createContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import usePersistedState from '../../../../hooks/use-persisted-state';
import groupTypes from './groupTypes';

/* eslint-disable no-console */

/**
 * ✅ Use this to host component state and functionality such as event
 *    handlers.
 *
 * 🚫 Use this to host the semantics of the group.  Store that in the
 *    data prop of the group node.
 *
 *  Default settings that only serve for testing
 */
export const EtlUnitGroupContext = createContext();

/**
 * Context provider that shares the user-driven state changes in the tools
 */
const Provider = ({
  children,
  showDetail: showDetailProp,
  displayType: displayTypeProp, // move this to state tree
  clearCallback,
  clickFabCallback,
  stateId,
}) => {
  // display state for the context
  const [displayType, setDisplayType] = useState(() => displayTypeProp);

  // callbacks for the context
  const handleClearCommand = useCallback(clearCallback, [clearCallback]);
  const handleClickFab = useCallback(clickFabCallback, [clickFabCallback]);

  const [showDetail, setShowDetail] = usePersistedState(
    `${stateId}|showDetail|TooContext`,
    showDetailProp,
  );

  const toggleShowDetail = useCallback(() => {
    setShowDetail(!showDetail);
  }, [setShowDetail, showDetail]);

  const state = {
    displayType,
    setDisplayType,
    showDetail,
    toggleShowDetail,
    setShowDetail,
    handleClearCommand,
    handleClickFab,
  };

  return (
    <EtlUnitGroupContext.Provider value={state}>
      {children}
    </EtlUnitGroupContext.Provider>
  );
};

Provider.propTypes = {
  displayType: PropTypes.oneOf(groupTypes),
  showDetail: PropTypes.bool,
  clearCallback: PropTypes.func,
  clickFabCallback: PropTypes.func,
  stateId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
Provider.defaultProps = {
  displayType: 'empty',
  showDetail: false,
  clearCallback: () => {},
  clickFabCallback: () => console.log(`Clicked fab: Not configured`),
};

export default Provider;
