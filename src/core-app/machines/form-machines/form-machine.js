/**
 * @module state-machine/form-machine
 *
 * @description
 * 🚧 Design:
 * User makes changes -> updates redux on the fly
 * User saves changes -> prevents reset (note, double negative)
 *
 * Benefit:
 * Plug-into existing machinary for updating a file-field.
 * Use the recorded View to reset/revert to previous state if not saved.
 *
 * Link between machine and redux:
 * How revert to previous hv if don't hit save?
 *
 * Relevant redux events:
 * files/EXCLUDE_FIELD is a toggle that changes enabled prop
 * files/UPDATE_FILEFIELD key value
 * files/RESET_FILEFIELDS filename + fields
 *
 * CHILD
 * Tasks
 * 1. receives view prop from redux (map state to props)
 * ✅ copies view -> changes
 * ✅ records ui changes to changes to prop
 * ✅ HOW to trigger validate -> dispatch an action to redux
 *
 * Parent services:
 * 1. renders each child field
 * ✅ spawns each child field
 * ✅ sends to ui command "save", "cancel", "reset"
 * ✅ closes the resources
 * ✅ displays the global error status
 * ✅ receive error status from mapStateToProps hv
 *
 *
 * Key regarding action sequence:
 * tansition(state, event) =>
 *   - 🛈  What state?
 *   - 👉 the event draws the line between state and nextState
 *
 *        * 🛈  When the event arrives, it operates on what state?
 *        * 👉 assign is the only function that edits state
 *        * 👉 an event is the opportunity to set target state.  That means
 *             __leave__ a state. Thus, the sequence of milestones
 *             between states:
 *
 *             state ->  assign found in:         -> state' + event
 *                       1. state.exit
 *                       2. actions (actions set by actions prop)
 *                       3. nextState.entry (target set by event prop)
 *
 *             💰💰 Some constant ref, "current state" needs to be computed
 *                  prior to computing the next state.
 *
 *             💰💰 This means, by the time the "current state" has been
 *                  computed, the assign and target state information from the
 *                  event is wholly consumed. All that remains are other,
 *                  non-assign actions.
 *
 *   - 💰 What state: The state that results from applying all the *assign* calls
 *        found in the actions in the milestones found in the above order.
 *        * 💰 Recall, the actor model allows the actor to change how it
 *             responds to an event depending on prior events (including
 *             whether to even receive a message).
 *
 *   - Note: When configuring a state, what is the value of the context?
 *           - Some prior state is the starting point!, not the state
 *             being configured
 *             🚨 log from prev state exit = log from actions in event.
 *           - How think about mutation? For each event:
 *             + some unknown, prior-state exit
 *             + actions associated with the event
 *             + entry actions of the target state
 *
 */
import { Machine, actions, send, spawn } from 'xstate';
import childMachine from './child-form-machine';

const rootMachineOptions = {
  guards: {
    hasErrors: (ctx) => {
      return ctx.errors.length > 0;
    },
  },
  actions: {
    /* dispatch refs configured by the caller */
    // updates the externally recorded state
    addUpdate: actions.log(() => 'Missing configuration for addUpdate'),
    excludeField: actions.log(() => 'Missing configuration for excludeField'),
    includeField: actions.log(() => 'Missing configuration for includeField'),
    reset: actions.log(() => 'Missing configuration for reset'),
    // returns the externally recorded state to the starting value

    /* other actions utilized by the machine */
    cleanup: ({ fieldMachines = [] }) => {
      fieldMachines.map(({ ref }) => ref.stop());
      actions.assign({});
    },
    appendDirty: actions.assign({
      dirty: ({ dirty }, { payload: { childId } }) => {
        dirty.add(childId);
        return dirty;
      },
    }),
    removeDirty: actions.assign({
      dirty: ({ dirty }, { payload: { childId } }) => {
        dirty.delete(childId);
        return dirty;
      },
    }),
    cacheField: actions.assign({
      fields: ({ fields = [] }, { payload: { view: field } }) => [
        ...fields,
        field,
      ],
      // payload: { view: { ...ctx.view } },
    }),
  },
};

/**
 * @function
 * Configuration of the initial context.
 * @param {string} id Unique id for the form (e.g., filename for headerView)
 * @param {Machine?} fieldMachines Configured using a list of field ids
 * @param {array?} errors Form-level error report
 * @param {debugging?}
 *
 * @return {object} Initial context for the machine.
 */
export const initialContext = ({
  id,
  fieldMachines = [],
  errors = [],
  debugging = false,
}) => ({
  id, // filename
  fieldMachines,
  fields: [],
  errors,
  dirty: new Set(),
  debugging,
});

