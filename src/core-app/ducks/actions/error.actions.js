// src/ducks/actions/error.actions.js

/**
 * @module ducks/actions/error.actions
 *
 * @description
 * See thinking-in-redux
 * Called by the normalizer middleware.
 *
 */
/* eslint-disable no-console */
const ACTION_ERROR = 'ACTION_ERROR';

export const actionError = ({ feature, error }) => ({
  type: `${feature} ${ACTION_ERROR}`,
  meta: { feature, error },
});

export default actionError;
