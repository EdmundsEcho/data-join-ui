// src/lib/filesToEtlUnits/remove-etl-field.js

/**
 * @module lib/filesToEtlUnits/remove-etl-field
 *
 * @description
 * Remove an etlField (seperate from removing a derived etlField)
 *
 * @category Lib
 */
import { updateField as updateRawField } from './update-field';
import { deleteReplace } from './headerview-helpers';
import { findAndSeedDerivedFields } from './transforms/find-derived-fields';
import {
  isMspan,
  isTheOnlyEtlUnit,
  selectRelatedRemovableFields,
  selectEtlUnitWithName,
} from './transforms/etl-unit-helpers';
import {
  getFactorIdFromName,
  updateWideToLongFields,
} from './transforms/wide-to-long-fields';
import { InvalidStateError } from '../LuciErrors';

import { PURPOSE_TYPES as PURPOSE } from '../sum-types';
import ERRORS from '../../constants/error-messages';
import { colors } from '../../constants/variables';

// re-export -> single access point for remove-etl-field
export { removeDerivedField } from './etl-from-pivot';

//------------------------------------------------------------------------------
const GLOBAL_DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
//------------------------------------------------------------------------------
const COLOR = colors.light.purple;
//------------------------------------------------------------------------------
/* eslint-disable no-console */
//------------------------------------------------------------------------------

/**
 *
 * 📌 Remove an etl-field
 *
 *
 *    config: ({ hvsSelector,
 *               etlFieldChangesSelector,
 *               etlUnitsSelector,
 *               DEBUG = GLOBAL_DEBUG, })
 *
 *    usage: ({ removeFieldWithName, purpose, etlUnit, state })
 *
 *
 *
 * The approach: update the headerViews before applying pivot and etlFromPivot
 * to recompute the etlObject.
 *
 * 🚫 To avoid corrupting the configuration:
 *    🛈  Cannot be the only etlUnit
 *    ✅ Cannot be mspan without removing the etlUnit
 *
 * ✅ For each headerView:
 *    Find/change field.enabled -> false
 *
 * 🔖 Use removeDerivedField from etl-from-pivot for derived etlFields
 *    (re-exported here)
 *
 * 🦀 Needs to scan only those hvs within hvs, that are relevant for
 *    the etlUnit.  Right now, it deletes all etlUnits with an mspan
 *    with the same name. Possible, because unique name is only enforced
 *    at the headerview scope.
 *
 * Three types of field structures:
 *
 *    👉 Implied
 *    👉 Wide
 *    👉 Raw
 *
 * @function
 * @throws InputError
 *
 * @param {Object} cfg
 * @param {Array.<Array<string,string>>} cfg.etlFieldNameAndPurposeValues
 * @param {?Function} cfg.hvsSelector hvs extraction from state
 * @param {Object.<string, any} state
 * @param {String} oldValue
 * @param {String} newValue Must be unique in the collection of etlField names
 * @return {{headerViews, etlFieldChanges}}
 *
 */
