/**
 * @module src/ducks/ui.reducer
 *
 * @description
 * Tracks the state of loading data for the app.
 * This might take on a branch for each of the components we track...
 *
 * 🚧 Set based on the status of the pendingRequests slice.
 *
 * see Programming with Actions
 *
 */
import {
  REDIRECT,
  CLEAR_REDIRECT,
  CLEAR_BOOKMARK,
  SET_LOADER,
} from './actions/ui.actions';
import { RESET } from './actions/project-meta.actions';

// selector
export const isUiLoading = (stateFragment) => ({
  isLoading: stateFragment.loading,
  message: stateFragment.message,
});

const initState = {
  loading: false,
  message: null,
  redirect: undefined,
  bookmarkUrl: undefined,
};

const reducer = (state = initState, action) => {
  switch (true) {
    case action.type === RESET:
    case action.type === 'RESET UI':
      return initState;

    // type: `${feature} ${SET_LOADER} ${toggle ? '... loading' : 'done'}`,
    // payload: { toggle, message, feature },
    case action.type.includes(SET_LOADER):
      return {
        ...state,
        ...action.payload,
      };

    case action.type === REDIRECT:
      return {
        ...state,
        redirect: action?.url,
        bookmarkUrl: action?.bookmarkUrl,
      };

    case action.type === CLEAR_REDIRECT:
      return {
        ...state,
        redirect: undefined,
      };

    case action.type === CLEAR_BOOKMARK:
      return {
        ...state,
        bookmarkUrl: undefined,
      };

    default:
      return state;
  }
};

export default reducer;
