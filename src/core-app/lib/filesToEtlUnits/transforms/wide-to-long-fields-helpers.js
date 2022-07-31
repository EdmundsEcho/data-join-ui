// src/lib/filesToEtlUnits/transforms/wide-to-long-fields-helpers.js

/**
 * Support functions for the wide-to-long-fields module
 */
export const filename = (mvalues) => mvalues[0].filename;
export const headerIdxs = (mvalues) =>
  mvalues.map((field) => field['header-idx']);
export const fieldAliases = (mvalues) =>
  mvalues.map((field) => field['field-alias']);
export const aliasIdxMap = (mvalues) =>
  mvalues.reduce(
    (acc, field) => ({
      ...acc,
      [field['field-alias']]: field['header-idx'],
    }),
    {},
  );
