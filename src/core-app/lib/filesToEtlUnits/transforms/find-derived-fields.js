// src/lib/filesToEtlUnits/transforms/find-derived-fields.js

/**
 * @module lib/filesToEtlUnits/transforms/find-derived-fields
 * @description
 *
 * The challenge is to "look ahead" to see what the impacts are on the etl-units
 * that result following the pivot... while still being in the headerView. So,
 * it's a prediction/look-ahead computation.
 *
 * Relevant structures:
 *
 * etl-unit :: field-alias: {
 *  type: quality|mvalue
 *  subject: String
 *  mcomps: [String]
 *  mspan: String
 *  codomain: String
 * }
 *
 * headerView :: filename: {
 *   filename: String,
 *   enabled: Bool,
 *   ...,
 *   fields: [{
 *     field-alias: String,
 *     enabled: Bool,
 *     purpose: subject|quality|mcomp|mspan|mvalue,
 *     ...
 *   }]
 * }
 *
 */
import { buildImpliedMvalue } from './implied-mvalue';
import { buildWideToLongFields } from './wide-to-long-fields';
import * as H from '../headerview-helpers';
import { SOURCE_TYPES } from '../../sum-types';
import { InvalidStateError } from '../../LuciErrors';
import { colors } from '../../../constants/variables';

/* eslint-disable no-console */

const { RAW } = SOURCE_TYPES;

/**
 * 📌
 *
 * Find and seed the derived field configurations.
 *
 *     headerView -> headerView with updated derived field configs
 *
 * There are two types of derived fields in this header/file context.
 *
 *   👉 implied-mvalue; inidcated when mspan exists but no mvalue
 *   👉 wideToLongFields; indicated when mvalue count > 1
 *
 * The presence of derived fields depends on the active fields in the
 * headerView; purpose and counts therein. Call this when updating
 * any of the following
 *
 *   👉 purpose
 *   👉 enabled
 *   👉 field-alias (=> wideToLongFields factors or implied-value mspan)
 *
 * The return value ensures the integrity of the configuration state as
 * the user makes changes.
 *
 * @function
 * @param {Object} hv
 * @param {?Array<FileField>} previousHvFields heuristic for wideToLongFields
 * @returns headerView Augmented with implied fields and many other udpates.
 *
 * @todo case: mvalue in header, mvalue from implied; would require manual
 * addition of implied mvalue.
 *
 */
export const findAndSeedDerivedFields = ({
  hv,
  previousHvFields,
  DEBUG = false,
  COLOR = colors.blue,
}) => {
  if (typeof hv.fields === 'undefined') {
    throw new InvalidStateError('validate-headerview undefined hv.fields');
  }
  // 👍 To indentify when we need either implied or wide-to-long configurations,
  //    start from the active RAW fields.
  const fields = H.getActiveHvFields(hv, [RAW]);
  const mvalues = fields.filter((f) => f.purpose === 'mvalue');
  const mspans = fields.filter((f) => f.purpose === 'mspan');

  const hasWideFields = mvalues.length > 1;
  const hasImpliedMvalueField = mvalues.length === 0 && mspans.length > 0;

  if (DEBUG) {
    console.group(`%c📁 hv: ${hv.filename}`, COLOR);
    console.log(`%chas wide fields: ${hasWideFields}`, COLOR);
    console.log(`%chas implied mvalue: ${hasImpliedMvalueField}`, COLOR);
    console.groupEnd(`%c📁 hv: ${hv.filename}`, COLOR);
  }

  // evidence of wide-to-long file format
  /* eslint-disable no-param-reassign */
  hv = hasWideFields
    ? buildWideToLongFields(hv, previousHvFields) // shallow copy when changed
    : H.removeProp(['wideToLongFields'], hv); // shallow copy

  // evidence of a missing mvalue
  hv = hasImpliedMvalueField
    ? buildImpliedMvalue(hv, DEBUG)
    : H.removeProp(['implied-mvalue'], hv);
  /* eslint-enable no-param-reassign */

  return hv;
};

export default findAndSeedDerivedFields;
