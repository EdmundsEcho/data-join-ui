// src/hooks/use-reducer-with-middleware.js

import { useReducer, useCallback, useEffect, useRef } from 'react';

// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Usage
 * [state, dispatch] = useReducerWithMiddleware(
 *   reducer,
 *   initialState,
 *   [beforeMiddleware],
 *   [afterMiddleware]
 * )
 */
const useReducerWithMiddleware = (
  reducer,
  initialState,
  beforeMiddleware = [],
  // afterMiddleware = [],
) => {
  const [state, rawDispatch] = useReducer(reducer, initialState);
  const aRef = useRef(undefined);

  // dispatch with middleware
  const dispatch = useCallback(
    (action) => {
      aRef.current = action;
      // *before* state changes
      beforeMiddleware.forEach((middlewareFn) => middlewareFn(action, state));
      rawDispatch(action);
    },
    [beforeMiddleware, state],
  );

  /*
  useEffect(() => {
    if (aRef.current) {
      afterMiddleware.forEach((middlewareFn) =>
        middlewareFn(aRef.current, state),
      );
    }
  }, [afterMiddleware, state]);
*/
  // reducer interface
  return [state, dispatch];
};

export default useReducerWithMiddleware;
