// src/lib/filesToEtlUnits/levels-request.js

/**
 * Hosts shared logic for configuring async levels requests.  There are
 * three consumers:
 *
 *    👉 FileField
 *    👉 Workbench
 *    👉 EtlField
 *
 * The first two describe the list of files from which to pull the levels.
 * They use the following keys:
 *
 *    page, limit, arrows, sources
 *
 */

import { FIELD_TYPES, SOURCE_TYPES } from '../sum-types';
import { InvalidStateError } from '../LuciErrors';

/* eslint-disable no-console */

/**
 * local utility functions
 */
const sourcePropsForRequest = ['filename', 'header-idx', 'map-symbols', 'null-value'];
/**
 * @function
 * @param {function | object} source
 * @returns {Object} source
 */
const sourceForRequest = (source, includeMapSymbol = true) => {
  const getValue = typeof source === 'function' ? source : (prop) => source[prop];

  // create a new sourcePropsForRequest to exclude map-symbols when includeMapSYmbol is false
  // use map filter
  let adjustedSourceProps = sourcePropsForRequest;
  if (!includeMapSymbol) {
    adjustedSourceProps = sourcePropsForRequest.filter(
      (prop) => prop !== 'map-symbols',
    );
  }

  const result = adjustedSourceProps.reduce((acc, prop) => {
    acc[prop] = getValue(prop);
    return acc;
  }, {});
  return result;
};
/**
 * 🦀 in the design: field types from the headerView can include impliedMvalue.
 * This request type does not hit the Levels request machinary so it works.
 * Nonetheless, to unify the process, we should add add ImpliedMvalue (separate
 * from another implied field that reside in the ETL domain: group-by-file)
 *
 * @function
 * @param {function} getValue
 * @param {('ETL' | 'FILE' | 'WIDE')} fieldType
 * @return {Object} request for the tnc py levels endpoint
 */
export const fileLevelsRequest = (getValue, fieldType, includeMapSymbol = false) => {
  switch (fieldType) {
    // call from headerView
    case FIELD_TYPES.FILE:
      return {
        purpose: getValue('purpose'),
        sources: [sourceForRequest(getValue, includeMapSymbol)],
      };
    // called from the headerView.
    case FIELD_TYPES.WIDE:
      return {
        purpose: getValue('purpose'),
        sources: makeSourcesFromWide(getValue),
      };
    // etl fields have a range of source types including WIDE
    // TODO: see how null-value-expansion is set for WIDE and other mvalue
    // sources
    case FIELD_TYPES.ETL:
      return {
        purpose: getValue('purpose'),
        sources: buildEtlSources(getValue('sources')),
        'map-symbols': getValue('map-symbols'),
        'null-value-expansion': getValue('null-value-expansion') ?? null,
      };
    default:
      throw new InvalidStateError(`Unreachable`);
  }
};

function buildEtlSources(sources, includeMapSymbol = true) {
  //
  // Universal processing of source types: RAW, WIDE, IMPLIED
  //
  const result = sources.flatMap((source) => {
    switch (source['source-type']) {
      case SOURCE_TYPES.RAW:
        return sourceForRequest(source, includeMapSymbol);

      case SOURCE_TYPES.WIDE:
        return makeSourcesFromWide((prop) => source[prop]);

      case SOURCE_TYPES.IMPLIED:
        return { flag: 'NA' };

      default:
        throw new InvalidStateError(`Unreachable`);
    }
  });

  return result;
}
/**
 * Task: Use the same source (filename and other props for the request) for each idx in
 * the wide header-idxs prop to create an array of sources.
 *
 * Note: source is from the sources prop of the ETL field where the source-type =
 * WIDE
 *
 * TODO: Need to include a null-value user-input for the wide-to-long
 * configuration. For now, assume mvalue is zero.  Note: this is only relevant
 * for mvalue (the factor/fields are derived from the fieldnames).
 *
 * @function
 * @param {function} getValue // a field in the wide-to-long configuration
 * @return {Array<Object>} sources // for the request
 */
function makeSourcesFromWide(getValue) {
  return getValue('header-idxs').map((idx) =>
    sourceForRequest((prop) => {
      if (prop === 'header-idx') {
        return idx;
      }
      return getValue(prop);
    }),
  );
}
