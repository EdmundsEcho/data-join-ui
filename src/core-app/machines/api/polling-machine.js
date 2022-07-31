/**
 *
 *  Part of
 *
 *    👉 polling-api.sagas.js
 *       👉 polling.config.js
 *          👉 polling-machine
 *             ✅ generate the events required to fire off the actions
 *               👉 polling-worker
 *
 * @module state-machine/polling-machine
 *
 */
import { Machine, actions, spawn } from 'xstate';
import pollingWorker, { initialWorkerContext } from './polling-worker';
import { colors } from '../../constants/variables';

/* eslint-disable camelcase, no-console */

// commands from outside
// event rendered by the external ui, consumed by the machine
// 🚧 can this be imported instead?
const FETCH = 'FETCH';
const CANCEL = 'CANCEL';
export const fetchAction = (event) => ({ type: FETCH, ...event });
export const cancelAction = (event) => ({ type: CANCEL, ...event });

/* not utilized; instead inferred by calling fetchAction
const RESUME = 'RESUME';
const FETCH_RESULTS = 'FETCH_RESULTS';
export const resumeAction = (event) => ({ type: RESUME, ...event });
export const fetchResults = (event) => ({ type: FETCH_RESULTS, ...event });
*/

//------------------------------------------------------------------------------
// PARENT
const pollingMachineInitialContext = () => {
  return {
    pollingWorkerRef: undefined,
    cancel: false, // command
    cancelled: false, // status event
    isError: false,
  };
};

//------------------------------------------------------------------------------
/**
 * input: request & meta
 * output: data from api
 */
