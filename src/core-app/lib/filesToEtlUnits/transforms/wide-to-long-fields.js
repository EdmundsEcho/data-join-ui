// src/lib/filesToEtlUnits/transforms/wide-to-long-fields.js

/**
 * @module lib/filesToEtlUnits/transforms/wide-to-long-fields
 *
 *
 * @description
 * Triggered when there is more than one mvalue in a single header.
 *
 * Wide -> Long file presentation
 *
 * Signal: more than one mvalue present in the header.
 *
 * The transform:
 *
 * 👉 Create a single etl-field (long) mvalue from the many mvalues (wide) in
 * the file-field format.  This new mvalue does not exist in sources, but is
 * derived from the stacking of the mvalue series in sources.
 *
 *       file/headere: [mvalue] in sources
 *       -> etl:       [mcomp] and/or mspan in etl-field + new-stacked-mvalue
 *
 * @see wide-to-long-fields.md
 *
 * ⬜ This module needs to be refactored in order to reduce repetitive code.
 *    Note: include the use of headerview-fields that defines mvalue from
 *    wide-to-long config.
 *
 */

import { longFieldFromFactor, meaFieldFromConfig } from './headerview-field';
import { trySpanEnabledField } from './span/span-levels';
import initialTimeValue from './span/initial-time-prop';
import { setTimeProp } from './span/span-helper';
import {
  DesignError,
  InputError,
  InvalidStateError,
  KeyValueError,
  LookupError,
} from '../../LuciErrors';
import { maybeFactorNameClashError } from '../validators/validations';

import {
  selectConfig as selectRegexConfig,
  parse as fieldNameToValueParser,
} from '../../regex';
import { areSetsEqual, removeProp, deleteReplace } from '../headerview-helpers';
import { PURPOSE_TYPES } from '../../sum-types';

import { colors } from '../../../constants/variables';

import * as W from './wide-to-long-fields-helpers';

//------------------------------------------------------------------------------
const GLOBAL_DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
const COLOR = colors.light.purple;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 *
 * 📌 The gateway to instantiating the wtlf configuration.
 *
 * Returns a wideToLongFields prop:
 *
 *   👉 Updated or
 *   👉 New from mvalue fields in the headerView
 *
 * Triggered by changes to the headerView field composition.
 * Called prior to a headerView validation triggered by various
 * updates (see find-derived-fields).
 *
 * When not updating a current value, relies on mkWideToLongFields
 * to instantiate the wideToLongFields prop for the first time.
 *
 * Utilizd by
 *
 *   👍 find-derived-fields (when mvalue count > 1)
 *
 *   🚫 User updates to the configuration prop itself, should not
 *      utilize this function.
 *
 * @function
 *
 * @param {Object} hv
 * @param {?Array<FileFields>} previousHvFields
 * @returns {Object} hv with more or fieldName -> value slots.
 *
 */
