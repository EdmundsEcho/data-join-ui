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
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import { useGridApiRef } from '@mui/x-data-grid-pro';

import ValueGridInner, {
  filterOperators,
  gridHeightFn,
} from './ValueGridInner';
import ErrorBoundary from './ErrorBoundary';

// api interface
import { usePagination, STATUS } from '../../hooks/use-pagination';
import { InvalidStateError } from '../../lib/LuciErrors';
import { PURPOSE_TYPES } from '../../lib/sum-types';

// support functions
import { removeProp } from '../../utils/common';

// re-export
export { filterOperators };

//-----------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
const pureSelectionModel = {
  __ALL__: {
    value: '__ALL__',
    request: false, // grid reverses this semantic
  },
};

//------------------------------------------------------------------------------
// The main component
//------------------------------------------------------------------------------
/**
 *
 * @component
 *
 */
const ValueGridCore = ({
  className,
  columns,
  //
  // 📖 data and parsing
  //
  identifier, // lookup key
  purpose,
  baseSelectAll, // interface for using the key
  fetchFn, // api fetch
  normalizer, // raw api -> fodder for edgeToGridRowFn
  edgeToGridRowFn,
  edgeToIdFn,
  rows, // when data ::derivedField
  //
  // 🙂 user input (parent retrieves)
  //
  selectionModel,
  reduced,
  //
  // 📬 events that update the redux-store
  //
  handleSetAllValues,
  handleToggleValue,
  //
  // Grid version
  //
  feature,
  checkboxSelection,
  pageSize,
  limitRowCount,
  DEBUG,
  ...rest
}) => {
  //
  const apiRef = useGridApiRef();
  // initialize the api edge -> grid row transformer
  const toGridFn = toGrid(edgeToIdFn, edgeToGridRowFn);

  // derived fields (e.g., group-by-file, already have data
  const dataPreloaded = typeof rows !== 'undefined';

  if (DEBUG && typeof rows !== 'undefined') {
    console.debug(`rows`);
    console.dir(rows);
  }

  //----------------------------------------------------------------------------
  // PAGE SIZE (size of each api response)
  //----------------------------------------------------------------------------
  const PAGE_SIZE = pageSize;

  // ---------------------------------------------------------------------------
  // 📖 Infinity window using the pagination hook
  //
  const {
    fetchPage,
    setFilter: setFetchFilter,
    status,
    data,
  } = usePagination({
    fetchFn,
    normalizer, // raw api -> fodder for the edge -> row
    filter: baseSelectAll,
    feature,
    pageSize: PAGE_SIZE,
    turnOff: dataPreloaded, // turn off api fetch
  });

  if (typeof PAGE_SIZE === 'undefined') {
    throw new InvalidStateError(
      `The ValueGrid must maintain a valid page size prop: ${identifier}`,
    );
  }
  // ---------------------------------------------------------------------------
  // 🙂 Primary user input
  // Default and/or user-directed requested values
  //
  // 🔑 totalCount sets the MAX_ROWS value; it may start as undefined. The second
  // source arrives onces the api returns.
  //
  const {
    totalCount,
    selectionModel: storeSelectionModel = pureSelectionModel,
  } = selectionModel;
  const modelType = selectionModelType(storeSelectionModel);
  const storeRowCount = Object.keys(storeSelectionModel).length;

  // ---------------------------------------------------------------------------
  // 🙂  Building a series or not
  //
  // 💫  Should re-render the component when the series-switch is toggled
  // component-specific reduced request vs expressed (i.e., series)
  // bool | undefined when quality
  // true -> single value
  // false -> series
  // undefined -> isQuality
  //
  // const { switchOn /* setDisableSwitch */ } = useContext(ToolContext);
  const inSeriesBuildingStateStore =
    typeof reduced === 'undefined' ? false : !reduced;

  // ---------------------------------------------------------------------------
  // State-machine toggles :/
  // ---------------------------------------------------------------------------
  // a constant, set when the api returns 'success'
  const [MAX_ROWS, setMaxRows] = useState(() => totalCount);
  // set when the api returns, used to set the grid error prop
  const [error, setError] = useState(() => undefined);
  // latch for one-time render when the api status = 'success'; override
  // when the rows prop is valid
  const [readyForMore, setReadyForMore] = useState(
    () => typeof rows === 'undefined',
  );
  // changes how the footer displays the record counts
  const [inFilterState, setInFilterState] = useState(() => false);
  // tracks when the paging endCursor is invalid
  const [inNewClearedState, setInNewClearedState] = useState(() => true);
  // tracks when can avoid api to retrieve a full list
  // when transition to inSeriesBuildingState
  const [inGridHasAllValuesState, setInGridHasAllValuesState] = useState(
    () => false,
  );
  // changes the data request and how the selection model is recorded
  const [inSeriesBuildingState, setInSeriesBuildingState] = useState(
    () => inSeriesBuildingStateStore,
  );
  // inSeriesBuilding: ensures setting REQUEST model using the all of the values
  const [inFromSelectAllState, setInFromSelectAllState] = useState(
    () => undefined,
  );

  // ---------------------------------------------------------------------------
  // 🔗 inSeriesBuildingStateStore -> inSeriesBuildingState
  //
  useEffect(() => {
    if (inSeriesBuildingState !== inSeriesBuildingStateStore) {
      setInSeriesBuildingState(() => inSeriesBuildingStateStore);
    }
  }, [inSeriesBuildingState, inSeriesBuildingStateStore]);

  // ---------------------------------------------------------------------------
  // Initial state to call when hit reset
  //
  const initialState = useCallback(() => {
    setMaxRows(totalCount);
    setError(undefined);
    setReadyForMore(true);
    setInFilterState(false);
    setInNewClearedState(true);
    setInFromSelectAllState(undefined);
    setInGridHasAllValuesState(false);
  }, [totalCount]);

  if (DEBUG) {
    console.debug(`%c📖 The grid state`, 'color:purple');
    console.dir({
      identifier,
      purpose,
      MAX_ROWS: MAX_ROWS || totalCount,
      pageSize,
      readyForMore,
      inFilterState,
      inNewClearedState,
      inGridHasAllValuesState,
      inFromSelectAllState,
      inSeriesBuildingState,
      dataPreloaded,
      cache: {
        status,
        totalCount: data.cache.totalCount,
        edges: data.cache.edges,
      },
    });
  }

  // ----------------------------------------------------------------------
  // Infinite scrolling feature
  //
  const handleOnRowScrollEnd = ({ viewportPageSize }) => {
    // if (apiRef.current.getVisibleRowModels().size < MAX_ROWS) {
    // 🦀 ?
    const gridRowCount = apiRef.current.getAllRowIds().length;
    if (gridRowCount > 0 && gridRowCount < MAX_ROWS) {
      const nextPageSize = Math.max(PAGE_SIZE, viewportPageSize);

      let max;
      if (inNewClearedState) {
        /* set the cursor to the max value of ids */
        const ids = apiRef.current.getAllRowIds();
        max = ids.sort()[ids.length - 1];
        setInNewClearedState(false);
      }

      const _ =
        feature === 'SCROLL'
          ? fetchPage({ pageSize: nextPageSize, after: max })
          : fetchPage();
      setReadyForMore(() => true);
    }
  };
  // ---------------------------------------------------------------------------
  // set fromSelectAllState
  // 🔖 undefined seems to have meaning ( ⬜ validate design )
  //
  useEffect(() => {
    if (inSeriesBuildingState) {
      // catch the all selected state; only reset when length === 0
      if (storeRowCount === MAX_ROWS) {
        setInFromSelectAllState(() => true);
      }
      if (storeRowCount === 0) {
        setInFromSelectAllState(() => false);
      }
    }
  }, [MAX_ROWS, inSeriesBuildingState, storeRowCount]);
  //
  // local routine that coordinates how to update the store
  // with that state of the grid.
  //
  // task: update the storeState using the full list of values, request = true
  //
  // Where are all of the values?
  // 🚫  the selection model is empty (b/c all are selected)
  // 🚫  the cache generally cannot be trusted to host all of them
  //     (e.g., what if a filter was applied...)
  // ✅  only the grid itself if we know it has all of the values
  //     ... this was accomplished by definition of the
  //     inSeriesBuildingState (recall with max rows 100)
  //
  const selectAllValues = useCallback(() => {
    if (DEBUG) {
      console.debug(`%cCalled selectAllValues: ${identifier}`, 'color:green');
      console.assert(
        apiRef.current.getSelectedRows().size !== 0,
        `${identifier}: selectAllValues trying to empty what is already empty: ${
          apiRef.current.getSelectedRows().size
        }`,
      );
    }
    // store gets full list request: true

    handleSetAllValues(rowIdsToRequestModel(apiRef.current.getAllRowIds()));
    // grid selection model gets an empty list
    apiRef.current.setSelectionModel([]);
  }, [DEBUG, apiRef, identifier, handleSetAllValues]);

  const deSelectAllValues = useCallback(() => {
    if (DEBUG) {
      console.debug(`%cCalled deSelectAllValues: ${identifier}`, 'color:red');
      console.assert(
        apiRef.current.getSelectedRows().size === 0,
        `${identifier}: deSelect is trying to fill, when not empty: ${
          apiRef.current.getSelectedRows().size
        }`,
      );
    }
    // store gets set to a state that will accumulate values REQUEST true
    handleToggleValue({ level: [], isSelected: false });
    // grid selection model gets the full list
    apiRef.current.setSelectionModel(apiRef.current.getAllRowIds());
  }, [DEBUG, apiRef, identifier, handleToggleValue]);

  const handleToggleAll = useCallback(
    ({ field }) => {
      if (field !== '__check__') return;
      // ⚠️  recall: isSelected = !selected in the grid.
      const isSelected = apiRef.current.getSelectedRows().size === 0;
      if (inSeriesBuildingState && !isSelected) {
        selectAllValues();
      }
      if (inSeriesBuildingState && isSelected) {
        deSelectAllValues();
      }
      if (!inSeriesBuildingState) {
        const storeSelectionModelGenerator = {
          __ALL__: {
            value: '__ALL__',
            request: !storeSelectionModel?.__ALL__?.request ?? false,
          },
        };
        if (DEBUG) {
          console.log(`%cisSelected: ${isSelected}`, 'color:orange');
          console.dir(storeSelectionModelGenerator);
          console.debug(
            ` 📬 handleToggleValue: leve: [] isSelected: ${storeSelectionModelGenerator.__ALL__.request}`,
          );
        }
        handleToggleValue({
          level: [], // valueIdx [] encodes ALL
          isSelected: storeSelectionModelGenerator.__ALL__.request,
        });
        apiRef.current.setSelectionModel(
          makeGridSelectionModel(
            storeSelectionModelGenerator,
            apiRef.current.getAllRowIds(),
          ),
        );
      }
    },
    [
      DEBUG,
      apiRef,
      deSelectAllValues,
      inSeriesBuildingState,
      selectAllValues,
      storeSelectionModel?.__ALL__?.request,
      handleToggleValue,
    ],
  );

  // ----------------------------------------------------------------------
  // Key assertions prior to running more complex effects
  // (they won't always pass, but need to at the "right time")
  //
  if (DEBUG) {
    const isQuality = purpose === PURPOSE_TYPES.QUALITY;
    console.assert(
      (typeof reduced === 'undefined' && isQuality) || !isQuality,
      `${identifier}: The store reduced state should be undefined for Quality values: isQuality: ${isQuality} reduced: ${reduced}`,
    );
    console.assert(
      inSeriesBuildingStateStore === inSeriesBuildingState,
      `${identifier}: Store does not align with component state: inSeriesBuildingStateStore: ${inSeriesBuildingStateStore} !== inSeriesBuildingState: ${inSeriesBuildingState}`,
    );
    console.assert(
      inSeriesBuildingState === !reduced ||
        isQuality ||
        typeof reduced === 'undefined',
      `${identifier}: Store does not align with component state: reduced: ${reduced} === inSeriesBuildingState: ${inSeriesBuildingState}`,
    );
  }

  // ----------------------------------------------------------------------
  // Pull extra data when in the inSeriesBuildingState
  //
  // in building series state, pull all of the values to
  // set a 'REQUEST' type selection model
  //
  // 👍 It's possible to manually select less than 100
  // 👍 or 👎 it's also possible to manually select over 100 too :)
  //
  useEffect(() => {
    if (DEBUG) {
      console.debug(
        `%cEffect - maybe (look for yellow): ${identifier}`,
        'color: green',
      );
    }
    if (
      inSeriesBuildingState &&
      !modelType.seriesCompatible(inFromSelectAllState)
    ) {
      if (DEBUG) {
        console.debug(
          `%cChanging the filter to get series data: Effect for: ${identifier} in series: ${inSeriesBuildingState} model type: ${modelType.type}`,
          'color: yellow',
        );
      }
      //
      // when the grid has all values
      // ... just update the store's selection model by combining the
      // current value of the store with allValues
      //
      if (inGridHasAllValuesState) {
        if (DEBUG) {
          console.debug(
            ` 📬 handleSetAllValues: ${makeStoreRequestSelectionModel(
              storeSelectionModel,
              apiRef.current.getAllRowIds(),
              (id) => ({ value: id, request: true }),
              inFromSelectAllState,
            )}`,
          );
        }
        handleSetAllValues(
          makeStoreRequestSelectionModel(
            storeSelectionModel,
            apiRef.current.getAllRowIds(),
            (id) => ({ value: id, request: true }),
            inFromSelectAllState,
          ),
        );

        // fill-up the store state
        // rowIdsToRequestModel(apiRef.current.getAllRowIds()),
        //
        // fill-up the grid selection model
        // apiRef.current.setSelectionModel(apiRef.current.getAllRowIds());
        //
        // do what is done to merge handleToggleValue
        // send a new selection model to the store
        // the grid rows nor the grid selection model changes
      }

      if (!inGridHasAllValuesState && MAX_ROWS <= 100) {
        // create and set a new filter
        // use the values to create a new selection model
        setFetchFilter(newFilterFrom(baseSelectAll), MAX_ROWS);
        setReadyForMore(() => true);
      } else {
        // take the ui out of this state
        // ⬜ Provide the user with a message
        /* eslint-disable-next-line */
        window.alert(`Too many component levels to include in a series`);
        // setSwitchOn(false);
      }
    }
  }, [
    DEBUG,
    MAX_ROWS,
    apiRef,
    baseSelectAll,
    identifier,
    inFromSelectAllState,
    inGridHasAllValuesState,
    inSeriesBuildingState,
    handleSetAllValues,
    setFetchFilter,
    storeSelectionModel,
    modelType,
  ]);

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
    ({ filterModel = undefined }) => {
      setFetchFilter(newFilterFrom(baseSelectAll, filterModel));
      /*
      setInFilterState(typeof filterModel !== 'undefined');
      setInNewClearedState(true);
      setReadyForMore(true);
            */
    },
    [baseSelectAll, setFetchFilter],
  );
  // ---------------------------------------------------------------------------
  // Reset the state of the grid
  //
  const reset = useCallback(() => {
    if (typeof rows === 'undefined') {
      apiRef.current.setFilterModel({
        items: [],
      });
    }
    apiRef.current.setRows(rows ?? []);
    initialState();
  }, [apiRef, initialState, rows]);

  //
  // hidden + visible -> all visible
  //
  const handleClearFilter = useCallback(() => {
    apiRef.current.setFilterModel({
      items: [],
    });
    apiRef.current.setSortModel([{ field: 'id', sort: 'asc' }]);
    setInFilterState(false);
    setInNewClearedState(true);
    handleFilterModelChange({});
  }, [apiRef, handleFilterModelChange]);

  // -------------------------------------------------------------------------
  // Set the MAX_ROWS following fetch request (flag readyForMore)
  //
  useEffect(() => {
    if (status === 'success') {
      setMaxRows(() => data.cache.totalCount);
    }
  }, [data.cache.totalCount, readyForMore, status]);

  // ---------------------------------------------------------------------------
  // Effect applied when
  //
  //   1️⃣  data.status changes
  //
  //      👉 from 'success' -> 'pending' => do nothing
  //      👉 from 'pending' -> 'error' => display error
  //      👉 from 'pending' -> 'success' => concat rows to local state
  //
  //   2️⃣  redux store values change (user update of selected)
  //
  //      👉 'success', prevSelectList -> 'success', newSelectList
  //         => update selection model
  //
  // ---------------------------------------------------------------------------
  useEffect(() => {
    switch (true) {
      case status === STATUS.REJECTED:
        setError({ message: JSON.stringify(data.cache) });
        break;

      // ---------------------------------------------------------------------------
      // Success scenarios
      //
      // When building a series of fields, the format of the selection model
      // changes to one that describes every level (i.e., does not use ALL)
      //
      case status === STATUS.RESOLVED &&
        readyForMore &&
        inSeriesBuildingState &&
        !inFromSelectAllState:
        if (DEBUG) {
          console.debug(`%cEffect Expanding to Series`, 'color:yellow');
          console.debug(
            ` 📬 handleSetAllValues: ${makeStoreRequestSelectionModel(
              storeSelectionModel,
              data.cache.edges,
              (edge) => ({ value: edge.node.level, request: true }),
              inFromSelectAllState,
            )}`,
          );
        }
        handleSetAllValues(
          makeStoreRequestSelectionModel(
            storeSelectionModel,
            data.cache.edges,
            (edge) => ({ value: edge.node.level, request: true }),
            inFromSelectAllState,
          ),
        );
        setReadyForMore(() => false);
        setMaxRows(() => data.cache.totalCount);
        break;

      //
      // otherwise...
      //
      case status === STATUS.RESOLVED && readyForMore: {
        if (DEBUG) {
          console.debug(`%cEffect *not inSeriesMode*`, 'color:yellow');
        }
        const { rows: newRows, selectedRows: newSelected } = toGridFn(
          data.cache,
          storeSelectionModel,
        );

        apiRef.current.updateRows(newRows);
        apiRef.current.selectRows(newSelected);

        setReadyForMore(() => false);
        setMaxRows(() => data.cache.totalCount);

        if (purpose === PURPOSE_TYPES.MSPAN) {
          /* update the store with [[value, count]] */
        }

        break;
      }
      default:
      /* do nothing */
    }
  }, [
    data,
    DEBUG,
    apiRef,
    handleSetAllValues,
    identifier,
    inFromSelectAllState,
    inSeriesBuildingState,
    purpose,
    readyForMore,
    status,
    storeSelectionModel,
    toGridFn,
  ]);

  // ---------------------------------------------------------------------------
  // gridHasAllValuesState
  //
  useEffect(() => {
    if (DEBUG) {
      console.debug(
        `👉 The grid row count: ${apiRef.current.getAllRowIds().length}`,
        `\n👉 MAX_ROWS: ${MAX_ROWS}`,
        `\n👉 inFilterState: ${inFilterState}`,
        inGridHasAllValuesState
          ? `\n🎉 inGridHasAllValuesState: ${inGridHasAllValuesState}`
          : `\n⬜  inGridHasAllValuesState: ${inGridHasAllValuesState}`,
      );
    }
    setInGridHasAllValuesState(() =>
      hasAllRecords(apiRef, MAX_ROWS, inFilterState),
    );
  }, [DEBUG, MAX_ROWS, apiRef, inFilterState, inGridHasAllValuesState]);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ValueGridInner
      apiRef={apiRef}
      className={clsx(className)}
      rowClassName={clsx(className, 'row')}
      columnClassName={clsx(className, 'column')}
      columns={columns}
      rows={rows}
      MAX_ROWS={MAX_ROWS /* from api */ || totalCount /* from redux */}
      gridHeightProp={gridHeightFn(rows?.length ?? MAX_ROWS, limitRowCount)}
      error={error}
      onRowsScrollEnd={handleOnRowScrollEnd}
      loading={data.status === 'pending' ?? true}
      // user input
      checkboxSelection={checkboxSelection}
      onRowSelected={handleToggleValue}
      onToggleAll={handleToggleAll}
      tabindex='-1'
      // filtering
      onFilterModelChange={handleFilterModelChange}
      handleClearFilter={handleClearFilter}
      inFilterState={inFilterState}
      resetFn={reset}
      {...rest}
    />
  );
};

