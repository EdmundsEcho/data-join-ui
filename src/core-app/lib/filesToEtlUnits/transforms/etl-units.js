/**
 * @module etl-units
 * @description
 * Computes the etl-unit from file-level information.
 *
 * Generates etl-units from active fields.
 * TODO: make etl-units when only mspan is defined, but not mvalue.
 *
 * Timing of the computation matters. There is a predicted etlUnit set of values
 * and a final computed value.
 *
 * @todo validate Jun 2020 addition of the etlUnit codomain-reducer prop
 *
 */

import {
  getActiveHvFields,
  fieldsKeyedOnPurpose,
  selectPropsInObj,
} from '../headerview-helpers';
import { selectEtlUnitsWithFieldName } from './etl-unit-helpers';
import { PURPOSE_TYPES as TYPES } from '../../sum-types';

import { InvalidStateError, DesignError } from '../../LuciErrors';

// -----------------------------------------------------------------------------
const GLOBAL_DEBUG = process.env.REACT_APP_DEBUG_ERROR_FIX === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 *
 * Returns the key for the etl-unit for a given etlField
 *
 * 0.5.1
 * string -> [string]
 *
 * @function
 * @param {string} etlFieldName
 * @param {Array<Object>} ppHvs
 * @return {Array<String>} etlUnit name(s)
 */
export const maybeEtlUnitFromName = (etlFieldName, ppHvs) => {
  return selectEtlUnitsWithFieldName(etlFieldName, etlUnitsFromPrePivot(ppHvs));
};
/**
 * Estimate based on current hvs value.
 * Generates the collection of etlUnits keyed with alias/name
 * input: { etl-field-name: { headerView }}
 * @function
 * @param {Array<HeaderView>} headerViews
 * @param {boolean} DEBUG
 * @return {Object} etlUnits
 */
export const predictEtlUnitsFromHeaderViews = (headerViews, DEBUG = GLOBAL_DEBUG) => {
  if (DEBUG) {
    console.group(`combine hv EtlUnits -> EtlUnits for other hvs`);
  }

  if (!Array.isArray(headerViews)) {
    return predictEtlUnitsFromHeaderViews(Object.values(headerViews));
  }

  const result = headerViews
    .map((hv) => getActiveHvFields(hv))
    .reduce((etlUnits, fields) => {
      if (DEBUG) {
        console.log(`combining...`);
      }
      return {
        ...etlUnits,
        ...etlUnitsFromFields(fields, DEBUG),
      };
    }, {});

  if (DEBUG) {
    console.dir(result);
    console.log(`done.`);
    console.groupEnd();
  }
  return result;
};

/**
 *
 * Reduce the atoms of etlUnits by reducing out the filename key.
 *
 * In this validation context, there are two kinds of etlUnits.
 *
 * 👉 from a single headerView (fields -> { filename: etlUnits })
 *
 * 👉 from all of the headerViews
 *
 * The first is an atom of computation; it has no meaning in the domain.
 * The atom is useful for reusing the computation that derived it.
 *
 * @function
 * @param {Object<Filename,Object>} etlUnitAtomsKeyedByHv
 * @param {boolean} DEBUG
 * @return {EtlUnits}
 *
 */
export function combineEtlUnits(etlUnitAtomsKeyedByHv, DEBUG) {
  if (DEBUG) console.group(`combine atoms of EtlUnits -> EtlUnits for hvs`);
  const result = Object.values(etlUnitAtomsKeyedByHv).reduce(
    // drop the filename key
    (combined, etlUnitsFromHvFields) => {
      if (DEBUG) {
        console.log(`combining...`);
        console.dir(etlUnitsFromHvFields);
      }
      return {
        ...combined,
        ...etlUnitsFromHvFields,
      };
    },
    {},
  );
  if (DEBUG) {
    console.dir(result);
    console.log(`done.`);
    console.groupEnd();
  }
  return result;
}

/**
 * Creates etlUnits from headerViews
 *
 * @function
 * @param {Object} headerViews
 * @param {boolean} DEBUG
 * @return {Object.<string,Object>}
 */
export function etlUnitsFromPrePivot(ppHvs, DEBUG) {
  return ppHvs
    .map((hv) => hv.fields)
    .reduce(
      (acc, fields) => ({
        ...acc,
        ...etlUnitsFromFields(fields, DEBUG),
      }),
      {},
    );
}

/**
 * Returns a Set of field names derived from a
 * collection of etlUnits
 * @param {Object.<string,*>} etlUnits
 * @returns Set names
 */
export const fieldNamesFromUnits = (etlUnits) => {
  return new Set(
    Object.values(etlUnits).reduce((acc, unit) => {
      const { subject, codomain, mcomps = [], mspan = null } = unit;
      return mspan
        ? [...acc, subject, codomain, mspan, ...mcomps]
        : [...acc, subject, codomain, ...mcomps];
    }, []),
  );
};

