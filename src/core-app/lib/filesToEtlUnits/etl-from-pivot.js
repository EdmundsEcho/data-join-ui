// src/lib/filesToEtlUnits/etl-from-pivot.js

/**
 *
 * @module lib/filesToEtlUnits/etl-from-pivot
 *
 * @description
 * Support for computing the etlObject including in a "backtracking" context.
 *
 * 🔖 This is the logical place to encapsulate adjusting
 *    the configuration in context of all of the etlFields.  For instance,
 *    the span's rangeStart with the global time/reference/idx value.
 *    ⬜ review and refactor as required.
 *
 * This is the second step in this two-step process:
 *  1️⃣ pivot: hvs -> computedEtlObject
 *  2️⃣ computedEtlObject -> etlObject
 *
 * The depency on the etl.reducer is the inherent understanding of
 * the dynamics by definition of how the UI is designed.
 *
 * ⬜ null-value-expansion for mcomp; generally no, but always so?
 *    From a derived group-by-file it seems like it may be useful.
 *
 * ⬜ decrease the size of objects: e.g., sources includes levels and
 *    replicated in many places.
 *
 * The computedEtlObject is sourced by the headerViews prop; raw file
 * data. Thus, the scope does not include
 *
 * 1. the "group-by-file" information
 * 2. any changes made in the etlView prior to the backtracking event
 *
 * This construct thus needs to be augmented accordingly.
 *
 * ⬜ Is this still outstanding: when sources is in the changes object,
 *    the list of sources does not change in response to changes in the
 *    alias-names. ComputedEtlObject keeps getting over-written.
 *
 */

import {
  maybeGroupByFileEtlUnitProp,
  maybeGroupByFileFilesProp,
  remakeDerivedEtlField,
  setGroupByFileIdxProp,
} from './create-etl-field';
import {
  fieldNamesFromUnits,
  tryCreateOrUpdateEtlUnit,
} from './transforms/etl-units';
import { setGlobalRef } from './transforms/span/reference';
import { removeProp, mapFromArray } from './headerview-helpers';
import { PURPOSE_TYPES as TYPES } from '../sum-types';
import { InputError, InvalidStateError } from '../LuciErrors';
import { colors } from '../../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_ETL_FROM_PIVOT === 'true';
// const DEBUG = true;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
/**
 * Synonym and likely better over-all name for the function with type:
 *
 *     computed etlObject -> etlObject with etl changes applied
 *
 * @function
 * @return {Object} Chain of functions
 */
export const applyEtlFieldChanges = etlFromPivot;
//------------------------------------------------------------------------------
/**
 *
 * 📌 Top-level export
 *
 * Augment the headerViews/pivot etlObject
 * 1. Re-introduce any derived fields from the etlView UI
 * 2. Re-instate any etlUnit configurations made prior
 *    to the backtrack event
 * 3. Return an updated etlObject and with the change record
 *
 * @function
 * @return {Object} Chain of functions
 *
 */
