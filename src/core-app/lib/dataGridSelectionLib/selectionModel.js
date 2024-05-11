/**
 * @module selectionModel
 *
 * @description
 * This module provides a function to create a new selection model object.
 * Todo: move the definitions from xstate-machine to here.  Have xstate-machine
 * depend on this module (not the other way around).
 *
 */
import { PURPOSE_TYPES } from '../sum-types';
import { InputError, InvalidStateError } from '../LuciErrors';

export const ALL_STATE = {
  SELECT_ALL: 'SELECT_ALL',
  SELECT_NONE: 'SELECT_NONE',
};
export const REQUEST_TYPES = {
  REQUEST: 'REQUEST',
  ANTIREQUEST: 'ANTIREQUEST',
  UNINITIALIZED: 'UNINITIALIZED',
};
export const COMPUTATION_TYPES = {
  SELECT: 'SELECT',
  REDUCE: 'REDUCE',
  SERIES: 'SERIES',
  EMPTY: 'EMPTY',
};
export const EVENT_TYPES = {
  INIT: 'INIT',
  RESUME: 'RESUME',
  RESET: 'RESET',
  onRowClick: 'onRowClick',
  onToggleAll: 'onToggleAll',
  onSetReduceComputation: 'onSetReduceComputation',
  enableAntiRequestFeature: 'enableAntiRequestFeature',
  disableAntiRequestFeature: 'disableAntiRequestFeature',
};
export { PURPOSE_TYPES };

export const initialSelectionModel = {
  disableAntiRequest: false,
  rowCountTotal: null,
  computationType: COMPUTATION_TYPES.EMPTY,
  requestType: REQUEST_TYPES.UNINITIALIZED,
  values: {},
};

/*
export const schema = {
  events: {} as
    | { type: 'onRowClick'; id: string; isSelected: boolean }
    | { type: 'onToggleAll'; isSelected: boolean },
}; */
//-----------------------------------------------------------------------------
/* eslint-disable no-console */

const ALL = '__ALL__';
const baseRequestValue = (request) => ({ [ALL]: { value: ALL, request } });

// ----------------------------------------------------------------------------
// guards for the xstate machine
export const isAllRequestValue = ({ selectionModel }) =>
  selectionModel.values[ALL].request;

export const shouldSwitchBuilder = ({ selectionModel }) => {
  if (selectionModel.disableAntiRequest) {
    return false;
  }
  return Object.keys(selectionModel.values).length === selectionModel.rowCountTotal + 1;
};

export const shouldClearValues = ({ selectionModel }) => {
  if (selectionModel.disableAntiRequest) {
    return false;
  }
  return Object.keys(selectionModel.values).length > 1;
};

// ----------------------------------------------------------------------------

/**
 * The publick interface for creating a new selectionModel. See onEnterAllStateFn
 * for additional internal logic.
 *
 * Create a new selection model object. Default values:
 *  - requestType: REQUEST
 *  - computationType: SELECT for quality, REDUCE for mcomp, SERIES for mspan
 *
 * @param {string} purpose - The purpose of the selection model.
 * @param {number} rowCountTotal - The total number of rows in the grid.
 * @returns {Object} A new selection model object.
 * @throws {InputError} If the purpose is not recognized.
 */
export const newSelectionModel = ({ purpose, rowCountTotal, reduced: reducedProp }) => {
  let computationType;
  let reduced;
  let values;
  let disableAntiRequest = false;
  switch (purpose) {
    case PURPOSE_TYPES.QUALITY:
      computationType = COMPUTATION_TYPES.SELECT;
      reduced = undefined;
      values = baseRequestValue(true);
      break;
    case PURPOSE_TYPES.MCOMP:
      computationType = COMPUTATION_TYPES.REDUCE;
      reduced = reducedProp || true;
      values = baseRequestValue(false);
      break;
    case PURPOSE_TYPES.MSPAN:
      computationType = COMPUTATION_TYPES.SERIES;
      reduced = reducedProp || false;
      values = baseRequestValue(true);
      disableAntiRequest = true;
      break;
    default:
      throw new InputError(`Unexpected purpose value: ${purpose}`);
  }

  return {
    rowCountTotal,
    requestType: values[ALL].request
      ? REQUEST_TYPES.ANTIREQUEST // exclude from select all
      : REQUEST_TYPES.REQUEST, // add to select none
    computationType,
    meta: {
      purpose,
      reduced,
    },
    values,
    disableAntiRequest,
  };
};

/**
 * Function that returns whether the number of values in the
 * selection model is one by excluding the ALL key.
 * @param {Object} selectionModel - The selection model object.
 * @returns {boolean} True if the number of values is one.
 */
