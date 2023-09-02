// src/ducks/workbench.reducer.js

/**
 * @module ducks/workbench-reducer
 *
 * @description
 * Workbench reducer used to track workbench state
 *
 * @category Reducers
 *
 */
import createReducer from '../utils/createReducer';
import {
  SET_TREE,
  RESET_TREE,
  SET_NODE_STATE,
  SET_CHILDIDS,
  SET_DRAGGED_ID,
  SET_MSPAN_REQUEST,
  SET_COMP_REDUCED,
  SET_COMP_VALUES,
  SET_GROUP_SEMANTIC,
  TAG_WAREHOUSE_STATE,
  TOGGLE_VALUE,
  TOGGLE_REDUCED,
  UPDATE_ETLUNIT_TEXT,
} from './actions/workbench.actions';
import {
  SET_MATRIX,
  SET_MATRIX_CACHE,
  TAG_MATRIX_STATE,
} from './actions/matrix.actions';
import { RESET } from './actions/project-meta.actions';

import { Tree } from '../lib/obsEtlToMatrix/tree';

import { NODE_TYPES, PURPOSE_TYPES, ETL_UNIT_TYPES } from '../lib/sum-types';
import { InputError } from '../lib/LuciErrors';
import { removeProp } from '../utils/common';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

// ------------------------------------------------------------------------------
const initialState = {
  tree: {},
  matrix: null, // hosts a paged view
  nowDragging: null, // supports dnd rendering
  hostedWarehouseState: 'STALE', // STALE | CURRENT | RENAME (no structural change)
  hostedMatrixState: 'STALE', // STALE | CURRENT | RENAME (no structural change)
};

// ------------------------------------------------------------------------------
/**
 * Reducer-specific selectors
 *
 * These functions should echo what is defined in the
 * `initialState` for this state fragment.
 *
 */
export const isHostedWarehouseStale = (stateFragment) =>
  stateFragment.hostedWarehouseState === 'STALE';
export const getMatrix = (stateFragment) => stateFragment.matrix;
export const getRequest = (stateFragment) => stateFragment.matrix;
export const getSelectedEtlUnits = (stateFragment) => stateFragment.selected;
export const getPalette = (stateFragment) => stateFragment.palette;
export const getTree = (stateFragment) => stateFragment?.tree ?? {};
export const isAppDataCompleted = (stateFragment) =>
  stateFragment.hostedWarehouseState !== 'STALE' &&
  stateFragment.hostedMatrixState !== 'STALE';

/**
 * Predicate - computed tree
 * @function
 * @return {bool}
 */
export const isWorkbenchInitialized = (stateFragment) =>
  Object.keys(stateFragment.tree).length > 0;

export const isHostedMatrixStale = (stateFragment) =>
  stateFragment.hostedMatrixState === 'STALE';

export const isCanvasDirty = (stateFragment) => {
  return Object.keys(stateFragment.tree).length === 0
    ? false
    : Object.values(stateFragment.tree).filter(
        (node) => node.type === NODE_TYPES.CANVAS && node.height === 4,
      ).length > 0;
};

// -----------------------------------------------------------------------------
// Validating the request spec
// -----------------------------------------------------------------------------
const validateRequestSpec = (tree) => {
  // filter the node type = "canvas", height = 4
  const filter = ({ type, height }) =>
    type === NODE_TYPES.CANVAS && height === 4;
  const canvasLeafNodes = Object.values(tree).filter(filter);
  // find the required data types
  const isQuality = ({ data }) => data.type === ETL_UNIT_TYPES.quality;
  const isMeasurement = ({ data }) => data.type === ETL_UNIT_TYPES.mvalue;
  //
  return {
    hasSubjectUniverse: () => canvasLeafNodes.findIndex(isQuality) !== -1,
    hasMeasurement: () => canvasLeafNodes.findIndex(isMeasurement) !== -1,
  };
};
export const runRequestSpecValidations = (stateFragment) => {
  // cache
  const validator = validateRequestSpec(stateFragment.tree);

  return [validator.hasSubjectUniverse(), validator.hasMeasurement()].every(
    (didPass) => didPass,
  );
};
// -----------------------------------------------------------------------------
export const selectPaletteGroup = (stateFragment) => stateFragment.paletteGroup;
/**
 * Pulls what is required to render an EtlUnit in relation to the state of the
 * workbench tree.
 *
 * returns: id, type, height, parent, index and childIds
 *
 * @function
 * @return {Object}
 */
