// src/lib/feedback/fixes/single-subject-name.js

/**
 * @module feedback/fixes/single-subject-name
 *
 * @description
 * Lazy Fix series
 */
import { getHeaderViews, getSelected } from '../../../ducks/rootSelectors';
import { InvalidStateError } from '../../LuciErrors';
import { PURPOSE_TYPES as TYPES } from '../../sum-types';
import {
  mapHeaderViews,
  mapHeaderViewFields,
} from '../../filesToEtlUnits/headerview-helpers';

/* eslint-disable no-console */

/**
 * Apply only with protection of guards.
 * Lazy payload generator.
 * Link in error-message object lazyFixes
 *
 * @function
 * @param {Object} state
 * @return {Object} hvs
 *
 */
export const fixSameAsOtherSubjects = (state, DEBUG = false) => {
  const hvs = getHeaderViews(state);
  // [[path, displayName]]
  const firstSelected = getSelected(state)[0][0];

  const newName = getDefaultSubjectName(hvs, firstSelected);
  if (DEBUG) {
    console.log(`New subject name for hvs: ${newName}`);
  }
  if (typeof newName === 'undefined') {
    throw new InvalidStateError(`Additional guards need to be in place`);
  }
  const hvMutation = (hv) =>
    // functor
    mapHeaderViewFields((field) => {
      if (field.purpose === TYPES.SUBJECT) {
        /* eslint-disable-next-line no-param-reassign */
        // field['field-alias'] = newName;
        return { ...field, 'field-alias': newName };
      }
      return field;
    }, hv);

  // functor
  return mapHeaderViews(hvMutation, hvs);
};

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

export default fixSameAsOtherSubjects;
