// src/lib/filesToEtlUnits/rename-etl-field.js

/**
 * Change the name of an etl-field
 *
 * ⬜  Changing the name does not maintain the group-by-file information
 * ⬜  Changing the name of a wide-to-long field crashes
 *
 * @module lib/filesToEtlUnits/rename-etl-field
 *
 * @category Lib
 */
// import { pivot } from './pivot';
// import { etlFromPivot } from './etl-from-pivot';
import { updateField as updateRawField } from './update-field';
import {
  updateFactorProp,
  updateMeasurementName,
} from './transforms/wide-to-long-fields';
import { setMvalue, setMspan } from './transforms/implied-mvalue';
import {
  deleteReplace,
  getActiveHvFields,
  removeProp,
} from './headerview-helpers';
import { InputError, ValueError } from '../LuciErrors';
import { InvalidStateInput } from '../LuciFixableErrors';

import { PURPOSE_TYPES as TYPES } from '../sum-types';
import ERRORS from '../../constants/error-messages';
// import { colors } from '../../constants/variables';

// -----------------------------------------------------------------------------
const GLOBAL_DEBUG = process.env.REACT_APP_DEBUG_LIB === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

// local aliased routine
const renameEtlUnitInEtlChanges = isEtlUnitInEtlChanges;

/**
 *
 * 📌 Rename an etl-field
 *
 * The approach: update the headerViews before applying pivot and etlFromPivot
 * to recompute the etlObject.
 *
 * 🚫 To avoid corrupting the configuration:
 *    Prior to proceeding, confirm the new name is safe in context of the other
 *    etlUnits; use safeToRename. Will throw InputError otherwise.
 *
 * ✅ For each headerView:
 *    Find/replace field-alias with new name. There is only ever one field
 *    with the old name in a given headerView.
 *
 *    hvs map: old field-alias -> new field-alias
 *
 * 👍 Short-circuits when updating a derived-field name.
 *
 * Three types of field structures:
 *
 *    👉 Implied
 *    👉 Wide
 *    👉 Raw
 *
 * ⚠️  Apply this function in the reducer to create a new state
 *    from the current state.
 *
 *    👉 Copy of hvs with reduce
 *    👉 Explict copy of hv when needed (newHv = ...)
 *    👉 Copy of fields when use map
 *    👉 Explicit copy of fields, when alias or derived field changes
 *
 * @function
 * @throws InvalidStateError
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
export function renameEtlField({
  hvsSelector = (id) => id,
  etlFieldChangesSelector = (id) => id,
  etlFieldNameAndPurposeValues = [],
  DEBUG = GLOBAL_DEBUG,
}) {
  // closure
  if (etlFieldNameAndPurposeValues.length === 0) {
    throw new InputError(
      `Tried to change a field name without the input required to validate the change`,
    );
  }

  // Workhorse
  // The configured function
  //
  // 👍 The callback returns a value only when changes were made.
  //
  // @function
  // @return { headerViews: maybe value, etlFieldChanges: maybe value }
  return ({ oldValue, newValue, state }) => {
    const hvs = hvsSelector(state);
    const etlChanges = etlFieldChangesSelector(state);

    const validation = safeToRename(oldValue, newValue)
      .noEtlNameCollision(etlFieldNameAndPurposeValues)
      .noHvNameCollision(hvs)
      .noReservedWord(newValue); // ⬜ also use this for setting field-alias

    switch (true) {
      // Scenario: No change
      case oldValue === newValue:
        return { headerViews: undefined, etlFieldChanges: undefined };

      // Scenario: invalid change (throw fixable error)
      case validation.unsafe():
        throw new InvalidStateInput(validation.getError());

      // Scenario: Rename a derived field
      case oldValue in etlChanges.__derivedFields: {
        return {
          etlFieldChanges: {
            ...renameEtlFieldChanges(oldValue, newValue, etlChanges),
            __derivedFields: renameDerivedField(
              oldValue,
              newValue,
              etlChanges.__derivedFields,
            ),
          },
          headerViews: undefined,
        };
      }

      // Scenario: old is an etlUnit; has changes AND a derived field
      case oldValue in etlChanges &&
        isEtlUnitInEtlChanges(oldValue, etlChanges): {
        return {
          etlFieldChanges: renameEtlUnitInEtlChanges(
            oldValue,
            renameEtlFieldChanges(oldValue, newValue, etlChanges),
            {
              newValue,
            },
          ),
          headerViews: renameFieldsInHvs(oldValue, newValue, hvs, DEBUG),
        };
      }

      // Scenario: Rename a field with etlFieldChange entries
      case oldValue in etlChanges:
        return {
          etlFieldChanges: renameEtlFieldChanges(
            oldValue,
            newValue,
            etlChanges,
          ),
          headerViews: renameFieldsInHvs(oldValue, newValue, hvs, DEBUG),
        };

      // Scenario: A field being renamed is an etlUnit (might impact derivedFields)
      case isEtlUnitInEtlChanges(oldValue, etlChanges):
        return {
          etlFieldChanges: renameEtlUnitInEtlChanges(oldValue, etlChanges, {
            newValue,
          }),
          headerViews: renameFieldsInHvs(oldValue, newValue, hvs, DEBUG),
        };

      // Scenario: Rename a field without any etlFieldChange entries
      default:
        return {
          etlFieldChanges: undefined,
          headerViews: renameFieldsInHvs(oldValue, newValue, hvs, DEBUG),
        };
    }
  };
}
/**
 * Returns a true value when the etlChanges needs to change.
 * Returns a new etlChange object when a config.newName is provided.
 *
 * ⚠️  the etlChanges copy is not valid when a config is not provided.
 * 👍 (the function does not return this value when a config is missing)
 *
 * @function
 * @param {string} oldName
 * @param {Object} etlChanges
 * @param {Object={}} config
 * @return {bool | Object}
 */
