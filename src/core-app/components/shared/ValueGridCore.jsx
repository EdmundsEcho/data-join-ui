// src/components/Workbench/components/shared/ValueGridCore.jsx

/**
 *
 * The DataGrid for displaying "levels" has a 3-layer configuration.
 *
 * The most inner component in the following:
 *
 *   👉 MatrixGrid, ValueGridWorkbench, ValueGridFileLevels
 *
 *      ✅ ValueGridCore
 *         - provides the data-fetching interface
 *            - external capacity to leverage usePagination
 *            - state required to manage paging and filtering
 *            - baseline configuration (e.g., min column spec)
 *
 *         👉 ValueGridInner
 *            - Fixed layout (composition of custom components)
 *
 *
 * 🔖  The ValueGrid hosts 2 state values:
 *     1. the levels data
 *     2. the selection model
 *
 * 🔖 The MUI onScrollEnd parameters (see mui-event-model.json)
 * {
 *  "visibleColumns": [ { } ],
 *  "viewportPageSize": 6,
 *  "visibleRowsCount": 200
 * }
 *
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import ValueGridInner, {
  filterOperators,
  gridHeightFn,
  ROW_HEIGHT,
  HEADER_HEIGHT,
  ADJUST_HEIGHT,
} from './ValueGridInner';
// import { useDisplayApiContext } from '../../contexts/EtlUnitDisplayContext';
import ErrorBoundary from './ErrorBoundary';

// api interface
import { usePagination, STATUS, SERVICES } from '../../hooks/use-pagination';
import { useScrollListener, useSelectMemoization } from '../../../hooks';
import { InvalidStateError } from '../../lib/LuciErrors';
import { PURPOSE_TYPES } from '../../lib/sum-types';

// selection model service set
import { mkGridSelectionModelFilter } from '../../hooks/use-selection-model';
import {
  useSelectionModelApiContext,
  useSelectionModelDataContext,
} from '../../contexts/SelectionModelContext';
import { useLevelsApiContext } from '../../contexts/LevelsDataContext';
// re-export
export { filterOperators, ROW_HEIGHT };
export { SERVICES };

//-----------------------------------------------------------------------------
//const DEBUG_MODULE = process.env.REACT_APP_DEBUG_LEVELS === 'true';
const DEBUG_MODULE = true;
//-----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 *
 * @component
 *
 */
