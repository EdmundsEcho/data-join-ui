// src/lib/filesToEtlUnits/headerview-report-fixes.js

/**
 * @module lib/filesToEtlUnits/headerview-report-fixes
 *
 * @description
 * Consolidates the fix-error reporting capacity of the headerview
 * configuration process.
 *
 */
// 👍 Read-only of hvs; creates a new fix error report
import { reportHvsStackFixes } from './validators/headerview-stack-fixes';
import { reportHvsEtlUnitFixes } from './validators/headerview-etlunit-fixes';
import { reportHvWideToLongFixes as rptWideToLongFixes } from './validators/headerview-widetolong-fixes';

import { SOURCE_TYPES } from '../sum-types';
import ERRORS from '../../constants/error-messages';
import { InputError } from '../LuciErrors';
import { colors } from '../../constants/variables';
import { errorWithMaybeLazyFix as initMaybeLazyFix } from '../feedback/error-with-lazy-action-fix';
import { dedupObject } from '../../utils/common';

// this might change; currently imported by middleware for when update wtlf
export const reportHvWideToLongFixes = rptWideToLongFixes;

// -----------------------------------------------------------------------------
const GLOBAL_DEBUG = process.env.REACT_APP_DEBUG_ERROR_FIX === 'true';
const COLOR = colors.blue;
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
//------------------------------------------------------------------------------

/**
 * 📌 headerViews reporting capacity
 *
 *    Generates a report "from scratch"
 *    🚧 Later, if need to include previous errors, ready to change.
 *    🚧 As of now, use a combine function (easier to debug process)
 *
 * 👍 processes all of fields considering/interpreting the source type
 *    (i.e., RAW, WIDE and IMPLIED)
 *
 * @function
 * @param {Object<string,HeaderView>} hvs
 * @param {boolean} DEBUG
 * @return {Object<string,Fixes>}
 */
