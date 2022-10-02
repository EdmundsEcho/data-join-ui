//
// actions to sanitize by the redux devTools extension
import { ADD_HEADER_VIEW } from './ducks/actions/headerView.actions';
import { SET_TREE } from './ducks/actions/workbench.actions';
import { POLLING_RESOLVED } from './ducks/actions/api.actions';
import { REMOVE as REMOVE_PENDING_REQUEST } from './ducks/actions/pendingRequests.actions';
// import { SET_MATRIX } from './ducks/actions/matrix.actions';

// -----------------------------------------------------------------------------
/* eslint-disable no-console */
// -----------------------------------------------------------------------------
export const addActionLogging = (store) => {
  const rawDispatch = store.dispatch;
  if (!console.group) {
    return rawDispatch;
  }

  return (action) => {
    console.group(action.type);
    console.log('%caction', 'color:blue', action);
    const returnValue = rawDispatch(action);
    console.groupEnd(action.type);
    return returnValue;
  };
};
// -----------------------------------------------------------------------------
const now = new Date();
const timeStamp = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
// -----------------------------------------------------------------------------
export const options = {
  name: `Tnc Redux - ${timeStamp}`,
  traceLimit: 150,
  trace: true,
  autoPause: true, // record only when window is active
  shouldCatchErrors: true, // ... in reducers; stops execution
  features: {
    pause: true, // start/pause recording of dispatched actions
    lock: false, // lock/unlock dispatching actions and side effects
    persist: false, // persist states on page reloading
    export: false, // export history of actions in a file
    import: 'custom', // import history of actions from a file
    jump: true, // jump back and forth (time travelling)
    skip: false, // skip (cancel) actions
    reorder: false, // drag and drop actions in the history list
    dispatch: true, // dispatch custom actions or action creators
    test: false, // generate tests for the selected actions
  },
  actionSanitizer: (action) => {
    switch (true) {
      // case action.type.includes('persist/REHYDRATE'):

      case action.type.includes(SET_TREE):
        // case action.type.includes(SET_MATRIX):
        return { ...action, payload: '<<LONG_BLOB>>' };

      case action.type.includes(POLLING_RESOLVED):
      case action.type.includes(REMOVE_PENDING_REQUEST):
        return scrubbDown(action);

      case action.type.includes(ADD_HEADER_VIEW):
        return {
          ...action,
          payload: { ...action.payload, fields: '<<LONG_BLOB>>' },
        };

      default:
        return action;
    }
  },
  stateSanitizer: (state) =>
    state.workbench?.matrix
      ? { ...state, workbench: { ...state.workbench, matrix: '<<LONG_BLOB>>' } }
      : state,
};

function scrubbDown(action) {
  return {
    ...action,
    event: {
      ...action.event,
      request: { ...action.event.request, data: '<<LONG_BLOB>>' },
    },
  };
}