ValueGridCore.whyDidYouRender = true;
ValueGridCore.propTypes = {
  className: PropTypes.string,
  baseSelectAll: PropTypes.shape({}).isRequired,
  checkboxSelection: PropTypes.bool,
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  feature: PropTypes.oneOf(['SCROLL', 'LIMIT']).isRequired,
  fetchFn: PropTypes.func.isRequired,
  reduced: PropTypes.bool,
  identifier: PropTypes.string.isRequired,
  purpose: PropTypes.oneOf([...Object.values(PURPOSE_TYPES), 'matrix'])
    .isRequired,
  pageSize: PropTypes.number.isRequired,
  limitRowCount: PropTypes.number,
  normalizer: PropTypes.func.isRequired,
  selectionModel: PropTypes.shape({
    totalCount: PropTypes.number,
    selectionModel: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.array]),
    type: PropTypes.string,
  }),
  edgeToGridRowFn: PropTypes.func.isRequired,
  edgeToIdFn: PropTypes.func,
  handleSetAllValues: PropTypes.func,
  handleToggleValue: PropTypes.func,
  rows: PropTypes.arrayOf(PropTypes.shape({})),
  DEBUG: PropTypes.bool,
};

ValueGridCore.defaultProps = {
  className: '',
  checkboxSelection: false,
  DEBUG: false,
  reduced: undefined,
  handleSetAllValues: () => {},
  handleToggleValue: () => {},
  selectionModel: {
    totalCount: undefined,
    selectionModel: { __ALL__: { value: '__ALL__', request: true } },
  },
  // ⬜ move this to a required prop
  edgeToIdFn: (edge) => edge.node.level,
  limitRowCount: undefined, // number of rows to display
  rows: undefined,
};

