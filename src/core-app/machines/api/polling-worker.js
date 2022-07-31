/**
 * @module state-machine/polling-worker
 *
 */
import { Machine, actions } from 'xstate';

//------------------------------------------------------------------------------
// Worker - CHILD
//------------------------------------------------------------------------------
/**
 *
 * Sends the parent a message to signal the request has completed
 * and is ready to be retrieved.
 *
 * Uses a guard/predicate to determine when ready to retrieve the results.
 *
 * @function
 * @param {Object} context Parent context with the request prop
 * @return {Object}
 */
export const initialWorkerContext = ({ request, meta }) => {
  return {
    meta,
    request: {
      maxTries: 20,
      ...request,
      resolved: false,
      tries: 0,
    },
    delayFactors: {
      exponentialRate: 1.5,
      seed: 200,
      max: 3000,
    },
    error: undefined,
  };
};

const pollingWorkerConfig = {
  id: 'polling-worker',
  strict: true,
  initial: 'polling',
  context: undefined,
  on: {
    STOP: {
      target: 'done.stopped',
      actions: [
        actions.assign({
          cancel: true,
        }),
      ],
    },
  },
  states: {
    idle: {
      meta: {
        description: `idle`,
      },
    },
    reading: {
      meta: {
        description: `Reading: is the request resolved?`,
      },
      entry: [
        actions.log(`reading`),
        actions.assign({
          request: (context) => ({
            ...context.request,
            tries: context.request.tries + 1,
          }),
        }),
      ],
      always: [
        { target: 'done.stopped', cond: (context) => context.cancel },
        { target: 'done.failed', cond: 'isMaxTries' },
        { target: 'done.resolved', cond: 'isRequestReady' },
        { target: 'waiting' },
      ],
    },
    polling: {
      meta: {
        description: `Polling the api for the status of the request.`,
      },
      entry: [actions.log(`polling`)],
      invoke: {
        id: 'poll-for-status',
        src: 'statusApiService',
        onDone: {
          target: 'reading',
          actions: ['setIsRequestReady'],
        },
        onError: {
          target: 'done.failed',
          actions: [
            actions.log(
              (context) => `polling failed: ${context.request.jobId}`,
            ),
            actions.assign({
              error: (_, event) => event,
            }),
          ],
        },
      },
    },
    waiting: {
      meta: {
        description: `Waiting before sending another poll request.`,
      },
      entry: [
        actions.log((context) => `waiting: ${context.pause}`),
        actions.assign({
          pause: pollingPause,
        }),
      ],
      after: {
        POLLING_PAUSE: 'polling',
      },
    },
    done: {
      meta: {
        description: `Completed the polling work.`,
      },
      states: {
        stopped: {
          type: 'final',
          meta: { description: `Polling stopped` },
          entry: [
            actions.log(`child polling done.stopped`),
            actions.sendParent((context) => ({
              type: 'POLLING_STOPPED',
              tries: context.request.tries,
            })),
          ],
        },
        resolved: {
          type: 'final',
          meta: { description: `Polling resolved!` },
          entry: [
            actions.log(`child polling done.resolved`),
            actions.sendParent((context) => ({
              type: 'POLLING_RESOLVED',
              tries: context.request.tries,
            })),
          ],
        },
        failed: {
          type: 'final',
          meta: { description: `Polling failed.` },
          entry: [
            actions.log(
              (context) =>
                `worker send parent POLLING_FAILED: ${context.request.jobId}`,
            ),
            actions.sendParent((context, event) => ({
              type: 'POLLING_FAILED',
              tries: context.request.tries,
              message: `Polling for status failed after ${context.request.tries} tries`,
              event,
            })),
          ],
        },
      },
    },
  },
};

/**
 * The child requires two services
 * 1. isResolved to determine when the status return a resolved status
 * 2. statusServiceApi to call the api; this call is made such that the
 *    api recieves { event: { meta, request } }
 *
 * context -> event { meta, request } for calling statusApiService
 *
 */
const pollingWorkerOptions = ({
  services: { statusApiService },
  guards: { isResolved },
}) => ({
  services: {
    // expose event: { meta, request }
    statusApiService: (context) =>
      statusApiService({
        meta: context.meta,
        request: {
          jobId: context.request.jobId,
          processId: context.request.processId,
        },
      }),
  },
  actions: {
    // api response -> resolved:boolean
    setIsRequestReady: actions.assign({
      request: (context, event) => {
        return {
          ...context.request,
          resolved: isResolved(event.data),
        };
      },
    }),
  },
  guards: {
    isRequestReady: (context) => context.request.resolved, // :: fn
    isMaxTries: (context) => {
      return context.request.tries > context.request.maxTries; // :: fn
    },
  },
  delays: {
    POLLING_PAUSE: pollingPause,
  },
});

/**
 * More globally accessible
 * record for the pause and context props.
 *
 */
function pollingPause(context) {
  return Math.min(
    context.delayFactors.max,
    context.delayFactors.seed *
      Math.pow(context.delayFactors.exponentialRate, context.request.tries),
  );
}
/* eslint-disable-next-line */
export default (options) =>
  Machine(pollingWorkerConfig, pollingWorkerOptions(options));