export const selectNodeMeta = (stateFragment, id) => {
  const { data, parent, ...rest } = stateFragment.tree?.[id] ?? { data: null };
  return {
    ...rest,
    etlUnitType: data?.etlUnitType ?? data?.type ?? null,
    parent,
    superParent: stateFragment.tree?.[parent]?.parent,
  };
};
/**
 * Return values that remain constant despite updates to the tree.
 *
 * ⬜ enumerate EtlUnitGroup types
 * ⬜ formalize and encapsulate the group typing
 *                ? 'subjectUniverse'
 *                : 'derivedField',
 *                : 'empty',
 *
 * @function
 * @return {Object}
 */
export const selectMaybeNodeSeed = (stateFragment, id) => {
  if (typeof stateFragment.tree[id] === 'undefined') {
    return null;
  }
  const { data = {}, type, height, childIds } = stateFragment.tree[id];

  // subjectUniverse when all etlUnits = quality
  const isSubjectUniverse =
    height === 3 &&
    type === 'canvas' &&
    childIds.filter(
      (childId) => stateFragment.tree[childId].data.type === 'etlUnit::quality',
    ).length === childIds.length;
  return {
    height,
    childIds,
    groupType: isSubjectUniverse ? 'subjectUniverse' : 'empty',
    etlUnitType: data?.etlUnitType ?? data?.type ?? null,
  };
};
/**
 * ⚠️  Only use this for non-leaf data to avoid managing data that
 *    is likely to cause several re-renders. Consider using `getNodeDataSeed`.
 */
export const selectMaybeNodeState = (stateFragment, id) => {
  return stateFragment.tree?.[id] || null;
};

export const selectMaybeDerivedFieldConfig = (stateFragment, id) => {
  return stateFragment.tree?.[id].data?.semantic === 'derivedField'
    ? stateFragment.tree?.[id].data?.identifier ?? null
    : null;
};

/**
 * Seed required to display EtlUnit
 */
export const getNodeDataSeed = (stateFragment, id) => {
  const { data } = stateFragment.tree[id];
  return {
    context: stateFragment.tree[id].type,
    etlUnitType: data.type === 'etlUnit::quality' ? 'quality' : 'measurement',
    identifier:
      data.value?.qualityName || data.value?.measurementType || data.identifier,
    displayType: data?.displayType ?? 'none',
  };
};

/**
 * Component related.
 * @function
 * @param {string?} identifier
 * @return {Object | bool}
 */
export const getIsCompReducedMap = (stateFragment, id, identifier) => {
  const { data } = stateFragment.tree[id];

  if (data.displayType === 'alias') {
    return undefined;
  }
  if (data.type === 'etlUnit::quality') {
    return undefined;
  }
  const mapComponents = Object.values(data.value.values).reduce(
    (acc, value) => {
      acc[value.componentName] = value.reduced;
      return acc;
    },
    {},
  );
  return typeof identifier === 'undefined'
    ? mapComponents
    : mapComponents[identifier];
};

/**
 * Component related
 * Default, neutral value is false
 * @function
 * @param {string?} identifier
 * @return {Object | bool}
 */
export const getNoValuesSelected = (stateFragment, id, identifier) => {
  const { data } = stateFragment.tree[id];
  if (data.displayType === 'alias') return false;
  if (data.type === 'etlUnit::quality') {
    const result = !data.value.request;
    return typeof identifier === 'undefined'
      ? { [data.value.qualityName]: result }
      : result;
  }

  const result = Object.values(data.value.values).reduce(
    (acc, value) => {
      acc[value.componentName] = !value.request;
      return acc;
    },
    { [data.value.measurementType]: false }, // seed with measurementType
  );
  return typeof identifier === 'undefined' ? result : result[identifier];
};

/**
 * EtlUnit::measurement property
 *
 * Action is taken when true.
 * Returns false when a time component is not found. This facilitates generic
 * use of the function (useSelector without forking)
 *
 * @function
 * @return {bool}
 */
