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
 * @function
 * @param {function} getValue
 * @param {('ETL' | 'FILE' | 'WIDE')} fieldType
 * @return {Object} request for the tnc py levels endpoint
 */
export const fileLevelsRequest = (getValue, fieldType) => {
  switch (fieldType) {
    case FIELD_TYPES.FILE:
      return {
        purpose: getValue('purpose'),
        sources: [
          {
            filename: getValue('filename'),
            'header-index': getValue('header-idx'),
          },
        ],
        arrows: getValue('map-symbols')?.arrows ?? {},
      };
    case FIELD_TYPES.ETL:
      return {
        purpose: getValue('purpose'),
        sources: buildSources(getValue('sources')),
        arrows: getValue('map-symbols')?.arrows ?? {},
      };
    case FIELD_TYPES.WIDE:
      return {
        purpose: getValue('purpose'),
        sources: makeFromWide(getValue('header-idxs'), getValue('filename')),
        arrows: {},
      };
    default:
      throw new InvalidStateError(`Unreachable`);
  }
};

function buildSources(sources) {
  //
  // Unify source types: RAW, WIDE, IMPLIED
  //
  const result = sources.flatMap((source) => {
    switch (source['source-type']) {
      case SOURCE_TYPES.RAW:
        return {
          filename: source.filename,
          'header-index': source['header-idx'],
        };

      case SOURCE_TYPES.WIDE:
        return makeFromWide(source['header-idxs'], source.filename);

      case SOURCE_TYPES.IMPLIED:
        return { flag: 'NA' };

      default:
        throw new InvalidStateError(`Unreachable`);
    }
  });

  return result;
}
/**
 * task: use the same filename across each of the header-idx in header-idxs
 */
function makeFromWide(idxs, filename) {
  return idxs.map((idx) => ({ filename, 'header-index': idx }));
}
