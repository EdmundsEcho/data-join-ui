/**
 * Utilized by the Delegate components
 * ... the component that displays the purpose-specific user input.
 */
import { PURPOSE_TYPES, FIELD_TYPES } from '../lib/sum-types';
import { InputError } from '../lib/LuciErrors';

export { PURPOSE_TYPES, FIELD_TYPES };

const LEVELS_DISPLAY_TYPES = {
  SUMMARY: 'summary view',
  RANGES: 'range view',
  SCROLL: 'scroll view',
  NOVIEW: 'no view',
};

//------------------------------------------------------------------------------
// File/Header Fields
//------------------------------------------------------------------------------
const fileFieldSchema = {
  [PURPOSE_TYPES.SUBJECT]: {
    etlUnit: true,
    purpose: true,
    levels: true,
    time: false,
    format: true,
    'map-symbols': true,
    'map-files': false,
    'map-weight': false,
    'codomain-reducer': isEtlUnitCodomain(PURPOSE_TYPES.SUBJECT),
    'null-value': false,
    'slicing-reducer': false,
    'permit-null': false,
    levelsDisplayType: LEVELS_DISPLAY_TYPES.SCROLL,
  },
  [PURPOSE_TYPES.QUALITY]: {
    etlUnit: true,
    purpose: true,
    levels: true,
    time: false,
    format: true,
    'map-symbols': true,
    'map-files': true,
    'map-weight': true,
    'codomain-reducer': isEtlUnitCodomain(PURPOSE_TYPES.QUALITY),
    'null-value': true,
    'slicing-reducer': false,
    'permit-null': false,
    levelsDisplayType: LEVELS_DISPLAY_TYPES.SCROLL,
  },
  [PURPOSE_TYPES.MSPAN]: {
    etlUnit: true,
    purpose: true,
    levels: true,
    time: true,
    format: true,
    'map-symbols': true,
    'map-files': false,
    'map-weight': false,
    'codomain-reducer': isEtlUnitCodomain(PURPOSE_TYPES.MSPAN),
    'null-value': true,
    'slicing-reducer': false,
    'permit-null': false, // use impliedMvalue override to get true
    levelsDisplayType: LEVELS_DISPLAY_TYPES.RANGES,
  },
  [PURPOSE_TYPES.MCOMP]: {
    etlUnit: true,
    purpose: true,
    levels: true,
    levelsOverlap: 0,
    time: false,
    format: true,
    'map-symbols': true,
    'map-files': true,
    'map-weight': true,
    'codomain-reducer': isEtlUnitCodomain(PURPOSE_TYPES.MCOMP),
    'null-value': true,
    'slicing-reducer': false,
    'permit-null': false,
    levelsDisplayType: LEVELS_DISPLAY_TYPES.SCROLL,
  },
  [PURPOSE_TYPES.MVALUE]: {
    etlUnit: true,
    purpose: true,
    levels: true,
    time: false,
    format: true,
    'map-symbols': true,
    'map-files': false,
    'map-weight': false,
    'codomain-reducer': isEtlUnitCodomain(PURPOSE_TYPES.MVALUE),
    'null-value': true,
    'slicing-reducer': true,
    'permit-null': true,
    levelsDisplayType: LEVELS_DISPLAY_TYPES.SUMMARY,
  },
};

