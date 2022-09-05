// actions to sanitize by the redux devTools extension
//
import { ADD_HEADER_VIEW } from './ducks/actions/headerView.actions';
import { SET_TREE } from './ducks/actions/workbench.actions';
// import { SET_MATRIX } from './ducks/actions/matrix.actions';
import { POLLING_RESOLVED } from './ducks/actions/api.actions';
import { REMOVE as REMOVE_PENDING_REQUEST } from './ducks/actions/pendingRequests.actions';

// -----------------------------------------------------------------------------
// 🚧 Reduce the memory and CPU usage
//    Redux debugging
// -----------------------------------------------------------------------------
export const devToolsConfiguration = {
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

  traceLimit: 20,
  trace: true,
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