export function removeNonDerivedEtlField({
  hvsSelector,
  etlFieldChangesSelector,
  etlUnitsSelector,
  DEBUG = GLOBAL_DEBUG,
}) {
  // closure
  if (DEBUG) {
    console.log(`%cInitializing remove-etl-field (for non-derived)`, COLOR);
  }

  // Workhorse
  // return a configured function for use by the caller
  //
  // 👍 The callback returns a value only when changes were made.
  //
  // @function
  // @return { headerViews: maybe value, etlFieldChanges: maybe value }
  return ({ fieldName, state }) => {
    const hvs = hvsSelector(state);
    const etlChanges = etlFieldChangesSelector(state);
    const etlUnits = etlUnitsSelector(state);
    const etlUnit = selectEtlUnitWithName(fieldName, etlUnits);

    // ⬜ figure out what is error, usefull?
    // 🦀 This needs to perform the check without derived-fields
    const { safe } = safeToRemove(fieldName, etlUnits)
      .notTheOnlyEtlUnit(etlUnits)
      .willNotInvalidateEtlUnit(etlUnits)
      .return();

    switch (true) {
      // Scenario: invalid change
      case !safe: {
        throw new InvalidStateError(
          `Failed to remove the etl field ${fieldName}`,
        );
      }

      // Scenario: Remove a derived field
      // 🔖 other field changes trigger a call to pivot which includes
      //    updates to etlFieldChanges prop
      case fieldName in etlChanges.__derivedFields: {
        return {
          headerViews: undefined,
        };
      }

      // Scenario: Remove a field
      default:
        if (DEBUG) {
          console.log(`%cRemoving a regular etl field: ${fieldName}`, COLOR);
        }
        return {
          // headerViews update triggers an update to etlView?
          headerViews: disableFieldStackInHvs(fieldName, etlUnit, hvs, DEBUG),
        };
    }
  };
}
/**
 * local utility
 *
 * Return updated headerViews
 *
 * @function
 * @return {HeaderViews}
 */