const rootMachineConfig = {
  id: 'ParentEditSaveForm',
  context: initialContext({ id: undefined }),
  initial: 'initializing',
  strict: true,
  on: {
    ERROR: {
      target: '.ready.changed.error',
      actions: actions.assign({
        errors: () => ['error1', 'error2'],
      }),
    },
    CLEAR_ERROR: {
      target: 'ready.changed',
      actions: actions.assign({
        errors: () => [],
      }),
    },
  },
  states: {
    initializing: {
      entry: [actions.log(() => `initializing: ...spawning children`)],
      always: {
        actions: [
          actions.assign({
            // move state in parent to children:
            // start fieldMachines: [{id, view}]
            // end   fieldMachines: [{id, ref}]
            //
            // ...childMachine.initialState.context,
            //
            fieldMachines: (ctx) =>
              ctx.fieldMachines.map((child) => {
                // return array of child objs
                // push state in fieldMachines from parent to children
                return {
                  ref: spawn(
                    childMachine.withContext({
                      view: child.view,
                      id: child.id,
                    }), // param 1
                    `child-${child.id}`, // param 2, handle for machine
                  ),
                  id: child.id, // child handle in array
                };
              }),
          }),
          actions.log((ctx) => `child count: ${ctx.fieldMachines.length}`),
        ],
        target: 'ready',
      },
    },
    ready: {
      initial: 'unchanged',
      onDone: 'closed',
      states: {
        done: { type: 'final' }, // do not enable SAVE
        unchanged: {
          initial: 'ok',
          states: { ok: {}, error: {} },
          on: {
            CANCEL: {
              actions: [actions.log(() => `parent is closing (no changes)...`)],
              target: 'done',
            },
          },
        },
        changed: {
          initial: 'clean',
          onDone: 'done',
          states: {
            error: {},
            clean: {
              on: {
                SAVE: {
                  actions: [actions.log(() => `parent is saving...`)],
                  target: 'done',
                },
              },
            },
            dirty: {
              always: [
                {
                  target: 'clean',
                  cond: ({ dirty }) => dirty.size === 0,
                },
              ],
            },
            done: {
              entry: actions.log((ctx) => `${ctx.id}: done`),
              type: 'final',
            },
          },
        },
      },
      entry: [actions.log(() => `form is in the ready state`)],
      on: {
        // sent by child when adds an uncommited change
        'CHILD.DIRTY': {
          actions: [
            'appendDirty',
            actions.log(
              (_, e) => `Parent recording: ${e.payload.childId} Dirty`,
            ),
            actions.log(
              ({ dirty }) =>
                `Field count with un-commited changes: ${dirty.size}`,
            ),
          ],
          target: '.changed.dirty',
        },
        // sent by child when changes are committed
        'CHILD.CLEAN': {
          // remove from the list
          actions: [
            'removeDirty',
            actions.log(
              (_, e) => `Parent recording: ${e.payload.childId} Clean`,
            ),
          ],
          target: '.changed.clean',
        },
        'CHILD.UPDATE': {
          actions: [
            actions.log(
              (_, event) =>
                `external recording of the update in child: ${event.payload.id}`,
            ),
            'addUpdate', // configured; payload: fieldIdx, key, value
          ],
          internal: true,
        },
        'CHILD.INCLUDE': {
          actions: 'includeField', // configured
        },
        'CHILD.EXCLUDE': {
          actions: 'excludeField', // configured
        },
        CANCEL: { target: 'cancelling' },
        /* utility for debugging */
        PRINT: {
          actions: actions.log((ctx) => `PRINT:\n${JSON.stringify(ctx)}`),
        },
        /* utility for debugging */
        PRINT_CHILDREN: {
          actions: actions.pure((ctx) => {
            return ctx.fieldMachines.map(({ id }) => {
              return send('PRINT', { to: `child-${id}` });
            });
          }),
        },
      },
    },
    // Task: Reset the redux store to the starting value
    cancelling: {
      // cancelling is a compound state that tracks status with redux
      entry: [
        actions.log((ctx) => `${ctx.id} entering state: cancelling`),
        actions.pure((ctx) => {
          return ctx.fieldMachines.map(({ id }) => {
            return send('GET_VIEW_REQUEST', { to: `child-${id}` });
          });
        }),
      ],
      on: {
        GET_VIEW_RESPONSE: {
          target: '.caching', // trigger always
          actions: [
            'cacheField',
            actions.log(
              (ctx) => `parent field cache has ${ctx.fields.length} views.`,
            ),
          ],
        },
      },
      // compound state for the cancelling state
      initial: 'idleRedux',
      onDone: {
        target: 'closed',
      },
      states: {
        idleRedux: {},
        caching: {
          entry: actions.log(() => '...caching'),
          always: [
            {
              target: 'savingToRedux',
              cond: ({ fields = [], fieldMachines }) =>
                fields.length === fieldMachines.length,
            },
          ],
        },
        savingToRedux: {
          entry: [
            actions.log(
              (ctx) =>
                `resetting the external record with field count: ${
                  ctx.fields.length
                }\n
               sample field: ${JSON.stringify(ctx.fields[0])}`,
            ),
            'reset', // ref to external dispatch
          ],
          type: 'final',
        },
      },
    },
    closed: {
      initial: 'closingChildren',
      states: {
        closingChildren: {
          entry: actions.pure((ctx) => {
            return ctx.fieldMachines.map(({ id }) => {
              return send('CLOSE', { to: `child-${id}` });
            });
          }),
          exit: 'cleanup',
          always: { target: 'done' },
        },
        done: {
          type: 'final',
          entry: [actions.log((ctx) => `${ctx.id}: closed`)],
        },
      },
    },
  },
};

export default Machine(rootMachineConfig, rootMachineOptions);
