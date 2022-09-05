// src/components/Workbench/components/EtlUnitGroupContext.jsx

import React, { useMemo, useState, createContext, useCallback } from 'react';
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
  console.assert(
    typeof clearCallback === 'function',
    `EtlUnitGroupContext: need a function`,
  );
  // display state for the context
  const [displayType, setDisplayType] = useState(() => displayTypeProp);

  const [showDetail, setShowDetail] = usePersistedState(
    `${stateId}|showDetail|TooContext`,
    showDetailProp,
  );

  const state = useMemo(
    () => ({
      displayType,
      setDisplayType,
      showDetail,
      toggleShowDetail: () => setShowDetail(!showDetail),
      setShowDetail,
      handleClearCommand: clearCallback,
      handleClickFab: clickFabCallback,
    }),
    [
      clearCallback,
      clickFabCallback,
      displayType,
      setDisplayType,
      showDetail,
      setShowDetail,
    ],
  );

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
  clearCallback: undefined,
  clickFabCallback: undefined,
};

export default Provider;
