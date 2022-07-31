// src/lib/filesToEtlUnits/transforms/prepare-for-transit.js

/**
 * @module /lib/filesToEtlUnits/transforms/prepare-for-transit
 * @description
 * Removes levels and otherwise prepares the ui-designed configuration for
 * sending to the API.
 *
 */

import * as H from '../headerview-helpers';
import { PURPOSE_TYPES } from '../../sum-types';

/**
 * preEtlObj
 */
const etlObjectTransit = (etlObject) => {
  const etlFields = Object.entries(etlObject.etlFields).reduce(
    (fields, [fieldName, field]) => {
      const updatedField = {
        ...H.removeProp('levels', field),
        sources: field.sources.map((s) => H.removeProp('levels', s)),
      };

      return {
        ...fields,
        [fieldName]: {
          'map-weights': null,
          ...updatedField,
          // time: time ? time : null
        },
      };
    },
    {},
  );

  return {
    etlFields,
    etlUnits: etlObject.etlUnits,
  };
};

/**
 * 📌
 *
 * Initialize with etlFields
 *
 * Returns a function: warehouseName -> etlFieldName
 *
 * @function
 * @param {EtlFields} etlFields
 * @param {string} warehouseName
 * @return {string} etlFieldName
 *
 */
export function toEtlFieldName(etlFields) {
  const lookupMap = createNameMap(etlFields);
  return (warehouseName) => lookupMap[warehouseName];
}

/**
 * Missing post-processing of the extraction
 *
 *   🔖 ObsEtl props:
 *
 *     👉 componentName where mspan changed to 'time'
 *
 *     👉 qualityName 'q_' prefix
 *
 *     👉 measurementType with 'm_' prefix
 *
 *     ⬜ replace spanValues with what is in the etlObject
 */

/**
 * Prepare the field names for what the backend uses.
 *
 * 🛈  Need to think more about what might "get lost in translation"
 *    However, most of the risk is mitigated if this is run prior
 *    to sending to the backend.
 *
 * ⬜ 🦀 Include this renaming schema when determining if a
 *       field name/alias is unique.
 *
 * @function
 * @param {EtlFields} etlFields
 * @return {Object} keyed by fieldName -> sanitizedName
 *
 */
export function createNameMap(etlFields) {
  let fieldName = '';
  /* eslint-disable no-param-reassign */
  return Object.values(etlFields).reduce((nameMap, field) => {
    fieldName = sanitizeFieldName(field.name);
    switch (field.purpose) {
      case PURPOSE_TYPES.QUALITY:
        fieldName = `q_${fieldName}`;
        break;
      case PURPOSE_TYPES.MVALUE:
        fieldName = `m_${fieldName}`;
        break;
      case PURPOSE_TYPES.MSPAN:
        fieldName = `time`;
        break;
      default:
        break;
    }
    nameMap[fieldName] = field.name;
    return nameMap;
  }, {});
}

export function sanitizeFieldName(name) {
  return name.replace(/[\W_]/g, '').toLowerCase();
}
/*
This function is run by tnc-py to generate names for the sql db
def sanitize_name(name):
        allowed_chars = re.compile(r'[\W_]+')
        return allowed_chars.sub('', name).lower().replace(' ', '')
*/

export default etlObjectTransit;
