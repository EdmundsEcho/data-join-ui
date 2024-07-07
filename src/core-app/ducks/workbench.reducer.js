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
import invariant from 'invariant';

import createReducer from '../utils/createReducer';
import {
  SET_TREE,
  RESET_TREE,
  SET_NODE_STATE,
  SET_CHILDIDS,
  SET_DRAGGED_ID,
  SET_MSPAN_REQUEST,
  SET_COMP_REDUCED,
  SET_COMP_REQUEST,
  SET_QUAL_REQUEST,
  SET_SELECTION_MODEL,
  SET_GROUP_SEMANTIC,
  TAG_WAREHOUSE_STATE,
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
import { InputError, WorkbenchError } from '../lib/LuciErrors';

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

/**
 * Node -> Purpose
 * Unifies a hodge-podge of logic to map graphql obsEtl data to an instance of
 * PURPOSE_TYPES.
 * @function
 * @param {Object} nodeData
 * @param {string} identifier
 * @param {bool} measurement
 * @param {string} caller
 * @return {string} PURPOSE_TYPES
 */
const purposeSelector = (nodeData, identifier /* meaFlag, caller*/) => {
  const rootEtlUnit = nodeData.type;

  switch (true) {
    case rootEtlUnit && nodeData.type === 'etlUnit::quality':
      return PURPOSE_TYPES.QUALITY;

    case rootEtlUnit && nodeData.type === 'etlUnit::measurement':
      return PURPOSE_TYPES.MVALUE;

    case rootEtlUnit && nodeData.value.displayType === 'alias':
      return undefined;

    case !rootEtlUnit && nodeData.tag === 'spanValues':
      return PURPOSE_TYPES.MSPAN;

    case !rootEtlUnit && nodeData.tag === 'txtValues':
      return PURPOSE_TYPES.MCOMP;

    // Default case if none of the above conditions are met
    default:
      throw new InputError(
        `Failed to set purpose for Node: ${nodeData.type} - ${identifier}`,
        nodeData,
      );
  }
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
  const filter = ({ type, height }) => type === NODE_TYPES.CANVAS && height === 4;
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
  if (!stateFragment.tree || !stateFragment.tree[id]) {
    return null;
  }
  const node = stateFragment.tree[id];
  if (node.data.semantic !== 'derivedField') {
    return null;
  }
  return node.data.identifier ?? null;
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
 * Returns a map keyed by the etlUnit::measurement parameters and the reduced
 * stated of each.
 *
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
  const mapComponents = Object.values(data.value.values).reduce((acc, value) => {
    acc[value.componentName] = value.reduced;
    return acc;
  }, {});
  return typeof identifier === 'undefined' ? mapComponents : mapComponents[identifier];
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
        Object.values(data.value.values).find((value) => value.tag === 'spanValues')
          .values,
      ).length === 1;
};

/**
 * graphql data -> display and selection model contexts for the display
 *
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
 *    purpose: ?PURPOSE_TYPES,
 *    rowCountTotal: ?number,
 *  };
 * @function
 * @param
 * @return {Array<Object>} config
 */
export const selectEtlUnitDisplayConfig = (
  stateFragment,
  id,
  identifier,
  meaFlag, // bool toggle for mea header data
  caller, // EtlUnitRoot, EtlUnitComponents
) => {
  const { data: nodeData, id: nodeId, type: paletteOrCanvas } = stateFragment.tree[id];
  // guard against value not in the nodeData, and value === undefined
  if (!nodeData || !nodeData.value) {
    return [];
  }

  // single component scenarios
  const purpose = purposeSelector(nodeData, identifier, meaFlag, caller);

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
          purpose,
          valueIdx: undefined,
          rowCountTotal: undefined,
        },
      ];

    case meaFlag:
      return [
        {
          title: nodeData?.value.displayName,
          fieldCount: 'WIP',
          nodeId,
          identifier,
          tag: 'measurement',
          etlUnitType: 'measurement',
          palette: paletteOrCanvas === 'palette',
          measurementType: nodeData?.value?.measurementType,
          purpose,
          valueIdx: undefined,
          rowCountTotal: nodeData?.count,
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
          measurementType: undefined,
          purpose,
          valueIdx: undefined,
          rowCountTotal: nodeData.value.count,
        },
      ];
    case nodeData?.value.measurementType !== identifier: {
      // single component
      const [valueIdx, component] = Object.entries(nodeData.value.values).find(
        ([, comp]) => comp.componentName === identifier,
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
          measurementType: nodeData?.value.measurementType,
          purpose,
          valueIdx: parseInt(valueIdx, 10),
          rowCountTotal: component?.count,
        },
      ];
    }

    case nodeData?.value.measurementType === identifier:
      // collection of components
      return Object.entries(nodeData.value.values).map(([valueIdx, component]) => ({
        title: component.displayName,
        fieldCount: 'WIP',
        nodeId,
        identifier: component.componentName,
        tag: component.tag,
        etlUnitType: 'measurement',
        palette: paletteOrCanvas === 'palette',
        measurementType: nodeData?.value.measurementType,
        purpose: purposeSelector(
          component,
          component.componentName,
          false,
          'EtlUnit-Component',
        ),
        valueIdx: parseInt(valueIdx, 10),
        rowCountTotal: component?.count,
      }));

    default:
      throw new InputError(`Unreachable: ${identifier}`);
  }
};

