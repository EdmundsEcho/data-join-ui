/**
 * Configuration for the selection model machine.
 */
import { createMachine, assign, send, log } from 'xstate';
import {
  EVENT_TYPES,
  ALL_STATE,
  COMPUTATION_TYPES,
  isValidModel,
  handleRowClickUpdate,
  handleToggleAllUpdate,
  handleClearValues,
  isAllRequestValue,
  shouldSwitchBuilder,
  shouldClearValues,
  initialSelectionModel,
} from './selectionModel';

//-----------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_LEVELS === 'true' ||
  process.env.REACT_APP_DEBUG_WORKBENCH === 'true' ||
  process.env.REACT_APP_DEBUG_MATRIX === 'true';
/* eslint-disable no-console */
//-----------------------------------------------------------------------------

/**
 * noop version of the machine for when the selection model is not required.
 */
export const noopMachine = () =>
  createMachine({
    id: 'noop',
    initial: 'idle',
    context: {},
    states: {
      idle: {}, // No actions or transitions
    },
  });

const initialContext = {
  silentMode: true, // dispatches context when false
  selectionModel: initialSelectionModel,
};
/**
 * selection model when turned on
 */
const baseMachineConfig = {
  id: 'selectionModel',
  version: '0.1.0',
  preserveActionOrder: true,
  predictableActionArguments: true,
  description: 'Manages values selection model for making data requests',
  context: initialContext,
  initial: 'idle',
  states: {
    idle: {
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
        [EVENT_TYPES.INIT]: {
          target: 'active',
          actions: [
            assign({
              selectionModel: (_, event) => ({
                ...event.selectionModel,
              }),
            }),
            (_, event) => {
              if (DEBUG) {
                console.debug('🚀 init with event', event);
              }
            },
          ],
        },
        [EVENT_TYPES.RESUME]: {
          target: 'active',
          actions: [
            assign({
              selectionModel: (_, event) => ({
                ...event.selectionModel,
              }),
            }),
            (_, event) => {
              if (DEBUG) {
                console.debug('💫 resuming with event', JSON.stringify(event, null, 2));
              }
            },
          ],
        },
      },
    },
    active: {
      type: 'parallel',
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
        allState: {
          initial: 'next',
          states: {
            next: {
              description: 'Go to the right allState by reading the selectionModel',
              always: [
                {
                  cond: 'isAllRequestValue',
                  target: `${ALL_STATE.SELECT_ALL}.waiting`,
                },
                {
                  target: `${ALL_STATE.SELECT_NONE}.waiting`,
                },
              ],
            },
            // state
            [ALL_STATE.SELECT_ALL]: {
              always: [
                {
                  // update context here, now to prevent bounce
                  cond: 'shouldSwitchBuilder',
                  target: `${ALL_STATE.SELECT_NONE}.dispatch`,
                  actions: [
                    assign({
                      selectionModel: ({ selectionModel }) =>
                        handleToggleAllUpdate(selectionModel, {
                          allState: ALL_STATE.SELECT_NONE,
                        }),
                    }),
                  ],
                },
              ],
              on: {
                onRowClick: {
                  target: '.maybeSwitchBuilder',
                  actions: [
                    assign({
                      silentMode: false,
                      selectionModel: ({ selectionModel }, event) =>
                        handleRowClickUpdate(
                          selectionModel,
                          event,
                          {
                            allState: ALL_STATE.SELECT_ALL,
                          },
                          DEBUG,
                        ),
                    }),
                  ],
                },
                onToggleAll: [
                  {
                    // update the context to prevent bounce
                    cond: 'isDeselectAll',
                    target: `#selectionModel.active.allState.${ALL_STATE.SELECT_NONE}.dispatch`,
                    actions: [
                      assign({
                        silentMode: false,
                        selectionModel: ({ selectionModel }) =>
                          handleToggleAllUpdate(selectionModel, {
                            allState: ALL_STATE.SELECT_NONE,
                          }),
                      }),
                    ],
                  },
                  // clear the values without changing state
                  {
                    target: '.clearValues',
                  },
                ],
              },
              initial: 'waiting',
              states: {
                maybeSwitchBuilder: {
                  always: [
                    {
                      // update context to prevent bounce
                      cond: 'shouldSwitchBuilder',
                      target: `#selectionModel.active.allState.${ALL_STATE.SELECT_NONE}.dispatch`,
                      actions: [
                        assign({
                          selectionModel: ({ selectionModel }) =>
                            handleToggleAllUpdate(selectionModel, {
                              allState: ALL_STATE.SELECT_NONE,
                            }),
                        }),
                      ],
                    },
                    { target: 'dispatch' },
                  ],
                },
                clearValues: {
                  always: [
                    {
                      target: 'dispatch',
                      cond: 'shouldClearValues',
                      actions: [
                        assign({
                          selectionModel: ({ selectionModel }) =>
                            handleClearValues(selectionModel),
                        }),
                      ],
                    },
                    { target: 'waiting' },
                  ],
                },
                error: {
                  type: 'final',
                  entry: [
                    (context) => console.error('🚨 Error: Invalid model', context),
                  ],
                },
                waiting: {
                  /* a state where parent waits for next event */
                },
                dispatch: {
                  entry: [
                    {
                      type: 'dispatchContext',
                      target: 'waiting',
                      cond: {
                        type: 'isValidModelAndDispatch',
                        state: { allState: ALL_STATE.SELECT_ALL },
                        debug: DEBUG,
                      },
                    },
                    {
                      target: 'error',
                    },
                  ],
                },
              },
            },
            // state
            [ALL_STATE.SELECT_NONE]: {
              always: [
                {
                  // update context here now to prevent bounce
                  cond: 'shouldSwitchBuilder',
                  target: `${ALL_STATE.SELECT_ALL}.dispatch`,
                  actions: [
                    assign({
                      selectionModel: ({ selectionModel }) => {
                        return handleToggleAllUpdate(selectionModel, {
                          allState: ALL_STATE.SELECT_ALL,
                        });
                      },
                    }),
                  ],
                },
              ],
              on: {
                onRowClick: {
                  target: '.maybeSwitchBuilder',
                  actions: [
                    assign({
                      silentMode: false,
                      selectionModel: ({ selectionModel }, event) =>
                        handleRowClickUpdate(
                          selectionModel,
                          event,
                          {
                            allState: ALL_STATE.SELECT_NONE,
                          },
                          DEBUG,
                        ),
                    }),
                  ],
                },
                onToggleAll: [
                  {
                    // update the context to prevent bounce
                    cond: 'isSelectAll',
                    target: `#selectionModel.active.allState.${ALL_STATE.SELECT_ALL}.dispatch`,
                    actions: [
                      assign({
                        silentMode: false,
                        selectionModel: ({ selectionModel }) =>
                          handleToggleAllUpdate(selectionModel, {
                            allState: ALL_STATE.SELECT_ALL,
                          }),
                      }),
                    ],
                  },
                  // clear the values without changing state
                  {
                    target: '.clearValues',
                  },
                ],
              },
              initial: 'waiting',
              states: {
                maybeSwitchBuilder: {
                  always: [
                    {
                      // update context here, now to prevent bounce
                      cond: 'shouldSwitchBuilder',
                      target: `#selectionModel.active.allState.${ALL_STATE.SELECT_ALL}.dispatch`,
                      actions: [
                        assign({
                          selectionModel: ({ selectionModel }) =>
                            handleToggleAllUpdate(selectionModel, {
                              allState: ALL_STATE.SELECT_ALL,
                            }),
                        }),
                      ],
                    },
                    { target: 'dispatch' },
                  ],
                },
                clearValues: {
                  always: [
                    {
                      target: 'dispatch',
                      cond: 'shouldClearValues',
                      actions: [
                        assign({
                          selectionModel: ({ selectionModel }) => {
                            return handleClearValues(selectionModel);
                          },
                        }),
                      ],
                    },
                    { target: 'waiting' },
                  ],
                },
                error: {
                  type: 'final',
                  entry: [
                    (context) => console.error('🚨 Error: Invalid model', context),
                  ],
                },
                waiting: {
                  /* a state where parent waits for next event */
                },
                dispatch: {
                  entry: [
                    log(
                      (event, context) =>
                        `📋 select none dispatch entry ${JSON.stringify(
                          { event, context },
                          null,
                          2,
                        )}`,
                    ),
                    {
                      type: 'dispatchContext',
                      target: 'waiting',
                      cond: {
                        type: 'isValidModelAndDispatch',
                        state: { allState: ALL_STATE.SELECT_NONE },
                        debug: DEBUG,
                      },
                    },
                    {
                      target: 'error',
                    },
                  ],
                },
              },
            },
          },
        },
        computationType: {
          initial: 'next',
          states: {
            next: {
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
              entry: [{ type: 'dispatchContext', cond: 'isNotSilentMode' }],
            },
            [COMPUTATION_TYPES.REDUCE]: {
              entry: [
                send({ type: EVENT_TYPES.enableAntiRequestFeature }),
                assign({
                  selectionModel: (context) => ({
                    ...context.selectionModel,
                    computationType: COMPUTATION_TYPES.REDUCE,
                  }),
                }),
                { type: 'dispatchContext', cond: 'isNotSilentMode' },
              ],
              on: {
                [EVENT_TYPES.onSetReduceComputation]: [
                  {
                    cond: 'isSeries', // read the event
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
                send({ type: EVENT_TYPES.disableAntiRequestFeature }),
                send({ type: EVENT_TYPES.onToggleAll, isSelected: false }),
                { type: 'dispatchContext', cond: 'isNotSilentMode' },
              ],
              on: {
                [EVENT_TYPES.onSetReduceComputation]: [
                  {
                    cond: 'isReduce', // read the event
                    target: COMPUTATION_TYPES.REDUCE,
                  },
                ],
              },
            },
          },
        },
        antiRequestFeature: {
          initial: 'next',
          states: {
            next: {
              always: [
                {
                  target: 'disabled',
                  cond: 'isAntiRequestDisabled',
                  description: 'Disabled when in the SERIES computation context',
                },
                {
                  target: 'enabled',
                },
              ],
            },
            disabled: {
              entry: [
                assign({
                  selectionModel: ({ selectionModel }) => ({
                    ...selectionModel,
                    disableAntiRequest: true,
                  }),
                }),
                send({ type: 'onToggleAll', isSelected: false }),
              ],
              exit: [
                {
                  //
                  // when the antiRequestFeature is re-engaged, it's possible
                  // all of the values exist in the values prop, in which case
                  // its time to switch models.
                  //
                  // update context here, now to prevent bounce
                  //
                  cond: 'shouldSwitchBuilder',
                  target: `#selectionModel.active.allState.${ALL_STATE.SELECT_NONE}.dispatch`,
                  actions: [
                    assign({
                      selectionModel: ({ selectionModel }) =>
                        handleToggleAllUpdate(selectionModel, {
                          allState: ALL_STATE.SELECT_NONE,
                        }),
                    }),
                  ],
                },
              ],
              on: {
                [EVENT_TYPES.enableAntiRequestFeature]: [{ target: 'enabled' }],
              },
            },
            enabled: {
              entry: [
                assign({
                  selectionModel: (context) => ({
                    ...context.selectionModel,
                    disableAntiRequest: false,
                  }),
                }),
              ],
              on: {
                [EVENT_TYPES.disableAntiRequestFeature]: [{ target: 'disabled' }],
              },
            },
          },
        },
      },
    },
  },
};

