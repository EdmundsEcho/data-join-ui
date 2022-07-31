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
import { SET_LOADER } from './actions/ui.actions';

// selector
export const isLoading = (stateFragment) => ({
  isLoading: stateFragment.loading,
  message: stateFragment.message,
});

const initState = {
  loading: false,
  message: '',
};

const reducer = (state = initState, action) => {
  switch (true) {
    case action.type === 'RESET':
    case action.type === 'RESET UI':
      return { ...initState };

    case action.type.includes(SET_LOADER):
      return typeof action.value === 'boolean'
        ? {
            ...state,
            loading: action.value,
            message: '',
          }
        : {
            ...state,
            loading: action.value.toggle,
            message: action.value?.message,
          };

    default:
      return state;
  }
};

export default reducer;
