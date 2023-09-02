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
 * 🚧 Interprets view using both etlObj and graphql data.
 *    WIP maintain user-view independent from underlying, server-side processing.
 *
 * 🟡 Weak-link in design: need to lookup span data using etlObj (user-centric)
 *    using data from graphql server (may or may not be db-compliant, may or may
 *    not be user-centric). 💥 How update state with actions.
 *    🔑 what can you use to find the etlObj data? displayName
 *
 *    Augmenting graphql data with etlObj
 *
 *      Data not present in graphql required to present workbench view
 *      - time configuration
 *
 * 2️⃣   Post-process what comes from mms/obs graphql for use by the user
 *     when designing the request.
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
    // closure/memoize with etlObj data for reuse
    // const etlNameLookup = toEtlFieldName(etlFields);

    // 🚧 Should remain user-centric (separate from db-compliant)
    const { measurementType, components } = data;

    // update graphql components for the measurement (mcomp or mspan)
    const newComponents = Object.keys(components).reduce((acc, k) => {
        //
        // augment the mea component with etlObj timeProp when
        // graphql component has spanValues
        //
        // ?? 🦀 using componentName to set displayName (see iniComponent)
        //
        const [displayName, timeProp] = components[k].componentValues?.spanValues
            ? [
                etlUnits[measurementType].mspan,
                etlFields[etlUnits[measurementType].mspan].time,
            ]
            : [components[k].componentName, undefined];

        acc[k] = iniComponent(components[k], displayName, timeProp);

        return acc;

    }, {});

    // measurement display name
    const displayName = measurementType;

    return {
        request: true,
        measurementType,
        displayName,
        'palette-name': displayName,
        'canvas-alias': displayName,
        values: newComponents,
    };
};

/**
 *
 * 🔖 generating a matrix request depends on the structure
 *    of the values (so no additions)
 *
 *    Only use for spanValues; other values are not recorded in state.
 */
const _iniValue = (value, requestDefault = true) => {
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
                    ...values.map((v) => _iniValue(v, tag === 'spanValues')),
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
const iniEtlUnitQual = (subject) => ({
    qualityName,
    qualityValues,
    count,
}) => {
    // const etlNameLookup = toEtlFieldName(etlFields);

    return {
        request: true,
        subjectType: subject.subjectType,
        qualityName,
        displayName: qualityName,
        'palette-name': qualityName,
        'canvas-alias': qualityName,
        tag: lowerFirstChar(qualityValues.__typename),
        count,
        values: { __ALL__: { value: '__ALL__', request: true } },
        /*
        values: {
          ...values.map((v) => _iniValue(v)),
        }, // generates an index
        */
    };
};

export { iniEtlUnitMea, iniEtlUnitQual };
