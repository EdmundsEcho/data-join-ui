// src/lib/obsEtlToMatrix/display-obsetl.js

/**
 *
 * @description Transformer.
 * Creates the data structure required to track user subsetting of
 * the ObsETL-based cards.
 *
 */

// import { toEtlFieldName } from '../filesToEtlUnits/transforms/prepare-for-transit';
import { lowerFirstChar } from '../../utils/common';
import {
  newSelectionModel,
  PURPOSE_TYPES,
  COMPUTATION_TYPES,
} from '../dataGridSelectionLib';

/**
 *
 * Used to instantiate the palette tree with the measurements.
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
 *       How maintain user vs db-compliant? Consider:
 *          componentName -> db-compliant
 *          displayName, palette-name, canvas-name -> user
 *      ?? How bridge eltObj with db-compliant (align the sources)?
 *
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
const iniEtlUnitMea =
  ({ etlFields, etlUnits }) =>
  (data) => {
    // closure/memoize with etlObj data for reuse
    // const etlNameLookup = toEtlFieldName(etlFields);

    // 🚧 Should remain user-centric (separate from db-compliant)
    const { measurementType, components } = data;

    // drive the sequence of the reduction with mspan at the top
    const types = Object.values(components).map((c) => c.componentValues.__typename);
    const reduceSequenceKeys = [
      types.indexOf('SpanValues'),
      ...types.map((t, i) => (t === 'SpanValues' ? -1 : i)).filter((i) => i !== -1),
    ];

    // update graphql components for the measurement (mcomp or mspan)
    const newComponents = reduceSequenceKeys.reduce((acc, k, newK) => {
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

      acc[newK] = iniComponent(components[k], displayName, timeProp);

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

/**
 * Convert the graphql obsEtl values that take on one of three
 * types: txtValues, intValues, spanValues.
 *
 * For spanValues we set the values prop to include all of the spanValues.  For
 * other types, values is undefined.  We use a selection model instead.
 *
 * tag is one of: txtValues, intValues, spanValues and found on the __typename
 * prop of componentValues.
 *
 */
function iniComponent(
  { componentName, componentValues, count },
  displayName,
  timeProp,
) {
  const tag = lowerFirstChar(componentValues.__typename);

  let values = componentValues?.spanValues ?? undefined;
  values = values?.map((v) => _iniValue(v, tag === 'spanValues'));

  const selectionModel = newSelectionModel({
    purpose: tag === 'spanValues' ? PURPOSE_TYPES.MSPAN : PURPOSE_TYPES.MCOMP,
    rowCountTotal: count,
  });

  const result = {
    request: tag === 'spanValues', // default only include mspan in the collection of select fields
    componentName,
    displayName,
    'palette-name': displayName,
    'canvas-alias': displayName,
    reduced: selectionModel.computationType === COMPUTATION_TYPES.REDUCE,
    tag,
    count,
    values,
    selectionModel,
  };
  if (timeProp) {
    result.timeProp = timeProp;
  }
  return result;
}

/**
 * Used to instantiate the palette tree with the qualities.
 *
 * obsEtl.subject -> qualities used to instantiate the workbench tree
 *
 * see also: iniEtlUnitMea
 *
 * @function
 * @param {Subject} subject
 * @returns {Array}
 */
const iniEtlUnitQual =
  (subject) =>
  ({ qualityName, qualityValues, count }) => {
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
      values: undefined,
      selectionModel: newSelectionModel({
        purpose: PURPOSE_TYPES.QUALITY,
        rowCountTotal: count,
      }),
    };
  };

export { iniEtlUnitMea, iniEtlUnitQual };
