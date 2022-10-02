/**
 * @module ducks
 * @description
 * Composes the reducers (state fragments -> state).
 * The module sets the redux store structure accordingly.
 *
 * The index captures the inventory of the reducers read-into
 * the combineReducers function used to configure the redux store.
 *
 * @see rootSelectors Where to find the selectors for state
 * @see combineReducers
 *
 */
export { default as $_projectMeta } from './project-meta.reducer'; // eslint-disable-line
export { default as fileView } from './fileView.reducer';
export { default as headerView } from './headerView.reducer';
export { default as etlView } from './etlView.reducer';
export { default as workbench } from './workbench.reducer';
export { default as pendingRequests } from './pendingRequests.reducer';
export { default as notifications } from './notifications.reducer';
export { default as modal } from './modal.reducer';
export { default as ui } from './ui.reducer';
export { default as stepper } from './stepper.reducer';
