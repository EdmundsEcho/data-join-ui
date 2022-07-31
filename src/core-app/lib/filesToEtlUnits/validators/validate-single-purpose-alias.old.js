// src/lib/filesToEtlUnits/validators/validate-single-purpose-alias.js

/**
 * @module validators/validate-single-purpose-alias
 */
import * as H from '../headerview-helpers';
import ERRORS from '../../../constants/error-messages';
// import { colors } from '../../../constants/variables';

/* eslint-disable no-console */

//------------------------------------------------------------------------------
/**
 * all field purposes
 *
 * @function
 *
 * @param {Object} hvs
 * @param {Object} previousErrors errorsByFile
 * @return {Object} errorsByFile
 *
 * 'field-alias' is used to align fields when files get stacked during
 * the pivot transformation.
 *
 * The validation makes sure that fields aligned with an alias have
 * matching purpose values.
 *
 */
export const singlePurposeAlias = ({
  headerViews,
  priorHvsErrors = {},
  DEBUG,
}) => {
  if (DEBUG) {
    console.group('singlePurposeAlias');
    console.debug('previousHvsErrors');
    console.dir(priorHvsErrors);
    console.groupEnd();
  }

  // sub-routine
  function go(hv, otherHvs) {
    // done when otherHvs is empty
    if (otherHvs.length === 0) {
      return priorHvsErrors;
    }

    // compute errors for hv
    const { errorsAhead, errors } = getHvAliasErrors(hv, otherHvs);

    // 💰 package the return values
    if (errors.length > 0) {
      priorHvsErrors[hv.filename] = [
        ...new Set([...errors, ...(priorHvsErrors[hv.filename] || [])]),
      ];
    }

    // done?
    if (!errorsAhead || otherHvs.length === 1) {
      return priorHvsErrors;
    }

    // iterate with the next hv
    const [nextHv, ...tail] = otherHvs;
    return go(nextHv, tail);
  }

  // start the computation
  const [firstHv, ...otherHvs] = H.enabledFieldsInHvs(headerViews);

  return go(firstHv, otherHvs);
};

/**
 * @function
 *
 * @param {Object} hv headerView
 * @param {Array.<Field>} hv.fields File/header fields
 * @param {String} hv.filename The data source
 * @param {Array.<Object>} otherHvs headerViews
 * @return {object}
 *
 */
export function getHvAliasErrors(hv, otherHvs) {
  // create a Map 'field-alias': purpose
  // case 1: initialization => set initial value of purpose
  // case 2: purpose already set =>
  //         does the new purpose value match the current?
  //         -> match: do nothing
  //         -> no match: failure; report error

  const error = ERRORS.singlePurposeAlias;

  const { aliasMapToPurpose: apMap, errorsAhead } = buildMap(otherHvs);

  return {
    errorsAhead,
    errors: hv.fields.reduce((errors, field) => {
      if (
        apMap.has(field['field-alias']) &&
        apMap.get(field['field-alias']) !== field.purpose
      ) {
        errors.push(error(field['field-alias']));
      }
      return errors;
    }, []),
  };
}

/**
 * Create the Map required to identify fields with the same field-alias
 * but different purpose values.
 *
 * 👉 The map is built using a Set of [field-alias, purpose]
 * 👉 Also provides a heuristic that indicates whether similar errors need to be
 *    processed.
 *
 * @function
 * @param {Object} otherHvs headerViews
 * @return {{ aliasMapToPurpose: Map, errorsAhead: bool }}
 */
function buildMap(otherHvs) {
  if (!Array.isArray(otherHvs)) {
    return buildMap(Object.values(otherHvs));
  }
  if (otherHvs.length === 0) {
    return {};
  }

  const buffer = otherHvs.reduce((acc, hv) => {
    return [
      ...acc,
      ...hv.fields.map((field) => [field['field-alias'], field.purpose]),
    ];
  }, []);

  const keyValueSet = new Set(buffer);
  const errorsAhead = buffer.length === keyValueSet.size;

  return {
    aliasMapToPurpose: new Map(keyValueSet),
    errorsAhead,
  };
}

export default singlePurposeAlias;