export const isSingleValue = (selectionModel = {}) =>
  Object.keys(selectionModel.values).filter((k) => k !== ALL).length === 1;

const isEmptyRequest = (selectionModel = {}) =>
  Object.keys(selectionModel.values).filter((k) => k !== ALL).length === 0;
/**
 * Interpret the selection model to determine whether a component is to be
 * included in the collection of select fields.
 *
 * There is only one case where we can *exclude* the field.
 * 1. isEmpty
 * 2. requestType is request
 * 3. computationType is reduce
 *
 * 🦀 Uncertain what it means to have SERIES with no values selected.
 *
 *
 * @param {Object} selectionModel - The selection model object.
 * @returns {boolean} True if the component is to be included.
 */
export const includeCompInSelectFields = (selectionModel) => {
  const exclude =
    selectionModel.computationType === COMPUTATION_TYPES.REDUCE &&
    selectionModel.requestType === REQUEST_TYPES.REQUEST &&
    isEmptyRequest(selectionModel);
  const incomplete =
    selectionModel.computationType === COMPUTATION_TYPES.SERIES &&
    isEmptyRequest(selectionModel);

  return !exclude && !incomplete;
};

/**
 * Transform the selection model to a graphql matrix request.
 *
 * endpoint
 * @function
 * @param {Object} selectionModel - The selection model object.
 * @returns {Object} { request: [txtValues], antiRequest: bool }
 */
export const mkQualOrCompRequest = (selectionModel, maybeSpanValues) => {
  return maybeSpanValues
    ? {
        antiRequest: !Object.values(maybeSpanValues)?.[0]?.request ?? false,
        reduced: selectionModel.computationType === COMPUTATION_TYPES.REDUCE,
        request: Object.values(maybeSpanValues).map(({ value }) => value),
      }
    : {
        antiRequest: selectionModel.requestType === REQUEST_TYPES.ANTIREQUEST,
        reduced: selectionModel.computationType === COMPUTATION_TYPES.REDUCE,
        request: isEmptyRequest(selectionModel)
          ? []
          : Object.values(selectionModel.values)
              .filter(({ value }) => value !== ALL)
              .map(({ value }) => value),
      };
};

/**
 * Luci selectionModel -> grid selectionModel
 *
 * The goal is to build a "deselect" list. This is because we have a default for
 * select all -> list = [].
 *
 * Depends on the keys in the selectionModel = rowToIdFn return value
 *
 * Returns a function that "deselects" rows for display in the grid.
 * Recall, the default is "select all" where we select none in the grid.
 * The grid will display the checkbox as though selected.
 *
 */
export function mkGridSelectionModelFilter(selectionModel, rowToIdFn = (x) => x) {
  //
  let deselect = () => false;

  // return a filter that excludes all values (~ select all default)
  if (!selectionModel) {
    return () => [];
  }

  const { values, requestType } = selectionModel;
  const clickedValues = Object.keys(values).filter((key) => key !== ALL);
  const clickedValueCount = clickedValues.length;
  const allRequestValue = values[ALL].request;

  switch (true) {
    case clickedValueCount === 0 && allRequestValue:
      deselect = () => false;
      break;

    case clickedValueCount === 0 && !allRequestValue:
      deselect = () => true;
      break;

    case clickedValueCount > 0 && requestType === REQUEST_TYPES.ANTIREQUEST: {
      // select all except what values the user does not want
      const valueSet = new Set(clickedValues);
      // reversed in the deselection
      deselect = (id) => valueSet.has(id);
      break;
    }

    case clickedValueCount > 0 && requestType === REQUEST_TYPES.REQUEST: {
      // select none except what values the user wants
      const valueSet = new Set(clickedValues);
      // reversed in the deselection
      deselect = (id) => !valueSet.has(id);
      break;
    }

    default:
      throw new InputError(
        `Unexpected selectionModel state: ${clickedValueCount} ${requestType}`,
        selectionModel,
      );
  }
  return (rows) => rows.map(rowToIdFn).filter(deselect);
}

/**
 * Utilized in the xstate machine configuration.
 *
 *
 * @param {Object} selectionModel
 * @param {Object} state {allState}
 * @returns {Object} selectionModel
 */
export const handleToggleAllUpdate = (selectionModel, state) => {
  const stateDependentFragment = modelFromAllState(state);
  return {
    ...selectionModel,
    ...stateDependentFragment,
  };
};
/**
 * onToggleAll logic when the event does not change the request type.
 * selectionModel -> selectionModel
 */
