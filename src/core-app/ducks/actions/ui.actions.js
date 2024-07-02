/**
 * @module /src/Ducks/actions/ui.actions
 *
 * @description
 * Over-all status of the ui
 *
 */

// any feature can set loader
export const SET_LOADER = `SET_LOADER`; // document

// service delivered by UI META
const feature = '[UI META]';
export const REDIRECT = `${feature} REDIRECT`; // document (state read by REDUX INIT)
export const CLEAR_REDIRECT = `${feature} CLEAR_REDIRECT`; // document (state read by REDUX INIT)
export const CLEAR_BOOKMARK = `${feature} CLEAR_BOOKMARK`; // document (state read by REDUX INIT)

export const ADD_ERROR = `${feature} ADD_ERROR`; // document
export const CLEAR_ERRORS = `${feature} CLEAR_ERRORS`; // document (see AppSnackbar)

// action kind :: command
export const addError = (payload) => ({
  type: ADD_ERROR,
  payload,
});
export const clearErrors = () => ({
  type: CLEAR_ERRORS,
});

// These impact the reducers
// loader = true means loading
/* eslint-disable no-shadow */
export const setUiLoadingState = ({ toggle, feature, message }) => ({
  type: `${feature} ${SET_LOADER} ${toggle ? '... loading' : 'done'}`,
  payload: { loading: toggle, message, feature },
});
/* eslint-enable no-shadow */

/**
 * A component has access to useNavigate.  The ReduxInitializer
 * will listen for changes in this reducer's state.
 */
export const redirect = (url, bookmarkUrl) => ({
  type: `${REDIRECT} ${url}`,
  url,
  bookmarkUrl,
});

export const clearRedirect = () => ({
  type: CLEAR_REDIRECT,
});
export const clearBookmark = () => ({
  type: CLEAR_BOOKMARK,
});
