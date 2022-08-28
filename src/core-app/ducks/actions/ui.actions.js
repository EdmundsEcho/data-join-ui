/**
 * @module /src/Ducks/actions/ui.actions
 *
 * @description
 * Over-all status of the ui
 *
 */
export const SET_LOADER = 'SET LOADER'; // document
export const REDIRECT = 'REDIRECT'; // document (state read by REDUX INIT)
export const CLEAR_REDIRECT = 'CLEAR_REDIRECT'; // document (state read by REDUX INIT)
export const CLEAR_BOOKMARK = 'CLEAR_BOOKMARK'; // document (state read by REDUX INIT)

const feature = '[UI META]';

// These impact the reducers
// loader = true means loading
export const setLoader = ({ toggle, feature, message }) => ({
  type: `${feature} ${SET_LOADER} ${toggle ? '... loading' : 'done'}`,
  value: { toggle, message },
  meta: { feature },
});

/**
 * A component has access to useNavigate.  The ReduxInitializer
 * will listen for changes in this reducer's state.
 */
export const redirect = (url, bookmarkUrl) => ({
  type: `${feature} ${REDIRECT} ${url}`,
  url,
  bookmarkUrl,
});

export const clearRedirect = () => ({
  type: `${feature} ${CLEAR_REDIRECT}`,
});
export const clearBookmark = () => ({
  type: `${feature} ${CLEAR_BOOKMARK}`,
});
