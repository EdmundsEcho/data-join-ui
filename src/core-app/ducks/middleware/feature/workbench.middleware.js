// src/ducks/middleware/feature/workbench.middleware.js

/**
 *
 * @description
 *
 * 💢 Hit the extraction endpoint
 *
 * ⏰ async, polling instantiation of the warehouse obsEtl -> warehouse
 *
 * Once we know the job is complete, the workbench page can go
 * ahead and use the graphql server.
 *
 * 💫 run the extraction when hostedWarehouseState === 'STALE'
 *
 * @module middleware/feature/workbench.middleware
 *
 */
import {
    // pass-through document
    TOGGLE_VALUE,
    TOGGLE_REDUCED,
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
    resetTree as resetWorkbench,
    tagWarehouseState,
    // MAKE_COMP_SERIES, // command
    // setCompValues, // document
} from '../../actions/workbench.actions';
import {
    SET_MATRIX_CACHE, // command
    fetchMatrixCache,
    tagMatrixState,
} from '../../actions/matrix.actions';
import {
    POLLING_RESOLVED,
    POLLING_ERROR,
    apiCancel,
    apiFetch,
} from '../../actions/api.actions';
import { setNotification } from '../../actions/notifications.actions';
import { setUiLoadingState } from '../../actions/ui.actions';
import {
    ApiCallError,
    InvalidStateError,
    ApiResponseError,
    InvalidTreeStateError,
} from '../../../lib/LuciErrors';

import { ServiceConfigs, getServiceType } from '../../../services/api';

// 📖 tree state
import {
    getProjectId,
    getTree,
    selectNodeState,
    getEtlObject,
    resetCanvas,
    isHostedWarehouseStale,
} from '../../rootSelectors';
import { Tree } from '../../../lib/obsEtlToMatrix/tree';
import { moveItemInArray, removeProp } from '../../../utils/common';
// -----------------------------------------------------------------------------
// normalize obsetl (can include db hosting spec)
import {
    iniEtlUnitMea,
    iniEtlUnitQual,
} from '../../../lib/obsEtlToMatrix/display-obsetl';
//import prepareForTransit from '../../../lib/filesToEtlUnits/transforms/prepare-for-transit';
// -----------------------------------------------------------------------------

import { NODE_TYPES } from '../../../lib/sum-types';

import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const DEBUG =
    process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true' ||
    process.env.REACT_APP_DEBUG_WORKBENCH_TREE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