function isEtlUnitInEtlChanges(oldValue, etlChanges, config = {}) {
  //
  // the only place where etlUnit prop exists is in __derivedFields
  //
  const [__derivedFields, changed] = Object.values(
    etlChanges?.__derivedFields ?? {},
  ).reduce(
    /* eslint-disable no-param-reassign, no-shadow */
    ([derivedFields, changed], derivedField) => {
      if (derivedField['etl-unit'] === oldValue) {
        derivedField = { ...derivedField, 'etl-unit': config?.newValue };
        changed = changed || true;
      }
      derivedFields[derivedField.name] = derivedField;
      return [derivedFields, changed];
    },
    /* eslint-enable no-param-reassign, no-shadow */
    [{}, false],
  );
  if (GLOBAL_DEBUG) {
    console.debug(`👉 isEtlUnitInEtlChanges: ${changed}`);
  }
  return typeof config?.newValue === 'undefined'
    ? changed
    : {
        ...etlChanges,
        __derivedFields,
      };
}

/**
 * Return updated headerViews
 * @function
 * @return {HeaderViews}
 */
function renameFieldsInHvs(oldValue, newValue, hvs, DEBUG) {
  return Object.values(hvs).reduce((newHvs, hv) => {
    //----------------------------------------------------------------------
    // three cases
    //
    // 1. RAW only
    //
    // 2. RAW plus IMPLIED (impliedMvalue)
    // - update prop config and field field-alias, include raw
    //
    // 3. Some RAW plus WIDE (wideToLongFields)
    // - update prop wtlf config and fields/factors, ignore mvalues in raw

    // for each hv, compute which of the three cases...
    let hvType = 'RAW';
    if (Object.keys(hv).includes('wideToLongFields')) hvType = 'WIDE';
    if (Object.keys(hv).includes('implied-mvalue')) hvType = 'IMPLIED';

    // define the field search predicate give the case
    const rawFieldPredicate = (field) => {
      return hvType === 'WIDE'
        ? field.enabled &&
            field.purpose !== TYPES.MVALUE &&
            field['field-alias'] === oldValue
        : field.enabled && field['field-alias'] === oldValue;
    };

    // update-field field-alias
    let newHv = {};
    let hvWasUpdated = false; // avoid changing hv refs when possible

    // Raw fields; always a field collection to search
    const maybeRawFieldIdx = hv.fields.findIndex(rawFieldPredicate);
    if (maybeRawFieldIdx !== -1) {
      const { field: updatedField } = updateRawField({
        readOnlyField: hv.fields[maybeRawFieldIdx],
        key: 'field-alias',
        value: newValue,
        DEBUG,
      });
      newHv = {
        ...hv,
        fields: deleteReplace(hv.fields, maybeRawFieldIdx, updatedField),
      };
      hvWasUpdated = true;
    }

    switch (hvType) {
      case 'RAW': {
        break; // done
      }

      // implied-mvalue: mvalue or its mspan
      case 'IMPLIED': {
        if (oldValue === hv['implied-mvalue'].config.mvalue) {
          newHv = {
            ...hv,
            'implied-mvalue': setMvalue(newValue, hv['implied-mvalue']),
          };
          hvWasUpdated = true;
        } else if (oldValue === hv['implied-mvalue'].config.mspan) {
          newHv = {
            ...hv,
            'implied-mvalue': setMspan(newValue, hv['implied-mvalue']),
          };
          hvWasUpdated = true;
        }
        break;
      }

      // has wtlf: mvalue or factor.name
      case 'WIDE': {
        if (hv.wideToLongFields.config.mvalue === oldValue) {
          newHv = {
            ...hv,
            wideToLongFields: updateMeasurementName(
              { mvalue: newValue },
              hv.wideToLongFields,
            ),
          };
          hvWasUpdated = true;
        } else {
          // find a factor with oldName, use updateFactorProp to update
          const maybeFactor = hv.wideToLongFields.config.factors.find(
            (factor) => factor.name === oldValue,
          );
          if (typeof maybeFactor !== 'undefined') {
            newHv = {
              ...hv,
              wideToLongFields: updateFactorProp(
                { factorId: maybeFactor.id, key: 'name', value: newValue },
                hv.wideToLongFields,
              ),
            };
            hvWasUpdated = true;
          }
        }
        break;
      }
      default:
        throw new ValueError(
          `rename-etl-field: Tried to process an unsupported headerView type: ${hvType}`,
        );
    }

    // in all cases...
    /* eslint-disable no-param-reassign */
    newHvs[hv.filename] = hvWasUpdated ? newHv : hv;
    return newHvs;
  }, {});
}

