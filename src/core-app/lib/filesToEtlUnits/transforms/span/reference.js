/**
 * @module /lib/filesToEtlUnits/transforms/span/reference
 *
 * @description
 * Used by file-to-header, field::purpose::mspan
 * :: levels ->
 *     reference: { idx: 0, value: String Date, isoFormat: String }
 *
 *  🚧  There are three points in the process when a new reference is
 *      instantiated:
 *
 *     1. from levels -> source ref (see newReference)
 *     2. from sources -> etlField ref
 *     3. from etlFields -> globalRef
 *
 */
import moment from 'moment';
import { toISOString } from './iso-formats';

// -----------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_REDUCERS === 'true' ||
  process.env.REACT_APP_DEBUG_SPAN_LEVELS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * :: levels -> reference
 *
 * ⬜ Update the documentation regarding if/how a seedRef is still in use.
 *
 * Note when using with files that start at different dates,
 * include the currentRef value.
 * Used to create
 * - new, seeding from another
 * - update, seeding from current
 *
 * @param { Array } levels Date/time levels:: [[value,count]]
 * @param { str } format Date/time format moment uses to parse levels
 * @param { integer } interval
 * @param seedReference Either the previous value, or other as starting point
 * @return reference time.reference prop
 */
export const newReference = ({ levels, format, interval }) => {
  if (DEBUG) {
    console.debug(
      `newReference inputs: ${format} ${interval.unit} ${interval.count}`,
    );
  }
  // if levels have not been unpacked, call the function again
  // with array of dates.
  if (Array.isArray(levels[0])) {
    return newReference({
      levels: levels.map((l) => l[0]).filter((d) => d !== ''),
      format,
      interval,
    });
  }

  // date maker :) with strict parsing
  // Note: accepts non-iso string formats
  const mkMoment = (str) => moment(str, format, true);

  // ⬜ Re-use the minTime function lower in the module
  const minMoment = levels
    .map((d) => mkMoment(d)) // level::[value, count]
    .reduce(
      /* eslint-disable-next-line no-shadow */
      (minMoment, tryNext) =>
        tryNext.isBefore(minMoment) ? tryNext : minMoment,
      mkMoment(levels[0]), // acc initial value
    );

  // convert known non-iso to iso format
  // Note: This logic needs to be repeated by the backend
  const isoFormat = toISOString(format);
  const value = minMoment.format(isoFormat);

  const result = {
    idx: newIdx(minMoment, interval),
    value,
    isoFormat,
  };
  if (DEBUG) {
    console.debug(`newReference result:`);
    console.dir(result);
  }

  return result;
};

/**
 *
 *     :: etlFields -> etlFields with global time objects
 *
 *     (isomorphic)
 *
 *     [
 *       field1 { time: { reference: { idx: 0, value: Feb, format } } }
 *       field2 { time: { reference: { idx: 0, value: Mar, format } } }
 *     ] -> [
 *       field1 { time: { reference: { idx: 0, value: Feb, format } } }
 *       field2 { time: { reference: { idx: 1, value: Mar, format } } }
 *     ]
 *
 *
 * 🔖 scope: ✅ the etlField time prop
 *           ✅ the rangeStart value for levels-mspan
 *
 * ⬜ Perhaps copy the coordinated/synchronized time prop into each of
 *    the sources.
 *
 * ⬜ Consider how to 'preview' a re-sampled version of time
 *    (e.g., mix of monthly and daily -> monthly)
 *
 * @param {Object<string,EtlField>} etlFields
 * @return {Object<string,EtlField>}
 */
