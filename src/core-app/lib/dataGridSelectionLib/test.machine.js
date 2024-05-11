import { assign } from 'xstate';
import { ALL, COMPUTATION_TYPES, REQUEST_TYPES } from './selectionModel';

/* eslint-disable no-console */

const withBaseRequestValue = (request) => ({ [ALL]: { value: ALL, request } });

const initialContext = {
  readOnly: null,
  selectionModel: {
    rowCountTotal: null,
    computationType: COMPUTATION_TYPES.EMPTY,
    requestType: REQUEST_TYPES.UNINITIALIZED,
    values: withBaseRequestValue(true),
  },
};

export const baseMachineConfig = (DEBUG = false) => ({
  id: 'selectionModel',
  description: 'Manages values selection model for making data requests',
  context: initialContext,
  initial: 'idle',
  states: {
    idle: {
      on: {
        INIT: {
          target: 'active',
          actions: [
            assign({
              readOnly: () => false,
              selectionModel: (context, event) => ({
                ...context.selectionModel,
                ...event.selectionModel,
              }),
            }),
            (context) => {
              if (DEBUG) {
                console.debug('🚀 init with context', context);
              }
            },
          ],
        },
        RESUME: {
          target: 'active',
        },
      },
    },
    active: {
      type: 'parallel',
      on: {
        RESET: {
          target: 'idle',
        },
      },
      states: {
        seedState: {
          initial: 'SELECT_ALL',
          states: {
            SELECT_ALL: {
              always: {
                target: 'SELECT_NONE',
                cond: 'shouldSwitchBuilder',
              },
              on: {
                onRowClick: {},
                onToggleAll: {
                  target: 'SELECT_NONE',
                  cond: 'isDeselectAll',
                },
              },
            },
            SELECT_NONE: {
              always: {
                target: 'SELECT_ALL',
                cond: 'shouldSwitchBuilder',
              },
              on: {
                onRowClick: {},
                onToggleAll: {
                  target: 'SELECT_ALL',
                  cond: 'isSelectAll',
                },
              },
            },
          },
        },
        computationType: {
          initial: 'EMPTY',
          states: {
            EMPTY: {
              always: [
                {
                  target: 'SELECT',
                  cond: 'isSelectContext',
                  description: 'Read context.computationType ===SELECT',
                },
                {
                  target: 'REDUCE',
                  cond: 'isReduceContext',
                  description: 'Read context.computationType === REDUCE',
                },
                {
                  target: 'SERIES',
                  cond: 'isSeriesContext',
                  description: 'Read context.computationType === SERIES',
                },
              ],
            },
            SELECT: {
              type: 'final',
            },
            REDUCE: {
              on: {
                onSetReduceComputation: {
                  target: 'SERIES',
                  cond: 'isSeries',
                },
              },
            },
            SERIES: {
              on: {
                onSetReduceComputation: {
                  target: 'REDUCE',
                  cond: 'isReduce',
                },
              },
            },
          },
        },
      },
    },
  },
  predictableActionArguments: true,
  preserveActionOrder: true,
});

export const baseMachineOptions = (dispatchContext, DEBUG = false) => ({
  actions: {
    dispatchContext,
  },
  guards: {
    isReduce: (_, event) => {
      return event.isSelected;
    },
    isSeries: (_, event) => {
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
      return selectionModel.computationType === 'SELECT';
    },
    isReduceContext: ({ selectionModel }) => {
      return selectionModel.computationType === 'REDUCE';
    },
    isSeriesContext: ({ selectionModel }) => {
      return selectionModel.computationType === 'SERIES';
    },
  },
  delays: {},
});
