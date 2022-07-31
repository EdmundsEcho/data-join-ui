/**
 * @module /lib/filesToEtlUnits/validators/validations
 *
 * @description
 * Collection of validations for what would be 'stacked' fields.
 * i.e., compares the same field found in several headerViews.
 *
 * 👉 Validations for a field considering other fields in other headerViews
 *    that share the same alias. Said differently, in context of stacking.
 *
 * 👉 Validations of the headerView using the etlUnit construct.
 *
 * 🚫 Not intended as a stand-alone. Hosts the implementations for the
 *    indivual tests.  The package also provides a purpose-specific delegate.
 *
 */
// import isequal from 'lodash.isequal';
import {
  predictEtlUnitsFromHeaderViews as etlUnitsFromHvs,
  predictEtlUnitsFromHeaderView as etlUnitsFromHv,
} from '../transforms/etl-units';
import { selectEtlUnitsWithFieldName as lookupKeys } from '../transforms/etl-unit-helpers';

import { PURPOSE_TYPES as TYPES } from '../../sum-types';
import ERRORS from '../../../constants/error-messages';
import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const GLOBAL_DEBUG = process.env.REACT_APP_DEBUG_ERROR_FIX === 'true';
const GLOBAL_COLOR = colors.light.blue;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
/**
 *
 * 📌 Main export
 *
 * Validates the field in a 'would be stacked' condition.  i.e., compares the same
 * field found in several headerViews.
 *
 * The set of tests are chosen/delegated using the field.purpose prop.
 *
 *       :: field, hv, otherHvs -> [error]
 *
 *
 * @function
 * @param {Object} input
 * @param {FileField} input.field               - the field being updated
 * @param {HeaderView} input.hv                 - the headerView to be analyzed
 * @param {Array.<HeaderView>} input.otherHvs   - the other headerViews
 * @param {boolean=false} input.DEBUG           -
 * @returns {Array.<Object>}                    - Array of error objects
 *
 */
export const validateFieldStack = (
  hvs,
  DEBUG = GLOBAL_DEBUG,
  COLOR = GLOBAL_COLOR,
) => {
  // ---------------------------------------------------------------------------
  //
  // closure
  //
  // Store units of computation:
  // hvEtlUnits: fields -> { filename: {etlUnits} }
  // otherHvsEtlUnits: fields -> { filename: {etlUnits} }
  //
  if (DEBUG) {
    console.groupCollapsed(`✨ Cached etlUnit atoms (one for each hv) `);
    hvs.forEach((hv) => {
      console.log(`${hv.filename}`);
    });
  }
  const atoms = hvs.reduce(
    ({ hvEtlUnits, otherHvsEtlUnits }, hv) => {
      const atomKey = hv.filename;
      /* eslint-disable no-param-reassign, no-shadow */
      hvEtlUnits[atomKey] = etlUnitsFromHv(hv, DEBUG);
      otherHvsEtlUnits[atomKey] = etlUnitsFromHvs(
        hvs.filter((hv) => hv.filename !== atomKey),
        DEBUG,
      );
      /* eslint-enable no-param-reassign, no-shadow */
      return { hvEtlUnits, otherHvsEtlUnits };
    },
    { hvEtlUnits: {}, otherHvsEtlUnits: {} },
  );

  if (DEBUG) {
    console.dir(atoms);
    console.assert(Object.keys(atoms.hvEtlUnits).length === hvs.length);
    console.groupEnd();
  }

  //---------------------------------------------------------------------------
  // 🔖 configured, purpose-specific tests ready for use
  //---------------------------------------------------------------------------
  return (field) => {
    if (DEBUG) {
      console.groupCollapsed(
        `%cfield stacking validations: ${field['field-alias']}`,
        COLOR,
      );
    }

    const maybeErrors = purposeSpecificValidations(
      field['field-alias'],
      atoms.hvEtlUnits[field.filename],
      atoms.otherHvsEtlUnits[field.filename],
      DEBUG,
    )[field.purpose]();

    if (DEBUG) {
      console.log(`Validate singlePurposeAlias`);
    }

    // for all purpose values
    if (!hasSinglePuposeAlias(field, atoms.otherHvsEtlUnits[field.filename])) {
      maybeErrors.push(ERRORS.singlePurposeAlias(field['field-alias']));
    }

    console.groupEnd();

    return maybeErrors;
  };
};