/**
 * Update etlFieldChanges
 * oldValue key -> newValue
 * @function
 * @return {EtlFieldChanges}
 */
function renameEtlFieldChanges(oldValue, newValue, etlFieldChanges) {
  return oldValue in etlFieldChanges
    ? {
        ...etlFieldChanges,
        [newValue]: etlFieldChanges[oldValue],
      }
    : etlFieldChanges;
}
/**
 * Renames a derived field
 * Called when oldValue exists in the __derivedFields prop
 * @function
 * @return {DerivedFields}
 */
function renameDerivedField(oldValue, newValue, derivedFields) {
  console.assert(
    oldValue in derivedFields,
    `renameDerivedField is being called unexpectedly: ${oldValue}`,
  );
  // Tasks:
  // ✅ __derivedFields: change key to new value
  // ...remove the old key (👍 removeProp returns a shallow copy)
  const updatedDerivedFields = removeProp(oldValue, derivedFields);
  // ...add the new key
  updatedDerivedFields[newValue] = {
    ...derivedFields[oldValue],
    // ✅ updatedDerivedFields[newValue].name
    name: newValue,
    // ✅ updatedDerivedFields[newValue]['etl-unit'], if quality
    'etl-unit':
      derivedFields[oldValue].purpose === TYPES.QUALITY
        ? newValue
        : derivedFields[oldValue]['etl-unit'],
    // ✅ updatedDerivedFields[newValue].sources -> ['field-alias']
    sources: derivedFields[oldValue].sources.map((source) => ({
      ...source,
      'field-alias': newValue,
    })),
  };
  return updatedDerivedFields;
}
/**
 * Chain of tests to validate the requested change to a etl fieldName.
 *
 * @param {string} oldName
 * @param {string} newName
 * @return {Closure}
 */