export const getIsTimeSingleton = (stateFragment, id) => {
  const { data } = stateFragment.tree[id];
  return data.type === 'etlUnit::quality' || data.displayType === 'alias'
    ? false
    : Object.keys(
        Object.values(data.value.values).find(
          (value) => value.tag === 'spanValues',
        ).values,
      ).length === 1;
};

/**
 * Retrieve the config required to display etlUnit data
 *
 * 🔑 Only return what are "permanent" values to avoid re-renders when
 *    the user toggles values related to a request.
 *
 *  const config = {
 *    title: meta.displayName,
 *    fieldCount: 0,
 *    nodeId,
 *    identifier,
 *    tag: meta.tag,
 *    etlUnitType: meta.etlUnitType,
 *    palette: false,
 *  };
 * @function
 * @param
 * @return {Array<Object>} config
 */
export const selectEtlUnitDisplayConfig = (
  stateFragment,
  id,
  identifier,
  measurement, // bool toggle for mea header data
) => {
  const {
    data: nodeData,
    id: nodeId,
    type: paletteOrCanvas,
  } = stateFragment.tree[id];

  switch (true) {
    case nodeData.displayType === 'alias':
      return [
        {
          title: nodeData?.displayName || 'No title',
          fieldCount: 'WIP',
          nodeId,
          identifier,
          tag: 'measurement',
          etlUnitType: 'transformation',
          type: 'alias',
          palette: false,
        },
      ];

    case measurement:
      return [
        {
          title: nodeData?.value.displayName,
          fieldCount: 'WIP',
          nodeId,
          identifier,
          tag: 'measurement',
          etlUnitType: 'measurement',
          palette: paletteOrCanvas === 'palette',
        },
      ];

    case nodeData.type === 'etlUnit::quality':
      return [
        {
          title: nodeData.value.displayName,
          fieldCount: 1,
          nodeId,
          identifier: nodeData.value.qualityName,
          tag: nodeData.value.tag,
          etlUnitType: 'quality',
          palette: paletteOrCanvas === 'palette',
        },
      ];
    case nodeData?.value.measurementType !== identifier: {
      // component
      const component = Object.values(nodeData.value.values).find(
        (comp) => identifier === comp.componentName,
      );
      return [
        {
          title: component.displayName,
          fieldCount: 'WIP',
          nodeId,
          identifier: component.componentName,
          tag: component.tag,
          etlUnitType: 'measurement',
          palette: paletteOrCanvas === 'palette',
        },
      ];
    }

    case nodeData?.value.measurementType === identifier:
      // components
      return Object.values(nodeData.value.values).map((component) => ({
        title: component.displayName,
        fieldCount: 'WIP',
        nodeId,
        identifier: component.componentName,
        tag: component.tag,
        etlUnitType: 'measurement',
        palette: paletteOrCanvas === 'palette',
      }));

    default:
      throw new InputError(`Unreachable: ${identifier}`);
  }
};
export const selectNodeWithoutLevels = (stateFragment, id) => {
  if (stateFragment.tree[id].data.type === 'etlUnit::quality') {
    const { values, ...restValue } = stateFragment.tree[id].data.value;
    return {
      ...stateFragment.tree[id],
      data: { ...stateFragment.tree[id].data, value: restValue },
    };
  }
  // else when measurement, return component stubs
  const { values } = stateFragment.tree[id].data.value;
  return {
    ...stateFragment.tree[id],
    data: {
      ...stateFragment.tree[id].data,
      value: {
        ...stateFragment.tree[id].data.value,
        /* eslint-disable no-shadow */
        values: Object.entries(values).reduce((acc, [key, value]) => {
          const { values, ...restValue } = value;
          acc[key] = restValue;
          return acc;
        }, {}),
        /* eslint-enable no-shadow */
      },
    },
  };
};

/**
 * nodeId + identifier -> graphql levels filter
 *
 * Seed for the DetailView
 *
 * @function
 * @param {Object} stateFragment
 * @param {number} nodeId
 * @param {string} identifier display name of the component
 * @return {Object | null} seeds
 */