//-------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// Utility functions for the grid
//------------------------------------------------------------------------------
function hasAllRecords(apiRef, MAX_ROWS, inFilterState) {
  return !inFilterState && apiRef.current.getAllRowIds().length === MAX_ROWS;
}

/**
 * Apply a filter to the baseline select all filter
 *
 * @function
 * @param {Object} baseSelectAll
 * @param {GridFilterModel} filterModel
 * @return {Object} filter utilized by obs graphql
 */
function newFilterFrom(baseSelectAll, filterModel) {
  const result =
    typeof filterModel === 'undefined'
      ? baseSelectAll
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
            { ...baseSelectAll },
          );
  return result;
}
//-------------------------------------------------------------------------------
/**
 *     grid ids -> store request model (type REQUEST)
 */
function rowIdsToRequestModel(ids) {
  return ids.reduce((requestModel, id) => {
    /* eslint-disable-next-line */
    requestModel[id] = { value: id, request: true };
    return requestModel;
  }, {});
}
//-------------------------------------------------------------------------------
/**
 * Transform the levels recieved from the api to what the valueGrid requires.
 * Combine the api information with the user-input recorded in the
 * redux-store.
 *
 * 🔑 The store records either levels requested or levels not requested;
 *    not a mix of requested and not requested. Accordingly, the listTypes
 *    are 'REQUEST' | 'ANTIREQUEST'
 *
 * ⚠️  The ValueGrid reverses the semantic of selecting a row.  This chosen
 *    approach reflects the bias that all records are inherently selected.
 *    The exception is to not be selected.
 *
 */
