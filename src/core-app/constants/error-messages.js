// src/constants/errorMessages.js

/**
 *
 * @module errorMessages
 *
 * @description
 *
 * Centralize error messages.
 * Each entry: key, message, fix, doc
 *
 * Contents:
 * 1. error object props:  key, message, fix, doc
 * 2. configuration to specify parent/child relationship between errors
 * 3. 'reduceError' function
 *
 */
import { intersection } from '../lib/filesToEtlUnits/headerview-helpers';
import { PURPOSE_TYPES as TYPES } from '../lib/sum-types';

// import { getDefaultSubjectName } from '../lib/feedback/fixes/single-subject-name';
//------------------------------------------------------------------------------
// Fix this reference issue
// Likely, move action creator to actions.
//------------------------------------------------------------------------------
/**
 * Default subject for consistent naming
 * Best: first where alias value was set by the user
 * Next: first in the list of selected files
 * Next: first in however the hvs object is converted to an array
 *
 * @function
 * @param {Array<HeaderView>} hvs
 * @param {Filename} firstSelected
 * @return {string} 'field-alias'
 *
 */
export function getDefaultSubjectName(hvs, firstSelected) {
  if (!Array.isArray(hvs)) {
    return getDefaultSubjectName(Object.values(hvs), firstSelected);
  }

  const findSubject = (field) => field.purpose === TYPES.SUBJECT;

  return (
    hvs.map((hv) =>
      hv.fields.find(
        (field) =>
          field.purpose === TYPES.SUBJECT &&
          field['header-name'] !== field['field-alias'],
      ),
    )?.[0]?.['field-alias'] ??
    (firstSelected
      ? hvs
          .find((hv) => hv.filename === firstSelected)
          .fields.find(findSubject)['field-alias']
      : hvs[0].fields.find(findSubject)['field-alias'])
  );
}
//------------------------------------------------------------------------------