export const selectSeedForValues = (stateFragment, nodeId, identifier) => {
  /* eslint-disable no-nested-ternary */
  if (!stateFragment.tree[nodeId]?.data?.value) {
    return null;
  }
  const { data } = stateFragment.tree[nodeId];
  const isRequestComponents = identifier === data.value?.measurementType;
  // when a quality, there is only one choice
  return data.type === 'etlUnit::quality'
    ? { qualityName: identifier }
    : isRequestComponents
    ? // return the comp meta, remove values
      {
        measurementType: data.value.measurementType,
        components: Object.values(data.value.values).map((comp) => {
          const { values, ...compMeta } = comp;
          return compMeta;
        }),
      }
    : {
        componentName: identifier,
        measurementType: data.value.measurementType,
      };
  /* eslint-enable no-nested-ternary */
};

/**
 * Hydrate the detail view
 * 🔑 values themselves are viewed directly from graphql
 *    ... only the user selection model is provided.
 *
 * quality -> values
 * component -> values
 * ⚠️  measurement -> Array of meta-data
 *
 *
 * 🔖 the selectionModel :: Object
 *
 * @function
 * @param {Object} stateFragment
 * @param {number} nodeId
 * @param {string} identifier display name of the component
 * @return {Object} with totalCount and selectionModel keys
 */
export const getSelectionModel = (stateFragment, nodeId, identifier) => {
  /* eslint-disable no-nested-ternary */
  // not every node has a valid data object
  if (!stateFragment.tree[nodeId]?.data?.value) {
    return null;
  }
  const { data } = stateFragment.tree[nodeId];
  const isRequestComponents = identifier === data.value?.measurementType;

  const mkResultFromComp = ({ count, values }) => ({
    totalCount: count,
    selectionModel: values,
  });
  // when a quality, there is only one choice
  return data.type === 'etlUnit::quality'
    ? // quality
      { totalCount: data.value.count, selectionModel: data.value.values }
    : isRequestComponents
    ? // Measuremnt -> components
      // return the comp meta, remove values
      Object.values(data.value.values).map((comp) => {
        const { values, ...compMeta } = comp;
        return compMeta;
      })
    : // component
      mkResultFromComp(
        Object.values(data.value.values).find(
          ({ componentName }) => componentName === identifier,
        ),
      );
  /* eslint-enable no-nested-ternary */
};

/**
 * @function
 * @param {Object} stateFragment
 * @param {number} nodeId
 * @return {Object}
 */
export const getSpanLevelsFromNode = (stateFragment, nodeId) => {
  if (!stateFragment.tree[nodeId]?.data?.value) {
    return null;
  }
  return {
    value: Object.values(
      stateFragment.tree[nodeId].data.value.values, // node -> measurement -> components
    ).find((value) => value.tag === 'spanValues'),
    etlUnitName: stateFragment.tree[nodeId].data.value.measurementType,
    displayName: stateFragment.tree[nodeId].data.value.displayName,
  };
};

/**
 * Span values require extra attention; not just a toggle
 * @function
 * @param {Object} stateFragment
 * @param {number} nodeId
 * @param {string} identifier display name of the component
 * @param {number} spanValueIdx
 * @return {(Span | null)}
 */
export const selectSpanValueFromNode = (
  stateFragment,
  nodeId,
  identifier,
  spanValueIdx,
) => {
  if (!stateFragment.tree[nodeId]?.data?.value) {
    return null;
  }
  const spanValue = Object.values(
    stateFragment.tree[nodeId].data.value.values, // node -> measurement -> components
  ).find((value) => value.componentName === identifier).values[spanValueIdx];
  // the mspan component -> specific value
  return spanValue;
};

export const getDraggedId = (stateFragment) => stateFragment.nowDragging;

/**
 * use instead of getDraggedId to avoid re-renders
 */
export const getAmIDropDisabled = (stateFragment, id) => {
  return (
    // stateFragment.tree[id]?.type === NODE_TYPES.PALETTE ||
    stateFragment.nowDragging?.id === id /* me */ ||
    stateFragment.nowDragging?.superParent === id /* me */
  );
};