export const setGlobalRef = (etlFields) => {
  if (DEBUG) {
    console.group(`⏰ setGlobalRef: Creating newIdx & adjusting rangeStart`);
  }
  if (typeof etlFields !== 'object')
    throw new Error({
      message: `setGlobalRef: wrong input type: ${typeof etlFields}`,
    });
  const mspans = Object.values(etlFields).filter(
    (field) => field.purpose === 'mspan',
  );

  if (mspans.length === 0) return etlFields; // nothing todo

  // find the min time reference within the etlFields collection
  const minField = minRefInValue(
    mspans,
    (field) => field.time.reference.value,
    (field) => field.time.reference.isoFormat,
  );

  const toMoment = (field) =>
    moment(field.time.reference.value, field.time.reference.isoFormat, true);

  const adjustSpan = (timeRef, span) => ({
    ...span,
    rangeStart: span.rangeStart + timeRef,
  });
  // 🔑 Update the time AND levels-mspan values
  /* eslint-disable-next-line no-shadow */
  const updateField = (newIdx, field) => {
    const result = {
      ...field,
      'levels-mspan': field['levels-mspan'].map((span) =>
        adjustSpan(newIdx, span),
      ),
      time: {
        ...field.time,
        reference: {
          ...field.time.reference,
          idx: newIdx,
        },
      },
    };
    if (DEBUG) {
      console.debug(`updatedField:`);
      console.debug(result);
    }
    return result;
  };

  // next, set the global value by copying the time object
  // to every etlField::mspan.
  // for each etlField, compute newIdx
  const updatedFields = mspans
    .map((field) =>
      updateField(
        newIdx(
          toMoment(field),
          minField.time.interval, // fixed = min
          toMoment(minField),
        ),
        field,
      ),
    )
    // over-write/update the mspan fields in the collection of etlFields
    .reduce((acc, field) => {
      acc[field.name] = field;
      return acc;
    }, etlFields);

  if (DEBUG) console.groupEnd();

  // next, what does this mean for sources?
  // source: distinct format
  //         same reference point
  //         different minDate and relativeRef
  // 🚧 for now the backend operates fine without this extra
  //    information.  This may change when we generate the longitudinal report.
  return updatedFields;
};

/**
 *
 *     format -> [value] -> value
 *
 *
function minTime(format, getValueFn = (x) => x) {
  return (rawValues) => {
    const { minValue } = rawValues.reduce(
      ({ minMoment = null, minValue }, tryValue) => {
        const tryMoment = moment(getValueFn(tryValue), format, true);

        return tryMoment.isAfter(minMoment)
          ? { minMoment, minValue }
          : { minMoment: tryMoment, minValue: tryValue };
      },
      {
        minMoment: moment(getValueFn(rawValues[0]), format, true),
        minRefInValue: rawValues[0],
      },
    );
    return minValue;
  };
}
 */

/**
 *
 *     format -> [reference] -> reference
 *
 * @function
 *
 */
export function minRefInValue(
  refsInValues,
  getValueFn = (x) => x,
  getIsoFormatFn = (x) => x,
) {
  /* eslint-disable no-shadow */
  const { minRefInValue } = refsInValues.reduce(
    ({ minMoment, minRefInValue }, tryRef) => {
      const tryMoment = moment(
        getValueFn(tryRef),
        getIsoFormatFn(tryRef),
        true,
      );

      if (DEBUG) {
        console.group('minRefInValue');
        console.log(tryMoment);
        console.log(minMoment);
        console.log(tryMoment.isAfter(minMoment));
        console.groupEnd();
      }

      return tryMoment.isAfter(minMoment)
        ? { minMoment, minRefInValue }
        : { minMoment: tryMoment, minRefInValue: tryRef };
    },
    {
      minMoment: moment(
        getValueFn(refsInValues[0]),
        getIsoFormatFn(refsInValues[0]),
        true,
      ),
      minRefInValue: refsInValues[0],
    },
  );
  return minRefInValue;
  /* eslint-enable no-shadow */
}
/**
 * @description
 * Requires a valid interval and if exists, a complete reference.
 *
 * @param minMoment moment
 * @param interval time.interval prop
 * @param seedReference time.reference prop
 * @return reference idx in time.reference.idx
 */
function newIdx(
  thisMoment,
  { unit, count },
  minMoment, // null
) {
  const refMoment = minMoment || thisMoment;

  return thisMoment.diff(refMoment, unit) / count;
}