export function reportHvsFixes(hvs, debug = false) {
  // ⚠️  initialize the hvsFixes object
  const hvsFixes = {};
  const DEBUG = debug || GLOBAL_DEBUG;

  let t0;
  if (DEBUG) {
    t0 = performance.now();
    console.groupCollapsed(
      `%c   -----------------------\n📋 reportHvsFixes kick-off`,
      COLOR,
    );
  }

  const closure = {
    // RAW
    reportHvs1: () => {
      // stackable fields across hvs
      hvsFixes[SOURCE_TYPES.RAW] = reportHvsStackFixes(hvs, DEBUG);
      if (DEBUG) {
        console.log(
          `%c👉 hvsFixes count following stackFixes: ${errorCount(hvsFixes)} `,
          COLOR,
        );
        console.dir(hvsFixes[SOURCE_TYPES.RAW]);
      }
      return closure;
    },

    // RAW
    reportHvs2: () => {
      // valid etlUnits in each hv
      hvsFixes[SOURCE_TYPES.RAW] = combine(
        hvsFixes[SOURCE_TYPES.RAW],
        reportHvsEtlUnitFixes(hvs, DEBUG),
      );
      if (DEBUG) {
        console.log(
          `%c👉 hvsFixes count following etlUnits: ${errorCount(hvsFixes)} `,
          COLOR,
        );
        console.dir(hvsFixes[SOURCE_TYPES.RAW]);
      }
      return closure;
    },

    // WIDE
    reportHvs3: () => {
      // wtlf-specific fixes
      hvsFixes[SOURCE_TYPES.WIDE] = reportWtlfFixes(hvs, DEBUG);
      if (DEBUG) {
        console.log(
          `%c👉 hvsFixes count following wtlfFixes: ${errorCount(hvsFixes)} `,
          COLOR,
        );
        console.dir(hvsFixes);
      }
      return closure;
    },

    dedupFixes: () => {
      const tmp = dedupHvsFixes(hvsFixes); // returns hvsFixes
      hvsFixes[SOURCE_TYPES.RAW] = tmp?.[SOURCE_TYPES.RAW] ?? {};
      hvsFixes[SOURCE_TYPES.WIDE] = tmp?.[SOURCE_TYPES.WIDE] ?? {};
      hvsFixes[SOURCE_TYPES.IMPLIED] = tmp?.[SOURCE_TYPES.IMPLIED] ?? {};
      if (DEBUG) {
        console.log(
          `%chvsFixes following the dedup process: ${errorCount(hvsFixes)} `,
          COLOR,
        );
        console.dir(hvsFixes);
      }
      return closure;
    },

    coordinateFixes: () => {
      coordinateHvsFixes(hvsFixes); // side-effect on hvsFixes
      if (DEBUG) {
        console.log(
          `%chvsFixes following the coordination process: ${errorCount(
            hvsFixes,
          )} `,
          COLOR,
        );
        console.dir(hvsFixes);
      }
      return closure;
    },

    setLazyFixes: () => {
      // context = hvsFixes; configures lazyFix when possible
      const withContext = initMaybeLazyFix(
        hvsFixes[SOURCE_TYPES.RAW], // errorContext
        hvs, // state context (make sure errorObjects use stateFragment : hvs)
        DEBUG,
      );
      hvsFixes[SOURCE_TYPES.RAW] = setLazyFixes(
        hvsFixes[SOURCE_TYPES.RAW],
        withContext,
      );
      if (DEBUG) {
        console.log(
          `%c👉 hvsFixes count following setLazyFixes: ${errorCount(
            hvsFixes,
          )} `,
          COLOR,
        );
        console.dir(hvsFixes[SOURCE_TYPES.RAW]);
      }
      return closure;
    },

    removeDanglingValues: () => {
      removeDanglingValues(hvsFixes); // side-effect on hvsFixes
      if (DEBUG) {
        console.log(
          `%chvsFixes following the removeDanglingValues process: ${errorCount(
            hvsFixes,
          )} `,
          COLOR,
        );
        console.dir(hvsFixes);
      }
      return closure;
    },

    elapsedTime: () => {
      if (DEBUG) {
        const t1 = performance.now();
        console.log(`%celapsed time: ${t1 - t0} ms`, COLOR);
      }
      return closure;
    },

    return: () => {
      if (DEBUG) {
        console.groupEnd();
      }
      return hvsFixes;
    },
  };
  return closure;
}

/**
 * local utility for reporting
 */
function errorCount(hvsFixes) {
  return Object.keys(hvsFixes).reduce((count, sourceType) => {
    /* eslint-disable no-param-reassign, no-shadow */
    return Object.keys(hvsFixes[sourceType]).reduce((count, filename) => {
      count += hvsFixes[sourceType][filename]?.length ?? 0;
      return count;
    }, count);
    /* eslint-enable no-param-reassign, no-shadow */
  }, 0);
}

/**
 * side-effect
 * @function
 * @param {Object<Filename,Array>} hvsFixes
 * @return
 *
 */
function removeDanglingValues(hvsFixes) {
  /* eslint-disable no-shadow, no-param-reassign */
  const go = (sourceTypeErrors) =>
    Object.entries(sourceTypeErrors).reduce(
      (errors, [source, sourceErrors]) => {
        if (sourceErrors?.length > 0) {
          errors[source] = sourceErrors;
        }
        return errors;
      },
      {},
    );
  Object.keys(hvsFixes).forEach((key) => {
    hvsFixes[key] = go(hvsFixes[key]);
  }); // side-effect on hvsFixes
  /* eslint-enable no-shadow, no-param-reassign */
}
/**
 * local utility to apply context to the error items
 *
 * @function
 * @param {Object<Filename,Array>} hvsRawErrors
 * @param {Array<Object>} withContext
 * @param {boolean} DEBUG
 * @return {Array<Object>}
 *
 */
