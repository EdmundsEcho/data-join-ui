// src/hooks/use-pagination.js
/**
 * @module hooks/use-pagination
 */
import { useMemo, useState, useEffect, useCallback } from 'react';
import { InputError } from '../lib/LuciErrors';
import { colors } from '../constants/variables';
import { useFetchApi, STATUS } from '../../hooks/use-fetch-api';
import useAbortController from '../../hooks/use-abort-controller';
import debounce from '../utils/debounce';

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

export const SERVICES = {
  LEVELS: 'LEVELS',
  GRAPHQL: 'GRAPHQL',
};

/*
The concept of cursor comes up in both the request and response.
Filter is a separate concept. Cursor in the response is a base64 uid
for a specific value; so is a string.  There are two cursor object types
used in the request:

GRAPHQL cursor {
    first: page size,
    after: cursor value,
 }
LEVELS cursor {
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
 * @param {('GRAPHQL' | 'LEVELS')} input.service
 * @param {number} input.rowsPerPageProp
 * @param {Object} input.filter qualityName | componentName, measurementType
 * @param {Object} input.fetchFn param Object with filter and cursor props
 * @return {React.hook}
 */
const usePagination = ({
  service,
  fetchFn, // how retrieve the raw data
  abortController: abortControllerProp,
  normalizer, // post-process response from api
  filter: filterProp,
  pageSize: pageSizeProp,
  turnOff = false, // support for derived data
  DEBUG: debugProp,
}) => {
  useEffect(() => {
    if (DEBUG) {
      console.debug('use-pagination service: ', service);
      console.log('filter prop changed', filterProp);
    }
  }, [filterProp, service]);
  //
  // initialize the local state
  const [pageSize, setPageSize] = useState(() => pageSizeProp);
  const [filter, setFilter] = useState(() => filterProp);
  // fragments of the fetch request
  const [currentPageIdx1, setCurrentPageIdx1] = useState(() => 1);
  const [cursor, setCursor] = useState(() => {
    return service === SERVICES.LEVELS
      ? { page: 1, limit: pageSizeProp }
      : {
          first: pageSize,
          after: null,
        };
  });

  const abortController = useAbortController(abortControllerProp);
  useEffect(() => {
    setFilter(() => filterProp);
  }, [filterProp]);
  // ---------------------------------------------------------------------------
  // 💢 Side-effect
  //    setCacheFn: transform cache value
  //    Note: memoization required b/c used in effect
  const setCacheFn = useMemo(
    () => (respData, cache) => ({
      ...cache,
      ...normalizer(respData), // e.g., data -> data.levels
      page: currentPageIdx1, // user-agent consumption
    }),
    [currentPageIdx1, normalizer],
  );
  const {
    execute,
    status,
    cache,
    getCache, // reads the cache, sets internal state to consumed
    cancel,
    reset: resetCache,
  } = useFetchApi({
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
    setStatus(STATUS.PENDING);
    setFilter(filterProp);
    setCursor({
      first: pageSize,
      after: null,
    });
    setCurrentPageIdx1(1);
  }, [filterProp, pageSize, pageSizeProp]);
*/

  const reset = useCallback(() => {
    if (DEBUG) {
      console.debug('Called reset in usePagination');
    }

    setCurrentPageIdx1(1);
    setCursor(() => {
      return service === SERVICES.LEVELS
        ? { page: 1, limit: pageSizeProp }
        : {
            first: pageSize,
            after: null,
          };
    });
    // cancel and reset the fetch hook
    // cancel();
    resetCache();
  }, [cancel, resetCache, pageSizeProp, service, pageSize]);

  //------------------------------------------------------------------------------
  // service: 'GRAPHQL' (graphql) | 'SCROLL' (tnc-py)
  //------------------------------------------------------------------------------
  // side-effect: sets a new cursor value and stores it in the local state
  //
  const onFetchPageGraphQL = useCallback(
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

      // scroll forward, consumer to cache "along the way"
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
  // service: 'LEVELS'
  //------------------------------------------------------------------------------
  // side-effect: sets the local state
  // @private
  //------------------------------------------------------------------------------
  const fetchPageLevels = useCallback(
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
  /**
   * @public
   */
  const onFetchNextPage = () => {
    fetchPageLevels(currentPageIdx1 + 1, false /* isZeroIdx */);
  };

  //const onFetchPreviousPage = () => {
  //  fetchPageLevels(currentPageIdx1 - 1, false /* isZeroIdx */);
  //};

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
  // sample when pulling levels for headerView
  // {
  //   "purpose": "quality",
  //   "sources": [
  //     {
  //       "filename": "/shared/datafiles/62277da3-1a58-4dbc-af84-22208d6fd3f0/dropbox/4bdff8/lE0WdposqDkAAAAAABpqBg/target_list.csv",
  //       "header-idx": 2,
  //       "map-symbols": {
  //         "arrows": {
  //           "AK": "AKs",
  //           "CA": "CAs",
  //           "FL": "FLs"
  //         }
  //       },
  //       "null-value": "ZZ"
  //     }
  //   ]
  // }
  // ---------------------------------------------------------------------------
  // 🟢 Pull new data when the request changes
  //    create the request by reading the cursor from the current state
  // ---------------------------------------------------------------------------
  const debounceExecute = useMemo(
    () =>
      debounce(
        (params) => {
          execute(params);
        },
        300,
        true,
      ),
    [execute],
  ); // Debounce execute to prevent too frequent calls
  useEffect(() => {
    if (!turnOff) {
      debounceExecute({
        filter,
        ...cursor,
      });
    }
    return () => {
      debounceExecute.cancel();
      cancel();
    };
  }, [turnOff, cancel, debounceExecute, filter, cursor]);

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
      status === STATUS.CONSUMED,
      // status === STATUS.REJECTED, not used to render
      // status === STATUS.IDLE, not used to render
    ];
    const currentStep = `${steps.findIndex((v) => v === true) + 1} of ${steps.length}`;
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

  const commonInterface = {
    fetchPage: service === SERVICES.LEVELS ? onFetchNextPage : onFetchPageGraphQL,
    setFilter: onSetFilter,
    status,
    data: { status, cache, getCache },
    reset, // hard reset
    cancel,
  };
  // ---------------------------------------------------------------------------
  return commonInterface;
};

export { usePagination, STATUS };
