/**
 * 🔑 "read on demand"
 * This context provider hosts a single flag that does not force a re-render
 * when updated.
 *
 *      Status
 *
 * Usage: Components can share access to the status of a data pull and whether
 * the data has "gone stale" (out of date).
 *
 * The module exports a hook to access the feature.
 *
 */
import React, { useContext, createContext, useMemo, useRef } from 'react';
import { PropTypes } from 'prop-types';

// consumer interface
export const STATUS = {
  empty: 'empty',
  loaded: 'loaded',
  stale: 'stale',
};

const StatusContext = createContext({ status: STATUS.empty });
StatusContext.displayName = 'StatusContext';

function StatusProvider({ children }) {
  const statusRef = useRef(STATUS.empty);

  //
  // 🚧 Do the functions need to be in a useCallback?
  //
  // exposed interface
  // never changes, so won't trigger a re-render, but has a side-effect
  // of changing the ref value; when read, provides the latest/current value.
  //
  const value = useMemo(
    () => ({
      isStale: () => statusRef.current === STATUS.stale,
      setToLoaded: () => {
        statusRef.current = STATUS.loaded;
      },
      setToStale: () => {
        statusRef.current = STATUS.stale;
      },
    }),
    [],
  );

  return (
    <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
  );
}

function useStatus() {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
}

StatusProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { StatusProvider, useStatus };