function safeToRename(oldName, newName) {
  let error;
  const closure = {
    // ⬜ Create a reserved word namespace
    noReservedWord: () => {
      if (['__derivedField'].includes(newName))
        error = ERRORS.noUseOfReservedWord(newName);
      return closure;
    },
    noEtlNameCollision: (listOfFieldNameAndPurposeValues) => {
      if (
        !noEtlNameCollision(oldName, newName, listOfFieldNameAndPurposeValues)
      )
        error = ERRORS.notCompatibleWithEtl(newName);
      return closure;
    },
    noHvNameCollision: (hvs) => {
      if (!noHvNameCollision(oldName, newName, hvs))
        error = ERRORS.notCompatibleWithEtl(newName);
      return closure;
    },
    safe: () => typeof error === 'undefined',
    unsafe: () => typeof error !== 'undefined',
    getError: () => error,
  };
  return closure;
}

/**
 * Determine whether the new name is safe to use.
 *
 * Safe when...
 *
 * ✅ the newName is not used by any other etlField.
 * ✅ the newName exists in *another* headerView, each with purpose =
 *    TYPES.QUALITY
 *
 * Return true when the new etl field name works in context of the other
 * etlUnits.
 *
 *   ✨ ok to stack etlUnit::quality with a change to a single field;
 *      not so for etlUnit::measurement.
 *
 * 🚫 when returns false
 *
 * @function
 * @param {string} oldName
 * @param {string} newName
 * @param {Array<Array<string,string>>} listOfFieldNameAndPurposeValues
 * @return {boolean}
 */
function noEtlNameCollision(
  oldValue,
  newValue,
  listOfFieldNameAndPurposeValues,
) {
  // when the purpose values match, for now let it be renamed
  const [, purpose] = listOfFieldNameAndPurposeValues.find(
    ([name]) => name === oldValue,
  );

  const [nameCollision, purposeOfCollision] =
    listOfFieldNameAndPurposeValues.find(([name]) => name === newValue) || [
      '',
      '',
    ];

  return (
    (purpose === purposeOfCollision && purpose === TYPES.QUALITY) ||
    !nameCollision
  );
}
/**
 *
 * ✅ file/hv test to determine whether a etl fieldName will corrupt
 *    the integrity of the configuration.
 *
 * ✨ given the constraint of one name per "naming slot" in a given headerView,
 *    to move the oldName into newName slot, make sure the newName slot is
 *    not already full.
 *
 * A collision is indicated when any hv has both the new and old field-alias
 * values.
 *
 * 🚫 when returns false.
 *
 * @function
 * @param {string} oldName
 * @param {string} newName
 * @param {Object<string,Object>} hvs
 * @return {boolean}
 */
function noHvNameCollision(oldName, newName, hvs) {
  // collision newName and oldName both exist in an hv
  const result = !Object.values(hvs).some((hv) => {
    const { collision } = getActiveHvFields(hv).reduce(
      /* eslint-disable-next-line */
      ({ list, collision }, field) => {
        switch (true) {
          case list.length === 0:
            return { list, collision: true }; // both have been removed

          case field['field-alias'] === list[0]:
            list = typeof list[1] === 'undefined' ? [] : [list[1]];
            return { list, collision }; // remove first

          case field['field-alias'] === list[1]:
            return { list: [list[0]], collision }; // remove second

          default:
            return { list, collision };
        }
      },
      { list: [oldName, newName], collision: false },
    );
    return collision;
  });
  return result;
}

/*
const newHvs = (args) => {
  let cache = changeAliases(args);
  const closure = {
    pivot: () => {
      cache = pivot(cache);
      return closure;
    },
    etl: () => {
      cache = etlFromPivot(cache);
      return closure;
    },
    return: () => cache,
  };
  return closure;
}; */

export default renameEtlField;