export function etlFromPivot() {
  let etlObject; // initial value = computed from pivot
  let etlFieldChanges;

  const closure = {
    init: (etlObjFromPivot, etlFieldChangesFromState) => {
      if (DEBUG) console.group(`%cetlFromPivot init`, colors.blue);

      etlObject = etlObjFromPivot;
      etlFieldChanges = etlFieldChangesFromState;

      if (!validateEtlObject(etlObject)) {
        throw new InvalidStateError(`The etlObject is invalid`);
      }
      if (DEBUG) {
        console.dir(etlObject.etlFields);
        console.dir(etlFieldChanges);
      }
      return closure;
    },

    resetEtlObject: (removeField) => {
      if (DEBUG) console.debug(`%cresetEtlObject`, colors.blue);
      ({ etlObject, etlFieldChanges } = resetEtlObject(
        etlObject,
        etlFieldChanges,
      ));
      if (typeof removeField !== 'undefined')
        ({ etlObject, etlFieldChanges } = removeDerivedField(removeField, {
          etlObject,
          etlFieldChanges,
        }));
      if (DEBUG) {
        console.dir(etlObject.etlFields);
        console.dir(etlFieldChanges);
      }
      return closure;
    },

    removeDerivedField: (fieldName) => {
      if (DEBUG)
        console.debug(`%cremoveDerivedField: ${fieldName}`, colors.blue);
      ({ etlObject, etlFieldChanges } = removeDerivedField(fieldName, {
        etlObject,
        etlFieldChanges,
      }));
      if (DEBUG) {
        console.dir(etlObject.etlFields);
        console.dir(etlFieldChanges);
      }
      return closure;
    },

    removeStalePropChanges: () => {
      if (DEBUG) console.debug(`%cremoveStalePropChanges`, colors.blue);
      ({ etlObject, etlFieldChanges } = removeStalePropChanges(
        etlObject,
        etlFieldChanges,
      ));
      if (DEBUG) {
        console.dir(etlObject.etlFields);
        console.dir(etlFieldChanges);
      }
      return closure;
    },

    removeStaleDerivedFields: () => {
      if (DEBUG) console.debug(`%cremoveStaleDerivedFields`, colors.blue);
      ({ etlObject, etlFieldChanges } = removeStaleDerivedFields(
        etlObject,
        etlFieldChanges,
      ));
      if (DEBUG) {
        console.dir(etlObject.etlFields);
        console.dir(etlFieldChanges);
      }
      return closure;
    },

    // reinstateDerivedFields(etlObject, derivedFields, fieldPropChanges)
    addDerivedFields: () => {
      if (DEBUG) console.debug(`%caddDerivedFields`, colors.blue);
      ({ etlObject, etlFieldChanges } = reinstateDerivedFields(
        etlObject,
        etlFieldChanges,
      ));
      if (DEBUG) {
        console.dir(etlObject.etlFields);
        console.dir(etlFieldChanges);
      }
      return closure;
    },

    // function applySourceReadInSequence({ etlObject, etlFieldChanges  }) {
    applySourceSequences: () => {
      if (DEBUG) console.debug(`%capplySourceSeq`, colors.blue);
      ({ etlObject, etlFieldChanges } = applySourceReadInSequence(
        etlObject,
        etlFieldChanges,
      ));
      if (DEBUG) {
        console.dir(etlObject.etlFields);
        console.dir(etlFieldChanges);
      }
      return closure;
    },

    // function applyEtlFieldPropConfigs({ computedEtlObject, etlFieldChanges }) {
    // 🦀 It seems possible for the user to update reference (read-only)
    applyFieldProps: () => {
      if (DEBUG) console.debug(`%capplyFieldProps`, colors.blue);
      ({ etlObject, etlFieldChanges } = applyEtlFieldPropConfigs(
        etlObject,
        etlFieldChanges,
      ));
      if (DEBUG) {
        console.dir(etlObject.etlFields);
        console.dir(etlFieldChanges);
      }
      return closure;
    },

    setGlobalSpanRef: () => {
      if (DEBUG) console.debug(`%csetGlobalSpanRef`, colors.blue);
      ({ etlObject, etlFieldChanges } = setGlobalSpanRef(
        etlObject,
        etlFieldChanges,
      ));
      if (DEBUG) {
        console.dir(etlObject.etlFields);
        console.dir(etlFieldChanges);
        console.groupEnd();
      }
      return closure;
    },
    return: () => ({
      etlObject,
      etlFieldChanges,
    }),
  };
  return closure;
}

/**
 * @function
 *
 */
function applyEtlFieldPropConfigs(etlObject, etlFieldChanges) {
  //
  if (typeof etlFieldChanges === 'undefined' || etlFieldChanges?.length === 0) {
    return {
      etlObject,
      etlFieldChanges,
    };
  }

  // filter/predicate to reduce stale changes to relevant changes
  const relevantChangesSet = new Set([
    ...Object.keys(etlObject.etlFields),
    ...Object.keys(etlFieldChanges.__derivedFields), // ? for missing derivedFields
  ]);

  // ✅ apply the key/value changes organized by fieldName
  // ✅ remove stale keys from the changes object/map
  // 🦀 Possible name clash with derivedFields.
  // ⬜ use $LuciMETA prefix
  const { fieldsSomeWithUserInput, relevantChanges } = Object.keys(
    etlFieldChanges,
  ).reduce(
    /* eslint-disable-next-line */
    ({ fieldsSomeWithUserInput, relevantChanges }, fieldName) => {
      if (relevantChangesSet.has(fieldName)) {
        /* eslint-disable-next-line */
        fieldsSomeWithUserInput[fieldName] = {
          ...fieldsSomeWithUserInput[fieldName], // << computed version
          ...etlFieldChanges[fieldName], // << user input
        };
        /* eslint-disable-next-line */
        relevantChanges[fieldName] = etlFieldChanges[fieldName];
      }
      return { fieldsSomeWithUserInput, relevantChanges };
    },
    {
      fieldsSomeWithUserInput: etlObject.etlFields, // << start with computed
      relevantChanges: {
        __derivedFields: etlFieldChanges.__derivedFields || {},
      }, // ⚠️
    },
  );

  return {
    etlObject: {
      etlUnits: etlObject.etlUnits,
      etlFields: fieldsSomeWithUserInput,
    },
    etlFieldChanges: relevantChanges,
  };
}