const ERRORS = {
  hasUniqueFieldNames: {
    key: 'hasUniqueFieldNames',
    message: 'One or more field names are not unique in this file',
    fix: 'The default names in this data source might not all be unique. Use the `alias` field to provide a unique name for each field.',
    doc: 'The `field-alias` property is a way to both rename fields and link/stack fields from different data sources.',
  },
  hasUniqueFactorNames: (factorName) => ({
    key: 'hasUniqueFactorNames',
    message:
      typeof factorName === 'undefined'
        ? `One of the factor names is already in use by another factor, or field.`
        : `The ${factorName} factor is already in use by another factor, or field.`,
    fix: 'The default names in this data source might not all be unique. Use the `alias` field to provide a unique name for each field.',
    doc: 'The `field-alias` property is a way to both rename fields and link/stack fields from different data sources.',
  }),

  // this error is part of the valid etlUnit; this error calls out partial
  // functions (not a valid function per the etlUnit spec)
  missingNullValues: (fieldNames) => ({
    key: 'missingNullValue',
    message: `The following fields have null values and require a null-value configuration entry: ${JSON.stringify(
      fieldNames,
    )}`,
    fix: 'Enter a value in the "Null Value" field e.g., "unknown"',
    doc: 'A complete data set may not have null values.',
  }),

  // 🦀 The validation fires the sameAsOtherSubjects error when missing a
  // subject.
  missingSubject: {
    key: 'missingSubject',
    message: `Missing a subject field.`,
    fix: `Select the field that identifies individual subjects.`,
    doc: `The subject field is the link between all data sets.`,
  },

  exactlyOneSubject: {
    key: 'exactlyOneSubject',
    message: `There needs to be exactly one subject (S) field.`,
    fix: `Select only one field as the subject.`,
  },

  // mspan
  missingMspan: {
    key: 'missingMspan',
    message:
      'A file with a measurement value (V) must also have a date/time (T) field',
    fix: 'Identify the field that represents time/date (T) of the measurement value (V)',
    doc: 'The presence of a measurement value field (V) <=> a function mapping a subject (S), time/date (T) and any number of components (C) to a measurement value.',
  },

  exactlyOneMspan: {
    key: 'exactlyOneMspan',
    message: `There needs to be exactly one time/date (T) field.`,
    fix: `Select only one field as the time/date field (mvp).`,
  },

  moreThanOneMspan: {
    key: 'moreThanOneMspan',
    message:
      'There needs to be exactly one time/date (T) field per file/data source.',
    fix: 'Select only one time/date (T) field, or combine the two fields (e.g., month & year)',
  },

  // mcomp
  noOrphanMcomp: {
    key: 'noOrphanMcomp',
    message: `A measurement component (C) exists without a measurement value (V).`,
    fix: `Either change the purpose of the field or find the measurement value (V) field.`,
  },
  wideToLongMissingMcomp: {
    key: 'wideToLongMissingMcomp',
    message: `There is a missing factor that describes this series of measurements.`,
    fix: `Please describe what makes each measurement in the series unique.`,
    doc: `In the event there are several measurement fields in a data source, what makes each of the measurements unique must be identified.`,
  },

  // mvalue (note, not possible to have more than one mvalue)
  missingMvalue: {
    key: 'missingMvalue',
    message: `There is at least one component (C) field without a measurement value (V) in the same file.`,
    fix: `Change the field to a quality (Q), or a identify data/time (T) and measurement value (V) fields.`,
    doc: `A component (C) describes a measurement.`,
  },

  hasMvalueName: {
    key: 'hasMvalueName',
    message: `The measurement is missing a name`,
    fix: `Provide a name to identify the measurement field`,
    doc: `All fields must have a name; a missing name can occur with a derived field`,
  },

  moreThanOneMvalue: {
    key: 'moreThanOneMvalue',
    message: `🦀 This is an invalid state - throw error`,
  },

  // headerView -> etlUnit structure
  hasAtLeastOneEtlUnit: {
    key: 'hasAtLeastOneEtlUnit',
    message: `The data source must have at least one field that describes either a subject quality (Q) or a measurement value (V).`,
    fix: `Identify a field that describes either a quality (Q) or a measurement value (V).`,
    doc: 'An etlUnit has a subject (S) field and either a quality (Q) or measurement value (V)',
  },

  //----------------------------------------------------------------------------
  // mspan interval/format (field prop-related)
  //----------------------------------------------------------------------------
  missingTimeFormatAndInterval: {
    key: 'missingTimeFormatAndInterval',
    message: 'The date/time field must specify the format and interval fields',
    fix: 'Provide a string format for the time/date field and specify the interval size.',
    doc: 'Specifies how the value of a field should be interpreted or parsed',
  },

  missingTimeFormat: {
    key: 'missingTimeFormat',
    message: 'The date/time field must specify the format (e.g., YYYY-MM).',
    fix: 'Provide a string format for the time/date field',
    doc: 'Specifies how the value of a field should be interpreted or parsed',
  },

  missingTimeInterval: {
    key: 'missingTimeInterval',
    message:
      'The date/time field must have an interval unit (e.g., week, month) and count (e.g., 3 Month for quarterly data)',
    fix: 'Complete the `Time-Interval` configuration.',
  },

  unsupportedTimeFormat: {
    key: 'unsupportedTimeFormat',
    message: 'The date/time format is not recognized.',
    fix: 'Provide a format that aligns with how to parse the date/time value',
    doc: 'Specifies how to parse the data/time value',
  },

  //----------------------------------------------------------------------------
  // HeaderView derived fields
  // Note: missing mvalue name for implied-mvalue is considered in the ui.
  //----------------------------------------------------------------------------
  // 🔖 WIP: use this when first presented with a wtlf context
  wideToLongConfig: {
    key: 'wideToLongConfig',
    message: 'A file with more than one measurement value must be configured',
    fix: 'Complete the `wide-to-long field configuration.`',
  },

  impliedMvalueConfig: {
    key: 'impliedMvalueConfig',
    message: 'There is a measurement value that needs to be configured.',
    fix: 'Complete the `implied-mvalue` field configuration.',
    doc: 'There is an implied measurement in this data source.',
  },

  //----------------------------------------------------------------------------
  // wide-to-long
  //----------------------------------------------------------------------------
  // 🚧 coordination between wide and other fields; error for hv
  hasWideFieldErrors: {
    key: 'hasWideFieldErrors',
    message: 'The wide field configuration has errors.',
    fix: 'Review the specific errors outlined in the wide-field configuration.',
    doc: '',
  },

  missingWideToLongFactorPurpose: {
    key: 'missingWideToLongFactorPurpose',
    message: `Each factor must be assigned a purpose: component or time/date`,
    fix: `Select either 'component' or 'time/date' for the factor's purpose.`,
    doc: `Each factor is this wide-format, becomes a field in the standardize
              'long-form' and treated like any other field.`,
  },

  missingFactorValues: {
    key: 'missingFactorValues',
    message: `Missing how to map a fieldname to a factor value.`,
    fix: `Look for missing entries; complete all of the entries in the factor configuration.`,
    doc: `In a wide-data format, the fieldname informs a value for each factor it encodes.`,
  },

  missingWideToLongFactorName: {
    key: 'missingWideToLongFactorName',
    message:
      `Missing a factor name. The factor name will be used as a ` +
      `field-name once the data is combined with the other data sources.`,
    fix: `Name the factor encoded in the series of field names`,
    doc:
      `A factor is the information implied in the field-name of a series of ` +
      `measurements. For instance, in a time series, time is a factor in the ` +
      `field name`,
  },

  missingWideToLongMeaName: {
    key: 'missingWideToLongMeaName',
    message:
      'Please name the measurement captured in the series of fields in this wide-data format.',
    fix: 'Complete the `measurement name` field.',
    doc: `When more than one field in a file is a measurement, that is a series.
          In a series, each field *name* in the series qualifies the measurement.
          Strictly speaking, the data is in a 'wide-format'.  This makes sense
          considering how the series could have been created in the first place.
          For instance, a time series.`,
  },

  missingWideToLongComp: {
    key: 'missingWideToLongComp',
    message: `Data in the wide-format must specify at least one component in the
              series.`,
    fix: `Select either a time/date or component purpose for each factor.`,
  },

  //----------------------------------------------------------------------------
  // Note: either one of the next two messages is sent in an
  // InvalidStateError
  invalidFactorNameMvalueClash: {
    key: 'invalidFactorNameMvalueClash',
    message: `The factor name cannot be the same as the name of the measurement recorded in the series of fields`,
    fix: `Provide a name not already used by other factors nor fields in this file/data source.`,
  },
  invalidFactorNameFactorClash: {
    key: 'invalidFactorNameFactorClash',
    message: `The factor name is in use by another factor.`,
    fix: `Provide a name not already used by other factors nor fields in this file/data source.`,
  },
  //----------------------------------------------------------------------------

  //----------------------------------------------------------------------------
  // generic field props
  //----------------------------------------------------------------------------
  missingNullValue: {
    key: 'missingNullValue',
    message:
      'There are missing values in this data source; a null-value substitute should be provided.',
    fix: 'Complete the `null-value` configuration.',
    doc: 'Specifies how to interpret NULL or blank values.',
  },

  //----------------------------------------------------------------------------
  // field in relation to same field in other headerViews
  //----------------------------------------------------------------------------
  singlePurposeAlias: (alias = 'An alias') => ({
    key: 'singlePurposeAlias',
    message: `${alias} is used in several files but with different purpose values.`,
    fix:
      `Change the field alias in one of the files, or make sure fields with the ` +
      `same alias have matching purpose values.`,
    doc:
      `The field name or alias, are used to identify fields in other files with the same ` +
      `information. The fields with matching field names or aliases must all have the ` +
      `same purpose.`,
  }),

  // ⬜ Define the interface using a flow-type
  sameAsOtherSubjects: {
    key: 'sameAsOtherSubjects',
    message: 'The subject name must be the same for all files.',
    fix: 'Rename the subject fields in each file to match one another.',
    action: {
      type: 'sameAsOtherSubjects',
      description: (stateFragment) =>
        `Set values to: ${getDefaultSubjectName(stateFragment)}`,
      guards: ['exactlyOneSubject', 'singlePurposeAlias'],
      lazyFix: 'fixSameAsOtherSubjects', // : (state) => payload for action
    },
  },

  // etlUnit:mvalue
  inRelatedUnit: {
    key: 'inRelatedUnit',
    message:
      'A measurement with the same name has a different mix of components.',
    fix: 'Make sure the measurement fields in each file with the same name, also have the same components.',
    doc: 'A measurement is described using subject and a mix of `components` and a `date/time` field.',
  },

  spanWorksWithCurrentUnits: {
    key: 'spanWorksWithCurrentUnits',
    message: `A measurement with the same name has a time/date field that is different.`,
    fix: 'Change either the measurement or time/date field name.',
    doc: 'Measurements in different data sources with the same name share components and time/date fields.',
  },

  mcompWorksWithCurrentUnits: {
    key: 'mcompWorksWithCurrentUnits',
    message: 'The measurement component is not compatible with others.',
    fix: 'Make sure that measurements with the same name have components with the same name.',
    doc: 'Measurements in different data sources with the same name share components and time/date fields.',
  },

  //----------------------------------------------------------------------------
  // Etl-specific
  //----------------------------------------------------------------------------
  uniqueEtlFieldName: {
    key: 'uniqueEtlFieldName',
    message: 'One or more field names are not unique.',
    fix: 'Change the field name.',
    doc: '',
  },

  notCompatibleWithEtl: (newName) => ({
    key: 'notCompatibleWithEtl',
    message: `The fieldname (${newName}) is already in use by a field that cannot be combined with this field.`,
    fix: 'Choose a unique name, or combine the field with a quality (Q) specified in a different source.',
    doc: 'Etl fieldnames must be unique.  Qualities can share the same name when specified in separate sources.',
  }),

  //----------------------------------------------------------------------------
  // Other
  // ⬜ Apply this rule to naming fields (setting field-alias)
  //----------------------------------------------------------------------------
  noUseOfReservedWord: (newName) => ({
    key: 'noUseOfReservedWord',
    message: `The field name (${newName}) is a reserved word`,
    fix: 'Please change the name (e.g., add a unique prefix)',
    doc: 'Etl fieldnames must be unique.  Qualities can share the same name when specified in separate sources.',
  }),
};