// Global values
const MAX_TRIES = process.env.REACT_APP_WORKBENCH_MAX_TRIES || 30;
const { isValid, getData, isValidError, getError } =
    ServiceConfigs[getServiceType(WORKBENCH)].response;

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

                // dispatch the current action in action.type with the closure that is
                // about to be returned.
                next(action);

                switch (action.type) {
                    //
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
                        // send to the top of the middleware stack
                        // sagas -> SET_MATRIX_CACHE // document
                        dispatch(
                            fetchMatrixCache({
                                projectId: getProjectId(getState()),
                                ...nodeState,
                            }),
                        );

                        break;
                    }
                    case SET_MATRIX_CACHE: {
                        // forward/pass-through the action proper
                        // next(action); 🦀 ??
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
                        next(tagMatrixState('STALE'));
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
                    case TOGGLE_VALUE:
                    case TOGGLE_REDUCED:
                    case SET_COMP_REDUCED:
                    case SET_MSPAN_REQUEST: {
                        // check if the parent is a group that needs to be updated
                        const state = getState();
                        const { parent } = selectNodeState(state, action.id);
                        // reset the parent cache
                        const parentState = removeProp(
                            'cache',
                            state.workbench.tree[parent].data,
                        );

                        // if the parent is a derivedField, add/re-add derived field
                        // send to the top of the middleware stack
                        if (state.workbench.tree[parent].data.displayType === 'derivedField') {
                            dispatch({
                                type: ADD_DERIVED_FIELD,
                                payload: {
                                    id: parent,
                                    ...parentState,
                                },
                            });
                        }
                        // split the action to select comp values when reduced = false
                        if (action.type === TOGGLE_REDUCED && action.payload === false) {
                            dispatch({
                                type: TOGGLE_VALUE,
                                id: action.id,
                                valueOrId: [],
                                identifier: action.identifier,
                                isSelected: false
                            });
                        }
                        next(tagMatrixState('STALE'));
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
                            next(tagMatrixState('STALE'));
                            break;
                        }

                        // else, update the tree
                        dispatch(moveTree(action.payload));
                        next(tagMatrixState('STALE'));

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
                        next(tagMatrixState('STALE'));
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
                        const treeState = getTree(getState()); // flat tree

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
                                const state = getState();
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

                        next(tagMatrixState('STALE'));
                        break;
                    }

                    case RESET_CANVAS: {
                        next(setTree(resetCanvas(getState())));
                        next(tagMatrixState('STALE'));
                        break;
                    }
                    // -------------------------------------------------------------------------
                    // Fire-up the api core service
                    // 📖 when hostedWarehouseState === 'STALE'
                    //    render the warehouse (extraction)
                    // -------------------------------------------------------------------------
                    // map feature command -> api command
                    // ui perspective -> api perspective
                    // fetchWarehouse -> apiFetch
                    // -------------------------------------------------------------------------
                    case FETCH_WAREHOUSE: {
                        // the payload required to make the warehouse request is pulled directly
                        // from the redux store (nothing in the action).
                        //
                        // rebuild warehouse (changed etlObj) | use the current tree
                        // 🔖 there is no reason (yet), to pull from graphql more than once, once the
                        //    tree has been instantiated
                        if (!isHostedWarehouseStale(getState())) {
                            next(
                                setNotification({
                                    message: `${WORKBENCH}.middleware: Warehouse cache is valid; no need re-render the warehouse`,
                                    feature: WORKBENCH,
                                }),
                            );
                        } else {
                            try {
                                const state = getState();
                                const projectId = getProjectId(state);
                                next([
                                    setNotification({
                                        message: `${WORKBENCH}.middleware: action::feature -> ::api (next: polling-api.sagas)`,
                                        feature: WORKBENCH,
                                    }),
                                    setUiLoadingState({
                                        toggle: true,
                                        feature: WORKBENCH,
                                        message: `Creating (or recreating) the ETL warehouse`,
                                    }),
                                    resetWorkbench(),
                                    /*-----------------------------------------------------------------*/
                                    apiFetch({
                                        /*-----------------------------------------------------------------*/
                                        // ::event
                                        meta: {
                                            uiKey: 'obsetl',
                                            feature: WORKBENCH,
                                        },
                                        request: {
                                            project_id: projectId,
                                            // etlObject: prepareForTransit(getEtlObject(state)), // config for extraction
                                            etlObject: getEtlObject(state), // config for extraction
                                            maxTries: MAX_TRIES,
                                        },
                                    }), // map + translation
                                ]);
                            } catch (e) {
                                // ERROR will have been thrown/catched if deeper
                                console.error(e);
                                next(
                                    setNotification({
                                        message: `${WORKBENCH}.middleware: ${e?.message || e}`,
                                        feature: WORKBENCH,
                                    }),
                                );
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
                            next(
                                setUiLoadingState({
                                    toggle: false,
                                    feature: WORKBENCH,
                                    message: 'Done cancel warehouse',
                                }),
                            );
                            next(tagWarehouseState('CURRENT'));
                        }
                        break;
                    }

                    // -------------------------------------------------------------------------
                    // Respond to events from the api (configured by asyncEtl below)
                    // -------------------------------------------------------------------------
                    // The response has a view of the obsEtl (representation of the warehouse)
                    // api event for this feature -> document feature
                    case `${WORKBENCH} ${POLLING_RESOLVED}`: {
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
                            // pull project_id, graphql data, and etlObj
                            const projectId = getProjectId(getState());
                            const { id, subject, measurements } = getData(action.event.request);
                            const { etlFields, etlUnits } = getEtlObject(getState());

                            if (id !== projectId) {
                                throw new InvalidStateError(
                                    `Mismatch project: graphql and middleware`,
                                );
                            }

                            next(
                                setUiLoadingState({
                                    toggle: true,
                                    feature: WORKBENCH,
                                    message: `Initializing the workbench`,
                                }),
                            );
                            //
                            // Normalizer-like: raw -> tree
                            //
                            // ⬜ This should be something we can configure to better encapsulate
                            //    the tree structure vs how it can be used.
                            //
                            const tree = Tree.fromObsEtl(
                              {
                                qualities: subject.qualities.map(
                                  iniEtlUnitQual(subject.subjectType),
                                ),
                                measurements: measurements.map(
                                  iniEtlUnitMea({ etlFields, etlUnits }),
                                ),
                              },
                              3 /* ⚠️  number of canvas stubs (superGroups) */,
                            );

                            // document the flat version of the tree
                            next([
                                setTree(Tree.toFlatNodes(tree)),
                                tagWarehouseState('CURRENT'),
                                tagMatrixState('STALE'),
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
                        } finally {
                            next(
                                setUiLoadingState({
                                    toggle: false,
                                    feature: WORKBENCH,
                                    message: 'Done processing new warehouse',
                                }),
                            );
                        }

                        break;
                    }

                    // action :: pollingEventError
                    case `${WORKBENCH} ${POLLING_ERROR}`: {
                        // expects event
                        if (!isValidError(action?.event?.request)) {
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
                                    getError(action.event.request) ||
                                    'The API polling request failed',
                                feature: WORKBENCH,
                            }),
                            // 🦀 does not work b/c window is also waiting for data
                            setUiLoadingState({
                                toggle: false,
                                feature: WORKBENCH,
                                message: 'Done workbench',
                            }),
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