/**
 *
 * @function
 * @param {String} fieldName Derived group-by-file to remove
 * @param {Object} etlState State with etlFieldChanges and etlObject
 * @param {Object.<string,(string|number|Object)>} etlState.etlFieldChanges
 * @param {{etlFields: {Object}, etlUnits: {Object}}} etlState.etlObject
 * @returns {Object} etlState State with removed field
 */
export function removeDerivedField(fieldName, { etlFieldChanges, etlObject }) {
  //
  // 🚧 In flux: Can a group-by-file field be a fragment/source
  //    to a non-group-by-file field?
  //

  let etlUnits = removeProp(fieldName, etlObject.etlUnits);

  // when purpose = mcomp, remove from etlUnits is more involved
  if (etlObject.etlFields[fieldName]?.purpose === TYPES.MCOMP) {
    const etlUnitsArr = Object.values(etlUnits);

    etlUnits = etlUnitsArr
      .filter((etlUnit) => etlUnit.type === TYPES.MVALUE)
      .reduce(
        (units, etlUnit) => {
          /* eslint-disable-next-line no-param-reassign */
          units[etlUnit.codomain] = {
            ...etlUnit,
            mcomps: etlUnit.mcomps.filter((mcomp) => mcomp !== fieldName),
          };
          return units;
        },
        mapFromArray(
          etlUnitsArr.filter((etlUnit) => etlUnit.type !== TYPES.MVALUE),
          'codomain',
        ),
      );
  }

  return {
    etlObject: {
      etlUnits,
      etlFields: removeProp(fieldName, etlObject.etlFields),
    },
    etlFieldChanges: {
      // clean-away changes
      ...removeProp(fieldName, etlFieldChanges || {}),
      // clean away the field itself
      __derivedFields: removeProp(
        fieldName,
        etlFieldChanges?.__derivedFields ?? {},
      ),
    },
  };
}

/**
 * 📌
 *
 * form seed data -> mkDerived -> remakeDerived
 *
 * Implied/Derived Etl field
 *
 * This is relevant when the UI adds a field informed by the group-by-file,
 * or when re-rendering following a backtracking event.
 *   * mcomp -> etlField:mcomp and stored within a etlUnit:mvalues
 *   * qual  -> etlField:quality and stored as a etlUnit:qual
 *
 * @function
 * @param {object} field
 * @param {object} etlState State with etlFieldChanges and etlObject
 * @returns {object} etlFieldChanges and etlObject
 */
export const addDerivedField = (fieldData, { etlFieldChanges, etlObject }) => {
  if (!('etlUnits' in etlObject)) {
    throw new InputError(`addDerivedField requires a valid etlObject`);
  }

  // group-by-file information:
  const { subjectName, field: newEtlField } = remakeDerivedEtlField(
    fieldData,
    etlObject.etlFields,
    'returnSubjectName',
  );

  return {
    etlFieldChanges: {
      ...etlFieldChanges,
      __derivedFields: {
        ...etlFieldChanges.__derivedFields,
        [newEtlField.name]: newEtlField,
      },
    },
    etlObject: {
      etlUnits: {
        ...etlObject.etlUnits,
        ...(tryCreateOrUpdateEtlUnit(
          subjectName,
          etlObject.etlUnits,
          newEtlField,
        ) || {}),
      },
      etlFields: {
        ...etlObject.etlFields,
        [newEtlField.name]: newEtlField,
      },
    },
  };
};