export const getDraggedNode = (stateFragment) =>
  stateFragment.tree?.[stateFragment.nowDragging?.id] ?? null;

export const getCanvasLists = (stateFragment) =>
  stateFragment?.tree[2]?.childIds;

/**
 * Utilized by the middleware; strictly speaking not async so
 * should be a change made directly to the store. Nonetheless...
 *
 * Tasks: select root, palette
 * find max palette nodeId
 * add 3 for the extra canvas; height 2
 * set their childIds = [], listeners = []
 *
 *
 * @function
 * @param {Object} stateFragment
 * @return {Object} tree
 */
export const resetCanvas = ({ tree }) => {
  /* eslint-disable no-param-reassign */
  const resetNode = (node) => {
    return { ...node, childIds: [], listeners: [] };
  };
  const resetListeners = (node) => {
    return { ...node, listeners: [] };
  };
  return Object.keys(tree).reduce((newTree, key) => {
    // palette of all heights, others less < 3 (includes root)
    if (tree[key].type === NODE_TYPES.PALETTE || tree[key].height < 3) {
      // reset the leaf canvas node values
      newTree[key] =
        tree[key].type === NODE_TYPES.CANVAS && tree[key].height === 2
          ? resetNode(tree[key])
          : resetListeners(tree[key]);
    }
    return newTree;
  }, {});
  /* eslint-enable no-param-reassign */
};

/**
 * Update a Component or Quality node
 * Returns an updated node
 *
 * 🦀 parent request value should be false
 *    when all children are false.
 *
 * @function
 * @param {Object} node
 * @param {number} valueIdx
 * @return {Object} node
 */
const setCompOrQualNodeRequest = (node, valueIdx, isSelected, level) => {
  //
  // clear the __ALL__ flag
  //
  const values = removeProp('__ALL__', node.values);
  //
  // If the valueIdx already exists on the list, remove it.
  // Else, add it.
  // 👍 ensures the list contains only the one "type" of request
  //    ... vs request vs antiRequest (where the type can change)
  //
  const alreadyOnTheList = Object.keys(node.values).includes(valueIdx);

  return alreadyOnTheList
    ? {
        ...node,
        values: removeProp(valueIdx, node.values),
      }
    : {
        ...node,
        request: !alreadyOnTheList && isSelected ? true : node.request,
        antiRequest: !isSelected,
        values: {
          ...values,
          [valueIdx]: {
            value: level,
            request: isSelected,
          },
        },
      };
};

/**
 * set the request prop for all values in the collection
 * request: bool
 *
 * @param {Object} compOrQualNode
 * @param {bool} toValue
 * @return values
 */
const setRequestValues = (toValue /* values */) => {
  return { __ALL__: { value: '__ALL__', request: toValue } };
};
/**
 * Logic to coordinate compOrQualNode value when all values
 * are requested = true |false
 */
const setAll = (compOrQualNode, isSelected) => {
  return {
    ...compOrQualNode,
    request: isSelected, // toggle the value
    // reduced: !isSelected ? true : compOrQualNode.reduced,
    antiRequest: false, // inference
    values: setRequestValues(isSelected /* areSelected :) */),
  };
};
/**
 * Apply after each individual toggle to see if all values
 * are the same... in which case, record the state at the group-level.
 *
 *       compOrQualNode -> compOrQualNode
 *
 * 🔖 dependency of allSelected with reduced
 *
 * @function
 * @param {Object} compOrQualNode
 * @return {Object} compOrQualNode
 *
 */
