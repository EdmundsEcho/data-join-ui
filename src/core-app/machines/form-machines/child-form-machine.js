/**
 * @module child-form-machine
 */
import { Machine, actions, sendParent } from 'xstate';

// mockGetView : prop from store
// validateChanges : dispath update_filefield
// userInputMachine : user input

// Machine spec
const childMachineConfig = {
  id: 'childForm',
  initial: 'initializing',
  strict: true,
  context: {
    id: undefined,
    view: {},
    changes: {},
    lastChange: {}, // buffer
  },
  on: {
    GET_VIEW_REQUEST: {
      actions: sendParent((ctx) => ({
        type: 'GET_VIEW_RESPONSE',
        payload: { view: { ...ctx.view } },
      })),
    },
    CLOSE: { target: 'closed' },
    /* utility for debugging */
    PRINT: {
      actions: [
        actions.log((ctx) => `PRINT: ${ctx.id}`),
        actions.log((ctx) => `      view: ${JSON.stringify(ctx.view)}`),
        actions.log((ctx) => `   changes: ${JSON.stringify(ctx.changes)}`),
        actions.log((ctx) => `lastChange: ${JSON.stringify(ctx.lastChange)}`),
      ],
    },
  },
  states: {
    initializing: {
      // cloneView
      entry: ['cloneView', actions.log((ctx) => `${ctx.id} cloning view`)],
      always: [
        { target: 'excluded', cond: 'isExcluded' },
        { target: 'included' },
      ],
    },
    included: {
      entry: actions.log((ctx) => `${ctx.id} now in state: included`),
      initial: 'hist',
      states: {
        hist: {
          type: 'history',
          history: 'deep',
          target: 'clean', // default
        },
        clean: {
          on: {
            ADD_CHANGE: {
              actions: ['addChange'],
              target: 'dirty',
            },
            SAVE_CHANGE: {
              actions: [
                actions.log(
                  (ctx, { payload: { key, value } }) =>
                    `SAVE_CHANGE key:${key} value:${value}`,
                ),
                'sendDirtyStatus',
                'saveChange',
                'commitSaveChange',
              ],
              target: 'clean',
            },
          },
        },
        dirty: {
          entry: [
            actions.log((ctx) => `${ctx.id}: adding change`),
            'sendDirtyStatus',
          ],
          on: {
            ADD_CHANGE: {
              actions: ['addChange'],
              target: 'dirty',
            },
            COMMIT: {
              actions: ['commit', 'sendCleanStatus'],
              target: 'clean',
              cond: (ctx) => ctx.lastChange.value.trim().length > 0,
            },
            CLEAR: {
              actions: ['clear', 'sendCleanStatus'],
              target: 'clean',
            },
          },
        },
      },
      on: {
        EXCLUDE: {
          target: 'excluded',
          actions: ['excludeChild', 'excludeCommit', 'sendCleanStatus'],
        },
      },
    },
    // this is a "hot" change that takes effect right away (no staging)
    excluded: {
      entry: actions.log((ctx) => `${ctx.id} now in state: excluded`),
      on: {
        INCLUDE: {
          target: 'included',
          actions: ['includeChild', 'includeCommit', 'sendCleanStatus'],
        },
      },
    },
    closed: {
      entry: actions.log((ctx) => `${ctx.id} now in state: closed`),
      type: 'final',
    },
  },
};

/* templates for custom actions */
const toggleInclusion = (toggle) => {
  return actions.assign({
    changes: ({ changes }) => ({
      ...changes,
      enabled: toggle,
    }),
  });
};

const commitInclusion = (toggle) => {
  const type = toggle ? 'CHILD.INCLUDE' : 'CHILD.EXCLUDE';
  return sendParent(({ id }, _) => ({
    type,
    payload: { id },
  }));
};

const childMachineOptions = {
  actions: {
    cloneView: actions.assign(({ view, ...otherCtx }) => {
      if (!view) {
        throw new Error('Child machine tried to clone an empty view');
      }
      return {
        ...otherCtx,
        changes: { ...view },
      };
    }),
    excludeChild: toggleInclusion(false),
    includeChild: toggleInclusion(true),
    // commit by sending to the parent
    excludeCommit: commitInclusion(false),
    includeCommit: commitInclusion(true),

    addChange: actions.assign({
      changes: ({ changes }, { payload: { key, value } }) => ({
        ...changes,
        [key]: value,
      }),
      // buffer used to update external recorder
      // (changes and commit are on different events)
      lastChange: (_, { payload: { key, value } }) => ({
        key,
        value,
      }),
    }),
    // parent config for CHILD.UPDATE: { payload: { id, key, value } }
    commit: actions.pure(({ id, lastChange: { key, value } }) => [
      sendParent({
        type: 'CHILD.UPDATE',
        payload: { id, key, value },
      }),
      sendParent({
        type: 'CHILD.CLEAN',
        payload: { childId: id },
      }),
    ]),

    // same as addChange ex the buffer; changes go live to external recorder
    // requires sending to parent using the same event (thus no need for buffer)
    saveChange: actions.assign({
      changes: ({ changes }, { payload: { key, value } }) => ({
        ...changes,
        [key]: value,
      }),
    }),

    commitSaveChange: actions.pure(({ id }, { payload: { key, value } }) => [
      sendParent({
        type: 'CHILD.UPDATE',
        payload: { id, key, value },
      }),
      sendParent({
        type: 'CHILD.CLEAN',
        payload: { childId: id },
      }),
    ]),

    clear: actions.assign({
      changes: (ctx, e) => ({
        ...ctx.changes,
        [e.key]: ctx.view[e.key],
      }),
    }),

    sendCleanStatus: sendParent(({ id: childId }) => ({
      type: 'CHILD.CLEAN',
      payload: { childId },
    })),

    sendDirtyStatus: sendParent(({ id: childId }) => ({
      type: 'CHILD.DIRTY',
      payload: { childId },
    })),

    reset: actions.assign({
      changes: (ctx) => ({ ...ctx.view }),
    }),
  },
  guards: {
    isExcluded: (context) => {
      return !context.view.enabled;
    },
  },
};

const childMachine = Machine(childMachineConfig, childMachineOptions);
export default childMachine;