const ValueGridCore = ({
  className, // includes identifier
  columns: columnsProp,
  identifier, // lookup key
  // 📖 data when derived
  derivedDataRows,
  rowCountTotal: rowCountTotalProp, // available when derived & single source
  purpose,
  filter: filterProp, // filter, interface for using the key (populates the request e.g., sources)
  fetchFn, // api fetch with project_id and abortController
  abortController,
  normalizer, // raw api -> fodder for edgeToGridRowFn
  edgeToGridRowFn,
  // selection model related
  rowToIdFn,
  // other display options
  filterModel: filterModelProp,
  sortModel: sortModelProp,
  // scrub function related
  mapSymbols,
  //
  // Grid version
  //
  service, // GRAPHQL (graphql) | LEVELS (levels service)
  checkboxSelection,
  pageSize: pageSizeProp,
  limitGridHeight,
  rowHeight,
  headerHeight,
  gridHeightAdjustment,
  DEBUG: debugProp,
  ...rest
}) => {
  //
  const DEBUG = debugProp || DEBUG_MODULE;

  // New 0.4.0
  const [gridRows, setGridRows] = useState(() => derivedDataRows || []);
  const [columns, setColumns] = useState(() => columnsProp);
  // ---------------------------------------------------------------------------
  // State-machine toggles :/
  // ---------------------------------------------------------------------------
  // a constant, set when the api returns 'STATUS.RESOLVED' (success)
  const [MAX_ROWS, setMaxRows] = useState(() => rowCountTotalProp);
  // set when the api returns, used to set the grid error prop
  const [error, setError] = useState(() => undefined);
  // latch for one-time render when the api status = 'success'; override
  // when the rows prop is valid
  const [readyForMore, setReadyForMore] = useState(() => typeof rows === 'undefined');
  // tracks when the paging endCursor is invalid
  const [inNewClearedState, setInNewClearedState] = useState(() => true);
  // tracks when can avoid api to retrieve a full list
  // when transition to inSeriesBuildingState
  const [inGridHasAllValuesState, setInGridHasAllValuesState] = useState(() => false);
  // changes how the footer displays the record counts
  const [inFilterState, setInFilterState] = useState(() => false);
  // filterModel for the grid
  const [filterModel, setFilterModel] = useState(() => filterModelProp);
  // sortModel for the grid
  const [sortModel, setSortModel] = useState(() => sortModelProp);

  // Memoize the filter object
  /* eslint-disable-next-line */
  const filter = useSelectMemoization(filterProp, ['null-value-expansion']);

  /** --------------------------------------------------------------------------
   * @function
   * @param {Function} edgeToIdFn
   * @param {Function} edgeToGridRowFn
   * @returns { rows: newRows, selectedRows: newSelected }
   */
  const toGridRowsFn = useMemo(() => toGridRows(edgeToGridRowFn), [edgeToGridRowFn]);
  //----------------------------------------------------------------------------
  // 📦 Luci selection model -> Grid selection model
  const { selectionModel } = useSelectionModelDataContext();
  const {
    onRowClick,
    onToggleAll,
    // reset: resetSelectionModel,
  } = useSelectionModelApiContext();

  const computeGridSelectionModel = mkGridSelectionModelFilter(
    selectionModel,
    rowToIdFn,
  );

  if (DEBUG) {
    console.debug('📦 selectionModel Grid selection model', {
      selectionModel,
      gridRows,
      gridSelectionModel: computeGridSelectionModel(gridRows),
    });
  }
  //----------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // 📖 Infinity window using the pagination hook
  //
  // The hook returns one of two interfaces (LEVELS | GRAPHQL)
  //
  const {
    fetchPage,
    setFilter: setFetchFilter,
    status,
    data,
    reset: resetPagination,
    // cancel,
  } = usePagination({
    fetchFn,
    abortController,
    normalizer,
    filter, // fetch params
    service,
    pageSize: pageSizeProp,
    turnOff: derivedDataRows, // off when we have derived data
  });

  // ---------------------------------------------------------------------------
  // Initial state set when when hit reset
  //
  const resetState = useCallback(
    (derivedDataRowsIn) => {
      if (DEBUG) {
        console.debug('🔥 Called Resetting the grid state.');
      }
      // setMaxRows(rowCountTotalProp);
      setError(undefined);
      setReadyForMore(true);
      setInNewClearedState(true);
      setInGridHasAllValuesState(false);
      setInFilterState(false);
      // resetSelectionModel();
      resetPagination();
      if (derivedDataRowsIn) {
        setGridRows(derivedDataRowsIn);
      } else {
        setGridRows([]);
      }
      // fetchPage({reset: true});
    },
    [DEBUG, resetPagination],
  );

  if (typeof pageSizeProp === 'undefined') {
    throw new InvalidStateError(
      `The ValueGrid must maintain a valid page size prop: ${identifier}`,
    );
  }

  // ----------------------------------------------------------------------
  // Get more data when scrolling
  //
  const handleFetchRows = useCallback(() => {
    // when to call for more data
    if (gridRows.length > 0 && gridRows.length < MAX_ROWS) {
      const remainingRows = MAX_ROWS - gridRows.length;
      const nextPageSize = Math.min(remainingRows, pageSizeProp);

      let maxCursor;
      if (inNewClearedState) {
        /* set the cursor to the max value of ids */
        maxCursor = gridRows.map((row) => row.id).sort()[gridRows.length - 1];
        setInNewClearedState(false);
      }

      // GRAPHQL (graphql) | LEVELS (levels service)
      if (service === SERVICES.GRAPHQL) {
        if (DEBUG) {
          console.debug('💥 Fetching more data GRAPHQL', maxCursor);
        }
        fetchPage({ pageSize: nextPageSize, after: maxCursor });
      } else {
        if (DEBUG) {
          console.debug('✨ Fetching more data LEVELS');
        }
        fetchPage();
      }

      setReadyForMore(true);
    }
  }, [MAX_ROWS, pageSizeProp, fetchPage, gridRows, service, inNewClearedState]);

  // register the handler with useScrollListener
  const { reset: reactivateScrollListener } = useScrollListener({
    rowHeight: ROW_HEIGHT,
    bufferRowCount: 200,
    callback: handleFetchRows,
    className,
  });

  // -------------------------------------------------------------------------
  //
  // When is the endCursor no longer valid?
  //
  // 👉 when a new filter is applied AND on the first page
  // 👉 when a new filter is cleared
  //
  // What events put me into a state where the endCursor is invalid?
  // 👉 when a new filter is rendered
  //
  // -------------------------------------------------------------------------
  // DataGrid filter model
  //
  const handleFilterModelChange = useCallback(
    ({ filterModel: newFilterModel = undefined }) => {
      setFetchFilter(newFilterFrom(filter, newFilterModel));
      setInFilterState(typeof newFilterModel !== 'undefined');
      setInNewClearedState(true);
      setReadyForMore(true);
    },
    [filter, setFetchFilter],
  );
  // ---------------------------------------------------------------------------
  // Reset the state of the grid
  //
  const reset = useCallback(() => {
    resetState(derivedDataRows || []);
  }, [resetState, derivedDataRows]);

  //
  // Changes in the filterModel (how we display what's in the grid)
  // NOTE: Different than the filter used to get row data.
  //
  // hidden + visible -> all visible
  //
  const handleClearFilter = useCallback(() => {
    setFilterModel({
      items: [],
    });
    setSortModel([{ field: 'id', sort: 'asc' }]);
    setInFilterState(false);
    setInNewClearedState(true);
    handleFilterModelChange({});
  }, [handleFilterModelChange]);

  // ---------------------------------------------------------------------------
  // newSymbol column updates
  // ---------------------------------------------------------------------------
  const setColumnVisible = useCallback((fieldName, visible) => {
    setColumns((currentColumns) => {
      return currentColumns.map((column) => {
        if (column.field === fieldName) {
          return { ...column, hide: !visible };
        }
        return column;
      });
    });
  }, []);
  // Set the mapSymbol column value when exists
  // changes the local state (gridRows) when 'newSymbol' column is present
  //
  //
  const handleUpdateSymbols = useCallback(() => {
    const hasNewSymbolCol = columns.some((column) => column.field === 'newSymbol');
    if (hasNewSymbolCol) {
      const updatedRows = gridRows.map((row) => {
        if (mapSymbols[row.level]) {
          return { ...row, newSymbol: mapSymbols[row.level] };
        }
        return row;
      });
      setGridRows(updatedRows); // Update grid rows
    }
  }, [mapSymbols, columns, gridRows]);

  const [latch, setLatch] = useState(() => true);
  useEffect(() => {
    if (mapSymbols && latch) {
      handleUpdateSymbols();
      setLatch(() => false);
    }
  }, [latch, mapSymbols, handleUpdateSymbols]);

  // may not be necessary
  const columnVisibilityModel = columns.reduce((acc, column) => {
    acc[column.field] = !column.hide;
    return acc;
  }, {});

  // link the callback to the levels context for use by the symbol
  // maker in tools.
  const { setUpdateSymbolsHandler } = useLevelsApiContext();
  // call setState only while other component's arent' rendering
  useEffect(() => {
    if (setUpdateSymbolsHandler) {
      setUpdateSymbolsHandler(handleUpdateSymbols);
    }
    return () => setUpdateSymbolsHandler(() => {});
  }, [handleUpdateSymbols, setUpdateSymbolsHandler]);

  // ---------------------------------------------------------------------------
  // 📦 Retrieve data; Effect applied when
  //
  //   1️⃣  data.status changes
  //
  //      👉 from 'resolved' -> 'pending' => do nothing
  //      👉 from 'pending' -> 'error' => display error
  //      👉 from 'pending' -> 'resolved' => concat rows to local state
  //
  //   2️⃣  redux store values change (user update of selected)
  //
  //      👉 'resolved', prevSelectList -> 'resolved', newSelectList
  //         => update selection model
  //
  // ---------------------------------------------------------------------------
  useEffect(() => {
    switch (true) {
      case status === STATUS.REJECTED:
        setError({ message: JSON.stringify(data.cache.message) });
        break;

      case status === STATUS.RESOLVED && readyForMore: {
        if (DEBUG) {
          console.debug(`%cEffect api resolved: ${identifier}`, 'color:yellow');
        }

        const newRows = toGridRowsFn(data.getCache());
        setMaxRows(() => data.cache.totalCount);
        setGridRows((prevRows) => {
          if (DEBUG) {
            console.debug(
              'Is the new cache in fact new?',
              prevRows[0]?.id !== newRows[0]?.id,
            );
          }

          // update the rows; validate proper use of the cache.
          const result = [...prevRows, ...newRows];
          // if the Set size and result.length are different, report the
          // differences in the console.error
          if (result.length !== new Set(result.map((row) => row.id)).size) {
            // find the duplicate entries
            const duplicates = result.reduce((acc, row) => {
              acc[row.id] = (acc[row.id] || 0) + 1;
              return acc;
            }, {});

            if (DEBUG) {
              console.error(
                'The grid rows are not unique. This could be due to copying the cache more than once.',
                duplicates,
              );
            }
          }
          // invariant(
          //   result.length === new Set(result.map((row) => row.id)).size,
          //   'The grid rows are not unique. This could be due to copying the cache more than once.',
          // );
          return result;
        });

        setReadyForMore(false);
        reactivateScrollListener();

        if (purpose === PURPOSE_TYPES.MSPAN) {
          /* update the store with [[value, count]] */
        }

        break;
      }
      default:
      /* do nothing */
    }
    return () => {};
  }, [
    DEBUG,
    // when status changes, data will change and vice-versa
    data,
    status,
    purpose,
    identifier,
    readyForMore,
    toGridRowsFn,
    reactivateScrollListener,
  ]);

  // ---------------------------------------------------------------------------
  // 🔗 changes to filter -> readyForMore
  //
  useEffect(() => {
    reset();
    return () => {};
  }, [filter, reset]);

  // ---------------------------------------------------------------------------
  // gridHasAllValuesState
  //
  useEffect(() => {
    setInGridHasAllValuesState(() =>
      hasAllRecords(MAX_ROWS, gridRows.length, inFilterState),
    );
    return () => {};
  }, [DEBUG, MAX_ROWS, gridRows.length, inFilterState, inGridHasAllValuesState]);

  // ---------------------------------------------------------------------------
  // debug report
  if (DEBUG) {
    console.debug('%c----------------------------------------', 'color:orange');
    console.debug(`%c📋 ValueGridCore loaded state summary:`, 'color:orange', {
      identifier,
      purpose,
      MAX_ROWS,
      gridRowCount: gridRows.length,
      pageSizeProp,
      readyForMore,
      inNewClearedState,
      inGridHasAllValuesState: inGridHasAllValuesState
        ? `🎉 ${inGridHasAllValuesState}`
        : `⬜ ${inGridHasAllValuesState}`,
      inFilterState,
      dataPreloaded: Boolean(derivedDataRows),
      selectionModel,
      cache: {
        status,
        totalCount: data.cache.totalCount,
        cache: data.cache,
      },
    });
  }

  if (DEBUG) {
    console.log('👉 grid height function inputs', {
      rowCount: MAX_ROWS,
      limitGridHeight,
      rowHeight,
      headerHeight,
      gridHeightAdjustment,
    });
  }
  // ---------------------------------------------------------------------------

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ValueGridInner
      key={`ValueGrid-${identifier}`}
      className={className}
      rowClassName={clsx(className, 'row')}
      columnClassName={clsx(className, 'column')}
      rows={gridRows}
      rowCountTotal={MAX_ROWS}
      columns={columns}
      columnVisibilityModel={columnVisibilityModel}
      gridHeightProp={gridHeightFn(
        derivedDataRows?.length ?? MAX_ROWS,
        limitGridHeight,
        rowHeight,
        headerHeight,
        gridHeightAdjustment,
      )}
      rowHeight={rowHeight}
      headerHeight={headerHeight}
      error={error}
      loading={data.status === 'pending' ?? true}
      // filtering
      onFilterModelChange={handleFilterModelChange}
      handleClearFilter={handleClearFilter}
      inFilterState={inFilterState}
      resetFn={reset}
      // user input (selector model changes)
      checkboxSelection={checkboxSelection}
      onRowClick={onRowClick}
      onToggleAll={onToggleAll}
      rowSelectionModel={computeGridSelectionModel(gridRows)}
      tabindex='-1'
      {...rest}
    />
  );
};

