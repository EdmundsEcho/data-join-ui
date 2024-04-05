// src/core-app/contexts/LevelsDataContext.jsx
/**
 * context headerView, etlUnit, workbench, matrix
 */
import React, { useContext, useMemo, createContext } from 'react';
import PropTypes from 'prop-types';

import { colors } from '../constants/variables';
import { FIELD_TYPES, PURPOSE_TYPES } from '../lib/sum-types';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

export const CONTEXTS = {
  HEADER_VIEW: 'headerView',
  ETL_UNIT: 'etlUnit',
  WORKBENCH: 'workbench',
  MATRIX: 'matrix',
};
// re-export
export { FIELD_TYPES };

export const LevelsDataContext = createContext({});
LevelsDataContext.displayName = 'Context - LevelsData';
export const LevelsApiContext = createContext({});
LevelsApiContext.displayName = 'Context - LevelsApi';

/**
 * Provider access to keys required to get field from store
 */
const Provider = ({ context, fieldType, purpose, getFieldValue, children }) => {
  // ---------------------------------------------------------------------------
  //
  if (DEBUG) {
    console.debug(`%cLevels context loading`, colors.orange);
  }

  const api = useMemo(
    () => ({ context, fieldType, purpose, getFieldValue }),
    [context, fieldType, purpose, getFieldValue],
  );

  const state = useMemo(() => ({}), []);

  return (
    <LevelsApiContext.Provider value={api}>
      <LevelsDataContext.Provider value={state}>{children}</LevelsDataContext.Provider>
    </LevelsApiContext.Provider>
  );
};
Provider.displayName = 'Provider-LevelsContext';
Provider.propTypes = {
  children: PropTypes.node.isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)),
  purpose: PropTypes.oneOf(Object.values(PURPOSE_TYPES)),
  getFieldValue: PropTypes.func,
  context: PropTypes.oneOf(Object.values(CONTEXTS)).isRequired,
};
Provider.defaultProps = {
  getFieldValue: () => {},
  fieldType: undefined,
  purpose: undefined,
};
//
export const useLevelsDataContext = () => useContext(LevelsDataContext);
export const useLevelsApiContext = () => useContext(LevelsApiContext);
export default Provider;
