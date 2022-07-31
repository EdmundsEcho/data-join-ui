/**
 * @module implied-mvalue
 * @description
 * Missing/implied mvalue
 * signal: presence of mspan without a mvalue present in the header.
 *
 * :: headerView -> headerView with "implied-mvalue"
 *
 *
 * Appends the following to headerView
 *
 * "implied-mvalue": {
 *   "config": {
 *     "mvalue": "alias",
 *     "mspan": "alias"
 *   },
 *   "field": {
 *     "enabled": "Bool",
 *     "field-alias": "String",
 *     "purpose": "mvalue",
 *     "map-implied": {
 *       "domain": "alias",
 *       "codomain": "CONST 1"
 *     }
 *   }
 * }
 *
 */
import { impliedMvalueField } from './headerview-field';
import { PURPOSE_TYPES } from '../../sum-types';
import { DesignError } from '../../LuciErrors';
import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const GLOBAL_DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
//------------------------------------------------------------------------------
const COLOR = colors.green;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const initialFieldValue = {
  field: {
    format: null,
    'field-alias': '',
  },
};

/**
 * Build the implied-mvalue prop in both a new and updating context.
 * Limit computation to when:
 *
 *  👉 does not have the implied-mvalue prop when indicated
 *  👉 mspan changes
 *
 * @throws error the headerView must have a mspan field.
 *
 * @function
 * @param hv headerView
 * @return headerView
 */
export const buildImpliedMvalue = (hv, DEBUG = GLOBAL_DEBUG) => {
  const {
    'implied-mvalue': currentMvalue = initialFieldValue,
    ...readOnly
  } = hv;

  // get the latest mspan value (take the first;
  // more than one mspan error is caught elsewhere)
  const mspan = readOnly.fields.find((f) => f.purpose === PURPOSE_TYPES.MSPAN);
  if (!mspan) {
    throw new DesignError(
      'buildImpliedMvalue: Tried to build an impliedMvalue without a mspan field',
    );
  }

  // no change needed when:
  if (
    mspan.filename === currentMvalue.field.filename &&
    mspan['field-alias'] === currentMvalue.config.mspan
  ) {
    if (DEBUG) {
      console.log(
        `%cbuildImpliedMvalue: field update does not change impliedMvalue`,
        COLOR,
      );
    }

    return hv;
  }

  // ✅ new copy of hv when implied-value changes
  return {
    ...readOnly,
    'implied-mvalue': {
      config: {
        mvalue: currentMvalue.field['field-alias'],
        mspan: mspan['field-alias'],
      },
      field: impliedMvalueField({
        mspan,
        nrows: hv.nrows,
        currentMvalue,
      }),
    },
  };
};

/**
 *
 *     fieldName, implied-mvalue -> implied-mvalue
 *
 * Used when the user updates the name of the mvalue field being configured.
 * Returns { config, field }
 *
 * @param {string} fieldName name of the mvalue
 * @param {Object} impliedMvalueObj has .config and .field props
 * @return {Object}
 *
 */
export const setMvalue = (fieldName, impliedMvalueObj) => {
  return {
    ...impliedMvalueObj,
    config: {
      ...impliedMvalueObj.config,
      mvalue: fieldName,
    },
    field: {
      ...impliedMvalueObj.field,
      'field-alias': fieldName,
    },
  };
};

/**
 *
 *     fieldName, implied-mvalue -> implied-mvalue
 *
 * Utilized by rename-etl-field
 *
 * Otherwise, any change in mspan in the RAW fields, relies on
 * a scan of the headerview (a scan that rebuilds the derived configurations)
 *
 * @function
 * @param {string} fieldName name of the mspan
 * @param {Object} impliedMvalueObj has .config and .field props
 * @return {Object}
 *
 */
export const setMspan = (fieldName, impliedMvalueObj) => {
  return {
    ...impliedMvalueObj,
    config: {
      ...impliedMvalueObj.config,
      mspan: fieldName,
    },
  };
};

/**
 * Pre-pivot processing subroutine
 * Append implied-mvalue with fields
 * :: hv -> hv
 */
export const appendImpliedFields = (hv, DEBUG = GLOBAL_DEBUG) => {
  if (typeof hv['implied-mvalue'] === 'undefined') {
    return hv;
  }

  const { 'implied-mvalue': impliedMvalue, ...rest } = hv;

  if (DEBUG === true) {
    // explicit predicate b/c sometimes called with idx
    console.log(`%cAppending implied mvalue field to the hv fields`, COLOR);
  }

  return {
    ...rest,
    fields: [...hv.fields, impliedMvalue.field],
  };
};
