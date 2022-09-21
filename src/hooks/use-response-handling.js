// src/hooks/use-response-handling.js

import { useCallback } from 'react';
import { STATUS } from './shared-action-types';
import { useSharedFetchApi } from './use-shared-fetch-api';

// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * use-response-handling hook
 *
 * Feature: Provide access to the shared response handling without having to set
 * the asyncFn value.  Allows use of the hook by multiple api calls.
 *
 *  📌 run: response -> meta effects
 *
 ----------------------------------------------------------------------------- */
const useResponseHandling = ({ caller, DEBUG }) => {
  // -----------------------------------------------------------------------------
  const { middlewareWithDispatch, status, reset } = useSharedFetchApi({
    caller,
    DEBUG,
  });

  // augment with a call to reset (allows reuse)
  const run = useCallback(
    (response) => {
      if (DEBUG) {
        console.debug(
          'use-response-handler run processing response:',
          response,
        );
      }
      reset();
      middlewareWithDispatch({
        response,
        caller: `useResponseHandling c/o: ${caller}`,
      });
    },
    [DEBUG, caller, reset, middlewareWithDispatch],
  );

  return {
    run,
    status,
  };
};

export { useResponseHandling, STATUS };