function toGrid(edgeToIdFn, edgeToGridRowFn) {
  return (data, requestOrNotList) => {
    const seed = { rows: [], selectedRows: [] };
    if (typeof data === 'undefined' || (data?.edges ?? null) === null) {
      return seed;
    }
    const { addPredicate } = addToSelectionModelPredicate(
      requestOrNotList,
      true, // useGlobalEmptyModel
    );

    // ---------------------------------------------------------------------------
    //
    //  edgeToValueId :: edge -> valueId
    //
    const { rows, selectedRows } = data.edges.reduce(
      /* eslint-disable no-shadow */
      ({ rows, selectedRows }, edge) => {
        // -----------------------------------------------------------------------
        // 1️⃣  render the data to display
        rows.push(edgeToGridRowFn(edge));
        // -----------------------------------------------------------------------
        // 2️⃣  render which values are selected
        // ... and reverse the display logic
        if (addPredicate(edgeToIdFn(edge))) {
          selectedRows.push(edge.node.level);
        }
        return { rows, selectedRows };
      },
      /* eslint-enable no-shadow */
      seed,
    );

    return { rows, selectedRows };
  };
}

//-------------------------------------------------------------------------------
/**
 *
 * 2️⃣  Predicate that determines whether to add a
 *    row to the selectionModel.
 *
 * @function
 * @param {Array<(string | number)>}
 * @return bool
 */
