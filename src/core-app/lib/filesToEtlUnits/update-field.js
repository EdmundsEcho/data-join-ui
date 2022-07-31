// src/lib/filesToEtlUnits/update-field.js

/**
 * @module lib/filesToEtlUnits/update-field
 *
 * @description
 * Update fields
 * Utilized by the files.reducer.js
 *
 * Exports:
 *
 * 👉 updateField(field, key, value)
 * 👉 CHANGE_SCOPE
 *
 * 👍 Does not apply any validations.
 *
 * @category Lib
 *
 */
import { mkPurposeSpecificField } from './transforms/headerview-field';
import { trySpanEnabledField } from './transforms/span/span-levels';
import { setTimeProp } from './transforms/span/span-helper';
import { removeProp } from './headerview-helpers';
import { debug } from '../../constants/variables';
import { InputError } from '../LuciErrors';
import { DesignWarning } from '../LuciWarnings';

/* eslint-disable no-console */

/**
 * 📌 The gateway for the module
 *
 * files.reducer.js calls updateField:
 *
 *      field, key, value -> field
 *
 * 🔖
 *   1. value is last because is optional.
 *   2. prop/value can be an object; so time/obj can be updated
 *   3. this function works for field so can be used by wide-to-long fields
 *
 * @function
 * @param {Object} args
 * @param {FileField} args.readOnlyField instance of headerView.fields or wide-to-long, or etl?
 * @param {string} args.key e.g., purpose, time.reference.format
 * @param {*} args.value e.g., string, number or object for deeper state changes
 * @param {boolean} args.DEBUG e.g., string, number or object for deeper state changes
 * @return {{stateDerivedFields: boolean, field: FileField}}
 *
 */
export function updateField({ readOnlyField: field, key, value, DEBUG }) {
  if (DEBUG) {
    console.debug(
      `%chv: ${field.filename}\nfield update: ${field['field-alias']} key: ${key} value: ${value}`,
      debug.color.orange,
    );
  }

  try {
    try {
      switch (true) {
        case /^enabled/.test(key):
          return {
            // field: setFieldValue(key, (enabled) => !enabled)(field),
            field: setFieldValue(key)(field, value, DEBUG),
            staleDerivedFields: true,
          };

        // Changes to this prop can lead to several changes in the field
        case /^purpose/.test(key):
          return {
            field: setPurpose(field, value, DEBUG),
            staleDerivedFields: true,
          };

        // 🚧 derivative changes to derived field configurations rely on
        //    scanning the updated headerView.  Is it robbust in a
        //    backtracking context?
        case /^field-alias/.test(key):
          return {
            field: setFieldValue(key)(field, value, DEBUG),
            staleDerivedFields: true,
          };

        case /^map-symbols\.arrows/.test(key):
          return {
            field: setFieldValue(key, (arrows) => {
              if (typeof value === 'object') {
                return addArrow(value, field);
              }
              if (typeof value === 'string') {
                return removeArrow(value, arrows);
              }
              return field;
            })(field, value, DEBUG),
            staleDerivedFields: false,
          };

        case /^format/.test(key):
          return {
            field: setFormat(field, value, DEBUG),
            staleDerivedFields: false,
          };

        // ✅  required when the api flags null values
        case /^null-value/.test(key):
          return {
            field: setNullValue(field, value, DEBUG),
            staleDerivedFields: false,
          };

        case /^codomain-reducer/.test(key):
          return {
            field: setFieldValue(key)(field, value, DEBUG),
            staleDerivedFields: false,
          };

        case /^time\.+./.test(key): {
          return {
            field: setTime(key)(field, value, DEBUG),
            staleDerivedFields: false,
          };
        }

        default:
          throw new DesignWarning('🚧 Unhandled field update request.');
      }
    } catch (e) {
      if (e instanceof DesignWarning) {
        console.warn(e.message);
        return {
          field: setFieldValue(key)(field, value, DEBUG),
        };
      }
      throw new InputError(
        `Failed to update a field with inputs: ${key} ${value}`,
      );
    }
  } catch (e) {
    if (e instanceof InputError) {
      console.error(e);
      return { field };
    }
    throw e;
  }
}