export function buildWideToLongFields(
  hv,
  previousHvFields = [],
  DEBUG = GLOBAL_DEBUG,
) {
  const { wideToLongFields = undefined, ...readOnly } = hv;

  // 💰 wide-to-long depends on mvalues.
  //    Nothing to do in the event the set of mvalue names has not changed
  if (previousHvFields.length === 0) {
    if (DEBUG)
      console.warn(`wide-to-long-fields: failed to provide a valid heuristic`);
  } else if (
    areSetsEqual(
      new Set(
        readOnly.fields
          .filter((field) => field.enabled && field.purpose === 'mvalue')
          .map((field) => field['field-alias']),
      ),
      new Set(
        previousHvFields
          .filter((field) => field.enabled && field.purpose === 'mvalue')
          .map((field) => field['field-alias']),
      ),
    )
  ) {
    if (DEBUG) {
      console.log(
        `%cbuildWideToLongFields: field update does not change wtlf`,
        colors.green,
      );
    }
    return hv;
  }

  // make a new wide-to-long configuration without overwriting user-input.
  const mvalues = readOnly.fields.filter(
    (field) => field.purpose === 'mvalue' && field.enabled,
  );

  const wtlf =
    typeof wideToLongFields === 'undefined'
      ? mkWideToLongFieldConfigProp({
          mvalues,
          nrows: readOnly.nrows,
        })
      : {
          ...wideToLongFields,
          config: { ...wideToLongFields.config },
          fields: { ...wideToLongFields.fields },
        };

  // inputs used to update fields
  wtlf.config['field-aliases'] = W.fieldAliases(mvalues);
  wtlf.config['header-idxs'] = W.headerIdxs(mvalues);
  wtlf.config['alias-idx-map'] = W.aliasIdxMap(mvalues);

  // ⬜ Only append the table of fieldName -> value when a previous
  //    configuration prop exists.

  // 🚧 make sure if starting from seed, fields are in place using config.factors.
  // Removes fields not present in the config.factors prop adds/removes time prop
  // ... among others.
  wtlf.fields = updateAndNormalizeFields({
    config: wtlf.config,
    fields: wtlf.fields,
  });

  // for each field, build default arrows for each field-alias
  // skip the field that will become the stacked mvalue
  wtlf.fields = Object.values(wtlf.fields)
    .filter((field) => field['field-alias'] !== wtlf.config.mvalue) // different
    .reduce(
      (fields, wideField) => {
        if (!Object.keys(wideField).includes('map-fieldnames')) {
          return fields;
        }

        const currentArrows = wideField['map-fieldnames'].arrows || {};
        const { config } = wtlf;

        // create the arrows: {}
        // 1. source from config
        // 2. combine old with the initial value
        //    eslint-disable-next-line no-shadow
        const newArrows = config['field-aliases'].reduce((newArrows, alias) => {
          // eslint-disable-next-line no-param-reassign
          newArrows[alias] = currentArrows[alias] || '';
          return newArrows;
        }, {});

        /* eslint-disable no-param-reassign */
        fields[wideField['field-alias']] = {
          ...wideField,
          'map-fieldnames': {
            ...wideField['map-fieldnames'],
            arrows: newArrows,
          },
          levels: deriveLevelsFromArrows({
            arrows: newArrows,
            config,
          }),
        };
        /* eslint-enable no-param-reassign */
        return fields;
      },
      {
        // append the mvalue "proper", the mvalue derived from the wideFields
        [wtlf.config.mvalue]: meaFieldFromConfig({
          config: wtlf.config,
          DEBUG,
        }),
      },
    );

  // return a new copy of hv
  return {
    ...readOnly, // ... hv props
    wideToLongFields: wtlf,
  };
}

/**
 * Pre-pivot processing subroutine
 * Append wideToLong fields with fields from the wide-to-long configuration.
 *
 *     hv -> hv
 *
 * ⚠️  Also called to validate headerViews by "looking ahead"/preview
 *
 * @function
 * @param {Object} hv
 * @param {string='pivot'} caller
 * @return {Object}
 *
 */
export function appendWideToLongFields(
  hv,
  caller = 'unknown',
  DEBUG = GLOBAL_DEBUG,
) {
  if (typeof hv.wideToLongFields === 'undefined') {
    return hv;
  }
  const { wideToLongFields, ...rest } = hv;

  if (DEBUG) {
    console.log(
      `%c${caller}: Appending the wide-to-long fields to the hv fields`,
      COLOR,
    );
    console.debug(wideToLongFields.fields);
  }

  if (!hasAliasIdxMap(Object.values(wideToLongFields.fields))) {
    throw new InvalidStateError(
      "The wtlf config is missing the 'alias-idx-map' prop",
    );
  }

  return {
    ...rest,
    fields: [
      // ignore mvalue fields now part of the wtlf config
      ...hv.fields.filter((field) => field.purpose !== 'mvalue'),
      ...Object.values(wideToLongFields.fields),
    ],
  };
}

