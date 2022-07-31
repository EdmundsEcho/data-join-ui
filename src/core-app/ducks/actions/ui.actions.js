/**
 * @module /src/Ducks/actions/ui.actions
 *
 * @description
 * Over-all status of the ui
 * The set actions impact the reducers.
 *
 * Programming with Actions
 *
 */
export const SET_LOADER = 'SET LOADER'; // document
// note how SET ~ VERB but it is not a command

// These impact the reducers
export const setLoader = ({ toggle, feature, message }) => ({
  type: `${feature} ${SET_LOADER} ${toggle ? '... loading' : 'done'}`,
  value: { toggle, message },
  meta: { feature },
});
