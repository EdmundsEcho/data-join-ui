// src/lib/filesToEtlUnits/validators/headerview-etlunit-fixes.js

/**
 * @module validators/headerview-etlunit-fixes
 *
 */
import {
  exactlyOneMspan,
  exactlyOneSubject,
  hasAtLeastOneEtlUnit,
  hasUniqueFieldNames,
  hasMvalueName,
  missingNullValues,
  noOrphanMcomp,
} from './validations';
import {
  enabledHvInHvs,
  fieldCountsByPurpose,
  getActiveHvFields,
} from '../headerview-helpers';
import ERRORS from '../../../constants/error-messages';
import { DesignError } from '../../LuciErrors';
import { colors } from '../../../constants/variables';

const COLOR = colors.blue;

// const DEBUG = process.env.REACT_APP_DEBUG_ERROR_FIX === 'true';
/* eslint-disable no-console */

/**
 *
 * 📌 Top-level export
 *
 * Generate an error/fix report for each hv in the hvs collection
 *
 *     :: hvs -> hvsFixes :: RAW
 *
 * 💰 Given that every field must contribute to a valid etlUnit function,
 *    the report exploits the etlUnit construct to assess the integrity
 *    of a headerView (and how to fix it).
 *
 * ⚠️  Each report is a 'standalone'; i.e., not in context of hvs.
 *
 *
 * @function
 * @param {Array<HeaderView>} hvs
 * @param {boolean} DEBUG
 * @returns {Object<Filename,Array>} Array of raw type fixes for each hv
 */
export function reportHvsEtlUnitFixes(hvs, DEBUG = false) {
  if (DEBUG) {
    console.groupCollapsed(
      '%c📋 report headerView -> etlUnits\nDoes each field contribute to an etlUnit?',
      COLOR,
    );
    console.log(`%chvs count: ${hvs.length}`, COLOR);
  }

  /* eslint-disable no-param-reassign, no-shadow */
  const hvsRawFixes = enabledHvInHvs(hvs).reduce((hvsRawFixes, hv) => {
    hvsRawFixes[hv.filename] = headerViewEtlUnitFixes(hv, DEBUG);
    if (DEBUG) {
      console.log(`hvsRawFixes for hv: ${hv.filename}`);
      console.dir(hvsRawFixes[hv.filename]);
    }
    return hvsRawFixes;
  }, {});
  /* eslint-enable no-param-reassign, no-shadow */

  /*
  console.log(`Length of first value`);
  console.dir(Object.values(hvsRawFixes)[0].length);
  console.log(`first error in first file: ${Object.values(hvsRawFixes)[0][0]}`);
  */
  if (DEBUG) console.groupEnd();

  return hvsRawFixes;
}

/**
 * The workhorse
 * Valid etlUnits in the headerView?
 *
 * Compute the errors for a single headerView within the scope of
 * that specific headerView (i.e., ignoring other headerViews).
 *
 *
 * 👍 processes all of fields regardless of source type
 *    (i.e., RAW, WIDE and IMPLIED)
 *
 * @function
 * @param {Object} hv
 * @return {Array.<Object>} array of error objects
 *
 */
function headerViewEtlUnitFixes(hv, DEBUG) {
  // generate report in context of the RAW, IMPLIED and WIDE fields
  const fields = getActiveHvFields(hv);
  const fieldCounts = fieldCountsByPurpose(fields);
  if (DEBUG) {
    console.group(`%c👉 hv: ${hv.filename}`, COLOR);
    console.table(fieldCounts);
  }

  // Invalid state
  // True because we count fields in context of the derived fields (i.e., so
  // ignore RAW field values when required)
  if (fieldCounts.mvalue > 1) {
    throw new DesignError(
      `This headerview has more than one mvalue: ${hv.filename}\n` +
        `(failed to call findAndSeedDerivedFields)`,
    );
  }

  const fixes = [];

  // series of conditionals to build fixes
  if (!hasUniqueFieldNames(fields)) fixes.push(ERRORS.hasUniqueFieldNames);

  // subject
  if (fieldCounts.subject === 0) fixes.push(ERRORS.missingSubject);
  else if (!exactlyOneSubject(fields)) fixes.push(ERRORS.exactlyOneSubject);

  // etlUnit::quality
  // subject -> quality | mvalue
  if (fieldCounts.subject > 0) {
    if (!hasAtLeastOneEtlUnit(fields)) fixes.push(ERRORS.hasAtLeastOneEtlUnit);

    const missing = missingNullValues(fields);
    if (missing.length > 0) {
      fixes.push(ERRORS.missingNullValues(missing));
    }

    if (!hasMvalueName(hv)) {
      fixes.push(ERRORS.hasMvalueName);
    }
  }

  // etlUnit::mvalue
  // subject, mspan, [mcomp] -> mvalue
  if (fieldCounts.mvalue > 0) {
    // ... when mvalue
    if (!exactlyOneMspan(fields)) fixes.push(ERRORS.exactlyOneMspan);
  }
  // ... when mcomp without mvalue
  if (!noOrphanMcomp(fields)) fixes.push(ERRORS.noOrphanMcomp);

  // etlUnit::quality subject -> quality
  // subject -> quality is covered in the first and second cases

  // mspan specific tests
  // validate mspan format and time props
  const mspanField = fields.find((field) => field.purpose === 'mspan');

  if (mspanField) {
    if (!mspanField.format || !mspanField.time?.interval?.unit)
      fixes.push(ERRORS.missingTimeFormatAndInterval);
    else if (!mspanField?.time?.interval?.unit)
      fixes.push(ERRORS.missingTimeInterval);
    //
    if (!mspanField?.time?.interval.count)
      fixes.push(ERRORS.missingTimeInterval);
  }
  // 🦀 still not integrated with interval?
  // errors.missingTimeFormat = ERRORS.missingTimeFormat;

  if (DEBUG) {
    console.log(`Fix/error count: ${fixes.length}`);
    console.groupEnd();
  }

  return fixes;
}

export default reportHvsEtlUnitFixes;
