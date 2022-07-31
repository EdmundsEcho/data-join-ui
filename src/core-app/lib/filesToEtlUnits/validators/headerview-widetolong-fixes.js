// src/lib/filesToEtlUnits/validators/headerview-widetolong-fixes.js

/**
 * @module validators/headerview-widetolong-fixes
 *
 * @description
 * Builds an array of errors assessiing wideToLongFields in context of
 * the headerView fields.
 *
 * @param wideToLongFields fields
 * @param hvFields fields
 * @return errors [error::string]
 *
 * ⬜ The validation may not be complete. See the commented code.
 *
 */
import { getActiveHvFields } from '../headerview-helpers';
import { maybeNameClashError } from './validations';
import { PURPOSE_TYPES as TYPES } from '../../sum-types';
import { DesignError } from '../../LuciErrors';
import ERRORS from '../../../constants/error-messages';
import { colors } from '../../../constants/variables';

const COLOR = colors.green;

/* eslint-disable no-console */

// -----------------------------------------------------------------------------
/**
 * Chain
 * Scope: wideToLongFields.errors
 *
 * Does not mutate the wideToLongFields prop.
 *
 * 👍 Interface: The hvsFixes param is an optional accumulator
 *    from other validation (e.g., headerview-stack-fixes).
 *
 *
 * @function
 * @param {Object} args
 * @param {Object} args.wideToLongFields
 * @param {?Array.<Object>} args.hvFields
 * @param {?Object<string,Object>} priorHvsFixes an optional starting point
 * @param {boolean} args.DEBUG
 * @return {Array.<Error>}
 *
 */
export const reportHvWideToLongFixes = ({
  wideToLongFields,
  hvFields,
  priorHvsFixes = {},
  DEBUG = false,
}) => {
  let fixes = [];
  const allFields = getActiveHvFields({
    fields: hvFields,
    wideToLongFields,
  });
  if (DEBUG) {
    console.groupCollapsed(
      `%c📋 report wide fields (series) -> etlUnit:mvalue\nIs the configuration complete and valid?`,
      COLOR,
    );
    console.log(`%cheaderView context (all fields):`, COLOR);
    console.dir(allFields);
  }

  const closure = {
    hasUniqueFieldNames: () => {
      const maybeError = maybeNameClashError({
        mvalueName: wideToLongFields.config.mvalue,
        factors: wideToLongFields.config.factors,
        allFields,
      });
      if (typeof maybeError !== 'undefined') fixes.push(maybeError);
      if (DEBUG)
        console.debug(
          `%chasUnique factor or field names? ${JSON.stringify(
            fixes.map((e) => e.key),
          )}`,
          COLOR,
        );
      return closure;
    },
    reportMissingInput: () => {
      fixes = fixes.concat(missingUserInput(wideToLongFields));
      if (DEBUG)
        console.debug(
          `%cmissing input? ${JSON.stringify(fixes.map((e) => e.key))}`,
          COLOR,
        );
      return closure;
    },
    validateStructure: () => {
      fixes = fixes.concat(validateStructure(wideToLongFields, allFields));
      if (DEBUG)
        console.debug(
          `%cvalid structure? ${JSON.stringify(fixes.map((e) => e.key))}`,
          COLOR,
        );
      return closure;
    },
    return: () => {
      if (DEBUG) console.groupEnd(`%cend validation`, COLOR);
      /*
      const result = {
        hvFixes: [
          ERRORS.hasWideFieldErrors,
          ...(priorHvsFixes[wideToLongFields.config.filename] || []),
        ],
        wideToLongFixes: [...new Set(fixes)],
   }; */
      return [...new Set(fixes)];
    },
  };
  return closure;
};

/**
 *
 *     wtlf -> bool
 *
 * @function
 */
function enteredAllFactorValues(wideToLongFields) {
  // false when any arrow value is empty/missing
  const mvalueName = wideToLongFields.config.mvalue;
  return Object.keys(wideToLongFields.fields)
    .filter((key) => key !== mvalueName)
    .reduce(
      (acc, factor) =>
        acc &&
        typeof Object.values(
          wideToLongFields.fields[factor]['map-fieldnames'].arrows,
        ).find((value) => value === '') === 'undefined',
      true,
    );
}

