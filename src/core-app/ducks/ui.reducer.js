/**
 *
 * Tracks the state of loading data for the app.
 * This might take on a branch for each of the components we track...
 *
 * 🚧 Set based on the status of the pendingRequests slice.
 * 🚧 May require a review given the error and  meta consuming capacity
 *    of the use-fetch-api (hook).
 *
 * see Programming with Actions
 *
 * @module src/ducks/ui.reducer
 *
 */
import {
  REDIRECT,
  CLEAR_REDIRECT,
  CLEAR_BOOKMARK,
  SET_LOADER,
  ADD_ERROR,
  CLEAR_ERRORS,
} from './actions/ui.actions';
import { RESET } from './actions/project-meta.actions';

// selector
export const isUiLoading = (stateFragment) => ({
  isLoading: stateFragment.loading,
  message: stateFragment.message,
  inErrorState: stateFragment.inErrorState,
});

const initState = {
  loading: false,
  inErrorState: false,
  message: null,
  redirect: undefined,
  bookmarkUrl: undefined,
  errors: [],
};

// eslint-disable-next-line default-param-last
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
        redirect: action?.url ?? state.redirect,
        bookmarkUrl: action?.bookmarkUrl ?? state.bookmarkUrl,
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

    case action.type === ADD_ERROR:
      return {
        ...state,
        errors: [...(state.errors || []), action.payload],
      };

    case action.type === CLEAR_ERRORS:
      return {
        ...state,
        errors: [],
      };

    default:
      return state;
  }
};

export default reducer;
