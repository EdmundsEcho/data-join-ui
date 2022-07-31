// src/ducks/middleware/feature/workbench.middleware.js

/**
 * @module middleware/feature/workbench.middleware
 *
 * @description
 *
 * 🚧 This is feature specific and not fully implemented
 *    Part of standardizing the messaging system using middleware
 *
 * ⚠️  Is part of the v2 store
 *
 * This is thus far a failed attempt to re-use the xstate polling request
 * service.  The mini-api fails because it does not support the sequence
 * 1. sync request from the api: etlObject -> obsEtl
 * 2. async, polling instantiation of the warehouse obsEtl -> warehouse
 *
 * 🔖 as of July 2021 works in confunction with workbench.sagas
 *
 */
import {
  // pass-through document
  TYPES,
  SET_MSPAN_REQUEST,
  SET_COMP_REDUCED,
  //
  WORKBENCH, // feature
  ADD_DERIVED_FIELD, // command
  FETCH_WAREHOUSE, // command
  CANCEL_WAREHOUSE, // command
  RESET_CANVAS, // command
  MOVE_TREE, // command from the workbench
  REMOVE_NODE, // command from the workbench
  DND_DRAG_START, // event
  DND_DRAG_END, // event
  setTree, // document
  setNodeState, // document
  setChildIds, // document
  setDraggedId, // document
  setGroupSemantic, // document
  moveTree,
  tagWarehouseState,
  // MAKE_COMP_SERIES, // command
  // setCompValues, // document
} from '../../actions/workbench.actions';
import {
  ApiCallError,
  ApiResponseError,
  InvalidTreeStateError,
} from '../../../lib/LuciErrors';
import {
  fetchMatrixCache,
  SET_MATRIX_CACHE, // command
} from '../../actions/matrix.actions';
import {
  POLLING_RESOLVED,
  POLLING_ERROR,
  // CANCEL, ⬜ using the back button will cancel
  apiCancel,
  apiFetch,
  // pollingEventError,
} from '../../actions/api.actions';
import { setNotification } from '../../actions/notifications.actions';
// import { POLLING_API } from '../../actions/polling.actions'; // tmp
import { setLoader } from '../../actions/ui.actions';
import prepareForTransit from '../../../lib/filesToEtlUnits/transforms/prepare-for-transit';

import { ServiceConfigs, getServiceType } from '../../../services/api';

// 📖 tree state
import {
  getTree,
  selectNodeState,
  getEtlObject,
  resetCanvas,
  isHostedWarehouseStateStale,
} from '../../rootSelectors';
import { Tree } from '../../../lib/obsEtlToMatrix/tree';
import { moveItemInArray, removeProp } from '../../../utils/common';
// normalize obsetl
import {
  iniEtlUnitMea,
  iniEtlUnitQual,
} from '../../../lib/obsEtlToMatrix/display-obsetl';

import { NODE_TYPES } from '../../../lib/sum-types';

import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true' ||
  process.env.REACT_APP_DEBUG_WORKBENCH_TREE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const MAX_TRIES = 20;