//------------------------------------------------------------------------------
/**
 * ✨ Delegates purpose-specific validations (predicates)
 *
 *     🔖 io interface
 *     param: (name, etlUnits, otherEtlUnits) -> [ERROR]
 *
 *
 * ✅ Report field values that are inconsistent with the same field
 *    found in other headerViews (where same field ~ same field-alias value).
 *
 * 👍 Given if fieldA is found to work with fieldB, the reverse is true.
 *    The fixes for a field will be the same for the same field found in other
 *    headerviews.
 *
 *    ✅ Memoize field result for use by all hv in hvs.
 *
 */
function purposeSpecificValidations(name, etlUnits, otherEtlUnits /* DEBUG */) {
  //
  // 🔖 Using [] ~ maybe Error where Nothing = []
  //
  return {
    [TYPES.SUBJECT]: () => {
      // 🔖 io interface
      return !sameAsOtherSubjects(name, otherEtlUnits)
        ? [ERRORS.sameAsOtherSubjects]
        : [];
    },

    [TYPES.QUALITY]: () => [],

    [TYPES.MSPAN]: () => {
      // 🔖 io interface
      return !spanWorksWithCurrentUnits(name, etlUnits, otherEtlUnits)
        ? [ERRORS.spanWorksWithCurrentUnits]
        : [];
    },

    [TYPES.MCOMP]: () => {
      // 🔖 io interface
      return !mcompWorksWithCurrentUnits(name, etlUnits, otherEtlUnits)
        ? [ERRORS.mcompWorksWithCurrentUnits]
        : [];
    },

    [TYPES.MVALUE]: () =>
      // 🔖 io interface
      !inRelatedUnit(name, etlUnits, otherEtlUnits)
        ? [ERRORS.inRelatedUnit]
        : [],
  };
}
/**
 * Predicate
 * Returns false when another field with the same alias has a different purpose.
 *
 */
function hasSinglePuposeAlias(field, otherHvsEtlUnits) {
  // map name:purpose
  const mklookup = (etlUnit) => {
    const map = {};
    map[etlUnit.subject] = TYPES.SUBJECT;
    if (etlUnit.type === TYPES.QUALITY) {
      map[etlUnit.quality] = TYPES.QUALITY;
    } else {
      map[etlUnit.mspan] = TYPES.MSPAN;
      etlUnit.mcomps.forEach((mcomp) => {
        map[mcomp] = TYPES.MCOMP;
      });
    }
    return map;
  };

  const fieldName = field['field-alias'];

  const predicate = (etlUnit) => {
    const purposeTbl = mklookup(etlUnit);
    return fieldName in purposeTbl
      ? field.purpose === purposeTbl[fieldName]
      : true;
  };

  return Object.values(otherHvsEtlUnits).every(predicate);
}
/**
 * Core stacking requirement
 *
 * 🔖 interface hv, otherHvs
 *
 * Test for same name as other subjects across files
 *
 *     :: (name, otherHvs) -> Bool
 *
 * 👍 Missing subjects are ignored.
 *
 */
function sameAsOtherSubjects(subjectName, otherEtlUnits) {
  // predicate
  const sameSubject = (etlUnit) => {
    return (
      etlUnit?.subject === null || (etlUnit?.subject === subjectName ?? true)
    );
  };
  return Object.values(otherEtlUnits).every(sameSubject);
}
//------------------------------------------------------------------------------
/**
 * Predicate
 * returns true when ok.
 * mspan validation; returns true when mspan fields have the same field-alias
 *
 * 🔖 interface hv, otherHvs
 *
 * @function
 */
function spanWorksWithCurrentUnits(fieldName, etlUnits, otherEtlUnits) {
  const potentialUnits = etlUnits;
  const currentUnits = otherEtlUnits;

  // the predicate
  const isSameSpan = (potentialUnit, currentUnit) => {
    // If either of the spans are null there is nothing to compare
    if (potentialUnit == null || currentUnit == null) {
      return true;
    }

    return potentialUnit.mspan === currentUnit.mspan;
  };

  return lookupKeys(fieldName, potentialUnits).reduce((acc, pUnitKey) => {
    return (
      acc &&
      isSameSpan(
        potentialUnits[pUnitKey], // where the etlUnits share a codomain...
        currentUnits[pUnitKey],
      )
    );
  }, true); // [p codomain] -> (unit -> unit -> Bool) -> Bool
}
/**
 * Predicate
 * Returns true when the etlUnit::measurement has a subset mix of components.
 *
 * 🔖 interface hv, otherHvs
 *
 *
 * @function
 */