function setLazyFixes(hvsRawErrors, withContext, DEBUG) {
  if (DEBUG) console.groupCollapsed(`%c...apply the error context`, COLOR);
  const numberOfKeys = Object.keys(hvsRawErrors);
  const result = Object.keys(hvsRawErrors).reduce(
    (hvsRawErrorsWithContext, filename, count) => {
      if (DEBUG) {
        console.log(
          `%c...${filename} error count: ${hvsRawErrors[filename].length}`,
          COLOR,
        );
      }
      /* eslint-disable-next-line no-param-reassign */
      hvsRawErrorsWithContext[filename] = hvsRawErrors[filename].map(
        // (error) => error,
        (error) => withContext(error),
      );
      if (DEBUG && count === numberOfKeys - 1) {
        console.log(`%cResult`, COLOR);
        console.dir(hvsRawErrorsWithContext);
        console.groupEnd();
      }
      return hvsRawErrorsWithContext;
    },
    {},
  );
  if (DEBUG) console.groupEnd();
  return result;
}
/**
 *
 * Fix/error report coordinated sequence
 *
 * Simplify the error messages when the hv has outstanding fixes
 * in the wideToLongFields prop.
 *
 * ✅ RAW fix = has a WIDE error | RAW fixes remain the same
 *
 * @function
 * @param {Object} hvsFixes
 */
function coordinateHvsFixes(hvsFixes) {
  const wideFixes = hvsFixes[SOURCE_TYPES.WIDE];
  /* eslint-disable no-param-reassign, no-shadow */
  hvsFixes[SOURCE_TYPES.RAW] = Object.keys(wideFixes)
    .filter((wideFilename) => wideFixes[wideFilename].length > 0)
    .reduce((rawFixes, wideFilenameWithErrors) => {
      rawFixes[wideFilenameWithErrors] = [ERRORS.hasWideFieldErrors];
      return rawFixes;
    }, hvsFixes[SOURCE_TYPES.RAW]);
  /* eslint-enable no-param-reassign, no-shadow */
}

/**
 * dedup
 * @function
 * @param {Object} hvsFixes
 */
function dedupHvsFixes(hvsFixes) {
  /* eslint-disable no-param-reassign, no-shadow */
  return Object.entries(hvsFixes).reduce((hvsFixes, [key, value]) => {
    hvsFixes[key] = dedupObject(value, 'key');
    return hvsFixes;
  }, {});
  /* eslint-enable no-param-reassign */
}

/**
 *
 * Wide-to-long-fields Fix/error report
 *
 * ✅ Re-compute the WIDE type errors
 *
 * @function
 * @param {Array<HeaderView>}
 * @return {Array<Object>}
 *
 */
function reportWtlfFixes(hvs, DEBUG) {
  return (
    hvs
      /* eslint-disable no-param-reassign */
      .filter((hv) => 'wideToLongFields' in hv)
      .reduce((fixes, hv) => {
        fixes[hv.filename] = wtlfFixes(hv, DEBUG);
        return fixes;
        /* eslint-enable no-param-reassign */
      }, {})
  );
}

/**
 * Generate the wtlf error report
 *
 * @function
 * @param {HeaderView} hv
 * @return {Array<Fix>}
 */
function wtlfFixes(hv, DEBUG) {
  return reportHvWideToLongFixes({
    wideToLongFields: hv.wideToLongFields,
    hvFields: hv.fields,
    DEBUG,
  })
    .hasUniqueFieldNames()
    .reportMissingInput()
    .validateStructure()
    .return();
}

/**
 *  combine report findings
 *
 *  👉 base case: Array + Array => dedup Array
 *  👉 Object + Object => combine values :: Array
 *                     => combine values :: Object
 *                     => 🚨 :)
 *
 */
function combine(left, right) {
  switch (true) {
    case Array.isArray(left):
      return [...new Set([...left, ...right])];

    case typeof left === 'object':
      return Object.keys(left).reduce((combined, leftKey) => {
        /* eslint-disable no-param-reassign */
        if (typeof left[leftKey] === 'object') {
          combined[leftKey] = combine(left[leftKey], right[leftKey]);
          return combined;
        }
        throw InputError(`Combine does not support this combination`);
        /* eslint-enable no-param-reassign */
      }, right);

    default:
      throw InputError(`Combine does not support this combination`);
  }
}
export default reportHvsFixes;
