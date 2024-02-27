import { actions, spawn, interpret, Machine } from 'xstate';
import { createModel } from '@xstate/test';
import { assert } from 'chai';

import apiPollingMachine, { fetchAction } from './polling-machine';
import { ServiceTypes, instantiateInspectionRequest } from '../../services/api';

const filePath = '/Users/edmund/Desktop/data/brand_sales_NRx.csv';

//------------------------------------------------------------------------------
// configure the machine to be tested
//------------------------------------------------------------------------------

function initPollingService(serviceType, instantiateApiService, next) {
  const machine = apiPollingMachine({
    serviceType,
    instantiateApiService,
    actions: {
      pollingEventStart: next({ type: 'POLLING_START' }),
      pollingEventEnd: next({ type: 'POLLING_END' }),
      resolvedEvent: next((_, event) => ({
        type: 'API_RESOLVED',
        result: event.data.data.results,
      })),
      cancelledEvent: next({ type: 'CANCEL' }),
      errorEvent: next((context) => ({
        type: 'ERROR',
        error: context.errorMessage,
      })),
    },
  });
  return machine;
}

const pollingMachine = initPollingService(
  ServiceTypes.INSPECTION,
  instantiateInspectionRequest,
  actions.sendParent,
);

describe(`Polling-machine`, () => {
  describe('Polling machine test', () => {
    it('fetch path: sets the request.uiKey', (done) => {
      const pollingService = interpret(pollingMachine)
        .onTransition((state) => {
          if (state.matches({ processing: 'instantiating' })) {
            expect(state.context.request.uiKey).toEqual(filePath);
            expect(state.context.request.serviceType).toEqual(
              ServiceTypes.INSPECTION,
            );
            assert.isUndefined(state.context.request.jobId);
            pollingService.stop();
            done();
          }
        })
        .start();
      pollingService.send(fetchAction(filePath));
    });

    /*
    it('fetch path: sets the request.jobId when polling', (done) => {
      const pollingService = interpret(pollingMachine)
        .onTransition((state) => {
          if (state.matches({ processing: 'resolving' })) {
            expect(state.context.request.uiKey).toEqual(filePath);
            assert.isDefined(state.context.request.jobId);
            pollingService.stop();
            done();
          }
        })
        .start();
      pollingService.send({ type: 'FETCH', uiKey: filePath });
    });
    */

    describe('fetch: should send messages to parent on the way to done', () => {
      const testMachine = Machine({
        id: 'test-machine',
        initial: 'start',
        context: { serverRef: undefined },
        states: {
          start: {
            entry: [
              actions.assign({
                serverRef: () => spawn(pollingMachine, 'server'),
              }),
              actions.raise('SUCCESS'),
            ],
            on: {
              SUCCESS: 'fetch',
            },
          },
          fetch: {
            entry: [
              actions.send(fetchAction(filePath), { to: 'server' }),
              actions.raise('SUCCESS'),
            ],
            on: {
              SUCCESS: 'waitForJobId',
            },
          },
          waitForJobId: {
            on: {
              POLLING_START: {
                target: 'waitToResolve',
                actions: actions.log(`POLLING START received`),
              },
              CANCEL: {
                target: 'waitForPollingEventEnd',
                actions: actions.send({ type: 'CANCEL' }, { to: 'server' }),
              },
            },
            meta: {
              test: () => {},
            },
          },
          waitToResolve: {
            on: {
              API_RESOLVED: { target: 'done' },
              CANCEL: {
                target: 'waitForPollingEventEnd',
                actions: actions.send(
                  { type: 'CANCEL' },
                  { to: (ctx) => ctx.server },
                ),
              },
            },
            meta: {
              test: () => {},
            },
          },
          waitForPollingEventEnd: {
            on: {
              POLLING_END: { target: 'done' },
            },
            meta: {
              test: () => {},
            },
          },
          done: {
            type: 'final',
            entry: [(context) => context.serverRef.stop()],
            meta: {
              test: () => {},
            },
          },
        },
      });

      // -----------------------------------------------------------------------
      it('fetch: should send polling start, end and resolved to parent on the way to done', (done) => {
        const test = interpret(testMachine)
          .onDone(() => {
            test.stop();
            done();
          })
          .start();
      });

      const testModel = createModel(testMachine).withEvents({
        CANCEL: {},
      });

      const plans = testModel.getSimplePathPlans();
      plans.forEach((plan) => {
        describe(plan.description, () => {
          plan.paths.forEach((path) => {
            it(path.description, (done) => {
              // do any setup, then...
              path.test();
              done();
            });
          });
        });
      });

      // -----------------------------------------------------------------------
      it('should have full coverage', () => {
        return testModel.testCoverage({
          filter: (stateNode) => stateNode?.meta ?? false,
        });
      });
    });

    it('fetch: modeled as a promise', (done) => {
      const testMachine = Machine({
        id: 'test-promise-machine',
        context: {
          result: undefined,
          error: undefined,
        },
        initial: 'pending',
        states: {
          pending: {
            entry: [actions.send(fetchAction(filePath), { to: 'server' })],
            invoke: {
              id: 'server',
              src: pollingMachine,
              onDone: {
                target: 'resolved',
                actions: [
                  actions.assign({
                    result: (_, event) => {
                      return event?.data?.result;
                    },
                  }),
                ],
              },
              onError: {
                target: 'rejected',
                actions: [
                  actions.assign({
                    error: (_, event) => {
                      return event?.data?.error;
                    },
                  }),
                ],
              },
            },
          },
          resolved: {
            type: 'final',
            data: {
              result: (context, event) => context.result,
            },
          },
          rejected: {
            type: 'final',
            data: {
              error: (context, event) => context.error,
            },
          },
        },
      });

      // data.data.result.filename
      const promise = new Promise((resolve) => {
        const test = interpret(testMachine)
          .onDone((data) => {
            resolve(data?.data?.result ?? data?.data?.error);
            test.stop();
          })
          .start();
      });
      promise
        .then((data) => expect(data.filename).toEqual(filePath))
        .then(() => done());
    });
  });
});
