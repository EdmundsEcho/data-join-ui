import { DISPLAY_VERSIONS } from './core-app/lib/sum-types';

/**
 * Return the display version based on a series of thresholds.
 *
 * @function
 * @param {Array}
 * @return {Function}
 */
export function getDisplayVersion(thresholds) {
  return (size) =>
    Object.keys(DISPLAY_VERSIONS)[
    Math.max(
        0,
        thresholds.findIndex((threshold) => size > threshold),
      )
    ];
}
