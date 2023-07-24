// src/lib/obsEtlToMatrix/display-obsetl.js

/**
 *
 * @description Transformer.
 * Creates the data structure required to track user subsetting of
 * the ObsETL-based cards.
 *
 */

import { toEtlFieldName } from '../filesToEtlUnits/transforms/prepare-for-transit';
import { lowerFirstChar } from '../../utils/common';

/**
 *
 * Utilized (Jul 2023)
 *
 * 2️⃣   Post-process what comes from mms/obs for use by the user
 *     when designing the request.
 *
 * ⚠️  the etlName to reconstruct the etlObject names is a mess.
 *
 * Initialize newly added CompMix entries
 * ... appends request: bool
 *
 * EtlUnit -> Display Data
 *
 * @function
 * @param {Object} data
 * @return {Object}
 */
const iniEtlUnitMea = ({ etlFields, etlUnits }) => (data) => {
    // closure/memoize for reuse
    const etlNameLookup = toEtlFieldName(etlFields);

    const { measurementType, components } = data;

    // 🔖 components for the measurement are values
    const values = Object.keys(components).reduce((acc, k) => {
        //
        // the lookup for time does not work; must go through etlUnit
        // 🦀 the backend names every mspan field using "time"
        // 🔖 the displayName is what the user knows about the field
        //
        const [displayName, timeProp] = components[k].componentValues?.spanValues
            ? [
                etlUnits[etlNameLookup(measurementType)].mspan,
                etlFields[etlUnits[etlNameLookup(measurementType)].mspan].time,
            ]
            : [etlNameLookup(components[k].componentName), undefined];
        acc[k] = iniComponent(components[k], displayName, timeProp);

        return acc;
    }, {});

    // measurement display name
    const displayName = etlNameLookup(measurementType);

    return {
        request: true,
        measurementType,
        displayName,
        'palette-name': displayName,
        'canvas-alias': displayName,
        values,
    };
};

/**
 *
 * 🔖 generating a matrix request depends on the structure
 *    of the values (so no additions)
 *
 *    Only use for spanValues; other values are not recorded in state.
 */
const iniValue = (value, requestDefault = true) => {
    return {
        request: requestDefault,
        value,
    };
};

function iniComponent(
    { componentName, componentValues, count },
    displayName,
    timeProp,
) {
    const tag = lowerFirstChar(componentValues.__typename);
    const values = componentValues?.spanValues ?? [];

    /*
    ((values = componentValues.txtValues) && (tag = 'txtValues')) ||
      ((values = componentValues.intValues) && (tag = 'intValues')) ||
      ((values = componentValues.spanValues) && (tag = 'spanValues'));
   */

    const result = {
        request: tag === 'spanValues', // default not requested for anything other than time
        componentName,
        displayName,
        'palette-name': displayName,
        'canvas-alias': displayName,
        reduced: tag !== 'spanValues', // default series for time
        tag,
        count,
        values:
            tag === 'spanValues'
                ? {
                    // with a new key = index
                    ...values.map((v) => iniValue(v, tag === 'spanValues')),
                }
                : { __ALL__: { value: '__ALL__', request: false } },
    };
    if (timeProp) {
        result.timeProp = timeProp;
    }
    return result;
}

/**
 *
 * Utilized (Jul 2023)
 *
 * obsEtl.subject -> qualities used to instantiate the workbench tree
 *
 * @function
 * @param {Subject} subject
 * @returns {Array}
 */
const iniEtlUnitQual = (subject, etlFields) => ({
    qualityName,
    qualityValues,
    count,
}) => {
    const etlNameLookup = toEtlFieldName(etlFields);

    return {
        request: true,
        subjectType: subject.subjectType,
        qualityName,
        displayName: etlNameLookup(qualityName),
        'palette-name': etlNameLookup(qualityName),
        'canvas-alias': etlNameLookup(qualityName),
        tag: lowerFirstChar(qualityValues.__typename),
        count,
        values: { __ALL__: { value: '__ALL__', request: true } },
        /*
        values: {
          ...values.map((v) => iniValue(v)),
        }, // generates an index
        */
    };
};

export { iniEtlUnitMea, iniEtlUnitQual };
