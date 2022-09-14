// src/hooks/use-pagination.js
/**
 * @module hooks/use-pagination
 */
import { useState, useEffect, useCallback } from 'react';
import { InputError, InvalidStateError } from '../lib/LuciErrors';
import useAbortController from '../../hooks/use-abort-controller';

/* eslint-disable no-console */

//------------------------------------------------------------------------------
const DEBUG = false;
//------------------------------------------------------------------------------
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
  normalizer, // post-processing
  filter: filterProp,
  pageSize: pageSizeProp,
  turnOn: isOn = true,
  DEBUG: debugProp,
}) => {
  //
  // initialize the local state
  //
  const [pageSize, setPageSize] = useState(() => pageSizeProp);
  const [status, setStatus] = useState(() => (isOn ? 'pending' : 'off'));
  const [filter, setFilter] = useState(() => filterProp);
  const [cache, setCache] = useState(() => dummyPageInfo);
  const [currentPageIdx1, setCurrentPageIdx1] = useState(() => 1);
  const [cursor, setCursor] = useState(() => {
    return feature === 'LIMIT'
      ? { page: 1, limit: pageSizeProp }
      : {
          first: pageSize,
          after: null,
        };
  });
  const abortController = useAbortController();

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

  if (DEBUG || debugProp) {
    console.debug(`%c📖 The usePagination state`, 'color:blue');
    console.dir({
      pageSize: pageSize || pageSizeProp,
      status,
      filter,
      currentPageIdx1,
      cursor,
    });
  }

  const reset = useCallback(() => {
    if (
      isOn &&
      typeof pageSize === 'undefined' &&
      typeof pageSizeProp === 'undefined'
    ) {
      throw new InvalidStateError(
        `The usePagination hook must maintain a valid page size prop`,
      );
    }
    setCursor({
      first: pageSize || pageSizeProp,
      after: null,
    });
    setCurrentPageIdx1(1);
  }, [isOn, pageSize, pageSizeProp]);

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
      const {
        hasNextPage: defaultHasNext,
        endCursor: defaultEndCursor,
        // hasPreviousPage,
        // startCursor,
      } = cache.pageInfo;

      // btoa - base64 encoded ascii
      const overrideCursor = typeof after !== 'undefined';
      const endCursor = overrideCursor ? btoa(after) : defaultEndCursor;
      const hasNextPage = overrideCursor || defaultHasNext;

      // for now, only scroll forward; the consumer can cache "along the way"
      // to avoid an api call going backwards
      if (hasNextPage) {
        setCursor({
          after: `"${endCursor}"`,
          first: fetchPageSize,
        });
      }
    },
    [cache.pageInfo, pageSize, reset],
  );

  //------------------------------------------------------------------------------
  // feature: 'LIMIT'
  //------------------------------------------------------------------------------
  // side-effect: sets the local state
  //------------------------------------------------------------------------------
  const onPageChange = useCallback(
    (pageNumber, isZeroIdx) => {
      const newPage = isZeroIdx ? pageNumber + 1 : pageNumber;
      if (DEBUG) {
        console.debug(`Adjusting for index: ${newPage}`);
      }
      const {
        hasNextPage,
        hasPreviousPage,
        // endCursor,
        // startCursor,
      } = cache.pageInfo;

      switch (true) {
        //
        // move forward
        //
        case newPage > currentPageIdx1: // ~ moving forward
          try {
            if (hasNextPage) {
              setCurrentPageIdx1(newPage);
              setCursor({
                page: newPage,
                limit: pageSize,
              });
            } else {
              throw new InputError(
                `Trying to move past the data boundary: ${currentPageIdx1} ${newPage}`,
              );
            }
          } catch (x) {}
          break;
        //
        // move backwards
        //
        case newPage < currentPageIdx1: // ~ moving backwards
          try {
            if (hasPreviousPage) {
              setCurrentPageIdx1(newPage);
              setCursor({
                page: newPage,
                limit: pageSize,
              });
            } else {
              throw new InputError(
                `Trying to move before the data boundary: ${currentPageIdx1} ${newPage}`,
              );
            }
          } catch (x) {}
          break;
        default:
      }
    },
    [cache.pageInfo, currentPageIdx1, pageSize],
  );
  const fetchNextPage = () => {
    onPageChange(currentPageIdx1 + 1, false /* isZeroIdx */);
  };
  const fetchPreviousPage = () => {
    onPageChange(currentPageIdx1 - 1, false /* isZeroIdx */);
  };

  const onPageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPageIdx1(1);
  }, []);

  const onSetFilter = useCallback(
    (newFilter, optionalPageSize) => {
      reset();
      setFilter(newFilter);
      if (optionalPageSize !== 'undefined') {
        onPageSizeChange(optionalPageSize);
      }
    },
    [onPageSizeChange, reset],
  );

  // const parseFnH = (response) => response.data.levels;
  // ---------------------------------------------------------------------------
  // 📌
  //
  // 💢 the fetch-routine
  //
  // 💫 anytime local state is updated; accomplished using
  //    callbacks provided to the user of the hook
  //
  //      👉 setPageSize first/last and page number cursor -> new cursor
  //      👉 fetchPage first/last cursor -> new cursor
  //      👉 setPageNumber page -> new page
  //      👉 filter
  //
  // 🔗 side-effect: setCache (triggers the user state to change)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let ignore = false; // react 18

    if (isOn) {
      setStatus('pending');
      //
      // create the request by reading the cursor from the current state
      // and filter prop (fixed for a given hook)
      //
      // Returns a promise that updates local state
      //
      fetchFn({ signal: abortController.signal, filter, ...cursor }).then(
        (response) => {
          if (!ignore) {
            setCache({ ...normalizer(response), page: currentPageIdx1 });
            setStatus('success');
          }
        },
        (error) => {
          setCache(error);
          setStatus('error');
        },
      );
    }
    return () => {
      ignore = true;
      abortController.abort();
    };
  }, [
    abortController,
    currentPageIdx1,
    cursor,
    fetchFn,
    filter,
    isOn,
    normalizer,
  ]);

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

export { usePagination };