//------------------------------------------------------------------------------
// Etl Fields (post pivot)
//------------------------------------------------------------------------------
const etlFieldSchema = {
  [PURPOSE_TYPES.SUBJECT]: {
    etlUnit: true,
    purpose: true,
    levels: true,
    time: false,
    format: true,
    'map-symbols': false,
    'map-files': false,
    'map-weight': false,
    'codomain-reducer': isEtlUnitCodomain(PURPOSE_TYPES.SUBJECT),
    'null-value-expansion': false,
    'slicing-reducer': false,
    sources: true,
    'sources-reorder': isEtlUnitCodomain(PURPOSE_TYPES.SUBJECT),
    'permit-null': false,
    levelsDisplayType: LEVELS_DISPLAY_TYPES.NOVIEW,
  },
  [PURPOSE_TYPES.QUALITY]: {
    etlUnit: true,
    purpose: true,
    levels: true,
    time: false,
    format: true,
    'map-symbols': true,
    'map-files': true,
    'map-weight': true,
    'codomain-reducer': isEtlUnitCodomain(PURPOSE_TYPES.QUALITY),
    'null-value-expansion': true,
    'slicing-reducer': false,
    sources: true,
    'sources-reorder': isEtlUnitCodomain(PURPOSE_TYPES.QUALITY),
    'permit-null': false,
    levelsDisplayType: LEVELS_DISPLAY_TYPES.SCROLL,
  },
  [PURPOSE_TYPES.MSPAN]: {
    etlUnit: true,
    purpose: true,
    levels: true,
    time: true,
    format: true,
    'map-symbols': false,
    'map-files': false,
    'map-weight': false,
    'codomain-reducer': isEtlUnitCodomain(PURPOSE_TYPES.MSPAN),
    'null-value-expansion': false, // null mvalue has infinite comp values
    'slicing-reducer': false,
    sources: true,
    'sources-reorder': isEtlUnitCodomain(PURPOSE_TYPES.MSPAN),
    'permit-null': false, // use impliedMvalue override to get true
    levelsDisplayType: LEVELS_DISPLAY_TYPES.RANGES,
  },
  [PURPOSE_TYPES.MCOMP]: {
    etlUnit: true,
    purpose: true,
    levels: true,
    time: null,
    format: true,
    'map-symbols': true,
    'map-files': true,
    'map-weight': true,
    'codomain-reducer': isEtlUnitCodomain(PURPOSE_TYPES.MCOMP),
    'null-value-expansion': false, // null mvalue has infinite comp values
    'slicing-reducer': false,
    sources: true,
    'sources-reorder': isEtlUnitCodomain(PURPOSE_TYPES.MCOMP),
    'permit-null': false, // ⚠️  likely in flux
    levelsDisplayType: LEVELS_DISPLAY_TYPES.SCROLL,
  },
  [PURPOSE_TYPES.MVALUE]: {
    etlUnit: true,
    purpose: true,
    levels: true,
    time: false,
    format: true,
    'map-symbols': true,
    'map-files': false,
    'map-weight': false,
    'codomain-reducer': isEtlUnitCodomain(PURPOSE_TYPES.MVALUE),
    'null-value-expansion': true,
    'slicing-reducer': true,
    sources: true,
    'sources-reorder': isEtlUnitCodomain(PURPOSE_TYPES.MVALUE),
    'permit-null': true,
    levelsDisplayType: LEVELS_DISPLAY_TYPES.SUMMARY,
  },
};

/**
 * Predicate to determine which inputs to display.
 *
 * Curried to set the input type and purpose.
 *
 * Usage:
 *
 *     import { displayInput as init, FILE }
 *     const displayInput = init(FILE, purpose)
 *
 *
 * @function
 * @param {FIELD_TYPES} fileOrEtl
 * @param {string} purpose
 * @param {string} property Field prop
 * @return {bool}
 */
export const displayInput = (fileOrEtl, purpose) => {
  // default to not show anything in the event purpose is undefined
  // Required to prevent runtime error when a field source is not fully formed.
  try {
    if (typeof purpose === 'undefined' || purpose === null) {
      throw new InputError(
        `field-input-config: Missing purpose; default display to false.`,
      );
    }
  } catch (e) {
    /* eslint-disable-next-line */
    console.error(e.message);
    return false;
  }

  const schema =
    fileOrEtl === FIELD_TYPES.FILE ? fileFieldSchema : etlFieldSchema;
  return (property) => schema[purpose][property];
};

function isEtlUnitCodomain(purpose) {
  return [PURPOSE_TYPES.MVALUE, PURPOSE_TYPES.QUALITY].includes(purpose);
}

export default displayInput;
