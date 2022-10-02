// src/hooks/use-pagination.js
/**
 * @module hooks/use-pagination
 */
import { useMemo, useState, useEffect, useCallback } from 'react';
import { InputError } from '../lib/LuciErrors';
import { colors } from '../constants/variables';
import { useFetchApi, STATUS } from '../../hooks/use-fetch-api';
import useAbortController from '../../hooks/use-abort-controller';

//-----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_LEVELS === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * @constant
 */
const dummyPageInfo = {
  pageInfo: {
    startCursor: null,
    endCursor: null,
    hasPreviousPage: false,
    hasNextPage: false,
  },
};

/*
The concept of cursor comes up in both the request and response.
Filter is a separate concept. Cursor in the response is a base64 uid
for a specific value; so is a string.  There are two cursor object types
used in the request:

PAGING cursor {
    first: page size,
    after: cursor value,
 }
LIMIT cursor {
    page: page number,
    limit: page size
 }

 friends(first: 10, after: "opaqueCursor") {
      edges {
        cursor
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
*/

//------------------------------------------------------------------------------
/**
 *
 *  📌  Relies on the Connection interface
 *
 *  Data sources: graphql | tnc-py
 *
 *
 * @function
 * @param {Object} input
 * @param {('LIMIT' | 'SCROLL')} input.feature
 * @param {number} input.rowsPerPageProp
 * @param {Object} input.filter qualityName | componentName, measurementType
 * @param {Object} input.fetchFn param Object with filter and cursor props
 * @return {React.hook}
 */