/**
 * Returns a selectionModel if exists, else null. The selectionModel depends on
 * a complete rendering of the workbench tree.
 *
 * Used for retrieving quality or mcomp values. WIP mspan.
 *
 * @function
 * @param {Object} stateFragment
 * @param {number} nodeId
 * @param {string} identifier display name of the component or quality
 * @param {string} purpose  (quality | mcomp)
 * @param {?string} measurementType (required when mcomp)
 * @return {?Object} selectionModel | null
 */
export const getMaybeSelectionModel = (
  stateFragment,
  { nodeId, purpose, measurementType, valueIdx },
) => {
  if (!purpose) {
    return null;
  }
  if (!stateFragment.tree[nodeId]?.data?.value) {
    console.error(`Tried to retrieve selectionModel from invalid node: ${nodeId}`);
    return null;
  }
  // assert purpose of type quality when data.type === 'etlUnit::quality'
  // assert purpose of type mcomp when data.type === 'etlUnit::measurement'
  // assert measurementType exists when data.type === 'etlUnit::measurement'

  const node = stateFragment.tree[nodeId];
  const { type, value } = node.data;

  // Handle different node types with assertions
  switch (type) {
    case 'etlUnit::quality':
      invariant(
        purpose === PURPOSE_TYPES.QUALITY,
        `Failed invariant, expected type quality: ${purpose}`,
      );
      // Directly return the selectionModel for 'quality' type
      return value?.selectionModel ?? null;

    case 'etlUnit::measurement': {
      invariant(
        [PURPOSE_TYPES.MCOMP, PURPOSE_TYPES.MSPAN].includes(purpose) && measurementType,
        `Failed invariant, expected type mcomp: ${purpose} and a defined measurementType`,
      );
      return value.values[valueIdx]?.selectionModel ?? null;
    }

    default:
      throw new WorkbenchError(`Unexpected node type: ${type}`, {
        message: `Unexpected node type: ${type}`,
        fix: `Make sure the lookup values are correct`,
      });
  }
};

/**
 * Updates the selectionModel hosted in the redux store.
 * See SET_SELECTION_MODEL
 * @private
 */
const setSelectionModel = (state, action) => {
  const { id, identifier, purpose, measurementType, payload } = action;
  const node = state.tree[id];
  if (!node || !node.data || !node.data.value) {
    throw new WorkbenchError(`Node data is invalid or missing in action: ${action}`);
  }

  const { type, value } = node.data;
  const [maybeCompIdx, readOnlyCompOrQual] =
    purpose === PURPOSE_TYPES.QUALITY
      ? [undefined, state.tree[id].data.value]
      : Object.entries(state.tree[id].data.value.values).find(
          ([, comp]) => comp.componentName === identifier,
        );
  const newCompOrQual = {
    ...readOnlyCompOrQual,
    selectionModel: payload,
  };

  // for documentation
  if (process.env.NODE_ENV === 'development') {
    switch (type) {
      case 'etlUnit::quality':
        invariant(
          purpose === PURPOSE_TYPES.QUALITY,
          `Expected type quality: ${purpose}`,
        );
        break;

      case 'etlUnit::measurement': {
        invariant(
          [PURPOSE_TYPES.MCOMP, PURPOSE_TYPES.MSPAN].includes(purpose),
          `Expected type mcomp or mspan: ${purpose}`,
        );
        invariant(
          value.measurementType === measurementType,
          `Expected types to match: ${measurementType}`,
        );
        break;
      }
      default:
        throw new WorkbenchError(`Unexpected node type: ${type}`);
    }
  }

  const newData = {
    ...state.tree[id].data,
    value:
      purpose === PURPOSE_TYPES.QUALITY
        ? { ...newCompOrQual } // 🎉 update here for quality :)
        : {
            ...state.tree[id].data.value,
            values: {
              ...state.tree[id].data.value.values,
              [maybeCompIdx]: {
                ...newCompOrQual,
              },
            },
          },
  };
  return updateNodeData(state, id, newData);
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

export const getCanvasLists = (stateFragment) => stateFragment?.tree[2]?.childIds;

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

  [SET_COMP_REQUEST]: (state, action) => {
    return updateComp(state, action);
  },

  [SET_QUAL_REQUEST]: (state, action) => {
    return updateQual(state, action);
  },

  [SET_GROUP_SEMANTIC]: (state, action) => {
    const { id, ...rest } = action.payload;
    const { data } = selectMaybeNodeState(state, id) || { data: {} };
    return updateNodeData(state, id, { ...data, ...(rest || {}) });
  },
  //
  // v0.4.0
  //
  [SET_SELECTION_MODEL]: (state, action) => setSelectionModel(state, action),

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
// CompaIdx and ValueIdx are different here.  ValueIdx is for mspan values.
// 💥 Do not use valueIdx when purpose mcomp (use componentName)
//
// 🔑 uses componentName to update state
//    (finds compIdx using compName)
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
function updateQual(state, action) {
  if (DEBUG) {
    console.debug(`inspect action updateQual`);
    console.dir(action);
  }
  const { id } = action;

  const result = {
    ...state,
    tree: {
      ...state.tree,
      [id]: {
        ...state.tree[id],
        data: {
          ...state.tree[id].data,
          value: qualityReducer(action, state.tree[id].data.value),
        },
      },
    },
  };
  return result;
}
function qualityReducer(action, state) {
  switch (action.type) {
    case SET_QUAL_REQUEST: {
      const { payload } = action;
      return setQualPropValue(state, 'request', payload);
    }
    default:
      return state;
  }
}

function setQualPropValue(qual, prop, value) {
  return {
    ...qual,
    [prop]: value,
  };
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

    case SET_COMP_REQUEST: {
      const { compIdx, newValue } = action;
      return setCompPropValue(state, compIdx, 'request', newValue);
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
