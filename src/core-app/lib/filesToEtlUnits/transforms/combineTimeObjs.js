// src/lib/filesToEtlUnits/transforms/combineTimeObjs.js

import { minRefInValue } from './span/reference';

/**
 *
 *    :: sources -> top-level prop
 *
 * This is a fully derived value; no user input.
 *
 * ✅ select time prop with earliest timee period
 * ⬜ adjust which isoFormat based on the "largest", least resolute.
 *    (will then require re-sampling)
 *
 * 🦀 The backend utilizes this etl-level value for all the sources.
 * 🦀 The user-input validation does not yet enforce formats for dates
 *
 * @function
 * @param {Array.<{Object}>} sources
 * @return {?{Object}} time prop
 *
 */
export const combineTimeObjs = (sources) => {
  if (sources[0].purpose !== 'mspan') return {};

  const { time } = minRefInValue(
    sources,
    (source) => source.time.reference.value,
    (source) => source.time.reference.isFormat,
  );

  return time;
};

export default combineTimeObjs;