/**
 * Assertion function
 * Used to catch what seems an intermittent bug where the
 * `alias-idx-map` prop goes missing.
 *
 * Note: This is a file-field view (not a stacked, sources view)
 *
 * @function
 * @param {Array<FileFields} fields
 * @return boolean
 */
function hasAliasIdxMap(fields) {
  return fields.every((field) => Object.keys(field).includes('alias-idx-map'));
}

/**
 * 💰 Generates the seed values required to produce a new wide-to-long-fields
 * configuration object.
 *
 * @function
 * @param {Object} args
 * @param {Array.<Field>} args.mvalues
 * @param {integer} args.nrows
 * @param {integer} args.numberOfFactors
 * @return {object} wideToLongFields configuration object
 */
function mkWideToLongFieldConfigProp({ mvalues, nrows }) {
  if (GLOBAL_DEBUG)
    console.log('%cInitializing fields with dummy factors', colors.red);
  // seed

  // required seeds to instantiate synthetic headerview-fields
  const config = {
    mvalue: '',
    'field-aliases': W.fieldAliases(mvalues), // fixed
    'header-idxs': W.headerIdxs(mvalues), // fixed by API
    'alias-idx-map': W.aliasIdxMap(mvalues), // fixed by API
    filename: W.filename(mvalues), // fixed by API
    nrows, // fixed by API
    factors: [
      {
        id: 0,
        name: '', // avoid duplicate key
        purpose: PURPOSE_TYPES.MCOMP,
      },
    ],
  };

  console.assert(
    Object.keys(config).includes('alias-idx-map'),
    'Missing alias-idx-map',
  );

  return {
    config,
    fields: longFieldsFromWideConfig(config),
  };
}

/**
 *
 * 🚨
 * Generates the fields from factors. Must provide sufficient infrastructure
 * to prevent the ui from asking for a field when it does not exist.
 * This can happen when a factor is present without a corresponding field.
 *
 *    config -> synthetic header fields + stacked mvalues
 *    config -> [field]
 *
 * ⚠️  map-fieldnames is user-input not hosted or derivable from the config object.
 *    Format and other synthetic mspan config information also cannot be
 *    derived from the configuration prop.
 *
 * @function
 * @param {Array.<{Factor}>} factors
 * @param {Object} config
 * @return {Object.<string, Field}
 *
 * @throws InputError when factor names are not unique.
 *
 */
