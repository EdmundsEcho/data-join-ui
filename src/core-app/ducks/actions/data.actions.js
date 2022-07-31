// src/ducks/actions/data.actions.js

/**
 * @module middleware/actions/data.actions
 *
 * @description
 * See thinking-in-redux
 * Called by the normalizer middleware.
 *
 */
import { InputError } from '../../lib/LuciErrors';

/* eslint-disable no-console */
const DATA_NORMALIZED = 'NORMALIZE DONE';
export const NORMALIZE = `NORMALIZE DO`;

export const dataNormalized = (feature) => ({
  type: `${feature} ${DATA_NORMALIZED}`,
  meta: { feature },
});

/**
 *
 * Construct a consistent action interface for actions that rely on normalizing
 * data prior to being documented.
 *
 *     {
 *       type:  includes ADD | SET
 *       payload: any
 *       meta: {
 *         normalizer: function
 *         feature: string
 *       }
 *     }
 *
 * @function
 * @return {Action}
 *
 */

export const normalizeData = ({ normalizer, payload, feature }) => {
  if (typeof feature === 'undefined') {
    throw new InputError(
      `Called the normalize action creator without the 'feature' prop.`,
    );
  }
  return {
    type: `${feature} ${NORMALIZE}`,
    payload,
    meta: {
      normalizer,
      feature,
    },
  };
};