const pollingMachineConfig = ({
  initialContext,
  pollingWorker: childMachine,
}) => ({
  id: 'polling-machine',
  strict: true,
  initial: 'idle',
  context: initialContext,
  on: {
    [CANCEL]: {
      actions: [
        actions.log((context) => `Will cancel uiKey: ${context?.meta?.uiKey}`),
        // actions.assign(updateState),
        actions.assign({ cancel: true }), // value is in a guard to trigger cancel
      ],
    },
    // should clean-up
    RESET: {
      target: 'idle',
      actions: [actions.log(`resetting`), actions.assign(initialContext)],
    },
  },
  states: {
    idle: {
      on: {
        // event is an external command
        // The starting point depends on the progress already made in the request...
        [FETCH]: [
          {
            cond: (_, event) => event?.request?.pollingDone ?? false,
            target: 'resuming.resolving',
            actions: [actions.assign(updateState)],
          },
          {
            cond: (_, event) => typeof event?.request?.jobId !== 'undefined',
            target: 'resuming.polling',
            actions: [actions.assign(updateState)],
          },
          {
            cond: (_, event) => typeof event?.meta?.uiKey !== 'undefined',
            target: 'processing',
            actions: [actions.assign(updateState)],
          },
          {
            target: 'done.failed',
            actions: [actions.log(`Failed - missing request information`)],
          },
        ],
      },
      meta: {
        description: (state) => {
          return `idle with undefined jobId (${
            state.context.request?.jobId ?? 'undefined'
          })`;
        },
      },
    },
    resuming: {
      on: {
        READY_FETCH: 'processing.instantiating',
        READY_POLLING: 'processing.polling',
        READY_RESOLVING: 'processing.resolving',
      },
      states: {
        fetch: {
          entry: [
            actions.log((_, event) => {
              return `RESUMING-FETCH-${event?.meta?.uiKey}`;
            }),
            actions.assign({
              request: (context, event) => ({
                ...context.request,
                uiKey: event?.meta?.uiKey,
              }),
            }),
            actions.raise('READY_FETCH'),
          ],
        },
        polling: {
          entry: [
            actions.log((_, event) => {
              return `RESUMING-POLLING-${event?.meta?.uiKey}`;
            }),
            actions.assign({
              request: (_, event) => ({
                ...event.request,
              }),
            }),
            actions.raise('READY_POLLING'),
          ],
        },
        resolving: {
          entry: [
            actions.log((_, event) => {
              return `RESUMING-FETCHING-RESULTS-${event?.meta?.uiKey}`;
            }),
            actions.assign({
              request: (_, event) => ({
                ...event.request,
              }),
            }),
            actions.raise('READY_RESOLVING'),
          ],
        },
      },
    },
    processing: {
      meta: {
        description: (state) => {
          return `Processing a request: ${state.context?.meta?.uiKey}`;
        },
      },
      // received command to fetch
      initial: 'instantiating',
      states: {
        instantiating: {
          meta: {
            description: (state) => {
              return `Processing a request: ${state.context?.meta?.uiKey}`;
            },
          },
          invoke: {
            id: 'initialize-request',
            src: 'initApiService', // call to the api
            onDone: {
              target: 'polling',
              actions: [
                actions.log(() => `DONE with instantiating`),
                actions.assign({
                  request: (context, event) => ({
                    ...context.request,
                    ...event.data,
                  }),
                }),
              ],
            },
            onError: {
              target: '#polling-machine.done.failed',
            },
          },
        },
        polling: {
          always: {
            target: 'cancelling',
            cond: 'isInCancelState',
          },
          onError: {
            target: '#polling-machine.done.failed',
            actions: [
              actions.assign({
                request: (context) => ({
                  ...context.request,
                  pollingDone: false,
                }),
              }),
            ],
          },
          entry: [
            'pollingEventStart', // send external event
            actions.log(
              (context, event) =>
                `spawning polling-worker: ${
                  event.data?.jobId ??
                  context?.request?.jobId ??
                  "Can't read jobId"
                }`,
            ),
            actions.assign({
              pollingWorkerRef: (context, event) => {
                return spawn(
                  childMachine.withContext({
                    id: `poll-${
                      event.data?.jobId ??
                      context?.request?.jobId ??
                      'Cant read jobId'
                    }`,
                    ...initialWorkerContext({
                      request: {
                        ...(event?.data ?? context?.request),
                        maxTries: context.request.maxTries,
                      },
                      meta: context.meta,
                    }),
                  }),
                  `poll-${
                    event.data?.jobId ??
                    context?.request?.jobId ??
                    'Cant read jobId'
                  }`,
                );
              },
            }),
          ],
          exit: [
            'pollingEventEnd', // send external event
            actions.log(
              (context) =>
                `stopping the polling worker: ${context.pollingWorkerRef.id}`,
            ),
            // actions.stop((context) => context.pollingWorkerRef.id),
            actions.send(
              { type: 'STOP' },
              {
                to: (context) => context.pollingWorkerRef.id,
              },
            ),
          ],
          on: {
            POLLING_RESOLVED: [
              {
                target: '#polling-machine.done.cancelled',
                cond: 'isInCancelState',
              },
              {
                target: 'resolving',
              },
            ],
            POLLING_FAILED: [
              {
                target: '#polling-machine.done.cancelled',
                cond: 'isInCancelState',
              },
              {
                target: '#polling-machine.done.failed',
                actions: [
                  actions.assign({
                    request: (context, { type, ...event }) => {
                      return {
                        ...context.request,
                        pollingDone: false,
                        pollingCount: event.tries,
                        errorEvent: event?.event ?? {
                          toString: () => 'Internal error',
                        }, // from the api
                        errorMessage: event.message,
                      };
                    },
                  }),
                ],
              },
            ],
          },
        },
        cancelling: {
          meta: {
            description: (state) => {
              return `Cancelling: ${state.context?.meta?.uiKey}`;
            },
          },
          entry: [actions.log('cancelling...')],
          exit: [actions.log('cancelled data')],
          initial: 'waiting',
          states: {
            waiting: {
              on: {
                POLLING_STOPPED: {
                  target: 'cancel',
                  actions: [
                    actions.log('Cancelled polling_stopped'),
                    actions.log((_, event) => JSON.stringify(event)),
                    actions.assign({
                      request: (context, event) => ({
                        ...context.request,
                        pollingCount: event.tries,
                      }),
                    }),
                    'pollingEventCancelled',
                  ],
                },
              },
            },
            cancel: {
              invoke: {
                id: 'cancel-api-service',
                src: 'cancelApiService',
                onDone: {
                  target: '#polling-machine.done.cancelled',
                  actions: actions.assign({
                    request: (context, event) => ({
                      ...context.request,
                      cancelled: true,
                      data: event.data,
                    }),
                  }),
                },
                onError: {
                  target: '#polling-machine.done.failed',
                },
              },
            },
          },
        },
        resolving: {
          meta: {
            description: (state) => {
              return `Resolving the completed request (processId: ${state.context.request.processId})`;
            },
          },
          invoke: {
            id: 'retrieve-service-results',
            src: 'resultApiService', // call to the api
            onDone: {
              target: '#polling-machine.done.resolved',
            },
            onError: {
              target: '#polling-machine.done.failed',
            },
          },
        },
      },
    },
    done: {
      type: 'final',
      states: {
        resolved: {
          type: 'final',
          entry: [
            actions.log(`✅ resolved`),
            'pollingEventResolved', // send to sagas -> redux
          ],
        },
        failed: {
          type: 'final',
          entry: [
            actions.log(`🚫 failed`),
            actions.assign({
              isError: true,
            }),
            'pollingEventError', // send to sagas -> redux
          ],
        },
        cancelled: {
          type: 'final',
          entry: [
            actions.log(`👍 cancelled`),
            actions.assign({
              cancelled: true,
            }),
            'pollingEventCancelled', // send to sagas -> redux
          ],
        },
      },
    },
  },
});

