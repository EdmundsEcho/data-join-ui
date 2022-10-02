/**
 * @module src/sagas
 *
 * @description
 * initSagas reads this file as input.
 * Composes the individual sagas into a single saga that is consumed when we
 * configure the redux-store.
 *
 * Augment error reporting with `babel-plugin-redux-saga`
 *
 */
export * from './polling-api.sagas';
export * from './headerView-report-fixes.sagas';
// export * from './fileView.sagas';
export * from './matrix.sagas';