/**
 * Determine how complete the entries are.
 *
 *      wtlf -> [error]
 *
 * 👍 Does not mutate to the wideToLongFields input.
 *
 * @function
 * @param {Object.<string, any>} wideToLongFields
 * @return {Array.<Error>}
 */
function missingUserInput(wideToLongFields) {
  const fixes = [];
  const { config } = wideToLongFields;

  // new mvalue name
  if (config.mvalue === null || config.mvalue.trim() === '')
    fixes.push(ERRORS.missingWideToLongMeaName);

  // factor names
  if (config.factors.some((f) => f.name.trim() === ''))
    fixes.push(ERRORS.missingWideToLongFactorName);

  // purpose values
  if (config.factors.some((f) => !Object.values(TYPES).includes(f.purpose)))
    fixes.push(ERRORS.missingWideToLongFactorPurpose);

  if (!enteredAllFactorValues(wideToLongFields))
    fixes.push(ERRORS.missingFactorValues);

  return fixes;
}

/**
 * Validate content in context of other headerView fields.
 *
 *     wtlf, [fields] -> [error]
 *
 * @function
 * @return {Array.<Error>}
 * @throws DesignError
 *
 */
function validateStructure(wideToLongFields, allFields, DEBUG) {
  const fixes = [];
  const { config } = wideToLongFields;

  const countNamePred = (input) => input !== '';
  const fieldCount = Object.keys(wideToLongFields.fields).filter(countNamePred)
    .length;
  const isInitState = fieldCount === 0;

  // validate relation between factors and fields
  try {
    if (
      !isInitState &&
      config.factors.filter((factor) => countNamePred(factor.name)).length +
        1 !==
        fieldCount
    ) {
      throw new DesignError(
        `🚧 The wideToLongFields prop is not in a valid state:\n` +
          `factor count: ${
            config.factors.filter((factor) => countNamePred(factor.name)).length
          }\n` +
          `field count (should be 1 more than factors)s:  ${
            Object.keys(wideToLongFields.fields).filter(countNamePred).length
          }\n` +
          `field count = factor count + 1?`,
      );
    }
  } catch (e) {
    if (e instanceof DesignError) console.error(e);
    else {
      throw e;
    }
  }
  /* validate the entries */
  // relevant counts
  const wtlfFactorCount = config.factors.length; // both mspan or mcomp
  const wtlfMspanCount = config.factors.filter((f) => f.purpose === TYPES.MSPAN)
    .length;
  const headerMspanCount = allFields.filter((f) => f.purpose === TYPES.MSPAN)
    .length;

  // mcomp in the wtlf (only ever an issue in this context)
  if (headerMspanCount > 0 && wtlfFactorCount === 0)
    fixes.push(ERRORS.wideToLongMissingMcomp);

  // mspan... evaluated in the global headerView context
  if (headerMspanCount === 0) fixes.push(ERRORS.missingMspan); // something wtlf could fix

  // when mspan exists in the wideToLongFields context
  if (headerMspanCount > 1 && wtlfMspanCount > 0)
    fixes.push(ERRORS.moreThanOneMspan);

  if (wtlfMspanCount === 1) {
    const mspanField = Object.values(wideToLongFields.fields).find(
      (f) => f.purpose === TYPES.MSPAN,
    );
    // ensure the time interval/format-related fields are complete
    if (!mspanField?.format && !mspanField?.time.interval.unit)
      fixes.push(ERRORS.missingTimeFormatAndInterval);
    else if (!mspanField?.format) fixes.push(ERRORS.missingTimeFormat);
    else if (
      !mspanField?.time.interval.unit ||
      !mspanField?.time.interval.count
    )
      fixes.push(ERRORS.missingTimeInterval);
  }

  return fixes;
}

export default reportHvWideToLongFixes;