/* --------------------------------------------------------------------------- */
const middleware =
  ({ dispatch, getState }) =>
  (next) =>
  (action) => {
    //
    if (DEBUG) {
      console.info('👉 loaded workbench.middleware');
    }

    if (action.type === 'PING')
      console.log(
        `%cPING recieved by workbench.middleware`,
        colors.light.purple,
      );

    if (action.type === 'MIDDLE')
      console.log(
        `%cMIDDLE recieved by workbench.middleware`,
        colors.light.purple,
      );

    // dispatch the current action in action.type with the closure that is
    // about to be returned.
    next(action);

    switch (action.type) {
      case 'VALIDATE_TREE': {
        const tree = getTree(getState());
        const hasDanglingBranches = Object.keys(tree).reduce((acc, key) => {
          const noChildren = tree[key].childIds.length === 0;
          const isLeaf = tree[key].height === 4;
          return acc || (noChildren && !isLeaf);
        }, false);
        next(
          setNotification({
            message: `Dangling branches: ${hasDanglingBranches}`,
            feature: WORKBENCH,
          }),
        );
        break;
      }

      /*
       * Group-specific action
       * Sequence accomplished with repeated calls:
       * 👉 empty -> derived field
       * 👉 derived field -> configured derived field
       *
       * each call maps to a call to update the node's cache
       */
      case ADD_DERIVED_FIELD: {
        // create a state that puts the node into an "ui input-ready" state
        const nodeState = {
          ...action.payload,
          displayType: 'derivedField',
          semantic: 'derivedField',
        };
        next([setGroupSemantic(nodeState)]);
        // sagas -> SET_MATRIX_CACHE // document
        dispatch(fetchMatrixCache(nodeState));

        break;
      }
      case SET_MATRIX_CACHE: {
        // forward/pass-through the action proper
        next(action);
        // cascade the action to listeners
        const source = action.meta.id;
        const { listeners } = getState().workbench.tree[source];
        if (DEBUG) {
          console.debug(`🔗 listeners`);
          console.dir(listeners);
        }
        next(
          listeners.map((listenerId) =>
            aliasCallbackAction(listenerId, {
              payload: action.payload,
              meta: action.meta,
            }),
          ),
        );
        break;
      }
      //
      // 🔖 This next case captures a series of specialized mutations
      //    ... likely a scrappy approach that will benefit from an
      //    improved design.
      //
      // Triggers for clearing parents :: group with a derived field
      // semantic.
      //
      // event -> split/map
      case TYPES.TOGGLE_VALUE:
      case TYPES.TOGGLE_REDUCED:
      case SET_COMP_REDUCED:
      case SET_MSPAN_REQUEST: {
        // next(action);
        // check if the parent is a group that needs to be updated
        const state = getState();
        const { parent } = selectNodeState(state, action.id);
        const parentState = removeProp(
          'cache',
          state.workbench.tree[parent].data,
        );

        if (state.workbench.tree[parent].data.displayType === 'derivedField') {
          dispatch({
            type: ADD_DERIVED_FIELD,
            payload: {
              id: parent,
              ...parentState,
            },
          });
        }
        break;
      }

      // event -> map to other event (use dispatch)
      case DND_DRAG_START: {
        next(setDraggedId(+action.payload.draggableId));
        break;
      }

      case DND_DRAG_END: {
        next(setDraggedId(null));
        // transform/pre-process the action to interpret a "combine"
        // dropped with drop-on elements event
        const {
          draggableId,
          destination = undefined,
          source = undefined,
        } = eventFromCombine(action.payload);

        /* eslint-disable no-param-reassign */
        action.draggableId = draggableId;
        action.payload.source = source;
        action.payload.destination = destination;
        /* eslint-enable no-param-reassign */

        if (
          typeof destination === 'undefined' ||
          typeof source === 'undefined'
        ) {
          break;
        }

        if (
          destination.droppableId === source.droppableId &&
          destination.index === source.index
        ) {
          break;
        }

        const treeState = getTree(getState());

        // same list, different index
        if (destination.droppableId === source.droppableId) {
          next(
            setChildIds({
              id: destination.droppableId,
              childIds: moveItemInArray(
                treeState[destination.droppableId].childIds,
                source.index,
                destination.index,
              ),
            }),
          );
          break;
        }

        // else, update the tree
        dispatch(moveTree(action.payload));

        break;
      }

      // 🚧 It may reduce re-renders if we compare the tree state before and after;
      // limit the changes/updates accordingly.
      case REMOVE_NODE: {
        // instantiate the Tree instance to compute changes
        const treeState = getTree(getState()); // flat tree
        const tree = Tree.fromFlatNodes(treeState);
        try {
          const updatedTree = Tree.removeNode(tree, {
            type: 'remove',
            nodeId: action.payload,
            DEBUG,
          });

          next([
            setTree(Tree.toFlatNodes(updatedTree.root)),
            setNotification({
              message: `removed node: ${action.payload}`,
              feature: WORKBENCH,
            }),
          ]);
        } catch (e) {
          if (e instanceof InvalidTreeStateError) {
            next(setNotification({ message: e.message, feature: WORKBENCH }));
          } else {
            throw e;
          }
        }
        break;
      }

      // 🚧 It may reduce re-renders if we compare the tree state before and after;
      // limit the changes/updates accordingly.
      case MOVE_TREE: {
        /**
         * Interpretation of the move:
         * 👉 source palette is a COPY semantic
         * 👉 source canvas is a COPY semantic
         * 👉 source palette, set the source id to parent
         */
        const {
          destination = undefined,
          source = undefined,
          draggableId,
        } = action.payload;
        const state = getState(); // for debugging
        const treeState = getTree(state); // flat tree

        //------------------------------------------------------------------------
        // MOVE or COPY based on source === palette
        let moveOrCopy = 'COPY';
        const dataMaker = {
          maker: (x) => {
            return x;
          },
          source: +draggableId,
        };

        const srcPalette =
          treeState[source.droppableId].type === NODE_TYPES.PALETTE;
        const dstPalette =
          treeState[destination.droppableId].type === NODE_TYPES.PALETTE;

        let message = '';
        switch (true) {
          case srcPalette && dstPalette:
            message = '⬜ nothing';
            return; // nothing to do
          case srcPalette && !dstPalette:
            message = '✨ copy';
            moveOrCopy = 'COPY';
            break;
          case !srcPalette && !dstPalette:
            message = '🟢 move';
            moveOrCopy = 'MOVE';
            break;
          case !srcPalette && dstPalette:
            message = '🚫 delete';
            moveOrCopy = 'MOVE'; // removed without changing palette
            break;
          default:
            message = '📬 What??';
            break;
        }

        //------------------------------------------------------------------------
        // MOVE or COPY based on data.displayType === derivedField
        if (
          treeState[draggableId].data.displayType === 'derivedField' &&
          treeState[destination.droppableId].data.displayType === 'derivedField'
        ) {
          moveOrCopy = 'COPY';
          if (DEBUG) console.debug(`🚧 Copy derived field to create alias`);

          dataMaker.maker = (derivedFieldData) => {
            return {
              ...derivedFieldData,
              source: draggableId,
              displayType: 'alias',
              type: 'alias',
              identifier: derivedFieldData.identifier,
              etlUnitType: 'transformation',
              displayName: `${derivedFieldData.groupTag} ${derivedFieldData.identifier} alias`,
              tag: 'empty', // values in this data set
            };
          };
        }
        if (DEBUG) {
          console.debug(message);
        }

        // interpret the event when coming from the palette to move from leaf to group
        const event = {
          ...action.payload,
          draggableId: srcPalette ? treeState[draggableId].parent : draggableId,
          moveOrCopy,
          type: 'DND',
        };

        // instantiate the Tree instance to compute changes
        const tree = Tree.fromFlatNodes(treeState);

        let before = '';
        if (DEBUG) {
          // debugging
          before = Tree.print(tree);

          console.dir(event);

          console.assert(tree.type === 'root');
          console.assert(tree.children[0].type === 'palette');
          console.debug(`👉 update with: ${moveOrCopy}`);
        }

        try {
          const updatedTree = Tree.moveNode(tree, {
            event, // may have been updated
            dataMaker,
            DEBUG,
          });

          if (DEBUG) {
            console.debug('📖 before');
            console.debug(before);

            console.debug('👉 event');
            console.dir(action.payload);

            console.debug('👉 dragged node');
            console.dir(selectNodeState(state, +action.payload.draggableId));

            console.debug('👉 destination node');
            console.dir(
              selectNodeState(state, +action.payload.destination.droppableId),
            );

            console.debug(`🚧 updated node `);
            console.debug(Tree.print(updatedTree));

            console.debug(`🚧 after tree `);
            console.debug(Tree.print(updatedTree.root));
          }

          next([
            setTree(Tree.toFlatNodes(updatedTree.root)),
            setNotification({
              message: `updated flat tree`,
              feature: WORKBENCH,
            }),
          ]);
        } catch (e) {
          if (e instanceof InvalidTreeStateError) {
            next(setNotification({ message: e.message, feature: WORKBENCH }));
          } else {
            throw e;
          }
        }

        break;
      }

      case RESET_CANVAS: {
        next(setTree(resetCanvas(getState())));
        break;
      }

      // -------------------------------------------------------------------------
      // Fire-up the api core service
      // -------------------------------------------------------------------------
      // map feature command -> api command
      // ui perspective -> api perspective
      // -------------------------------------------------------------------------
      case FETCH_WAREHOUSE: {
        // the payload required to make the request is pulled directly
        // from the redux::store
        const state = getState();

        // instantiate | update the hosted warehouse
        if (!isHostedWarehouseStateStale(state)) {
          next(
            setNotification({
              message: `${WORKBENCH}.middleware: No need to compute the warehouse`,
              feature: WORKBENCH,
            }),
          );
        } else {
          try {
            // uses action-splitter to process multiple actions
            next([
              setNotification({
                message: `${WORKBENCH}.middleware: action::feature -> ::api (next: polling-api.sagas)`,
                feature: WORKBENCH,
              }),
              setLoader({
                toggle: true,
                feature: WORKBENCH,
                message: `Creating the ETL warehouse`,
              }),
              /*-----------------------------------------------------------------*/
              apiFetch({
                /*-----------------------------------------------------------------*/
                // ::event
                meta: { uiKey: 'obsetl', feature: WORKBENCH },
                request: {
                  etlObject: prepareForTransit(getEtlObject(state)),
                  maxTries: MAX_TRIES,
                },
              }), // map + translation
              tagWarehouseState('CURRENT'),
            ]);
          } catch (e) {
            // ERROR will have been thrown/catched if deeper
            console.error(e);
            next([
              setNotification({
                message: `${WORKBENCH}.middleware: ${e?.message || e}`,
                feature: WORKBENCH,
              }),
              tagWarehouseState('STALE'),
            ]);
          }
        }
        break;
      }

      // take ui perspective -> api perspective
      case CANCEL_WAREHOUSE: {
        try {
          // ui perspective, obsetl is unique because there is only one
          // ⚠️  feature -> core; dispatch is not required
          next([
            setNotification({
              message: `${WORKBENCH} middleware: action::feature -> ::api (next: polling-api.sagas)`,
              feature: WORKBENCH,
            }),
            apiCancel({
              // ::event (machine)
              meta: { uiKey: 'obsetl', feature: WORKBENCH },
            }), // map + translation
          ]);
        } catch (e) {
          next(
            setNotification({
              message: `${WORKBENCH} middleware: ${e?.message ?? e}`,
              feature: WORKBENCH,
            }),
          );
        } finally {
          next(setLoader({ toggle: false, feature: WORKBENCH }));
        }
        break;
      }

      // -------------------------------------------------------------------------
      // Respond to events from the api (configured by asyncEtl below)
      // -------------------------------------------------------------------------
      // The response has a view of the obsEtl (representation of the warehouse)
      // api event for this feature -> document feature
      case `${WORKBENCH} ${POLLING_RESOLVED}`: {
        const { isValid, getData } =
          ServiceConfigs[getServiceType(WORKBENCH)].response;

        if (DEBUG) {
          console.log(`👉 middleware - resolved`);
          console.log(action);
        }
        // expects event
        //
        // 🔑 Dependency on request + machine output structure
        //
        if (!isValid(action?.event?.request)) {
          console.dir(action);
          throw new ApiResponseError(
            'workbench.middleware: unexpected response; see api.ServiceConfigs',
          );
        }
        try {
          const { subject, measurements } = getData(action.event.request);
          const { etlFields, etlUnits } = getEtlObject(getState());

          //
          // Normalizer-like
          // ⬜ This should be something we can configure to better encapsulate
          //    the tree structure vs how it can be used.
          //
          const tree = Tree.fromObsEtl(
            {
              qualities: subject.qualities.map(
                iniEtlUnitQual(subject.subjectType, etlFields),
              ),
              measurements: measurements.map(
                iniEtlUnitMea({ etlFields, etlUnits }),
              ),
            },
            3 /* ⚠️  number of canvas stubs (superGroups) */,
          );

          // document the flat version of the tree
          next([
            setLoader({
              toggle: false,
              feature: WORKBENCH,
              message: `Creating the ETL warehouse`,
            }),
            setTree(Tree.toFlatNodes(tree)),
          ]);
        } catch (e) {
          if (e instanceof ApiCallError) {
            next(
              setNotification({
                message: `${WORKBENCH}.middleware: Error graphql not ready`,
                feature: WORKBENCH,
              }),
            );
          } else {
            next(
              setNotification({
                message: e.message,
                feature: WORKBENCH,
              }),
            );
          }
        }

        break;
      }

      // action :: pollingEventError
      case `${WORKBENCH} ${POLLING_ERROR}`: {
        const { isValid, getData } =
          ServiceConfigs[getServiceType(WORKBENCH)].response;

        // expects event
        if (!isValid(action?.event?.request)) {
          console.dir(action);
          throw new ApiResponseError(
            'workbench.middleware: unexpected response; see api.ServiceConfigs',
          );
        }
        console.assert(
          action.event.request?.error,
          'The response is not an error',
        );
        next([
          setNotification({
            message:
              getData(action.event.request) || 'The API polling request failed',
            feature: WORKBENCH,
          }),
          setLoader({ toggle: false, feature: WORKBENCH }),
        ]);

        break;
      }
      default:
    }
  };

/**
 * 🚧 expand the interpretation to combine derived fields
 *
 * task create a synthetic event where
 * 👉 draggableId = draggableId
 * 👉 destinationId = combine.draggableId (crux of the interpretation)
 *
 * @function
 * @param {Object} event dnd event
 * @return {Object} dnd event
 */
function eventFromCombine(event) {
  if (!event.combine) {
    return event;
  }
  return {
    ...event,
    destination: { droppableId: event.combine.draggableId, index: null },
  };
}

/**
 * An alias needs to coordinate state with the source.
 *
 * This function is the callback for registered listeners.
 *
 *    action updatedSourceData -> undatedAliasData
 *
 *
 * @function
 * @param {Object} sourceData
 * @return {Object} action
 */
function aliasCallbackAction(nodeId, { payload, meta }) {
  // remove props we don't want to over-write
  const immutableProps = [
    // don't change these
    'source',
    'displayType',
    'type',
    'etlUnitType',
    'tag',
    // ignore these
    'normalizer',
    'feature',
  ];
  const action = setNodeState({
    ...removeProp(immutableProps, meta),
    cache: payload,
    id: nodeId,
  });
  return action;
}

export default middleware;
