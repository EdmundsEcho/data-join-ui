// src/contexts/AppFloatingFunctionContext.jsx

import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  createContext,
} from 'react';
import PropTypes from 'prop-types';
import { useLocation, useParams } from 'react-router-dom';

import { useLocationChange } from '../hooks';

import { colors } from '../core-app/constants/variables';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

export const DataContext = createContext({});
DataContext.displayName = 'Context - Data FloatingFunctions';
export const ApiContext = createContext({});
ApiContext.displayName = 'Context - Api FloatingFunctions';

/**
 * Floating functions throughout the app context
 */
const Provider = ({ children }) => {
  // ---------------------------------------------------------------------------
  //
  if (DEBUG) {
    console.debug(`%cfloating functions context loading`, colors.orange);
  }

  // ---------------------------------------------------------------------------
  //   State depends on displayed route
  // ---------------------------------------------------------------------------
  const { pathname } = useLocation();
  const [showFeedback, setShowFeedback] = useState(() => false);
  const [showResetCanvas, setShowResetCanvas] = useState(() => false);
  const [showDownloadMatrix, setShowDownloadMatrix] = useState(() => false);
  const [inProjectRoutes, setInProjectRoutes] = useState(
    () => pathname.includes('projects') && pathname.split('/').length > 2,
  );

  // ---------------------------------------------------------------------------
  // local derivations
  const temp = pathname.split('/');
  const lastPathFragment = temp[temp.length - 1];
  const firstPathFragment = temp[1]; // skip host

  const handleLocationChange = () => {
    // set whether to display the function
    setShowFeedback(() => firstPathFragment !== 'login');
    setShowResetCanvas(() => lastPathFragment === 'workbench');
    setShowDownloadMatrix(() => lastPathFragment === 'matrix');
    setInProjectRoutes(
      () => pathname.includes('projects') && pathname.split('/').length > 2,
    );
  };

  // effect called when location changes
  useLocationChange(handleLocationChange);

  // Public interface - Data
  const state = useMemo(
    () => ({
      showFeedback,
      showDownloadMatrix,
      showResetCanvas,
      inProjectRoutes,
    }),
    [inProjectRoutes, showFeedback, showResetCanvas, showDownloadMatrix],
  );

  // Public interface - Api
  const api = useMemo(
    () => ({
      // setShowFeedback,
      // setShowDownloadMatrix,
      // setShowResetCanvas,
    }),
    [],
  );

  return (
    <ApiContext.Provider value={api}>
      <DataContext.Provider value={state}>{children}</DataContext.Provider>
    </ApiContext.Provider>
  );
};
Provider.displayName = 'Provider - AppFloatingFunctionContext';
Provider.propTypes = { children: PropTypes.node.isRequired };
//
export const useFloatingFunctionsDataContext = () => useContext(DataContext);
export const useFloatingFunctionsApiContext = () => useContext(ApiContext);
export default Provider;