function disableFieldStackInHvs(
  disableFieldName,
  etlUnit,
  hvs,
  DEBUG = GLOBAL_DEBUG,
) {
  //---------------------------------------------------------------------------
  // closure for repeated use whilst reducing hvs
  //---------------------------------------------------------------------------
  const disableFields = selectRelatedRemovableFields(
    disableFieldName,
    etlUnit,
    DEBUG,
  );
  const disablePredicate = (field) =>
    disableFields.includes(field['field-alias']);
  //
  if (DEBUG) {
    console.log(
      `%cfields: ${disableFieldName}\nrelated fields in etlUnit: ${JSON.stringify(
        disableFields,
      )}`,
      colors.red,
    );
    console.log(`%cetlUnit`, colors.red);
    console.dir(etlUnit);
  }

  //---------------------------------------------------------------------------
  // routine for hv.fields
  //---------------------------------------------------------------------------
  // returns { fields, isMutated }
  // updateField({ readOnlyField: field, key, value, DEBUG }) {
  // const { field: newField, staleDerivedFields } = updateField
  const processRawFields = (fields) => {
    // sub-routine
    function disableRawField(field) {
      /* eslint-disable no-shadow */
      const result = updateRawField({
        readOnlyField: field,
        key: 'enabled',
        value: false,
        DEBUG,
      }).field;
      if (DEBUG) {
        console.log(`%cenabled prop set to: ${result.enabled}`, colors.red);
        console.dir(result);
      }
      return result;
      /* eslint-enable no-shadow */
    }
    //-------------------------------------------------------------------------
    const result = fields.reduce(
      /* eslint-disable no-shadow */
      ({ fields, mutated }, field) =>
        disablePredicate(field)
          ? {
              mutated: true,
              fields: deleteReplace(
                fields,
                field['header-idx'],
                disableRawField(field),
              ),
            }
          : { fields, mutated },
      { fields, mutated: false },
      /* eslint-enable no-shadow */
    );
    //-------------------------------------------------------------------------

    if (DEBUG) {
      console.log(`%c👉 disable result for hv: ${fields[0].filename}`, COLOR);
      console.dir(result);
    }
    return result;
  };

  //---------------------------------------------------------------------------
  // subroutine for hv.wideToLongFields
  //---------------------------------------------------------------------------
  // returns { wtlf, isMutated } with whatever changes required
  const processWideFields = (wtlf) =>
    Object.values(wtlf.fields).reduce(
      /* eslint-disable no-shadow */
      ({ wtlf: newWtlf, mutated, hasFactors }, field) => {
        return disablePredicate(field) && field.purpose !== PURPOSE.MVALUE
          ? {
              mutated: true,
              wtlf: updateWideToLongFields({
                readOnlyWideToLongFields: newWtlf,
                userInput: {
                  command: 'REMOVE_FACTOR', // performs all of the required changes
                  factorId: getFactorIdFromName(field['field-alias'], wtlf),
                },
              }),
              // 🔖 considers the 'to be' value following REMOVE_FACTOR
              hasFactors: newWtlf.config.factors?.length > 1 ?? false,
            }
          : { wtlf: newWtlf, mutated, hasFactors };
      },
      { wtlf, mutated: false, hasFactors: true },
      /* eslint-enable no-shadow */
    );

  const disableMvalues = (fields) =>
    fields.map((field) =>
      field.purpose === PURPOSE.MVALUE ? { ...field, enabled: false } : field,
    );

  //---------------------------------------------------------------------------
  /* eslint-disable-next-line no-shadow */
  return Object.values(hvs).reduce((hvs, hv) => {
    //----------------------------------------------------------------------
    // three header scenarios
    //
    // 1. RAW only
    //    - change fields from enabled = true -> false
    //
    // 2. RAW with impliedMvalue
    //    - etlUnit::measurement: change RAW etlUnit components enabled
    //    - etlUnit::quality (see RAW only)
    //
    // 3. RAW with wideToLongFields
    //    - etlUnit::measurement:
    //        removing all factors
    //        ? change RAW mvalues enabled
    //        : wtlf only
    //
    //    - etlUnit::quality NA

    // update-field field-alias
    let newHvAcc = {};
    let hvMutated = false; // enable conditional ref changes
    const setLatchedMutated = (mutated) => {
      return hvMutated ? true : mutated;
    };

    // for each field in the hv, disable with configured disablePredicate
    const { fields, mutated } = processRawFields(hv.fields);
    hvMutated = setLatchedMutated(mutated);
    newHvAcc = hvMutated ? { ...hv, fields } : hv;

    if ('wideToLongFields' in hv) {
      /* eslint-disable-next-line no-shadow */
      const { wtlf, mutated, hasFactors } = processWideFields(
        hv.wideToLongFields,
      );
      hvMutated = setLatchedMutated(mutated);
      switch (true) {
        // updated wtlf that still encodes at least one factor
        case mutated && hasFactors:
          console.log(`NOT HERE!`);
          newHvAcc = { ...hv, wideToLongFields: wtlf };
          break;
        // updated wtlf that no longer encodes any factors; disable series
        case mutated && !hasFactors: {
          console.log(`ARE YOU HERE?`);

          newHvAcc = { ...hv, fields: disableMvalues(hv.fields) };
          break;
        }
        // no wtlf changes
        case !mutated:
          break;
        default:
          break;
      }
    }

    if ('impliedMvalue' in hv) {
      /* nothing remaining to do */
    }
    /* eslint-disable-next-line no-param-reassign */
    hvs[hv.filename] = hvMutated
      ? findAndSeedDerivedFields({
          hv: newHvAcc,
          previousHvFields: [], // force a scan
          DEBUG,
          COLOR,
        })
      : hv;
    return hvs;
  }, {});
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
/**
 * Chain of tests to validate the request
 *
 * ✅ mspan treated the same as removing mvalue.
 *
 * @param {string} removeName
 * @param {Object} etlUnits
 * @return {Closure}
 */
function safeToRemove(removeName, etlUnits, disableMspan = true) {
  let error;
  const safe = typeof error === 'undefined';
  const closure = {
    notTheOnlyEtlUnit: () => {
      if (isTheOnlyEtlUnit(removeName, etlUnits)) {
        error = ERRORS.hasAtLeastOneEtlUnit;
      }
      return closure;
    },
    willNotInvalidateEtlUnit: () => {
      if (disableMspan && isMspan(removeName, etlUnits)) {
        error = ERRORS.missingMspan;
      }
      return closure;
    },
    safe: () => safe,
    return: () => ({ safe, error }),
  };
  return closure;
}
//------------------------------------------------------------------------------

export default removeNonDerivedEtlField;
