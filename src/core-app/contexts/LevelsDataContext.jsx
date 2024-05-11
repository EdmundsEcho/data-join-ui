// src/core-app/contexts/LevelsDataContext.jsx
/**
 * context headerView, etlUnit, workbench, matrix
 */
import React, {
  useState,
  useCallback,
  useContext,
  useMemo,
  createContext,
} from 'react';
import PropTypes from 'prop-types';

import { colors } from '../constants/variables';
import { FIELD_TYPES, PURPOSE_TYPES } from '../lib/sum-types';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_LEVELS === 'true';
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
const Provider = ({
  context,
  fieldType,
  purpose,
  getFieldValue: getFieldValueProp,
  children,
}) => {
  // ---------------------------------------------------------------------------
  //
  if (DEBUG) {
    console.debug(`%cLevels context loading`, colors.orange);
  }

  const getFieldValue = useCallback(getFieldValueProp, [getFieldValueProp]);

  const [handleUpdateSymbols_, setUpdateSymbolsHandler_] = useState(() => undefined);
  const handleUpdateSymbols = useCallback(handleUpdateSymbols_, [handleUpdateSymbols_]);
  const setUpdateSymbolsHandler = useCallback(
    (fn) => {
      setUpdateSymbolsHandler_(() => fn);
    },
    [setUpdateSymbolsHandler_],
  );

  const api = useMemo(
    () => ({
      getFieldValue,
      setUpdateSymbolsHandler,
      handleUpdateSymbols,
    }),
    [getFieldValue, setUpdateSymbolsHandler, handleUpdateSymbols],
  );

  const state = useMemo(
    () => ({
      context,
      fieldType,
      purpose,
    }),
    [context, fieldType, purpose],
  );

  return (
    <LevelsApiContext.Provider value={api}>
      <LevelsDataContext.Provider value={state}>{children}</LevelsDataContext.Provider>
    </LevelsApiContext.Provider>
  );
};
Provider.displayName = 'Provider - LevelsContext';
Provider.propTypes = {
  children: PropTypes.node.isRequired,
  purpose: PropTypes.oneOf([...Object.values(PURPOSE_TYPES), 'matrix']).isRequired,
  context: PropTypes.oneOf(Object.values(CONTEXTS)).isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)),
  getFieldValue: PropTypes.func,
};
Provider.defaultProps = {
  getFieldValue: () => {},
  fieldType: undefined,
};
//
export const useLevelsDataContext = () => useContext(LevelsDataContext);
export const useLevelsApiContext = () => useContext(LevelsApiContext);
export default Provider;
