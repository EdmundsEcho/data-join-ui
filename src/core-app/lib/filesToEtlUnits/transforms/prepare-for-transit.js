// src/lib/filesToEtlUnits/transforms/prepare-for-transit.js

/**
 *
 * @module /lib/filesToEtlUnits/transforms/prepare-for-transit
 *
 * @description
 * Removes levels and otherwise prepares the ui-designed configuration for
 * sending to the API.
 *
 * This module is a side-effect of a poorly desiged fielname translation
 * to meet the needs of the hosted db service.
 *
 */

import * as H from '../headerview-helpers';
import { PURPOSE_TYPES } from '../../sum-types';

/**
 * preEtlObj that is db-compliant
 * 👎 exposes db implementation
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
 * Aug 2023
 * use depends on db-compliant nature of graphql data
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
 *
 * Utilized (Jul 2023)
 *
 * Prepare the field names for what the backend uses.
 *
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
 *
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
 * Private, export for testing only
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

/* private, export for testing only */
export function sanitizeFieldName(name) {
    return name.replace(/[\W_]/g, '').toLowerCase();
}

export default etlObjectTransit;