/**
 * Likely DEPRECATE
 *
 * ⚙️  Use this object literal to specify parent/child relationships between
 * errors.
 *
 * 🚧 Background
 * Issue: Some errors make less sense in context of the presence of other
 * errors.
 * Solution: Structure that relates errors keys to each other, and with a
 * priority of which error to display/ignore.
 *
 * The context/function: A full list of errors -> reduced list of errors.
 *
 * {
 *   key: dominant error key
 *   value: [key] << suppress error keys
 * }
 *
 */
const errorInteraction = {
  oneSubject: ['sameAsOtherSubjects'],
};

/**
 *
 * 🚧 WIP not yet utilized
 *
 * Post-processing isomorphic function for validation errors.
 * { filename: [error object] }
 *
 * @function
 *
 * @param {object} errorsPerFile
 * @return {object}
 *
 */
export function reduceErrors(errorsPerFile) {
  // retrieve keys with filters
  // apply filters
  const keysWithFilters = Object.keys(errorInteraction);
  const activatedErrors = getAllErrorKeys(errorsPerFile);
  const activatedKeywWithFilters = [
    ...intersection(new Set(keysWithFilters), new Set(activatedErrors)),
  ];
  const suppressErrors = activatedKeywWithFilters.reduce(
    (acc, activeKey) => acc.concat(errorInteraction[activeKey]),
    [],
  );

  const keysWithFiltersPerFile = Object.entries(errorsPerFile).reduce(
    (acc, [filenameKey, errors]) => {
      // filename: [{key, message, fix}]
      const activeKeys = errors.map((error) => error.key);
      /* remove keys per file
      const activeKeysWithFilters = [
        ...intersection(new Set(keysWithFilters), new Set(activeKeys)),
      ];
      const removeKeys = activeKeysWithFilters.reduce(
        (accRemove, filtKey) => accRemove.concat(errorInteraction[filtKey]),
        [],
      );
      */

      // final rebuild of error object with filename keys
      // original (active) keys not in removeKeys
      acc[filenameKey] = activeKeys
        .filter((activeKey) => !suppressErrors.includes(activeKey))
        .map((activeKey) => ERRORS[activeKey]);
      return acc;
    },
    {},
  );
  return keysWithFiltersPerFile;
}

function getAllErrorKeys(errorsPerFile) {
  const values = Object.values(errorsPerFile); // [errors]
  return values.reduce(
    (acc, errors) => acc.concat(errors.map((error) => error.key)),
    [],
  );
}

export default ERRORS;