/**
 * Create or update an etlUnit when etlFields and units have already been
 * computed.
 *
 *  - create when newField has purpose == TYPES.QUALITY
 *  - update when newField has purpose == TYPES.MCOMP
 *
 *  Note: the latter may fail if the etlUnit does not exist.
 *
 * @function
 * @param {String} subFieldName,
 * @param {{etlUnits: Object.<string,*>}} etlUnits,
 * @param {Object} newEtlField EtlField.
 * @return {etlUnit} Returns null if updated a etlUnit that does not exist
 */
export const tryCreateOrUpdateEtlUnit = (subFieldName, etlUnits, newEtlField) => {
  if (!newEtlField) return null;
  if (!Object.values(TYPES).includes(newEtlField.purpose)) {
    throw new InvalidStateError(
      `The newEtlField has an invalid purpose: ${newEtlField.purpose}`,
    );
  }

  switch (newEtlField.purpose) {
    case TYPES.QUALITY: {
      return {
        [newEtlField.name]: {
          type: TYPES.QUALITY,
          subject: subFieldName,
          codomain: newEtlField.name,
          'codomain-reducer': newEtlField['codomain-reducer'],
        },
      };
    }
    case TYPES.MCOMP: {
      // append the etlUnit::measurement with the new comp
      const currentEtlUnit = etlUnits[newEtlField['etl-unit']];
      return currentEtlUnit
        ? {
            [newEtlField['etl-unit']]: {
              ...currentEtlUnit,
              mcomps: [...currentEtlUnit.mcomps, newEtlField.name],
            },
          }
        : null;
    }
    default: {
      // 'mspan'
      console.dir(newEtlField);
      throw new DesignError(
        `Tried to add an unsupported purpose type: ${newEtlField.purpose}`,
      );
    }
  }
};
/**
 * Estimate based on current hv value.
 * input: file ~ headerView
 * output: { codomain: { etl-unit }}
 *
 * Note: This does not guarantee valid units as null values will be inserted
 * where required.
 * TODO: Decide if this is the best way to go.
 * @function
 *
 */
export const predictEtlUnitsFromHeaderView = (headerView, DEBUG = GLOBAL_DEBUG) =>
  etlUnitsFromFields(getActiveHvFields(headerView), DEBUG);

/**
 * 📌
 * Workhorse
 *
 * Creates etlUnits from an array of fields.
 *
 * @function
 * @param {Array.<Object>}
 * @return {Object}
 */
function etlUnitsFromFields(fields_, DEBUG) {
  if (fields_.find((field) => !field.enabled)) {
    throw new DesignError(`The caller failed to filter for enabled fields`);
  }
  const fields = fieldsKeyedOnPurpose(fields_);
  const subject = fields[TYPES.SUBJECT][0] || {};
  const mspan = fields[TYPES.MSPAN][0] || {};

  if (DEBUG) {
    console.groupCollapsed(`👉 etlUnitsFromFields: ${fields_[0].filename}`);
    /* eslint-disable no-param-reassign, no-shadow */
    const report = Object.keys(fields).reduce((report, purposeKey) => {
      report[purposeKey] = selectPropsInObj(['field-alias'], fields[purposeKey]).map(
        (entry) => entry['field-alias'],
      );
      return report;
      /* eslint-enable no-param-reassign, no-shadow */
    }, {});

    console.table(report);
  }

  const qualityUnits = fields[TYPES.QUALITY].map((qual) =>
    mkQualityUnit({
      codomain: qual['field-alias'],
      subject: subject['field-alias'],
      codomainReducer: qual['codomain-reducer'],
    }),
  );

  const mvalueUnits = fields[TYPES.MVALUE].map((mvalue) =>
    mkMvalueUnit({
      codomain: mvalue['field-alias'],
      subject: subject['field-alias'],
      mspan: mspan['field-alias'],
      mcomps: fields[TYPES.MCOMP].map((mcomp) => mcomp['field-alias']),
      codomainReducer: mvalue['codomain-reducer'],
    }),
  );

  const result = mvalueUnits.reduce(
    (units, unit) => {
      /* eslint-disable-next-line no-param-reassign */
      units[unit.codomain] = unit;
      return units;
    },
    qualityUnits.reduce((units, unit) => {
      /* eslint-disable-next-line no-param-reassign */
      units[unit.codomain] = unit;
      return units;
    }, {}),
  );

  if (DEBUG) {
    console.log(`etlUnit atom: ${fields_[0].filename}`);
    console.dir(result);
    console.log(`------`);
    console.groupEnd();
  }
  return result;
}

function mkQualityUnit({ codomain, subject = null, codomainReducer = 'FIRST' }) {
  return {
    type: TYPES.QUALITY,
    subject,
    codomain,
    'codomain-reducer': codomainReducer,
  };
}

function mkMvalueUnit({
  codomain,
  subject = null,
  mspan = null,
  mcomps = [],
  codomainReducer = 'SUM',
  slicingReducer = 'SUM',
}) {
  return {
    type: TYPES.MVALUE,
    subject,
    mspan,
    mcomps,
    codomain,
    'codomain-reducer': codomainReducer,
    'slicing-reducer': slicingReducer,
  };
}