function addToSelectionModelPredicate(
  requestOrNotList,
  useGlobalEmptyModel = false,
) {
  const [isAll = false, allRequested] = [
    requestOrNotList?.__ALL__,
    requestOrNotList?.__ALL__?.request, // ⚠️  reverse, for !isSelected
  ];

  const globalEmptyModel = useGlobalEmptyModel ? isAll && allRequested : false;

  const listType = selectionModelType(requestOrNotList).type;

  return {
    isAll,
    allRequested,
    addPredicate: (rowId) => {
      const whatIsTheRequest =
        requestOrNotList?.[rowId]?.request ?? listType !== 'REQUEST';
      //
      // selectModel displays ✅ when *not* on the list
      // ...only add to the selectionModel when !request
      return (
        !globalEmptyModel && ((isAll && !allRequested) || !whatIsTheRequest)
      );
    },
  };
}
//-------------------------------------------------------------------------------
/**
 *
 * Provides an updated selection model required following
 * user changes in the values requested.
 *
 * 💡 The rows are not recomputed when changing the request value.
 *    The redux-store receives the event and changes the store.
 *    This handler updates the selectionModel for the grid.
 *
 * @function
 * @param {Array} newSelectionModel
 * @param {Array<GridRowModel>} rows
 * @return {Array} updated selectionModel
 */
