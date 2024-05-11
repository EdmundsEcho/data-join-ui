import { assign, createMachine  } from 'xstate';

export const SEED_STATE = {
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
};
export const ALL = '__ALL__';
export const baseRequestValue = (request) => ({ [ALL]: { value: ALL, request } });

const initialContext = {
  readOnly: null,
  selectionModel: {
    rowCountTotal: null,
    computationType: COMPUTATION_TYPES.EMPTY,
    requestType: REQUEST_TYPES.UNINITIALIZED,
    values: {},
  },
};

function configValidation(state = { seedState: undefined }) {
  return (context, event) => {
    const { selectionModel } = context;
    const result = validateSelectionModel(selectionModel, state);
    if (!result.valid) {
      console.error('Selection model is invalid:', result.errors);
      throw new InvalidStateError('Selection model is invalid', {
        cause: {
          selectionModel: JSON.stringify(selectionModel, null, 2),
          event: JSON.stringify(event, null, 2),
          state,
          errors: result.errors,
        },
      });
    }
    return true;
  };
}


"type": "RESUME",
            "selectionModel": {
              "rowCountTotal": 3,
              "requestType": "REQUEST",
              "computationType": "REDUCE",
              "meta": {
                "purpose": "mcomp",
                "reduced": true
              },
              "values": {
                "__ALL__": {
                  "value": "__ALL__",
                  "request": false
                }
              }

const baseMachineOptions = {
  actions: {
    dispatchContext: (context) => {
      console.debug('📬 dispatchContext not configured', context.selectionModel);
    },
    validateSelectionModel: (...args) => configValidation()(...args),
    maybeResetRequestType: assign({
      selectionModel: (context) => {
        const { selectionModel } = context;
        const requestsCount = Object.keys(selectionModel.values).length - 1;
        const noValues = requestsCount === 0;
        const seedState = selectionModel.values[ALL].request;

        // Determine if the current requestType is valid
        const validRequestType = noValues
          ? [
              selectionModel.requestType === REQUEST_TYPES.REQUEST && seedState,
              selectionModel.requestType === REQUEST_TYPES.ANTIREQUEST && !seedState,
            ].some((v) => v)
          : true;

        // Only update if the requestType is not valid
        if (!validRequestType) {
          return {
            ...selectionModel,
            requestType: seedState ? REQUEST_TYPES.REQUEST : REQUEST_TYPES.ANTIREQUEST,
          };
        }

        return selectionModel;
      },
    }),
  },
  guards: {
    isReduce: (_, event) => {
      console.debug('isReduce: ', event);
      return event.isSelected;
    },
    isSeries: (_, event) => {
      console.debug('isSeries: ', event);
      return !event.isSelected;
    },
    isSelectAll: (_, event) => {
      return event.isSelected;
    },
    isDeselectAll: (_, event) => {
      return !event.isSelected;
    },
    shouldSwitchBuilder: (context) => {
      const { selectionModel } = context;
      const requestsCount = Object.keys(selectionModel.values).length - 1;
      const result = requestsCount === selectionModel.rowCountTotal;
      if (DEBUG) {
        console.debug('🔥 shouldSwitchBuilder', result, requestsCount);
      }
      return result;
    },
    isSelectContext: ({ selectionModel }) => {
      return selectionModel.computationType === COMPUTATION_TYPES.SELECT;
    },
    isReduceContext: ({ selectionModel }) => {
      return selectionModel.computationType === COMPUTATION_TYPES.REDUCE;
    },
    isSeriesContext: ({ selectionModel }) => {
      return selectionModel.computationType === COMPUTATION_TYPES.SERIES;
    },
  },
};
const baseMachineConfig = {
  id: 'selectionModel',
  version: '0.1.0',
  description: 'Manages values selection model for making data requests',
  context: initialContext,
  initial: 'idle',
  states: {
    idle: {
      on: {
        [EVENT_TYPES.INIT]: {
          target: 'active',
          actions: [
            assign({
              readOnly: () => false,
              selectionModel: (_, event) => ({
                ...event.selectionModel,
              }),
            }),
            (_, event) => {
              if (DEBUG) {
                console.debug('🚀 init with event', event);
              }
            },
            { type: 'validateSelectionModel' },
          ],
        },
        [EVENT_TYPES.RESUME]: {
          target: 'active',
          actions: [
            assign({
              readOnly: () => true,
              selectionModel: (_, event) => ({
                ...event.selectionModel,
              }),
            }),
            (_, event) => {
              if (DEBUG) {
                console.debug('💫 resuming with event', JSON.stringify(event, null, 2));
              }
            },
            { type: 'validateSelectionModel' },
          ],
        },
      },
    },
    active: {
      type: 'parallel',
      // determine where to go reading the selectionModel
      entry: [
        (context) => {
          console.debug('🚀 active entry', {
            ALL_false: context.selectionModel.values[ALL].request === false,
          });
        },
        configValidation({ seedState: undefined }),
        // { type: 'validateSelectionModel' },
        {
          target: SEED_STATE.SELECT_NONE,
          cond: (context) => context.selectionModel.values[ALL].request === false,
        },
        {
          target: SEED_STATE.SELECT_ALL,
          cond: (context) => context.selectionModel.values[ALL].request === true,
        },
      ],
      on: {
        [EVENT_TYPES.RESET]: {
          target: 'idle',
          actions: [
            assign(() => ({ ...initialContext })),
            (context) => {
              if (DEBUG) {
                console.debug('🚀 reset with context', context);
              }
            },
          ],
        },
      },
      states: {
        seedState: {
          initial: SEED_STATE.SELECT_ALL,
          states: {
            [SEED_STATE.SELECT_ALL]: {
              entry: [
                assign((context) => {
                  if (context.readOnly) {
                    console.log('Resuming with current context:', context);
                    return {
                      ...context,
                      readOnly: false,
                    };
                  }
                  return {
                    ...context,
                    selectionModel: {
                      ...context.selectionModel,
                      requestType: REQUEST_TYPES.ANTIREQUEST, // exclude values from
                      values: withBaseRequestValue(true), // ALL true
                    },
                  };
                }),
                (context) => {
                  if (DEBUG) {
                    console.debug(
                      '✨ building context in seed state SELECT_ALL',
                      JSON.stringify(context, null, 2),
                    );
                  }
                },
                configValidation({ seedState: SEED_STATE.SELECT_ALL }),
                // { type: 'validateSelectionModel' },
                { type: 'dispatchContext' },
              ],
              on: {
                onRowClick: {
                  actions: [
                    (context) => {
                      if (DEBUG) {
                        console.debug('✨ before', JSON.stringify(context, null, 2));
                      }
                    },
                    assign({
                      selectionModel: updateSelectionModelCfg(
                        SEED_STATE.SELECT_ALL,
                        DEBUG,
                      ),
                    }),
                    (context) => {
                      if (DEBUG) {
                        console.debug('✨ after', JSON.stringify(context, null, 2));
                      }
                    },
                    // { type: 'maybeResetRequestType' },
                    {
                      cond: 'shouldSwitchBuilder',
                      target: SEED_STATE.SELECT_NONE,
                    },
                    configValidation({ seedState: SEED_STATE.SELECT_ALL }),
                    // { type: 'validateSelectionModel' },
                    { type: 'dispatchContext' },
                  ],
                },
                onToggleAll: {
                  cond: 'isDeselectAll',
                  target: SEED_STATE.SELECT_NONE,
                },
              },
            },
            [SEED_STATE.SELECT_NONE]: {
              entry: [
                assign((context) => {
                  if (context.readOnly) {
                    console.log('Resuming with context:', context);
                    return {
                      ...context,
                      readOnly: false,
                    };
                  }
                  return {
                    ...context,
                    selectionModel: {
                      ...context.selectionModel,
                      requestType: REQUEST_TYPES.REQUEST, // add values to
                      values: withBaseRequestValue(false), // ALL false
                    },
                  };
                }),
                (context) => {
                  if (DEBUG) {
                    console.debug(
                      '💥 building context in seed state SELECT_NONE',
                      JSON.stringify(context, null, 2),
                    );
                  }
                },
                configValidation({ seedState: SEED_STATE.SELECT_NONE }),
                // { type: 'validateSelectionModel' },
                { type: 'dispatchContext' },
              ],
              on: {
                onRowClick: {
                  actions: [
                    assign({
                      selectionModel: updateSelectionModelCfg(
                        SEED_STATE.SELECT_NONE,
                        DEBUG,
                      ),
                    }),
                    // { type: 'maybeResetRequestType' },
                    {
                      cond: 'shouldSwitchBuilder',
                      target: SEED_STATE.SELECT_ALL,
                    },
                    configValidation({ seedState: SEED_STATE.SELECT_NONE }),
                    // { type: 'validateSelectionModel' },
                    { type: 'dispatchContext' },
                  ],
                },
                onToggleAll: {
                  cond: 'isSelectAll',
                  target: SEED_STATE.SELECT_ALL,
                },
              },
            },
          },
        },
        computationType: {
          initial: COMPUTATION_TYPES.EMPTY,
          states: {
            [COMPUTATION_TYPES.EMPTY]: {
              always: [
                {
                  target: COMPUTATION_TYPES.SELECT,
                  cond: 'isSelectContext',
                  description: 'Read context.computationType === SELECT',
                },
                {
                  target: COMPUTATION_TYPES.REDUCE,
                  cond: 'isReduceContext',
                  description: 'Read context.computationType === REDUCE',
                },
                {
                  target: COMPUTATION_TYPES.SERIES,
                  cond: 'isSeriesContext',
                  description: 'Read context.computationType === SERIES',
                },
              ],
            },
            [COMPUTATION_TYPES.SELECT]: {
              type: 'final',
              entry: [{ type: 'dispatchContext' }],
            },
            [COMPUTATION_TYPES.REDUCE]: {
              entry: [
                assign({
                  selectionModel: (context) => ({
                    ...context.selectionModel,
                    computationType: COMPUTATION_TYPES.REDUCE,
                  }),
                }),
                { type: 'dispatchContext' },
              ],
              on: {
                [EVENT_TYPES.onSetReduceComputation]: [
                  {
                    cond: 'isSeries',
                    target: COMPUTATION_TYPES.SERIES,
                  },
                ],
              },
            },
            [COMPUTATION_TYPES.SERIES]: {
              entry: [
                assign({
                  selectionModel: (context) => ({
                    ...context.selectionModel,
                    computationType: COMPUTATION_TYPES.SERIES,
                  }),
                }),
                { type: 'dispatchContext' },
              ],
              on: {
                [EVENT_TYPES.onSetReduceComputation]: [
                  {
                    cond: 'isReduce',
                    target: COMPUTATION_TYPES.REDUCE,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
  predictableActionArguments: true,
  preserveActionOrder: true,
};

function validateSelectionModel(model, state) {
  const errors = [];

  // Rule 1: Validate requestType and computationType
  if (!REQUEST_TYPES[model.requestType]) {
    errors.push('Invalid requestType');
  }
  if (!COMPUTATION_TYPES[model.computationType]) {
    errors.push('Invalid computationType');
  }

  // Rule 2: Validate rowCountTotal is a number greater than zero
  if (typeof model.rowCountTotal !== 'number' || model.rowCountTotal <= 0) {
    errors.push('rowCountTotal must be a number greater than zero');
  }

  // Rule 3: Validate ALL consistency
  const allRequestValue = model.values[ALL]?.request;
  if (typeof allRequestValue !== 'boolean') {
    errors.push('ALL must have a boolean request value');
  } else {
    // Check if other request values are the opposite of ALL
    // eslint-disable-next-line
    for (let key in model.values) {
      if (key !== ALL && model.values[key].request === allRequestValue) {
        errors.push('Other request values must be opposite of ALL');
        break; // Only need to find one case to prove inconsistency
      }
    }
  }

  // Rule 4: Check the number of entries against rowCountTotal
  const selectedCount = Object.keys(model.values).length - 1; // Subtract 1 for ALL
  if (selectedCount > model.rowCountTotal) {
    errors.push('Number of selected values exceeds rowCountTotal');
  }

  // Rule 5: The ALL request value must align with the requestType
  const requestTypeAligned = [
    // select all except the antirequest
    model.requestType === REQUEST_TYPES.ANTIREQUEST && allRequestValue === true,
    // select none except the request
    model.requestType === REQUEST_TYPES.REQUEST && allRequestValue === false,
  ].some((v) => v);

  // Rule 6: The ALL request value must align with the SEED_STATE
  if (state && state?.seedState) {
    const { seedState } = state;
    const aligned =
      (allRequestValue === true && seedState === SEED_STATE.SELECT_ALL) ||
      (allRequestValue === false && seedState === SEED_STATE.SELECT_NONE);
    if (!aligned) {
      errors.push(
        `The ALL request value (${allRequestValue}) must align with the seedState (${seedState})`,
      );
    }
  }

  if (!requestTypeAligned) {
    errors.push(
      `The ALL request value (${allRequestValue}) must align with the requestType (${model.requestType})`,
    );
  }

  // Return the validation result with all collected errors
  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}
function configValidation(state = { seedState: undefined }) {
  return (context, event) => {
    const { selectionModel } = context;
    const result = validateSelectionModel(selectionModel, state);
    if (!result.valid) {
      console.error('Selection model is invalid:', result.errors);
      throw new Error('Selection model is invalid', {
        cause: {
          selectionModel: JSON.stringify(selectionModel, null, 2),
          event: JSON.stringify(event, null, 2),
          state,
          errors: result.errors,
        },
      });
    }
    return true;
  };
}
const machine =  createMachine(baseMachineConfig, baseMachineOptions);