function mcompWorksWithCurrentUnits(fieldName, etlUnits, otherEtlUnits) {
  const potentialUnits = etlUnits;
  const currentUnits = otherEtlUnits;

  // p ~ potential unit
  return lookupKeys(fieldName, potentialUnits) // name -> [p codomain]
    .reduce(
      (acc, punitKey) =>
        acc &&
        hasRelatedComps(potentialUnits[punitKey], currentUnits[punitKey]),
      true,
    ); // [p codomain] -> (unit -> unit -> Bool) -> Bool
}

/**
 * Predicate
 * mvalue validation
 *
 * 🔖 interface hv, otherHvs
 *
 * Assess relationship between etlUnits::mvalue using the mix of mcomps. mspan
 * is ignored.
 *
 * relatedUnits === true when [mcomps1] :< [mcomps2] or vice versa.
 *
 * @function
 *
 */
function inRelatedUnit(fieldName, etlUnits, otherEtlUnits) {
  const potentialEtlUnit = etlUnits[fieldName];
  const currentEtlUnit = otherEtlUnits[fieldName]; // key::codomain

  // note: ignores mspan name
  // going from different mvalue, could have different mspan
  // ... change to same mvalue, then mspan must be the same.
  // So, change mspan of potential == mspan current (thus `matchSpan`)
  return hasRelatedComps(potentialEtlUnit, currentEtlUnit);
}

//------------------------------------------------------------------------------
//
// Individual headerView tests (not in context of other hvs)
//
// Utilized by headerview-etlunit-fixes.js
//
// 👍 Not organized by purpose because it looks at fields in view of etlUnits.
//
// 👍 ERRORS are *not* set here; caller sets the ERRORS/fix
//    (in contrast to purpose-specific stack tests)
//
//------------------------------------------------------------------------------
/**
 * All field types
 * Returns true when ok.
 *
 *     [field] | HeaderView -> bool
 *
 * @function
 * @param {hv: HeaderView, allFields: Array<Field>}
 * @return {boolean}
 */
export const hasUniqueFieldNames = (allFields) => {
  const names = allFields.map((field) => field['field-alias']);
  return names.length === new Set(names).size;
};

/**
 * subject
 * Returns true when ok.
 *
 * @function
 * @param {FileFields} allFields
 * @return {boolean}
 */
export function exactlyOneSubject(allFields) {
  return allFields.filter((f) => f.purpose === 'subject').length === 1;
}

/**
 * mspan
 * (moot when an mvalue does not exist)
 * Returns true when ok.
 *
 * ⬜ This may be redundant given other etlUnit tests.
 *
 * @function
 * @param {FileFields} allFields
 * @return {boolean}
 */
export const exactlyOneMspan = (allFields) =>
  allFields.find((field) => field.purpose === TYPES.MVALUE)
    ? allFields.filter((f) => f.purpose === 'mspan').length === 1
    : true;

/**
 * mcomp
 * Returns true when ok.
 * Orphan condition: mcomp > 0, mvalue == 0
 *
 * @function
 * @param {FileFields} allFields
 * @return {boolean}
 */
export const noOrphanMcomp = (allFields) => {
  return !(
    allFields.find((field) => field.purpose === TYPES.MCOMP) &&
    !allFields.find((field) => field.purpose === TYPES.MVALUE)
  );
};

/**
 * presence of at least one etlUnit
 * Returns true when ok.
 *
 * @function
 * @param {FileFields} allFields
 * @return {boolean}
 */
export const hasAtLeastOneEtlUnit = (allFields) =>
  allFields.filter((field) => field.purpose === TYPES.QUALITY).length +
    allFields.filter((field) => field.purpose === TYPES.MVALUE).length >
  0;

/**
 * Null values are not always required.  When they are, we call that out.
 *
 * Returns an empty array when ok.
 *
 * @function
 * @param {FileFields} allFields
 * @return {Array<string>}
 */
export const missingNullValues = (allFields) =>
  allFields
    .filter(
      (field) =>
        field['null-value-count'] > 0 &&
        field['null-value'] === null &&
        (field.purpose === TYPES.QUALITY || field.purpose === TYPES.COMPONENT),
    )
    .map((field) => field['field-alias']);

//------------------------------------------------------------------------------
// Implied mvalue
/**
 * Returns true when ok.
 *
 */