const baseMachineOptions = {
  actions: {
    dispatchContext: (context, event) => {
      const { selectionModel } = context;
      console.debug(
        '📬 dispatchContext not configured',
        JSON.stringify(
          {
            event,
            silentMode: context.silentMode,
            selectionModel,
            values: selectionModel.values,
          },
          null,
          2,
        ),
      );
    },
  },
  guards: {
    isAllRequestValue,
    isValidModel,
    isValidModelAndDispatch: (context, event, meta) =>
      !context.silentMode && isValidModel(context, event, meta),
    isNotSilentMode: (context) => !context.silentMode,
    isAntiRequestDisabled: (context) => context.selectionModel.disableAntiRequest,
    shouldClearValues,
    shouldSwitchBuilder,
    isReduce: (_, event) => event.isSelected,
    isSeries: (_, event) => !event.isSelected,
    isSelectAll: (_, event) => {
      return event.isSelected;
    },
    isDeselectAll: (_, event) => {
      return !event.isSelected;
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

export const createSelectionModelMachine = (
  dispatchContext,
  initialSelectionModel_ = {},
) => {
  const machineConfig = {
    ...baseMachineConfig,
    context: {
      ...baseMachineConfig.context,
      selectionModel: initialSelectionModel_,
    },
  };

  const machineOptions = {
    ...baseMachineOptions,
    actions: {
      ...baseMachineOptions.actions,
      // expose the selectionModel inside the context
      dispatchContext: ({ selectionModel }, event) => {
        if (DEBUG) {
          console.debug(
            `%creducer handle set dispatch: ${JSON.stringify(
              { selectionModel, event },
              null,
              2,
            )}`,
            'color: #bada55',
          );
        }
        return dispatchContext(selectionModel, event);
      },
    },
  };
  return createMachine(machineConfig, machineOptions);
};

export default { baseMachineConfig, baseMachineOptions };
