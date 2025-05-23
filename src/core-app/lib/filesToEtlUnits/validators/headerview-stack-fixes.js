// src/lib/filesToEtlUnits/validations/headerview-stack-fixes.js

/**
 * @module validators/headerview-stack-fixes
 *
 * @description
 * Reviews a headerView in context of the other headerViews. Generates
 * fixes/errors organized by filename. Each fix is based on the capacity to
 * stack a field with other fields in the other headerViews.
 *
 *
 *          { path1: [ 'error' ], path2: ['error'] }
 *
 *
 * ⚠️  The validation is based in part in how the files/headers will
 * "stack".  This requires that each field be looked at individually
 * compared to related fields in other headers.
 *
 * The "related" is organized by `etlUnit` and `etlField` where
 * 💰 [ etlField ] -> etlUnit
 *
 */
import { enabledHvInHvs, getActiveHvFields } from '../headerview-helpers';
import { validateFieldStack as initValidateFieldStack } from './validations';
import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const GLOBAL_DEBUG = process.env.REACT_APP_DEBUG_ERROR_FIX === 'true';
//------------------------------------------------------------------------------
const COLOR = colors.light.blue;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 *
 * 📌 Top-level export
 *
 * 🚫 One of several reports. Not intended as a stand-alone.
 *
 * Impact on state is limited to the errors prop
 *
 *     :: hvs -> hvsFixes :: RAW
 *
 * @function
 * @param {Object<Filename,HeaderView>} headerViews
 * @param {boolean} DEBUG
 * @return {Object<Filename, Array>} raw fixes for each hv
 *
 * @category Lib
 *
 */
export function reportHvsStackFixes(hvs, DEBUG = GLOBAL_DEBUG) {
  // delegate to the hv specific worker
  if (DEBUG) {
    console.group(
      `%c📋 report headerView -> stacking capacity\n   Will fields found in multiple headerViews stack properly?`,
      COLOR,
    );
  }
  const result = validHvStackInHvs(enabledHvInHvs(hvs), DEBUG);

  if (DEBUG) console.groupEnd();

  return result;
}

/**
 *
 * The workhorse
 *
 * Stack check
 *
 * Reports errors generated by `validateField` (field-level).
 * Iterates through each field in a headerview, for each in the headerviews
 * collection.
 *
 * Validates hv field by field, in the hvs context.
 *
 * 👍 processes all of fields regardless of source type
 *    (i.e., RAW, WIDE and IMPLIED)
 *
 * ⚠️  But only reports the RAW field fixes (e.g., WIDE processed elsewhere)
 *
 *
 * @function
 * @param {Object} args
 * @param {Array<HeaderView>} args.headerViews
 * @param {Object<SOURCE_TYPES, Array<Object>>} args.accRawFixes
 * @param {Object<FieldName, Array<Object>>} args.memo
 * @return {Object<Filename,Array>} Array of raw hvs fixes
 *
 */
function validHvStackInHvs(hvs, DEBUG) {
  // initialize the combinations of etlUnits required to perform the validation
  const stackValidationFn = initValidateFieldStack(hvs, DEBUG, COLOR); // ⚠️
  // for each headerView in hvs, compute otherHvs,
  // run the hvStackFixes routine, track results keyed by field
  const { hvsStackFixes } = hvs.reduce(
    /* eslint-disable no-shadow, no-param-reassign */
    // compute the stack report for each hv
    ({ hvsStackFixes, memo }, hv) => {
      let maybeStackFixes = {};
      ({ maybeStackFixes, memo } = goHvStackFixes(
        hv, // for each hv in hvs
        hvs.filter((hv_) => hv_.filename !== hv.filename), // context for the stack analysis
        stackValidationFn, // ⚠️  initialized
        memo, // leverage previous stack results keyed by field
        DEBUG,
      ));
      // record the hv result when exists (not Nothing)
      if (maybeStackFixes.length > 0)
        hvsStackFixes[hv.filename] = maybeStackFixes;
      return { hvsStackFixes, memo };
    },
    { hvsStackFixes: {}, memo: {} },

    /* eslint-enable no-shadow, no-param-reassign */
  );

  return hvsStackFixes;
}

/**
 * validHvStackInHvs sub-routine
 *
 *      maybeStackFixes :: Array
 *
 * @function
 * @param {HeaderView} hv
 * @param {Object<string,Object>} memo memo with count and result props
 * @param {boolean} DEBUG
 * @return {{maybeStackFixes: Array, memo: Object}}
 */
function goHvStackFixes(hv, otherHvs, validateFieldStackFn, memo, DEBUG) {
  /* eslint-disable no-shadow, no-param-reassign */
  if (DEBUG) {
    console.groupCollapsed(`%c📁 go hv: ${hv.filename}`, COLOR);
    console.group(`%cin hvs:`, COLOR);
    otherHvs.forEach((hv) => console.debug(`%c📁 ${hv.filename}`, COLOR));
    console.groupEnd();
  }
  // scan hv one field at a time
  // each scan returns :: [error], push to accumulate
  // ... all in the scope of memo
  // return combined errors for hv and memo for use with the next hv
  const maybeStackFixes = getActiveHvFields(hv).reduce(
    (maybeStackFixes, field) => {
      const memoKey = field['field-alias'];

      if (memoKey in memo) {
        if (DEBUG) {
          memo[memoKey].count += 1; // track utilization
          console.debug(
            `%c...using memo result for field: ${memoKey} in hv: ${hv.filename}`,
            colors.green,
          );
        }
        maybeStackFixes = [...maybeStackFixes, ...memo[memoKey].maybeErrors];
      } else {
        // 💰 Workhorse for each iteration
        //    The field is put through a series of *purpose-specific* stacking
        //    tests in context of the other hvs.
        const maybeErrors = validateFieldStackFn(
          field, // iterated field
          //  hv,      // fixed for this go
          // otherHvs, // fixed for this go
        );
        if (DEBUG) {
          console.debug(
            `%c👉 new result for field: ${memoKey}\nin hv: ${hv.filename}`,
            COLOR,
          );
          console.table(maybeErrors);
        }
        memo[memoKey] = { maybeErrors, count: 0 };
        maybeStackFixes = [...maybeStackFixes, ...maybeErrors];
      }
      return maybeStackFixes;
    },
    [],
  );

  if (DEBUG) {
    console.groupEnd();
  }

  return { maybeStackFixes, memo };
  /* eslint-enable no-shadow, no-param-reassign */
}

export default reportHvsStackFixes;