/* --------------------------------------------------------------------------- */
/**
 * purpose -> field
 *
 * With each update, the function rebuilds the purpose-specific qualities
 * of the field.
 *
 */
function setPurpose(field, newPurpose, DEBUG) {
  // avoid making changes if purpose value is unchanged
  if (field.purpose === newPurpose) {
    return field;
  }

  return mkPurposeSpecificField(
    setFieldValue('purpose')(field, newPurpose, DEBUG),
  );
}
/**
 * time -> field
 * Changes the fully-qualified prop name in the time prop.
 *
 * With each update, the function tries to convert raw time values
 * to span values (i.e., series of time -> single span)
 *
 */
function setTime(key, DEBUG) {
  return (field, value) => {
    // this should never happen, but an easy redirect
    if (field.purpose !== 'mspan') {
      return field;
    }

    const updatedField = updateFieldPropInField(
      'time', // time prop object
      field, // field object
      (timeProp) => setTimeProp(key, value, timeProp),
      DEBUG,
    );

    // a new interval might enable new spans
    return trySpanEnabledField({
      field: updatedField,
      sourceType: 'RAW',
      DEBUG,
    });
  };
}

/**
 * format -> field
 * Changes both format and, when mspan, the time interval prop
 */
function setFormat(field, newFormat, DEBUG) {
  const updatedField = setFieldValue('format')(field, newFormat, DEBUG);

  // return if not mspan
  if (field.purpose !== 'mspan') {
    return updatedField;
  }

  // a new format might enable new spans
  return trySpanEnabledField({
    field: updatedField,
    sourceType: 'RAW',
    DEBUG,
  });
}

/**
 * null-value -> field
 * May trigger an update to mspan/levels-mspan values
 */
function setNullValue(field, newNullValue, DEBUG) {
  const updatedField = setFieldValue('null-value')(field, newNullValue, DEBUG);

  if (Object.keys(field).includes('levels-mspan')) {
    return trySpanEnabledField({
      field: updatedField,
      sourceType: 'RAW',
      DEBUG,
    });
  }

  return updatedField;
}

/**
 * "map-symbols"
 * callback :: field -> field
 */
function addArrow(field, newArrow) {
  return updateFieldPropInField(
    'map-symbols', // prop to where we point fn
    field,
    (mapSymbols) => ({
      // [prop]: fn(field), latest
      arrows: {
        ...mapSymbols.arrows,
        ...newArrow,
      },
    }),
  );
}

/**
 * "map-symbols"
 * callback :: field -> field
 */
function removeArrow(field, domain) {
  return updateFieldPropInField(
    'map-symbols', // prop to where we point fn
    field,
    (mapSymbols) => ({
      arrows: removeProp(domain, mapSymbols.arrows),
    }),
  );
}

/**
 * Utility maker for field -> field callbacks
 * fn default: constant:: a -> b -> a
 * Returns :: field
 * @param {string} prop Prop name
 * @return {Field}
 */
function setFieldValue(prop, fn = undefined) {
  return (field, newValue, DEBUG) => {
    // Generally does not require a new value when fn is specified.
    if (typeof newValue === 'undefined' && typeof fn === 'undefined') {
      throw new Error(
        `update-field: ${field.name} Requires a valid value or update function: ${newValue}`,
      );
    }
    return updateFieldPropInField(prop, field, fn || (() => newValue), DEBUG);
  };
}

// -----------------------------------------------------------------------------
/*
 * Utility ~ Functor that points a fn to the data...
 * Returns :: field
 * @param {string} prop
 * @param {Field} field
 * @param {{({object}):any}} fn Input: prop, returns a new prop value
 * @return {Field}
 */
function updateFieldPropInField(prop, field, fn, DEBUG) {
  if (DEBUG) {
    console.debug(
      `updating field: ${field['field-alias']} prop: ${prop} to value: ${fn(
        field[prop],
      )}`,
    );
  }
  return {
    ...field,
    [prop]: fn(field[prop]),
  };
}

export default updateField;