const maybeSetAll = (compOrQualNode) => {
  // Determine when all values are pointing to the same value
  const allSelected =
    Object.values(compOrQualNode.values).filter(({ request }) => request)
      .length === compOrQualNode.count;

  const allDeselected =
    Object.values(compOrQualNode.values).filter(({ request }) => !request)
      .length === compOrQualNode.count;

  const noneSelected = Object.keys(compOrQualNode.values).length === 0;

  const isSeries = !compOrQualNode?.reduced ?? false;

  return allDeselected || (allSelected && !isSeries) || noneSelected
    ? setAll(compOrQualNode, allSelected || noneSelected)
    : compOrQualNode;
};
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// The Reducer
// ----------------------------------------------------------------------------
const reducer = createReducer(initialState, {
  // Utility to reset all state
  [RESET]: () => initialState,

  // debugging utility
  PING: (state) => {
    console.log(`PING from redux workbench.reducer`);
    return state;
  },

  // debugging utility
  TREE: (state) => {
    const tree = Tree.fromFlatNodes(getTree(state));
    console.log(tree);
    return state;
  },

  // 🚧 WIP
  CLEAR_CACHE: (state, nodeId) => {
    const { tree } = state;
    return {
      ...state,
      tree: {
        ...tree,
        [nodeId]: {
          ...tree[nodeId],
          data: {
            ...tree[nodeId].data,
            cache: null,
          },
        },
      },
    };
  },
  // dispatched by workbench.middleware
  [TAG_WAREHOUSE_STATE]: (state, { payload }) => {
    return {
      ...state,
      hostedWarehouseState: payload,
    };
  },
  // dispatched by workbench.middleware
  [TAG_MATRIX_STATE]: (state, { payload }) => {
    return {
      ...state,
      hostedMatrixState: payload,
    };
  },

  // dispatched by workbench.middleware
  [SET_DRAGGED_ID]: (state, { payload }) => {
    return {
      ...state,
      nowDragging: payload ? selectNodeMeta(state, payload) : null,
    };
  },

  // dispatched by workbench.middleware
  [SET_TREE]: (state, { payload }) => {
    return {
      ...state,
      tree: payload,
    };
  },
  [RESET_TREE]: () => initialState,

  // dispatched by workbench.middleware
  [SET_NODE_STATE]: (state, { payload }) => {
    if (DEBUG) {
      console.debug(`📁 writing node state`);
      console.dir(payload);
    }
    const { id, ...nodeState } = payload;
    return updateNodeData(state, id, { ...state.tree[id].data, ...nodeState });
  },

  // update the sequence of children
  [SET_CHILDIDS]: (state, { payload: { id, childIds } }) => {
    return {
      ...state,
      tree: {
        ...state.tree,
        [id]: {
          ...state.tree[id],
          childIds,
        },
      },
    };
  },
  [UPDATE_ETLUNIT_TEXT]: (state, { cardIdentifier, text }) => {
    return {
      ...state,
      selected: {
        ...state.selected,
        [cardIdentifier]: {
          ...state.selected[cardIdentifier],
          identifier: text,
        },
      },
    };
  },

  // dispatched by the EtlUnitParameter tools
  [SET_MSPAN_REQUEST]: (state, action) => {
    return updateComp(state, action);
  },

  [SET_COMP_REDUCED]: (state, action) => {
    return updateComp(state, action);
  },

  [SET_COMP_VALUES]: (state, action) => {
    return updateComp(state, action);
  },

  [SET_GROUP_SEMANTIC]: (state, action) => {
    const { id, ...rest } = action.payload;
    const { data } = selectMaybeNodeState(state, id) || { data: {} };
    return updateNodeData(state, id, { ...data, ...(rest || {}) });
  },

  //
  // 🚧 scrappy overloaded action payload
  //
  // valueOrId :: number | string -> change a single value to isSelected
  // valueOrId :: Array empty -> set __ALL__ using isSelected
  //
  [TOGGLE_VALUE]: (state, { id, valueOrId, identifier, isSelected }) => {
    //
    // 🔖 retrieve the node values; method depends on Component vs Quality
    //    store the keys required to update the specific comp node
    //
    const etlUnitType =
      state.tree[id].data.type === 'etlUnit::quality'
        ? PURPOSE_TYPES.QUALITY
        : PURPOSE_TYPES.MVALUE;

    // tmp flag to weed-out deprecated approach
    if (typeof valueOrId === 'undefined' || isSelected === 'undefined') {
      throw new InputError(
        `The toggle request sent an incomplete action for: ${identifier}\n` +
          `valueOrId: ${valueOrId} isSelected: ${isSelected}`,
      );
    }
    const updateGroupOfValues = Array.isArray(valueOrId);

    // pull the "prev/current" values from the store
    const [maybeCompIdx, compOrQualNode] =
      etlUnitType === PURPOSE_TYPES.QUALITY
        ? [undefined, state.tree[id].data.value]
        : Object.entries(state.tree[id].data.value.values).find(
            ([, comp]) => comp.componentName === identifier,
          );

    // assert when maybeCompIdx can't be "Nothing"
    if (
      typeof maybeCompIdx === 'undefined' &&
      etlUnitType === PURPOSE_TYPES.MVALUE
    ) {
      throw new InputError(
        `Tried to update a component, ${identifier}, on node ${id} without a compIdx`,
      );
    }

    //
    // 🔖 how many values get updated depends on the valueIdx type
    //    The approach needs to work for both quality and component
    //
    let newCompOrQualNode = {};
    switch (true) {
      //
      // Group-level update (__ALL__ values)
      // Clear the request, set the __ALL__ key value to isSelected
      //
      // 🔖
      //    interaction between reduced and __ALL__ selected
      //    inference of antiRequest when __ALL__ is activated
      //
      case updateGroupOfValues && compOrQualNode.tag !== 'spanValues':
        newCompOrQualNode = setAll(
          compOrQualNode,
          isSelected /* areSelected :) */,
        );
        break;
      //
      // Individual level/value updates
      // set the value at valueIdx (for a specific value)
      //
      case !updateGroupOfValues:
        newCompOrQualNode = setCompOrQualNodeRequest(
          compOrQualNode,
          valueOrId,
          isSelected,
          valueOrId,
        );
        //
        // synchronize the state of the individual values with the group
        //
        newCompOrQualNode = maybeSetAll(newCompOrQualNode);
        break;
      default:
    }
    //
    // 🔖 Nested but normalized; flatening provides not clear advantage
    //
    // quality:         data/value
    //   state.tree[id].data.value
    //
    // component:        data/value/values[maybeCompIdx]
    //    state.tree[id].data.value.values[maybeCompIdx];
    //
    const newData = {
      ...state.tree[id].data,
      value:
        etlUnitType === PURPOSE_TYPES.QUALITY
          ? { ...newCompOrQualNode } // 🎉 update here for quality :)
          : {
              ...state.tree[id].data.value,
              values: {
                ...state.tree[id].data.value.values,
                [maybeCompIdx]: {
                  ...newCompOrQualNode,
                  values: newCompOrQualNode.values,
                },
              },
            },
    };

    return updateNodeData(state, id, newData);
  },
  //
  // this is measurement/comp/mspan related (i.e., not a quality property)
  // valueIdx is for mspan values
  //
  // 🔖 MCOMP and MSPAN are both etlUnit parameters (losely both are components)
  //    The leaf values of MSPAN have an extra reduced prop
  //
  //    etlUnit::Measurement : Subject, MSPAN, [MCOMP] -> MVALUE
  //
  //    🔑 A synonym for Reduced is to not include the component in the
  //    request. This way, all of the mvalues are reduced for that component
  //    (the component is "is reduced out" of the measurement).
  //
  //
  [TOGGLE_REDUCED]: (state, { id, valueOrId, identifier: componentName }) => {
    const updateType = ['number'].includes(typeof valueOrId)
      ? PURPOSE_TYPES.MSPAN
      : PURPOSE_TYPES.MCOMP;

    const [compIdx, compNode] = Object.entries(
      state.tree[id].data.value.values,
    ).find(([, comp]) => comp.componentName === componentName);

    if (
      !(
        (updateType === PURPOSE_TYPES.MSPAN && compNode.tag === 'spanValues') ||
        (updateType === PURPOSE_TYPES.MCOMP &&
          ['intValues', 'txtValues'].includes(compNode.tag))
      )
    ) {
      throw new InputError(
        `The toggleReduced action event is flawed: ${
          valueOrId ?? 'no valueOrId'
        } ${updateType} ${componentName}`,
      );
    }

    let newCompNode = {};
    switch (true) {
      // toggle the value at valueOrId
      case updateType === PURPOSE_TYPES.MCOMP:
        newCompNode = {
          ...compNode,
          request: true,
          reduced: !compNode.reduced,
        };
        break;
      case updateType === PURPOSE_TYPES.MSPAN:
        newCompNode = {
          ...compNode,
          request: true,
          reduced: null,
          values: {
            ...compNode,
            [valueOrId]: {
              ...compNode[valueOrId],
              request: true,
              value: {
                ...compNode[valueOrId].value,
                reduced: !compNode[valueOrId].value.reduced,
              },
            },
          },
        };
        break;
      default:
    }
    //
    // 🔖 Nested but normalized; flatening provides no clear advantage
    //
    // quality:         data/value
    //   state.tree[id].data.value
    //
    // component:        data/value/values[maybeCompIdx]
    //    state.tree[id].data.value.values[maybeCompIdx];
    //
    return {
      ...state,
      tree: {
        ...state.tree,
        [id]: {
          ...state.tree[id],
          data: {
            ...state.tree[id].data,
            value: {
              ...state.tree[id].data.value,
              values: {
                ...state.tree[id].data.value.values,
                [compIdx]: {
                  ...newCompNode,
                  values: newCompNode.values,
                },
              },
            },
          },
        },
      },
    };
  },

  // ------------------------------------------------------------------------------
  // Move to matrix reducer
  [SET_MATRIX]: (state, { payload }) => {
    return {
      ...state,
      matrix: payload,
    };
  },
  // dispatched by workbench.middleware
  [SET_MATRIX_CACHE]: (state, { payload, meta }) => {
    const newState = {
      ...state.tree[meta.id],
      data: {
        ...state.tree[meta.id].data,
        cache: payload,
      },
    };
    return meta?.id
      ? {
          ...state,
          tree: {
            ...state.tree,
            [meta.id]: newState,
          },
        }
      : state;
  },
  RESET_MATRIX: (state) => {
    return {
      ...state,
      matrix: null,
    };
  },
});

