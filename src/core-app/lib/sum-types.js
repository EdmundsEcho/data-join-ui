/**
 *
 * Resource to support the re-use of critical or otherwise highly utilized
 * enumerations (~types).
 *
 * @module enumerations
 *
 */

/**
 * Deprecate?
 */
export const DISPLAY_VERSIONS = ['LARGE', 'BASELINE', 'MINI'].reduce((acc, key) => {
  acc[key] = key;
  return acc;
}, {});

/**
 * Multiple measurement values are possible. There are two use-cases.
 *
 *   1. Wide data format (where data is in the fieldname)
 *   2. Multiple, simultaneous measurements (they share date and components)
 */
export const MVALUE_MODE = {
  WIDE: 'wide/single',
  MULTIPLE: 'multipe',
};

export const FIELD_TYPES = {
  FILE: 'file-field',
  WIDE: 'wide-to-long',
  ETL: 'etl-field',
};
export const SOURCE_TYPES = {
  RAW: 'RAW',
  WIDE: 'WIDE',
  IMPLIED: 'IMPLIED',
};
export const SOURCE_TYPES_DESC = {
  RAW: 'source-types/raw-data',
  WIDE: 'source-types/wide-to-long-configuration',
  IMPLIED: 'source-types/implied-measurement',
};
export const PURPOSE_TYPES = {
  SUBJECT: 'subject',
  QUALITY: 'quality',
  MVALUE: 'mvalue',
  MCOMP: 'mcomp',
  MSPAN: 'mspan',
};
export const PURPOSE_TYPES_DESC = {
  SUBJECT: 'field-purpose/subject',
  QUALITY: 'field-purpose/quality',
  MVALUE: 'field-purpose/measurement-value',
  MCOMP: 'field-purpose/measurement-component',
  MSPAN: 'field-purpose/measurement-time-component',
};
export const ETL_UNIT_TYPES = {
  [PURPOSE_TYPES.QUALITY]: `etlUnit::quality`,
  [PURPOSE_TYPES.MVALUE]: `etlUnit::measurement`,
  quality: `etlUnit::quality`,
  mvalue: `etlUnit::measurement`,
};
export const NODE_TYPES = {
  CANVAS: 'canvas',
  PALETTE: 'palette',
  GROUP: 'group',
  EMPTY: 'empty',
  ROOT: 'root',
};

// consumer interface
export const STATUS = {
  INACTIVE: 'inactive',
  UNINITIALIZED: 'uninitialized',
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  EMPTY: 'empty',
  SUCCESS: 'success',
  CONSUMED: 'consumed', // the response was read by consumer
  inactive: 'inactive',
  idle: 'idle',
  pending: 'pending',
  resolved: 'resolved',
  rejected: 'rejected',
};

export const ROUTES = {
  meta: 'meta',
  files: 'files',
  fields: 'fields',
  workbench: 'workbench',
  matrix: 'matrix',
};

// -----------------------------------------------------------------------------
// 🔖 Interface
// etlUnit keys with a field(s)
export const ETL_UNIT_FIELDS = ['subject', 'codomain', 'mspan', 'mcomps'];
// -----------------------------------------------------------------------------