export const handleClearValues = (selectionModel) => ({
  ...selectionModel,
  values: { [ALL]: selectionModel.values[ALL] },
});
/**
 * Critical onRowClick event logic
 * Rules
 * isSelected true, requestType REQUEST => add to values
 * isSelected true, requestType ANTIREQUEST => remove from values
 * isSelected false, requestType REQUEST => remove from values
 * isSelected false, requestType ANTIREQUEST => add to values
 */
const shouldAddOrRemove = (isSelected, requestType) => {
  // guard for undefined parameters
  if (typeof isSelected !== 'boolean' || !REQUEST_TYPES[requestType]) {
    throw new InputError(
      `Invalid isSelected: ${isSelected} or requestType: ${requestType}`,
    );
  }
  switch (true) {
    case requestType === REQUEST_TYPES.REQUEST && isSelected:
      return 'ADD';
    case requestType === REQUEST_TYPES.REQUEST && !isSelected:
      return 'REMOVE';
    case requestType === REQUEST_TYPES.ANTIREQUEST && isSelected:
      return 'REMOVE';
    case requestType === REQUEST_TYPES.ANTIREQUEST && !isSelected:
      return 'ADD';
    default:
      throw new Error('Unreachable - shouldAddOrRemove');
  }
};
/**
 * onRowClick event handler
 *
 * Adds or removes values from the request encapsulating the current state
 * and the request to add or remove values.
 *
 * Returns a function that takes ({ context, event }) and returns the updated
 * selectionModel (mutates values only).
 *
 * @function
 * @param {string} REQUEST_TYPES
 * @returns {Function} updateSelectionModel
 */
export const handleRowClickUpdate = (selectionModel, event, state, debug) => {
  if (!state) {
    throw new InputError('Missing state in handleRowClickUpdate');
  }
  // value that captures if the event.id exists in selectionModel.values
  const exists = selectionModel.values?.[event.id];
  const addOrRemove = shouldAddOrRemove(event.isSelected, selectionModel.requestType);
  if (debug) {
    console.debug('👉 handleRowClickUpdate', {
      event,
      allValue: selectionModel.values[ALL].request,
      isSelected: event.isSelected,
      requestType: selectionModel.requestType,
      shouldAddOrRemove: addOrRemove,
    });
  }

  let newValues = { ...selectionModel.values };

  if (addOrRemove === 'REMOVE' && exists) {
    const { [event.id]: _, ...rest } = newValues;
    newValues = rest;
  } else if (addOrRemove === 'ADD' && !exists) {
    newValues[event.id] = {
      value: event.id,
      request: event.isSelected,
    };
  }
  // validating the update
  if (process.env.REACT_APP_ENV === 'development') {
    const before = Object.keys(selectionModel.values).length;
    const after = Object.keys(newValues).length;
    const debugObj = {
      state,
      event,
      newValues,
      selectionModel,
    };
    switch (addOrRemove) {
      case 'ADD' && !exists:
        if (after - 1 !== before) {
          throw new InvalidStateError({
            message: 'ADD failed',
            shouldAddOrRemove: addOrRemove,
            ...debugObj,
          });
        }
        if (debug) {
          console.debug(`✅ ADD as requested: before: ${before} after: ${after}`);
        }
        break;
      case 'REMOVE' && exists:
        if (after + 1 !== before) {
          throw new InvalidStateError({
            message: 'REMOVE failed',
            shouldAddOrRemove: addOrRemove,
            ...debugObj,
          });
        }
        if (debug) {
          console.debug(`✅ REMOVE as requested: before: ${before} after: ${after}`);
        }
        break;
      default:
    }
  }
  return {
    ...selectionModel,
    values: newValues,
  };
};

/**
 * The predicate return true when the model is valid. It throws an InvalidStateError
 * when otherwise.
 *
 * @param {Object} context
 * @param {Object} event
 * @param {Object} meta - { cond: { state, debug } }
 * @return bool
 */
export const isValidModel = ({ selectionModel }, event, { cond: { state, debug } }) => {
  const { valid, errors } = validateSelectionModel(selectionModel, state);
  if (debug) {
    console.debug('🦀 isValidModel', {
      valid,
      errors,
      state,
      selectionModel,
      values: { ...selectionModel.values },
    });
  }
  if (!valid) {
    throw new InvalidStateError('The selection model reached an invalid state.', {
      verbose: debug,
      cause: {
        selectionModel,
        allState: `is: ${
          selectionModel.values[ALL].request
        } where state should be: ${allStateFromAllValue(selectionModel)}`,
        event,
        state,
        errors,
      },
    });
  }
  return valid;
};