/**
 * Updates the computation with a new span reference
 * etl state -> etl state
 *
 * 🦀 This may not be setting the reference according to the isoFormat.
 *
 * @function
 *
 * @param {{etlObject: {object}, etlFieldChanges: {object}}
 * @return {{etlObject: {object}, etlFieldChanges: {object}}
 *
 */
function setGlobalSpanRef({ etlFields, etlUnits }, etlFieldChanges) {
  return {
    etlFieldChanges,
    etlObject: {
      etlUnits,
      etlFields: setGlobalRef(etlFields),
    },
  };
}

/**
 * Return the etlObject to the pivot(hvs) value
 * 👍 without running pivot
 *
 * ✅ remove derived fields from the etlObject
 *
 * @function
 * @param {{etlObject: {object}, etlFieldChanges: {object}}
 * @return {{etlObject: {object}, etlFieldChanges: {object}}
 *
 */
function resetEtlObject(etlObject, etlFieldChanges) {
  if (!hasDerivedFields(etlFieldChanges)) return { etlObject, etlFieldChanges };
  // return the etlObject to a computed value without derived fields
  return {
    etlFieldChanges,
    etlObject: {
      etlUnits: removeProp(
        Object.keys(etlFieldChanges.__derivedFields),
        etlObject.etlUnits,
      ),
      etlFields: removeProp(
        Object.keys(etlFieldChanges.__derivedFields),
        etlObject.etlFields,
      ),
    },
  };
}

function removeStalePropChanges(etlObject, etlFieldChanges) {
  const activeFields = new Set([
    ...Object.keys(etlObject.etlFields),
    ...Object.keys(etlFieldChanges.__derivedFields),
  ]);
  const fieldChanges = Object.keys(etlFieldChanges).reduce(
    (activeChanges, fieldName) => {
      if (activeFields.has(fieldName))
        /* eslint-disable-next-line no-param-reassign */
        activeChanges[fieldName] = etlFieldChanges[fieldName];
      return activeChanges;
    },
    {},
  );
  fieldChanges.__derivedFields = etlFieldChanges.__derivedFields;
  return {
    etlObject,
    etlFieldChanges: fieldChanges,
  };
}

function removeStaleDerivedFields(etlObject, etlFieldChanges) {
  if (!hasDerivedFields(etlFieldChanges)) return { etlObject, etlFieldChanges };

  const tryWithNewEtlUnitsFn = maybeGroupByFileEtlUnitProp(etlObject.etlUnits);
  const tryWithNewSourcesFn = maybeGroupByFileFilesProp(etlObject.etlFields);
  const withFieldIdxFn = setGroupByFileIdxProp(etlObject.etlFields);

  /* eslint-disable no-param-reassign */
  return {
    etlObject,
    etlFieldChanges: {
      ...etlFieldChanges,
      __derivedFields: Object.values(etlFieldChanges.__derivedFields)
        .map((groupByFileField) => tryWithNewEtlUnitsFn(groupByFileField))
        .map((groupByFileField) => tryWithNewSourcesFn(groupByFileField))
        .filter((field) => field !== null)
        .map((groupByFileField) => withFieldIdxFn(groupByFileField))
        .reduce((fields, field) => {
          // array -> object
          fields[field.name] = field;
          return fields;
        }, {}),
    },
  };
  /* eslint-enable no-param-reassign */
}

function hasDerivedFields(etlFieldChanges) {
  return Object.keys(etlFieldChanges?.__derivedFields ?? {}).length > 0;
}

/**
 * Scope etlObject and __derivedFields
 *
 * 👎 the etlFieldChanges update is likely redundant but...
 * 👍 re-uses the addDerivedField code used when first creating the field.
 * 👍 consistent interface with other functions in the chain
 *
 * @function
 */