const noop = () => {};

ValueGridCore.whyDidYouRender = true;
ValueGridCore.propTypes = {
  className: PropTypes.string.isRequired,
  filter: PropTypes.shape({}).isRequired,
  checkboxSelection: PropTypes.bool,
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  service: PropTypes.oneOf(Object.values(SERVICES)).isRequired,
  fetchFn: PropTypes.func.isRequired,
  abortController: PropTypes.shape({}),
  reduced: PropTypes.bool,
  identifier: PropTypes.string.isRequired,
  purpose: PropTypes.oneOf([...Object.values(PURPOSE_TYPES), 'matrix']).isRequired,
  pageSize: PropTypes.number.isRequired,
  limitGridHeight: PropTypes.number.isRequired,
  headerHeight: PropTypes.number,
  gridHeightAdjustment: PropTypes.number,
  rowHeight: PropTypes.number,
  normalizer: PropTypes.func.isRequired,
  selectionModel: PropTypes.shape({
    totalCount: PropTypes.number,
    selectionModel: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.array]),
    type: PropTypes.string,
  }),
  filterModel: PropTypes.shape({}),
  sortModel: PropTypes.arrayOf(PropTypes.shape({})),
  mapSymbols: PropTypes.shape({}),
  edgeToGridRowFn: PropTypes.func.isRequired,
  rowToIdFn: PropTypes.func,
  handleSetAllValues: PropTypes.func,
  handleSelectValue: PropTypes.func,
  handleSetSelectionModel: PropTypes.func,
  derivedDataRows: PropTypes.arrayOf(PropTypes.shape({})),
  rowCountTotal: PropTypes.number,
  DEBUG: PropTypes.bool,
};