/**
 * Implements Rule 6. starting from state
 * Returns the requestType and values required by definition of allState.
 * @private
 * @param {Object} state - { allState }
 * @returns {Object} { requestType, values }
 */
function modelFromAllState(state) {
  let predicate;

  if (typeof state === 'string') {
    predicate = state;
  } else if (state && typeof state.allState === 'string') {
    predicate = state.allState;
  } else {
    throw new InputError(`Invalid state input: ${JSON.stringify(state)}`);
  }

  const isSelectAllState = predicate === ALL_STATE.SELECT_ALL;
  return {
    values: baseRequestValue(isSelectAllState),
    requestType: requestTypeFromAllValue(isSelectAllState),
  };
}
/**
 * Implements Rule 6. starting from ALL
 * Sets the allState using the ALL value.
 * @function
 * @private
 * @param {Object} selectionModel
 * @returns {ALL_STATE.*} The allState state.
 */
function allStateFromAllValue(model) {
  const predicate = typeof model === 'boolean' ? model : model.values[ALL].request;
  return predicate ? ALL_STATE.SELECT_ALL : ALL_STATE.SELECT_NONE;
}
/**
 * Rule 5.
 * Sets the requestType using the ALL value.
 * When the ALL value is true, the requestType is ANTIREQUEST (all except).
 * When the ALL value is false, the requestType is REQUEST (none except).
 * @function
 * @private
 * @param {Object | bool} selectionModel or the ALL.request value.
 * @returns {ALL_STATE.*} The allState state.
 * @returns {REQUEST_TYPE.*}
 */
function requestTypeFromAllValue(model) {
  const predicate = typeof model === 'boolean' ? model : model.values[ALL].request;
  return predicate ? REQUEST_TYPES.ANTIREQUEST : REQUEST_TYPES.REQUEST;
}
export const testSuite = {
  ALL,
  requestTypeFromAllValue,
  allStateFromAllValue,
  modelFromAllState,
  baseRequestValue,
  shouldAddOrRemove,
  handleToggleAllUpdate,
};
/**
 * Invariants for the selection model. Return an object with the summary status
 * and list of errors.
 * { valid, safeToDispatch, errors }
 *
 * @function
 * @private
 *
 */
function validateSelectionModel(model, state = { allState: undefined }) {
  const errors = [];

  // Rule 1: Validate requestType and computationType
  if (!REQUEST_TYPES[model.requestType]) {
    errors.push('Rule 1. Invalid requestType');
  }
  if (!COMPUTATION_TYPES[model.computationType]) {
    errors.push('Rule 1. Invalid computationType');
  }
  // Rule 2: Validate rowCountTotal is a number greater than zero
  if (typeof model.rowCountTotal !== 'number' || model.rowCountTotal <= 0) {
    errors.push('Rule 2. rowCountTotal must be a number greater than zero');
  }
  // Rule 3: Validate ALL consistency
  const allRequestValue = model.values[ALL]?.request;
  if (typeof allRequestValue !== 'boolean') {
    errors.push('ALL must have a boolean request value');
  } else {
    // Check if other request values are the opposite of ALL
    Object.keys(model.values)
      .filter((key) => key !== ALL)
      .some((key) => {
        const fail = model.values[key].request === allRequestValue;
        if (fail) {
          errors.push('Rule 3. Other request values must be opposite of ALL');
        }
        return fail;
      });
  }
  if (
    !model.disableAntiRequestFeature &&
    Object.keys(model.values).length >= model.rowCountTotal + 1
  ) {
    errors.push(
      'Rule 4. When antiRequestFeature is on, the number of selected values should not meet or exceed rowCountTotal',
    );
  }
  // Rule 5: The ALL request value must align with the requestType
  // ALL is true, requestType is ANTIREQUEST
  // ALL is false, requestType is REQUEST
  if (model.requestType !== requestTypeFromAllValue(allRequestValue)) {
    errors.push(
      `Rule 5. The ALL request value (${allRequestValue} - ${
        allRequestValue ? 'select all' : 'select none'
      }) must align with the requestType (${model.requestType})`,
    );
  }
  // Rule 6: The ALL request value must align with the ALL_STATE
  const { allState } = state;
  if (allState) {
    const aligned =
      (allRequestValue === true && allState === allStateFromAllValue(model)) ||
      (allRequestValue === false && allState === allStateFromAllValue(model));
    if (!aligned) {
      errors.push(
        `Rule 6. The ALL request value (${allRequestValue}) must align with the allState (${allState})`,
      );
    }
  }

  // Return the validation result with all collected errors
  const valid = errors.length === 0;

  return { valid, errors };
}

// END