export function reinstateDerivedFields(etlObject, etlFieldChanges) {
  // nothing to do when...
  if (!hasDerivedFields(etlFieldChanges)) {
    return {
      etlObject,
      etlFieldChanges,
    };
  }

  // export const addDerivedField = (field, { etlFieldChanges, etlObject }) => {
  return Object.values(etlFieldChanges.__derivedFields).reduce(
    /* eslint-disable-next-line */
    ({ etlObject, etlFieldChanges }, derivedField) => {
      const { etlObject: eo, etlFieldChanges: ec } = addDerivedField(
        derivedField,
        {
          etlFieldChanges,
          etlObject,
        },
      );
      return { etlObject: eo, etlFieldChanges: ec };
    },
    {
      // start with computedEtlObject from pivot
      etlObject, // original values
      etlFieldChanges: {
        ...etlFieldChanges, // << untouched by the reduction
        __derivedFields: {}, // << rebuilt in the reduction
      },
    },
  );
}
/**
 * Applies the read-in sequence request to each of the sources prop
 * of each EtlField.
 *
 * Tasks:
 * 1. include only the sources in the etlObject.etlFields
 * 2. apply changes to read-in sequence
 *
 *      changes [3,1,2] -> active files [2,1]   -> result [1,2]
 *      changes [1,2]   -> active files [3,2,1] -> result [1,2,3]
 *
 * @function
 *
 * @param {{etlUnits: {Object}, etlFields: {Object} }}
 * @param {Object.<String, Object>}
 * @return {{etlObject: {Object}, etlFieldChanges: {Object}}}
 *
 */
function applySourceReadInSequence(etlObject, etlFieldChanges) {
  const { etlFields, etlUnits } = etlObject;

  if (typeof etlFieldChanges === 'undefined')
    return { etlObject, etlFieldChanges };

  if (!('__derivedFields' in etlFieldChanges)) {
    throw new InvalidStateError(
      `The etlFieldChanges object is missing the __derivedFields prop.`,
    );
  }
  // const fieldChanges = removeProp(gcc)etlFieldChanges

  // retrieve the prop changes
  const { __derivedFields, ...propFieldChanges } = etlFieldChanges;

  // augment the source changes with the latest sources/files
  const sourceChanges = Object.keys(propFieldChanges)
    .filter((fieldName) =>
      Object.keys(propFieldChanges[fieldName]).includes('sources'),
    )
    /* eslint-disable-next-line */
    .reduce((sourceChanges, fieldName) => {
      const activeFileNames = new Set(
        etlFields[fieldName].sources.map((source) => source.filename),
      );
      const sourceChange = propFieldChanges[fieldName].sources.filter(
        (source) => activeFileNames.has(source.filename),
      );
      // keep changes where files are still active
      if (sourceChange.length > 0) {
        // cons the active not ordered sources
        const { sources: activeSources } = etlFields[fieldName];
        const sourceSeqNames = sourceChange.map((source) => source.filename);
        // 👉 activeNotOrdered = subset of Active
        const activeNotOrdered = activeSources.filter(
          (activeSource) => !sourceSeqNames.includes(activeSource.filename),
        );
        const combined = [...sourceChange, ...activeNotOrdered];
        console.assert(
          combined.length === activeSources.length,
          `${fieldName}: The source prop updated failed`,
        );
        /* eslint-disable-next-line */
        sourceChanges[fieldName] = [...sourceChange, ...activeNotOrdered];
      }
      return sourceChanges;
    }, {});

  // integrate the changes into the etlFieldChanges object
  const updatedFieldChanges = Object.keys(sourceChanges).reduce(
    /* eslint-disable-next-line */
    (updatedFieldChanges, fieldName) => {
      /* eslint-disable-next-line */
      updatedFieldChanges[fieldName] = {
        ...etlFieldChanges[fieldName],
        sources: sourceChanges[fieldName],
      };
      return updatedFieldChanges;
    },
    etlFieldChanges,
  );

  return {
    etlFieldChanges: updatedFieldChanges,
    etlObject: {
      etlUnits,
      etlFields: [...fieldNamesFromUnits(etlUnits)]
        .filter((active) => Object.keys(etlFieldChanges).includes(active))
        .reduce((acc, fieldName) => {
          const { sources: sourcesSeq = null } = updatedFieldChanges[fieldName];

          if (sourcesSeq !== null) {
            acc[fieldName].sources = updatedFieldChanges[fieldName].sources;
          }
          return acc;
        }, etlFields),
    },
  };
}

function validateEtlObject(etlObject) {
  return (
    typeof etlObject?.etlUnits === 'object' &&
    typeof etlObject?.etlFields === 'object' &&
    Object.keys(etlObject.etlFields).length > 0
  );
}

export default etlFromPivot;