function makeGridSelectionModel(storeRequestOrNotList, allRowIds) {
  const { isAll, allRequested, addPredicate } = addToSelectionModelPredicate(
    storeRequestOrNotList,
  );

  if (isAll && allRequested) return [];
  if (isAll && !allRequested) return allRowIds;

  /* eslint-disable no-shadow */
  const selectedRows = allRowIds.reduce((selectedRows, rowId) => {
    if (addPredicate(rowId)) {
      selectedRows.push(rowId);
    }
    return selectedRows;
  }, []);
  /* eslint-enable no-shadow */

  return selectedRows;
}

//------------------------------------------------------------------------------
//
function selectionModelType(requestOrNotList) {
  // empty bias = REQUEST
  const tmp = Object.values(requestOrNotList)?.[0]?.request ?? true;
  const isAll = Object.keys(requestOrNotList).includes('__ALL__');
  return tmp
    ? {
        type: 'REQUEST',
        isAll,
        seriesCompatible: (inFromSelectAllState = false) =>
          inFromSelectAllState || !isAll,
      }
    : { type: 'ANTIREQUEST', isAll, seriesCompatible: () => isAll };
}

//------------------------------------------------------------------------------
// 🧮 compute a 'REQUEST' list by combining the list of all values
//    with the current selectionModel
//
//    @return {Object} the store selection model
//
function makeStoreRequestSelectionModel(
  storeSelectionModel,
  allValues,
  toStoreEntryFn,
  inFromSelectAllState,
) {
  const model = selectionModelType(storeSelectionModel);
  if (model.seriesCompatible(inFromSelectAllState)) {
    return storeSelectionModel;
  }
  const fullRequestModel = Object.values(allValues)
    .map((edge) => toStoreEntryFn(edge))
    .reduce((acc, entry) => {
      acc[entry.value] = entry;
      return acc;
    }, {});
  if (model.type === 'REQUEST' && model.isAll) {
    return fullRequestModel;
  }
  // ... when ANTIREQUEST, remove from the fullRequestModel
  // when storeSelectionModel = false
  // base = allEdges
  return removeProp(Object.keys(storeSelectionModel), fullRequestModel);
}

//------------------------------------------------------------------------------
//
const WithErrorBoundary = (valueGridProps) => (
  <ErrorBoundary>
    <ValueGridCore {...valueGridProps} />
  </ErrorBoundary>
);
export default WithErrorBoundary;