function updateNodeData(state, id, newData) {
  return {
    ...state,
    tree: {
      ...state.tree,
      [id]: {
        ...state.tree[id],
        data: newData,
      },
    },
  };
}
//-------------------------------------------------------------------------------
// Reuse
// 🔑 uses componentName to update state
//
function updateComp(state, action) {
  if (DEBUG) {
    console.debug(`inspect action updateComp`);
    console.dir(action);
  }
  const { type, id, identifier, valueOrId, valueIdx, payload } = action;
  const [compIdx] = Object.entries(state.tree[id].data.value.values).find(
    ([, comp]) => comp.componentName === identifier,
  );

  const result = {
    ...state,
    tree: {
      ...state.tree,
      [id]: {
        ...state.tree[id],
        data: {
          ...state.tree[id].data,
          value: {
            ...state.tree[id].data.value,
            // const { compIdx, valueOrId, newValue } = action;

            values: componentReducer(
              {
                type,
                compIdx,
                valueIdx: valueIdx || valueOrId,
                newValue: payload,
              },
              state.tree[id].data.value.values,
            ),
          },
        },
      },
    },
  };
  return result;
}
//-------------------------------------------------------------------------------
/**
 *
 * Measurement updates - return mea components (first values)
 *
 * @function
 * @param {Object} action
 * @param {Object} state mea values
 * @return {Object} values for the mea
 */
function componentReducer(action, state) {
  // subroutines
  const setSpanValue = (spanComp, valueIdx, value) => {
    return {
      ...spanComp,
      values: {
        ...spanComp.values,
        [valueIdx]: value,
      },
    };
  };
  // returns first values
  const setCompPropValue = (mea, compIdx, prop, value) => {
    return {
      ...mea,
      [compIdx]: {
        ...mea[compIdx],
        [prop]: value,
      },
    };
  };

  switch (action.type) {
    case SET_COMP_REDUCED: {
      const { compIdx, newValue } = action;
      return setCompPropValue(state, compIdx, 'reduced', newValue);
    }

    case SET_COMP_VALUES: {
      const { compIdx, newValue } = action;
      return setCompPropValue(state, compIdx, 'values', newValue);
    }

    case SET_MSPAN_REQUEST: {
      const { compIdx, valueIdx, newValue } = action;
      return {
        ...state,
        [compIdx]: setSpanValue(state[compIdx], valueIdx, newValue),
      };
    }
    default:
      return state;
  }
}

//-------------------------------------------------------------------------------
export default reducer;