const usePagination = ({
  feature = 'LIMIT',
  fetchFn, // how retrieve the raw data
  abortController: abortControllerProp,
  normalizer, // post-processing
  filter: filterProp,
  pageSize: pageSizeProp,
  turnOff = false, // support for derived data
  DEBUG: debugProp,
}) => {
  //
  // initialize the local state
  const [pageSize, setPageSize] = useState(() => pageSizeProp);
  const [filter, setFilter] = useState(() => filterProp);
  // fragments of the fetch request
  const [currentPageIdx1, setCurrentPageIdx1] = useState(() => 1);
  const [cursor, setCursor] = useState(() => {
    return feature === 'LIMIT'
      ? { page: 1, limit: pageSizeProp }
      : {
          first: pageSize,
          after: null,
        };
  });
  const abortController = useAbortController(abortControllerProp);

  // ---------------------------------------------------------------------------
  // 💢 Side-effect
  //    setCacheFn: pre-process cache value
  //    Note: memoization required b/c used in effect
  const setCacheFn = useMemo(
    () => (respData, cache) => ({
      ...cache,
      ...normalizer(respData), // e.g., data -> data.levels
      page: currentPageIdx1, // user-agent consumption
    }),
    [currentPageIdx1, normalizer],
  );
  const { execute, status, cache, cancel } = useFetchApi({
    asyncFn: fetchFn,
    setCacheFn, // (response.data, cache)
    initialCacheValue: dummyPageInfo,
    blockAsyncWithEmptyParams: true,
    abortController,
    useSignal: typeof abortControllerProp !== 'undefined',
    immedidate: false,
    caller: 'usePagination',
    turnOff,
    DEBUG,
  });
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Initial state to call when hit reset
  /*
  const initialState = useCallback(() => {
    setPageSize(pageSizeProp);
    setStatus('pending');
    setFilter(filterProp);
    setCursor({
      first: pageSize,
      after: null,
    });
    setCurrentPageIdx1(1);
  }, [filterProp, pageSize, pageSizeProp]);
*/

  const reset = useCallback(() => {
    setCursor(() => ({
      first: pageSize || pageSizeProp,
      after: null,
    }));
    setCurrentPageIdx1(() => 1);
  }, [pageSize, pageSizeProp]);

  //------------------------------------------------------------------------------
  // feature: 'SCROLL'
  //------------------------------------------------------------------------------
  // side-effect: sets a new cursor value and stores it in the local state
  //
  const onFetchPage = useCallback(
    ({
      pageSize: fetchPageSize = pageSize,
      after = undefined,
      reset: resetState = false,
    }) => {
      if (resetState) {
        reset();
        return;
      }
      const defaultHasNext = cache.pageInfo?.hasNextPage ?? false;
      const defaultEndCursor = cache.pageInfo?.endCursor ?? null;

      // btoa - base64 encoded ascii
      const overrideCursor = typeof after !== 'undefined';
      const endCursor = overrideCursor ? btoa(after) : defaultEndCursor;
      const hasNextPage = overrideCursor || defaultHasNext;

      // for now, only scroll forward; the consumer can cache "along the way"
      // to avoid an api call going backwards
      if (hasNextPage) {
        setCursor(() => ({
          first: fetchPageSize,
          after: `"${endCursor}"`,
        }));
      }
    },
    [cache.pageInfo?.hasNextPage, cache.pageInfo?.endCursor, pageSize, reset],
  );

  //------------------------------------------------------------------------------
  // feature: 'LIMIT'
  //------------------------------------------------------------------------------
  // side-effect: sets the local state
  //------------------------------------------------------------------------------
  const onPageChange = useCallback(
    (pageNumber, isZeroIdx = true) => {
      const newPage = isZeroIdx ? pageNumber + 1 : pageNumber;
      switch (true) {
        //
        // move forward
        //
        case newPage > currentPageIdx1: // ~ moving forward
          try {
            if (cache.pageInfo.hasNextPage) {
              setCurrentPageIdx1(() => newPage);
              setCursor(() => ({
                page: newPage,
                limit: pageSize,
              }));
            } else {
              throw new InputError(
                `Trying to move past the data boundary: ${currentPageIdx1} ${newPage}`,
              );
            }
          } catch (x) {
            /* do nothing */
          }
          break;
        //
        // move backwards
        //
        case newPage < currentPageIdx1: // ~ moving backwards
          try {
            if (cache.pageInfo.hasPreviousPage) {
              setCurrentPageIdx1(() => newPage);
              setCursor(() => ({
                page: newPage,
                limit: pageSize,
              }));
            } else {
              throw new InputError(
                `Trying to move before the data boundary: ${currentPageIdx1} ${newPage}`,
              );
            }
          } catch (x) {
            /* do nothing */
          }
          break;
        default:
      }
    },
    [
      cache.pageInfo.hasPreviousPage,
      cache.pageInfo.hasNextPage,
      currentPageIdx1,
      pageSize,
    ],
  );
  const fetchNextPage = () => {
    onPageChange(currentPageIdx1 + 1, false /* isZeroIdx */);
  };
  const fetchPreviousPage = () => {
    onPageChange(currentPageIdx1 - 1, false /* isZeroIdx */);
  };

  // when change page size, restart the list
  const onPageSizeChange = useCallback((newPageSize) => {
    setPageSize(() => newPageSize);
    setCurrentPageIdx1(() => 1);
  }, []);

  const onSetFilter = useCallback(
    (newFilter, optionalPageSize) => {
      reset();
      setFilter(() => newFilter);
      if (optionalPageSize !== 'undefined') {
        onPageSizeChange(optionalPageSize);
      }
    },
    [onPageSizeChange, reset],
  );

  // ---------------------------------------------------------------------------
  //
  // 💫 renders anytime local state is updated; accomplished using
  //    callbacks provided to the user of the hook
  //
  //      👉 setPageSize first/last and page number cursor -> new cursor
  //      👉 fetchPage first/last cursor -> new cursor
  //      👉 setPageNumber page -> new page
  //      👉 filter
  //
  // ---------------------------------------------------------------------------
  // 🟢 Pull new data when the request changes
  //    create the request by reading the cursor from the current state
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!turnOff) {
      execute({
        filter,
        ...cursor,
      });
    }
    return cancel;
  }, [turnOff, cancel, execute, filter, cursor]);

  // ---------------------------------------------------------------------------
  // report on state of the component
  // 🔖 devtool search: /(useSharedFetchApi action|SubApp loaded|SubApp latch)/
  // ---------------------------------------------------------------------------
  if (DEBUG || debugProp) {
    //
    const steps = [
      status === STATUS.UNINITIALIZED,
      status === STATUS.PENDING,
      status === STATUS.RESOLVED,
    ];
    const currentStep = `${steps.findIndex((v) => v === true) + 1} of ${
      steps.length
    }`;
    console.debug('%c----------------------------------------', colors.blue);
    console.debug(`%c📋 usePagination loaded state summary:`, colors.blue, {
      pageSize: pageSize || pageSizeProp,
      status,
      filter,
      currentPageIdx1,
      cursor,
      cache,
      steps,
      currentStep,
    });
  }

  // ---------------------------------------------------------------------------
  // Array.from(map)[map.size - 1];
  return feature === 'LIMIT'
    ? {
        // common interface
        fetchPage: fetchNextPage,
        setFilter: onSetFilter,
        status,
        data: { status, cache },
        // LIMIT only
        fetchNextPage,
        fetchPreviousPage,
        setPageSize: onPageSizeChange,
        setPageNumber: (pageNumber) =>
          onPageChange(pageNumber, true /* isZeroIdx */),
      }
    : {
        // common interface
        fetchPage: onFetchPage,
        setFilter: onSetFilter,
        status,
        data: { status, cache },
      };
};

export { usePagination, STATUS };
