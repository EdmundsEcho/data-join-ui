/**
 *
 * Resource to support the re-use of critical or otherwise highly utilized
 * enumerations (~types).
 *
 * @module enumerations
 *
 */
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
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  idle: 'idle',
  pending: 'pending',
  resolved: 'resolved',
  rejected: 'rejected',
};

// -----------------------------------------------------------------------------
// 🔖 Interface
// etlUnit keys with a field(s)
export const ETL_UNIT_FIELDS = ['subject', 'codomain', 'mspan', 'mcomps'];
// -----------------------------------------------------------------------------