function longFieldsFromWideConfig(config) {
  const { factors = [] } = config;
  if (factors.length === 0) {
    throw new InputError(
      `Tried to create long fields without any factors: ${
        config.mvalue || 'unknown'
      }`,
    );
  }
  if (
    new Set([...factors.map((factor) => factor.name)]).size !== factors.length
  ) {
    throw new InputError(
      `Tried to create long fields with non-unique factors: ${
        config.mvalue || 'unknown'
      }`,
    );
  }

  // 👎 the structure is keyed using a factor name... duplicates must be
  //    manually avoided during the input phase!
  /* eslint-disable no-shadow, no-param-reassign */
  const fields = factors.reduce((fields, factor) => {
    // seeding: factor.name will be ''
    fields[factor.name] = longFieldFromFactor({
      factor,
      config,
    });
    return fields;
  }, meaFieldFromConfig({ config, DEBUG: GLOBAL_DEBUG })); // the mvalue from stacked mvalues
  /* eslint-enable no-shadow, no-param-reassign */

  return fields;
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Selectors for the component

/**
 * Retrieve the factor and its position from/in the collection of factors.
 *
 * @private
 * @function
 * @param {number} factorId id prop of a factor instance
 * @param {Array.<object>} factors array of factors
 * @return {{location: number, factor: object}}
 */
function selectFactorById(factorId, factors) {
  const location = factors.findIndex((factor) => factor.id === factorId);
  return { location, factor: factors[location] };
}

export const mvalueNames = (hv) =>
  hv.fields
    .filter((field) => field.purpose === 'mvalue' && field.enabled)
    .map((field) => [field['field-alias'], field['header-idx']]);

/**
 * @description
 * selects an arrow in map-fieldnames
 * Use prop.hv to lookup a specific arrow (table cell)
 * which arrows: factorName to search wtlf.fields key -> arrows
 * which arrow: field-aliase aka field-name -> which arrow
 * @param {Object} args
 * @param {integer} args.factorId
 * @param {string} args.fieldAlias
 * @param {Object} wtlf
 * @return {codomain}
 */
export const getArrow = ({ factorId, fieldAlias }, wtlf) => {
  const factorName = factorNameFromId(factorId, wtlf);
  if (!wtlf.fields[factorName]) return '';
  if (!wtlf.fields[factorName]['map-fieldnames']) return '';

  return wtlf.fields[factorName]['map-fieldnames'].arrows[fieldAlias] || '';
};

/**
 * @private
 * @function
 */
function factorNameFromId(factorId, wtlf) {
  return wtlf.config.factors.find((factor) => factor.id === factorId).name;
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// data editing
/**
 * Utilized by files.reducer
 *
 * Props describe what to update in the wideToLongFields configuration.
 *
 * Throws an error in the event of a flawed state.
 *
 * @function
 * @param {Object} props payload for the update
 * @param {Object} props.wideToLongFields instance to read from
 * @param {?boolean} DEBUG
 * @return {Object} wideToLongFields
 *
 * @throws InputError
 *
 */
export function updateWideToLongFields({
  readOnlyWideToLongFields: wtlf,
  userInput,
  DEBUG = GLOBAL_DEBUG,
}) {
  const { command, factorId, fieldId, key, value } = userInput;
  if (DEBUG) {
    console.debug('%cwide-to-long-fields - update', colors.orange);
    console.dir(userInput);
  }
  try {
    // ⚠️  The case sequence matters
    switch (true) {
      /* wtlf.config.factor */
      case command === 'ADD_FACTOR':
        if (DEBUG) console.debug('%cAdd factor', colors.orange);
        return addFactor(wtlf);

      case command === 'REMOVE_FACTOR':
        if (DEBUG) console.debug(`%cRemove factor: ${factorId}`, colors.orange);
        return removeFactor(factorId, wtlf);

      // Update the mvalue name
      /* wtlf.config.name */
      case key === 'config.mvalue':
        if (DEBUG)
          console.debug(`%cconfig.mvalue with value: ${value}`, colors.orange);
        return updateMeasurementName({ mvalue: value }, wtlf);

      // Update map-fieldnames with a new factor value
      /* wtlf.fields[..]['map-fieldnames'].arrows[value.key] = value.value */
      /* wtlf.fields[factorName]['map-fieldnames'].arrows where value: regex */
      case ['map-fieldnames.arrow', 'map-fieldnames.arrows'].includes(key):
        if (DEBUG)
          console.debug(
            `%cfactorId:${factorId} key:${key} value:${JSON.stringify(value)}`,
            colors.orange,
          );
        return updateMapFieldnameArrows({ factorId, key, value }, wtlf, DEBUG);

      // Update a field prop
      // 👎 close, but not yet exploiting fileField update logic
      case typeof fieldId !== 'undefined': {
        if (DEBUG)
          console.debug(
            `%ca wide field prop with value: ${value}`,
            colors.orange,
          );
        return updateFieldProp({ fieldId, key, value }, wtlf);
      }
      // ⚠️  review the udpateArrow function factorName v id.

      // Update a factor prop
      /* wtlf.config.factor. */
      case typeof factorId !== 'undefined':
        if (DEBUG)
          console.debug(`%ca factor prop with value: ${value}`, colors.orange);
        return updateFactorProp({ factorId, key, value }, wtlf);

      default:
        throw new DesignError('🚨 Unreachable wide-to-long update request.');
    }
  } catch (e) {
    if (e instanceof DesignError || e instanceof InputError) {
      console.error(e);
      return wtlf;
    }
    throw e;
  }
}
// -----------------------------------------------------------------------------
/**
 *
 *     wtlf -> wtlf
 *
 * Update a factor inside the factors collection.
 *    👉 Cascading change: Update the corresponding field.
 *
 *    ⚠️  Throws an invalid state error in the event the factor name
 *       is a duplicate.
 *
 * factor: { id, name, purpose, parser }
 * parser: (mvalue field-alias) -> value WIP
 *
 * ⚠️  Update factor -> update field
 * 👉 name    -> field['field-alias']
 * 👉 purpose -> field[purpose]
 * 👉 parser  -> update codomain of arrows
 *
 * Navigating wideToLongFields
 * * id = factorId => uid for a factor
 * * factorIdx => position in the Array of factors
 *
 *
 * @function
 * @throws InvalidStateError
 *
 * @param {Object} args
 * @param {integer} args.factorId Index of the currently editing factor
 * @param {string} args.key data being modified
 * @param {string} args.value Value of data being modified
 * @param {Object} wtlf
 * @return {Object} wideToLongFields with errors
 *
 */
export function updateFactorProp({ factorId, key, value }, wtlf) {
  let { fields } = wtlf;
  const { config } = wtlf;
  const { factors } = config;

  if (key === 'name') {
    const maybeError = maybeFactorNameClashError({
      tryName: value,
      mvalueName: config.mvalue,
      factors,
    });

    if (maybeError) throw new InvalidStateError(maybeError);
  }

  // retrieve the current factor in the array of factors using factorId
  const { location, factor } = selectFactorById(factorId, factors);

  const updatedFactor = {
    ...factor,
    [key]: value,
  };
  const prevFactorName = factor.name;
  const newFactorName = updatedFactor.name;

  const updatedConfig = {
    ...config,
    factors: deleteReplace(factors, location, updatedFactor),
  };

  // update the field
  // 📖 ui-specific input (not derivable)
  // 💰 new = previous field with user input + newly derived
  //    Retrieve the current field using the prev factor.name
  // 🦀 nLevels does not consider duplicate values of the
  //    codomain of the arrows
  const newField = longFieldFromFactor({
    factor: updatedFactor,
    config: updatedConfig,
    prevField: fields[prevFactorName],
  });

  // update the collection of fields
  // if the key used in the fields object changed,
  // remove the now stale key entry
  if (prevFactorName !== newFactorName) {
    fields = removeProp(prevFactorName, fields);
  }

  return {
    ...wtlf,
    fields: {
      ...fields,
      [newFactorName]: newField,
    },
    config: updatedConfig,
  };
}

/**
 * Adds a *slot* for a new factor... a factor with no-name.
 *
 *     wtlf -> wtlf
 *
 * Adds a new factor to the wideToLongFields prop.
 * This requires appending to both
 * - config.factors
 * - fields
 *
 * @function
 * @param {Object} wideToLongFields
 * @return {Object} wideToLongFields
 */
function addFactor(wtlf /* no name for the factor */) {
  const { config: readOnlyConfig, fields: readOnlyFields } = wtlf;
  const { factors: readOnlyFactors } = readOnlyConfig;
  const factors = [...readOnlyFactors];

  const newFactor = {
    id: factors[factors.length - 1].id + 1,
    name: '', // default that disables arrow input until updated
    purpose: PURPOSE_TYPES.MCOMP, // default
    // parser: 'return factor;', // how to parse a field name -> value
  };

  // 🦀 nLevels does not consider duplicate values in the codomain of the arrows
  const newField = longFieldFromFactor({
    factor: newFactor,
    config: readOnlyConfig,
  });

  factors.push(newFactor);

  return {
    ...wtlf,
    fields: {
      ...readOnlyFields,
      [newFactor.name]: newField, // newFactor.name = ''
    },
    config: {
      ...readOnlyConfig,
      factors,
      // factors: factors.push(newFactor).sort((a, b) => a.id - b.id),
    },
  };
}

/**
 *
 * Remove a factor from the wideToLongFields prop.
 *
 * This requires removing from both
 * - config.factors
 * - fields
 *
 * @function
 * @param {integer} factorId
 * @param {Object} wtlf
 * @return {Object} wtlf
 */
function removeFactor(factorId, wtlf) {
  const { config, fields } = wtlf;
  const { factors } = config;

  const { location, factor } = selectFactorById(factorId, factors);

  return {
    ...wtlf,
    fields: removeProp(factor.name, fields),
    config: {
      ...config,
      factors: deleteReplace(factors, location),
    },
  };
}

/**
 *
 * Is a delegate utilized by updateFieldProp.
 *
 *      wtlf -> field
 *
 * @private
 * @function
 * @returns {Object} WideField
 */
const updateMspanProp = ({ fieldAlias, key, value }, wtlf) => {
  const { fields } = wtlf;

  return {
    ...fields[fieldAlias],
    time: setTimeProp(key, value, fields[fieldAlias].time),
  };
};

/**
 *
 * 👍 Creates an updated version of wtlf without mutating state.
 *
 * 🚧 Closely related to update-field
 *
 * @function
 * @param {Object} userInput
 * @param {string} userInput.fieldId 'field-alias'
 * @param {string} userInput.key field prop
 * @param {*} userInput.value field value
 * @return {Object} wideToLongFields
 *
 */
function updateFieldProp({ fieldId: fieldAlias, key, value }, wtlf) {
  const { fields } = wtlf;
  let updatedField = { ...fields[fieldAlias] };

  // delegate time-prop updates
  switch (true) {
    case /^time\.+./.test(key): {
      updatedField = trySpanEnabledField({
        field: updateMspanProp({ fieldAlias, key, value }, wtlf),
        sourceType: 'WIDE',
        DEBUG: GLOBAL_DEBUG, // global
      });
      break;
    }

    case key === 'format' &&
      fields[fieldAlias].purpose === PURPOSE_TYPES.MSPAN: {
      // try to update levels-mspan
      updatedField[key] = value;
      updatedField = trySpanEnabledField({
        field: updatedField,
        sourceType: 'WIDE',
        DEBUG: GLOBAL_DEBUG, // global
      });
      break;
    }
    default: {
      fields[fieldAlias] = {
        ...fields[fieldAlias],
        [key]: value,
      };
    }
  }

  return {
    ...wtlf,
    fields: {
      ...fields,
      [fieldAlias]: updatedField,
    },
  };
}

/**
 *
 *     wtlf -> wtlf with update map-fieldnames
 *
 * interface
 *
 *   👉 update single arrow instance
 *   👉 set the whole collection of arrows
 *
 * 🎉 This is when actual data/levels are provided.
 *
 * @function
 * @param {Object} args
 * @param {integer} args.factorId
 * @param {Object} args.value
 * @param {Object.<string,*>} wtlf readOnly previous value
 * @return {Object.<string,(string|integer)>} new wtlf
 *
 */
function updateMapFieldnameArrows({ factorId, key, value }, wtlf, DEBUG) {
  const { config: readOnlyConfig, fields } = wtlf;
  // factorId -> factorName == fieldName
  const factorName = factorNameFromId(factorId, wtlf);
  try {
    if (typeof fields[factorName] === 'undefined') {
      throw new InvalidStateError(
        `wideToLongFields is missing a field for the factor with id: ${factorId}`,
      );
    }
    if (!Object.keys(fields[factorName]).includes('map-fieldnames')) {
      throw new InvalidStateError(
        `wideToLongFields is missing the prop key: map-fieldnames`,
      );
    }
    if (
      key === 'map-fieldnames.arrow' &&
      (!Object.keys(value).includes('key') ||
        !Object.keys(value).includes('value'))
    ) {
      throw new InputError(
        `wideToLongFields arrow update must use value::object with a key and value props: ${JSON.stringify(
          value,
        )}`,
      );
    }
  } catch (e) {
    if (e instanceof InvalidStateError) {
      console.error(e);
      return wtlf;
    }
    throw e;
  }
  const updatedArrows =
    key === 'map-fieldnames.arrow'
      ? {
          ...fields[factorName]['map-fieldnames'].arrows,
          [value.key]: value.value,
        }
      : fieldNameToValueParser({
          parser: value,
          items: fields[factorName]['field-aliases'],
          DEBUG,
        });

  // bonus value alignment parser ~ format when mspan
  const formatIn =
    key === 'map-fieldnames.arrows' &&
    fields[factorName].purpose === PURPOSE_TYPES.MSPAN
      ? selectRegexConfig(value).format
      : null;

  // field/levels
  const updatedLevels = deriveLevelsFromArrows({
    arrows: updatedArrows,
    config: readOnlyConfig,
  });

  // field re-assembly
  let updatedField = {
    ...fields[factorName],
    'map-fieldnames': {
      ...fields[factorName]['map-fieldnames'],
      arrows: updatedArrows,
    },
    levels: updatedLevels,
    format: formatIn || fields[factorName].format,
  };

  // mspan-levels
  // trySpanEnabledField -> ? mspan-levels
  updatedField =
    updatedField.purpose === PURPOSE_TYPES.MSPAN
      ? trySpanEnabledField({
          field: updatedField,
          sourceType: 'WIDE',
          DEBUG: GLOBAL_DEBUG, // global
        })
      : updatedField;

  return {
    ...wtlf,
    fields: {
      ...wtlf.fields,
      [factorName]: updatedField,
    },
  };
}

/**
 *     wtlf -> wtlf
 *
 * ⚠️  Needs to work "between" fieldNames
 *
 * @function
 * @param {{mvalue: string}} mvalue
 * @param {Object} wtlf
 * @return {Object}
 *
 */
export function updateMeasurementName({ mvalue }, wtlf) {
  //
  if (typeof wtlf === 'undefined') {
    return undefined;
  }
  const currentName = wtlf.config.mvalue;

  const config = {
    ...wtlf.config,
    mvalue,
  };

  return {
    ...wtlf,
    config, // update mvalue
    fields: {
      ...removeProp(currentName, wtlf.fields),
      [mvalue]: meaFieldFromConfig({
        // update field-alias
        config,
        prevField: wtlf.fields[currentName],
        DEBUG: GLOBAL_DEBUG,
      }),
    },
  };
}

/**
 * Extract the wide-to-long-fields prop from a headerView
 *
 * @function
 * @param {HeaderView} headerView
 * @returns {WideToLongFields}
 */
export const getWideToLongFieldsConfig = (hv) => {
  try {
    if (!('wideToLongFields' in hv)) {
      throw new KeyValueError(
        `'wideToLongFields' does not exist in headerView: ${hv.filename}`,
      );
    }
    return hv.wideToLongFields;
  } catch (e) {
    if (e instanceof KeyValueError) {
      if (GLOBAL_DEBUG) console.warn(e);
      else console.warn(e.message);
      return {};
    }
    throw e;
  }
};

/**
 * @description
 * Extract the fields produced from the wide-to-long file format.
 * @param headerView
 * @returns wtlf.fields
 */
export const wideFields = (hv) => {
  return Object.values(getWideToLongFieldsConfig(hv)?.fields);
};

/**
 * @description
 * Test if the factor, to be a field name, clashes with the
 * field names in the headerView.
 * @param factors ~ field-alias, also keys to fields
 * @param hv.fields Array
 * @returns Bool
 * @todo WIP Decide on how to fix bug that deletes fieldname
 * when the validation script removes a name that looks
 * like a duplicate, even before having completed the UI entry.
 */
/*
const validFactorNames = (factors, hvFields) => {
  if (factors.find((fact) => fact.name === '' || fact.name === null))
    return false;

  if (
    factors.find((fact) =>
      hvFields.map((hvField) => hvField['field-alias']).includes(fact.name),
    )
  )
    return false;

  return true;
};
*/

/**
 * Append new or remove fields derived from factors, to any previously
 * configured fields.
 *
 *      config.factors + config.mea = all wtlf fields
 *
 * Previous configured fields are hosted in config.fields.
 *
 * ⬜ Leverage with longFieldsFromWideConfig(config)
 *
 * Recall, there are two types of fields
 *
 *    👉 hv.fields
 *    👉 wideToLongFields.fields <<< focus
 *
 * @function
 * @private
 *
 * @param {Object} wideToLongFields
 * @param {Object} wideToLongFields.config
 * @param {Object} wideToLongFields.fields
 * @returns {Object} fields wideToLongFields.fields
 */
function updateAndNormalizeFields({ config, fields }) {
  return config.factors.reduce(
    (updatedFieldCollection, factor) => {
      /* eslint-disable no-param-reassign */
      updatedFieldCollection[factor.name] =
        fields[factor.name] ||
        longFieldFromFactor({
          factor,
          config,
          DEBUG: GLOBAL_DEBUG, // global
        });
      /* eslint-enable no-param-reassign */

      const {
        'map-fieldnames': mapFieldnames = {
          arrows: {},
        },
      } = updatedFieldCollection[factor.name];

      const levels = deriveLevelsFromArrows({
        // update levels
        arrows: mapFieldnames.arrows,
        config,
      });

      const requiredUpdates = {
        'header-idxs': config['header-idxs'], // fixed
        'field-aliases': config['field-aliases'], // fixed
        'alias-idx-map': config['alias-idx-map'], // fixed
        levels,
        nlevels: levels.length,
      };

      // add or remove time prop
      // rebuild levels from arrows
      /* eslint-disable no-param-reassign */
      updatedFieldCollection[factor.name] =
        updatedFieldCollection[factor.name].purpose === PURPOSE_TYPES.MSPAN
          ? {
              time: initialTimeValue, // default time
              ...updatedFieldCollection[factor.name], // might update time
              ...requiredUpdates,
            }
          : {
              ...removeProp('time', updatedFieldCollection[factor.name]),
              ...requiredUpdates,
            };
      /* eslint-enable no-param-reassign */

      return updatedFieldCollection;
    },
    {
      [config.mvalue]:
        fields[config.mvalue] ||
        meaFieldFromConfig({ config, DEBUG: GLOBAL_DEBUG }),
    },
  );
}

export const updateWideFieldInWideToLong = (
  updatedWideField,
  wideToLongConfig,
) => ({
  ...wideToLongConfig,
  fields: {
    ...wideToLongConfig.fields,
    [updatedWideField['field-alias']]: updatedWideField,
  },
});

export const getFactorIdFromName = (name, wtlf) => {
  const factorId =
    wtlf.config.factors.find((factor) => factor.name === name)?.id ?? undefined;
  if (typeof factorId === 'undefined') {
    throw new LookupError(`The id does not exist for factor: ${name}`);
  }
  return factorId;
};

/*
 * [[value, n]]
 *
 * @return {Array<Array>}
 */
function deriveLevelsFromArrows({ arrows, config }) {
  // 🦀 config.nrows x number of times value shows up
  /* eslint-disable no-shadow */
  const rebuildRaw = ({ arrows, config }) =>
    Object.values(arrows).map((value) => [value, config.nrows]);
  /* eslint-enable no-shadow */

  return dedupLevels(
    rebuildRaw({
      arrows,
      config,
    }),
  );
}

function dedupLevels(levels) {
  const tmp = levels.reduce((acc, level) => {
    acc[level[0]] = acc[level[0]] ? (acc[level[0]] += level[1]) : level[1];
    return acc;
  }, {});

  return Object.keys(tmp).map((v) => [v, tmp[v]]);
}