ValueGridCore.defaultProps = {
  checkboxSelection: false,
  DEBUG: false,
  reduced: undefined,
  handleSetAllValues: noop,
  handleSelectValue: noop,
  handleSetSelectionModel: noop,
  selectionModel: undefined,
  filterModel: {
    items: [],
  },
  sortModel: [{ field: 'id', sort: 'asc' }],
  mapSymbols: undefined,
  abortController: undefined,
  headerHeight: HEADER_HEIGHT,
  gridHeightAdjustment: ADJUST_HEIGHT,
  rowHeight: ROW_HEIGHT,
  rowCountTotal: undefined,
  derivedDataRows: undefined,
  // selection model related
  rowToIdFn: undefined,
};

//-------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// Utility functions for the grid
//------------------------------------------------------------------------------
function hasAllRecords(MAX_ROWS, rowsInState, inFilterState) {
  return !inFilterState && rowsInState === MAX_ROWS;
}

/**
 * Apply a filter to the baseline select all filter
 *
 * NOTE: Different than the filter used to get row data.
 *
 * @function
 * @param {Object} filter
 * @param {GridFilterModel} filterModel
 * @return {Object} filter utilized by obs graphql
 */
function newFilterFrom(filter, filterModel) {
  const result =
    typeof filterModel === 'undefined'
      ? filter
      : filterModel.items
          .filter(({ value }) => typeof value !== 'undefined')
          // assemble the filter items from the grid
          .map(({ operatorValue, value }) => ({
            fieldName: operatorValue,
            value,
          }))
          .reduce(
            (acc, item) => {
              acc[item.fieldName] = item.value;
              return acc;
            },
            // merge the items with an updated selectAll filter
            { ...filter },
          );
  return result;
}

//-------------------------------------------------------------------------------
/**
 * Injects edge -> grid row transformation function
 *
 * Row data (edges) -> grid rows
 * Depends on paged edge data structure.
 * Transform the data from the api to what the valueGrid requires.
 * Note: raw data must be pre-processed using the api normalizer fn
 * @function
 * @param {Function} edgeToGridRowFn
 * @returns rows
 */
function toGridRows(edgeToGridRowFn) {
  return (data /* from the api */) => {
    if (typeof data === 'undefined' || (data?.edges ?? null) === null) {
      return [];
    }
    return data.edges.map(edgeToGridRowFn);
  };
}

//------------------------------------------------------------------------------
//
const WithErrorBoundary = (valueGridProps) => (
  <ErrorBoundary>
    <ValueGridCore {...valueGridProps} />
  </ErrorBoundary>
);
export default WithErrorBoundary;
