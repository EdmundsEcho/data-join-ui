// src/lib/filesToEtlUnits/file-to-header.js

/**
 * @module file-to-header
 *
 * @description
 * response from INSPECTION service -> headerView
 *
 * The module exports `addFileToHeaderViews`
 *
 * Part 1 of 2 in
 * [file-fields] -> [field-files]
 * where the api macro-inspection generates file-fields
 *
 * This module accomplishes the first step:
 *   file-fields -> headerView (the UI for file-fields)
 *
 *   where header = augmented `file-fields`
 *
 * The function uses a config object to specify the transformation/augmentation.
 *
 * Features of the augmentation:
 *
 * 1. computes `header-alias` from `header` that de-dups entries by
 *    concatenating an idx where required
 * 2. is keyed using `filename`
 * 3. injects the "enabled" property to track user selection of fields
 * 4. is configurable
 *
 */
import { fieldFromFileField } from './transforms/headerview-field';
import { findAndSeedDerivedFields } from './transforms/find-derived-fields';
import { MVALUE_MODE } from '../sum-types';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
//------------------------------------------------------------------------------

/**
 * Configuration
 *
 * v0.5.0 added mvalueMode
 *
 * This module operates on :: hv
 *
 * This configuration object defines how to augment the data received from
 * the macro-inspection in order to accomplish the following:
 *
 * 1. Enable user input in the header view (including field selection)
 * 2. Facilitate the pivot :: [file-fields] -> [field-files]
 *    where
 *    * `field-files` has the the shape required for the etlField view
 *    * `field-files` generates the `sources` property for each etlField
 *
 * ⬜ run mvalue summary statistics computation when loading. Include required
 * props to generate a etl-field (top-level) value from all sources to avoid
 * recomputing from levels in each source.
 *
 * Properties that confirm a transformation:
 * enabled, removed delimiter and hash.
 *
 *     ```
 *     defaultConfig: {
 *       configFile: function,
 *       configField: function
 *     }
 *     ```
 *
 */
const defaultConfig = {
  // closure
  configFile: (file) => ({
    // (file) -> file
    filename: file.filename,
    header: file.header,
    enabled: true,
    nrows: file.nrows,
    fields: file.fields,
    mvalueMode: MVALUE_MODE.MULTIPLE,
  }),
  // (file, field) -> field
  configField: fieldFromFileField,
};

/**
 *
 * Returns a function:
 *
 *     raw api new file -> headerView
 *
 * Utilized by the headerView.middleware to normalize
 * the raw api data.
 *
 */
export const normalizer = (file) => {
  return findAndSeedDerivedFields({
    hv: fileToHeaderView(defaultConfig)(file),
    DEBUG,
  });
};

/**
 * 📌 raw api file (inspection result) -> headerView
 *
 * Transform the data using configFile and configField functions provided
 * as configuration objects.
 *
 * @function
 * @returns {function}
 *
 */
function fileToHeaderView({ configFile, configField } = defaultConfig) {
  // closure
  return (file) => {
    // const { fields, ...configuredTopLevel } = configFile(file); // fields from API
    const partialTransform = configFile(file);
    const transformedFields = partialTransform.fields.map((field) =>
      configField(file, field),
    ); // configured fields

    return {
      ...partialTransform,
      fields: transformedFields,
    };
  };
}

export const forTesting = {
  defaultConfig,
};