/**
 * Implement the interface for the two kinds of outgoing messages
 * 1. To the api (services)
 * 2. To the redux store by way of the sagas channel (using emit)
 */
const pollingMachineOptions = ({
  emit,
  actions: apiActions,
  services: apiServices,
  guards,
  DEBUG,
}) => {
  return {
    guards: {
      ...guards,
      isInCancelState: (context) => context?.cancel ?? false,
    },
    /* eslint-disable no-param-reassign, no-shadow */
    services: Object.entries(apiServices).reduce((services, [name, fn]) => {
      services[name] = makeEventForApi(fn, DEBUG);
      return services;
    }, {}), // all receive (context, event)
    actions: Object.entries(apiActions).reduce(
      (withEmitActions, [name, fn]) => {
        withEmitActions[name] = (context, event) => {
          return emit(fn(makeOutgoingEvent(context, event, name, DEBUG)));
        };
        return withEmitActions;
      },
      {},
    ),
    /* eslint-enable no-param-reassign, no-shadow */
  };
};

/* --------------------------------------------------------------------------- */
// Local routines
// Update state with latest command information hosted in event
function updateState(context, event) {
  return {
    ...context,
    ...event,
  };
}
/* --------------------------------------------------------------------------- */
/**
 * The machine sends two types of events. Each must adhere to an event interface
 * implemented here.
 *
 * 1. Event notices
 * 2. Calls to the api functions
 *
 */
function makeEventForApi(fn, DEBUG = false) {
  return ({ meta, request }) => {
    if (DEBUG) {
      console.debug(`%cMachine outgoing to Api: ${fn.name}`, colors.yellow);
      console.dir({ meta, request });
    }
    return fn({ meta, request });
  };
}
function makeOutgoingEvent(context, event, fnName, DEBUG = false) {
  const result = {
    meta: context.meta,
    request: {
      ...context.request,
      error: context.isError,
      cancelled: context.cancelled,
      data: event.data,
    },
  };
  if (DEBUG) {
    console.debug(
      `%cMachine outgoing to Sagas -> Redux: ${fnName}`,
      colors.yellow,
    );
    console.dir(result);
  }
  return result;
}
/* --------------------------------------------------------------------------- */
/**
 *  🎉 Instantiates the Machine with the user configuration
 *     (see polling-api)
 */
const maker = (options) => {
  return Machine(
    pollingMachineConfig({
      initialContext: pollingMachineInitialContext(),
      pollingWorker: pollingWorker(options),
    }),
    pollingMachineOptions(options),
  );
};

export default maker;
/*
        // alternative - direct command
        [RESUME]: [
          {
            target: 'resuming.polling',
            cond: (_, event) => {
              try {
                if (!event?.request?.jobId) {
                  throw new MachineError(
                    'Tried to resume the machine with incomplete request',
                  );
                }
              } catch (e) {
                console.error(e);
              }
              return typeof event?.request?.jobId !== 'undefined';
            },
            actions: [
              actions.log((_, event) => `RESUME - ${event?.meta?.uiKey}`),
              actions.assign(addEventToContext),
            ],
          },
          {
            target: 'resuming.fetch',
          },
        ],
        [FETCH_RESULTS]: [
          {
            target: 'resuming.resolving',
            cond: (_, event) => {
              try {
                if (!event?.request?.jobId || !event?.request?.pollingDone) {
                  throw new MachineError(
                    'Tried to resume the machine with incomplete request',
                  );
                }
              } catch (e) {
                console.error(e);
              }
              return event?.request?.jobId && event?.request?.pollingDone;
            },
            actions: [
              actions.log(
                (_, event) => `RESUME FETCH RESULTS - ${event?.meta?.uiKey}`,
              ),
              actions.assign(addEventToContext),
            ],
          },
          {
            target: 'resuming.polling',
          },
        ],
*/
