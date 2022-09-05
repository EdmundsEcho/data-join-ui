// src/ducks/actions/workbench.actions.js

import { makeActionCreator } from '../../utils/makeActionCreator';

//------------------------------------------------------------------------------
// middleware-related actions
// feature
export const WORKBENCH = '[Workbench]'; // feature
export const feature = WORKBENCH;

// Part of the March '20 push
export const TOGGLE_VALUE = `${WORKBENCH} SET REQUEST VALUE`;
export const TOGGLE_REDUCED = `${WORKBENCH} SET REDUCED`;

export const UPDATE_ETLUNIT_TEXT = `${WORKBENCH} UPDATE etlUnit TEXT`;
//
// commands
// Migrating to middleware WIP
export const FETCH_WAREHOUSE = `${WORKBENCH} FETCH`; // command from StepBar
export const CANCEL_WAREHOUSE = `${WORKBENCH} CANCEL`; // command
export const RESET_CANVAS = `${WORKBENCH} RESET`; // command

// data-related
// set the group semantic to generate a derived field
export const ADD_DERIVED_FIELD = `${WORKBENCH} ADD DERIVED FIELD`; // command

export const MOVE_TREE = `${WORKBENCH} MOVE TREE`; // command
export const REMOVE_NODE = `${WORKBENCH} REMOVE NODE`; // command

// document
export const SET_TREE = `${WORKBENCH} SET TREE`;
export const RESET_TREE = `${WORKBENCH} CLEAR`;
export const SET_CHILDIDS = `${WORKBENCH} SET CHILDIDS`;
export const SET_DRAGGED_ID = `${WORKBENCH} SET DRAGGED ID`;
export const SET_MSPAN_REQUEST = `${WORKBENCH} SET MSPAN REQUEST`;
export const SET_COMP_REDUCED = `${WORKBENCH} SET COMP REDUCED (request)`;
export const SET_COMP_VALUES = `${WORKBENCH} SET COMP VALUES (model)`;
export const SET_GROUP_SEMANTIC = `${WORKBENCH} SET GROUP SEMANTIC`;
export const SET_NODE_STATE = `${WORKBENCH} SET NODE STATE`;
// document the status/need to recompute the project-warehouse
export const TAG_WAREHOUSE_STATE = `${WORKBENCH} TAG WAREHOUSE STATE`;

// event
export const DND_DRAG_END = `${WORKBENCH} DND DRAG END`; // map to event
export const DND_DRAG_START = `${WORKBENCH} DND DRAG START`;

// action kind :: command
export const addDerivedField = (payload) => ({
  type: ADD_DERIVED_FIELD,
  payload,
});

// action kind :: command
export const moveTree = (payload) => ({
  type: MOVE_TREE,
  payload,
});

// action kind :: command
export const removeNode = (payload) => ({
  type: REMOVE_NODE,
  payload,
});

// action kind :: command
// retrieve the value from the store
// function* _fetch({ type, meta: { feature, uiKey } }) {
// 🔖 project id is injected using middleware
export const fetchWarehouse = (startTime /* { etlObject } */) => ({
  type: FETCH_WAREHOUSE,
  startTime,
  payload:
    'middleware to pull etlObject from store (see extraction in network)',
});

// action kind :: command
export const cancelWarehouse = () => ({
  type: CANCEL_WAREHOUSE,
  payload: 'workbench',
});

// action kind :: document
export const setTree = (payload) => ({
  type: SET_TREE,
  payload,
});

export const resetTree = () => ({
  type: RESET_TREE,
});

// action kind :: document
export const setNodeState = (payload) => ({
  type: SET_NODE_STATE,
  payload,
});

// document
export const tagWarehouseState = (payload) => ({
  type: TAG_WAREHOUSE_STATE,
  payload,
});

/**
 * Action creator
 * action kind :: document
 * payload: id, childIds
 *
 * @function
 * @param {Object} paylaod
 * @return {Object} event
 */
export const setChildIds = (payload) => ({
  type: SET_CHILDIDS,
  payload,
});

// action kind :: document
export const setSpanValue = makeActionCreator(
  SET_MSPAN_REQUEST,
  'id',
  'identifier',
  'valueIdx',
  'payload',
);

// action kind :: document
export const setCompReduced = makeActionCreator(
  SET_COMP_REDUCED,
  'id',
  'identifier',
  'valueIdx',
  'payload',
);
// action kind :: document
export const setCompValues = makeActionCreator(
  SET_COMP_VALUES,
  'id',
  'identifier',
  'payload',
);

//------------------------------------------------------------------------------
/**
 * Dnd event
 * action kind :: event -> map to action
 * payload: dnd event data
 *
 * @function
 * @param {Object} paylaod
 * @return {Object} event
 */
export const onDndDragEnd = (payload) => ({
  type: DND_DRAG_END,
  payload,
});
/**
 * Dnd event
 * payload: dnd event data
 *
 * @function
 * @param {Object} paylaod
 * @return {Object} event
 */
export const onDndDragStart = (payload) => ({
  type: DND_DRAG_START,
  payload,
});
/**
 * Action creator
 * action kind :: document
 * payload: id
 *
 * @function
 * @param {Object} paylaod
 * @return {Object} event
 */
export const setDraggedId = (payload) => ({
  type: SET_DRAGGED_ID,
  payload,
});
/**
 * Action creator
 * action kind :: document
 * payload: id
 *
 * @function
 * @param {Object} paylaod
 * @return {Object} event
 */
export const setGroupSemantic = (payload) => ({
  type: SET_GROUP_SEMANTIC,
  payload,
});
//------------------------------------------------------------------------------

// reinitialize the workbench
// action kind :: command
export const resetCanvas = () => ({
  type: RESET_CANVAS,
});

// Updates to Canvas ETL units
export const updateEtlUnitIdentifier = makeActionCreator(
  UPDATE_ETLUNIT_TEXT,
  'cardIdentifier',
  'text',
);
//
// 🚧 WIP: part of March '20 push
// scrappy overloaded function to update
// component, component values, quality values
//
// 🔖 The values encode a "selectionModel"; not the values themselves
//    necessarily. e.g., {__ALL__: { value: __ALL__, request: true }}
//
// see also: setCompValues
//
export const toggleValue = makeActionCreator(
  TOGGLE_VALUE,
  'id', // nodeId number
  'valueOrId', // number | number[]
  'identifier', // string
  'isSelected', // bool
);
// 🚧 WIP: part of March '20 push
export const toggleReduced = makeActionCreator(
  TOGGLE_REDUCED,
  'id', // nodeId number
  'valueOrId', // for mspan values; number?
  'identifier', // string
);

// END