export const hasMvalueName = (hv) => {
  if (Object.keys(hv).includes('implied-mvalue')) {
    return hv['implied-mvalue'].config?.mvalue !== '' ?? false;
  }
  return true;
};
//------------------------------------------------------------------------------
// Wide-to-long specific validations
/**
 *
 * Similar to hasUniqueFieldNames, but considers the specifics
 * of the wideToLongFields configuration property.
 *
 * Resolves where the name clash is occuring within the more complex wtlf.
 * i.e., RAW, factor name, or mvalue name.
 *
 * Returns maybeError:  specific ERROR | undefined when ok.
 *
 * @function
 * @param {Object} args
 * @param {string} args.mvalueName
 * @param {Array<Factor>} args.factors
 * @param {Array<FileFields>} args.allFields
 * @return {Object}
 */
export const maybeNameClashError = ({ mvalueName, factors, allFields }) => {
  const factorNames = factors.map((factor) => factor.name);
  const fieldNames = allFields.map((field) => field['field-alias']);

  const factorNamesOk = factorNames.length === new Set(factorNames).size;
  const mvalueNameOk = !factorNames.includes(mvalueName);
  const fieldNamesOk = fieldNames.length === new Set(fieldNames).size;

  // 🚨 the first one must be prevented
  // (factors with same names, separate call to maybeFactorNameClashError)
  if (!factorNamesOk) return ERRORS.invalidFactorNameFactorClash;
  if (!mvalueNameOk) return ERRORS.invalidFactorNameMvalueClash;
  if (!fieldNamesOk) return ERRORS.hasUniqueFieldNames;

  return undefined;
};
/**
 * Wide-to-long factor avoids name clash
 * (within the wtlf namespace)
 *
 * Returns undefined when ok.
 *
 * @function
 * @param {Object} args
 * @param {string} args.tryName
 * @param {string} args.mvalueName
 * @param {Array<Factor>} args.factors
 * @return {?Object} The app fix/error object
 */
export const maybeFactorNameClashError = ({ tryName, mvalueName, factors }) => {
  if (tryName === mvalueName) return ERRORS.invalidFactorNameMvalueClash;
  if (factors.map((factor) => factor.name).includes(tryName))
    return ERRORS.invalidFactorNameFactorClash;
  return undefined;
};
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
/**
 * Utility (local)
 *
 * Used to test if [mcomp] can be made to relate to the other.
 * Note: the test returns false if either of the arrays have duplicate values.
 */
function isSubset(a1, a2) {
  const set2 = new Set(a2);

  return (
    a1.length === new Set(a1).size && // false when duplicates exist
    a2.length === set2.size && // false when duplicates exist
    ![...a1].filter((e) => !set2.has(e)).length // false when diff is not empty
  );
}
/**
 * Utility
 *
 * hasRelatedComps
 * Related ~ relation = units have subset components
 *
 * 🦀 The backend does not yet support reducing the smaller
 *    set of components to create a match.
 *
 * @function
 * @param {EtlUnit} etlUnit1
 * @param {EtlUnit} etlUnit2
 * @return {boolean}
 */
function hasRelatedComps(etlUnit1 = null, etlUnit2 = null) {
  if (etlUnit1 === null) {
    return true;
  }

  // ~ monoidal, return true when compared to undefined
  if (etlUnit2 === null) {
    return true;
  }

  const { mcomps: mcomps1 = null } = etlUnit1;
  const { mcomps: mcomps2 = null } = etlUnit2;

  if (mcomps1 === null || mcomps2 === null) {
    return true;
  }

  return isSubset(mcomps1, mcomps2) || isSubset(mcomps2, mcomps1);
}

//------------------------------------------------------------------------------
// Export for testing only
export const testOnlyExports = {
  hasRelatedComps,
};

/**
 * mcomp validation
 *
 * Key question: Do the potential etlUnits fit with the current etlUnits
 *   nrx [mcomps1] (in current headers)
 *   nrx [mcomps2] (in potential header)
 *   -> bad when mcomps1 != mcomps2
 *
 * given: etlUnit::mvalue is a function
 *
 * :: (subject, mspan, [mcomp]) -> mvalue
 *
 * For every etl-unit of type mvalue, where the codomain match in the
 * current etl-units, are the mcomps relatable? Must be true to be a valid
 * alias (note how we ignore mspan).
 *
 * mspan: if same codomain and mcomps are relatable, then mspan must be the
 * same.
 *
 */
