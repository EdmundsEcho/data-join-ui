// src/lib/filesToEtlUnits/transforms/span/span-levels

/**
 * @module lib/filesToEtlUnits/transforms/span/span-levels
 *
 * @description
 * Processes time series date information (purpose = mspan).
 * The inputs and outputs are *file-level*.
 *
 *
 * @todo
 * 1. Report errors when the format provided generates undefined moments
 * 2. Other?
 *
 * @category Lib
 *
 */
import moment from 'moment';
import { newReference } from './reference';
import * as H from '../../headerview-helpers';
import { unit as isoUnit } from './iso-formats';
import { DesignWarning } from '../../../LuciWarnings';
import { colors } from '../../../../constants/variables';

//------------------------------------------------------------------------------
const GLOBAL_DEBUG = process.env.REACT_APP_DEBUG_SPAN_LEVELS === 'true';
// const GLOBAL_DEBUG = true;
const COLOR = colors.light.yellow;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * top-level private function
 * Utility function
 * Reports the interval size between dates. Interval size accounts for the
 * information provided in the `time` object.
 * config -> [moment] -> [difference::interval]
 *
 * @function
 * @param {Object} arg
 * @param {Array<Moment>} moments
 * @return {Array<number>}
 */
const mkDiffs = ({ interval: { unit, count } }, moments) => {
  const sorted = moments.sort((a, b) => a - b); // sorted moments
  const [, ...cloneTail] = [...sorted];

  return cloneTail.map(
    // compare 2nd with 1st, then 3rd with 2nd
    (mom, i) => mom.diff(sorted[i], isoUnit(unit)) / count,
  );
};

/**
 * Utility function
 * :: [moment] -> { len: Number, rest: [moment] }
 * [1,1,2,1,1,1,2]
 * @function
 * @param {Array<number>}
 * @return {{len: number, rest: Array<number>}}
 */
const nextSpan = (diffs) => {
  // recursive sub-routine
  // 👍 that exits as-needed
  const continuous = (len, difs) => {
    //
    if (difs.length === 0) {
      // we are at the end of the series, return
      return {
        spanLength: len + 1, // len diff -> len original array
        diff: undefined,
        restDiffs: difs,
      };
    }

    // test the next diff to see if continuous
    const [diff, ...restDiffs] = difs;

    if (diff > 1) {
      // not continuous, return a new span
      const flagLastDisjoint =
        restDiffs.length === 0 ? 'missingLastSpan' : false; // ugly but clear
      return {
        spanLength: len + 1, // len diff -> len original array
        diff,
        restDiffs,
        flagLastDisjoint,
      };
    }

    if (diff === 0) {
      // the data points are in the same span
      // proceed without advancing len
      return continuous(len, restDiffs);
    }
    return continuous(len + 1, restDiffs); // continuous, so keep recursing
  };

  // call the recursive function with len starting at 0
  const result = continuous(0, diffs);
  return result;
};

const mkSpan = (rangeStart, rangeLength) => ({
  rangeStart,
  rangeLength,
  reduced: false,
});

const mkSpans = (config, moments) => {
  // when there is only one date
  if (moments.length === 1) {
    return [mkSpan(0, 1)];
  }

  // [1,1,2,1,3,1] : all 1s ~ continuous.
  const diffs = mkDiffs(config, moments);

  if (GLOBAL_DEBUG) {
    console.debug('diffs');
    console.dir(diffs);

    console.debug('sorted');
    console.dir(moments.sort((a, b) => a - b));
  }

  // local help :: a -> b -> a
  //
  //     [span] -> [diff] -> [span]
  //
  const go = (
    accSpanValues, // array of span values
    difs, // series of differences between time points
    spanStart = 0, // cursor for where to start the next span
  ) => {
    if (difs.length === 0) {
      // done
      return accSpanValues;
    }
    // generate the span, append to the acc
    const { spanLength, diff, restDiffs, flagLastDisjoint = false } = nextSpan(
      difs,
    );

    const newAcc = [
      ...accSpanValues,
      mkSpan(spanStart, spanLength),
      ...(flagLastDisjoint
        ? [mkSpan(spanStart + spanLength + diff - 1, 1)]
        : []),
    ];

    // move the start cursor forward
    let newSpanStart = spanStart + spanLength;
    if (diff !== undefined) {
      newSpanStart += diff - 1;
    }

    return go(newAcc, restDiffs, newSpanStart);
  };

  return go([], diffs);
};
/**
 * @description
 * Generates the file-level `reference` and `levels-mspan` props.
 *  { 'levels-spans', time }
 *
 * @param config format, interval, seedReference
 * @param dates levels
 * @param moments
 * @returns Object
 */
// eslint-disable-next-line no-underscore-dangle
const mkSpansFromDates = (config) => (dates, moments) => {
  const result = {
    reference: newReference({
      levels: dates,
      format: config.format,
      interval: config.interval,
    }), // send it moments

    'levels-mspan': mkSpans(config, moments),
  };

  if (GLOBAL_DEBUG) {
    console.log('new reference');
    console.dir(result);
  }

  return result;
};
/**
 * Returns true when moment successfully parses all of the date/time levels.
 * @param format String that describes input date/time format
 * @param dates Array of date/times
 * @param returnMoments Optional request for link to moments
 * @return boolOrMoments
 */
const validDates = (format, dates, returnMoments = false) => {
  if (Array.isArray(dates[0])) {
    return validDates(
      format,
      dates.map((l) => l[0]).filter((d) => d !== ''),
    );
  }
  const moments = dates.map((d) => moment(d, format, true));
  const areValid =
    moments.filter((d) => d.format() === 'Invalid date').length === 0;

  return returnMoments ? areValid && moments : areValid;
};

/**
 * The workhorse
 *
 * 🦀 Does not create a separate span when null value is dated after
 *    the levels in the raw data.
 *
 * 🚧 The screen for valid inputs, is redundant with some of what
 * callers already do.
 *
 * @param {Array.<Array>} levels No null values
 * @param {string} format
 * @param {{ interval: {Object}, reference: {Object} }} time
 * @return {{time: {Object}, 'levels-mspan': {Array.<Object>}}
 */
const mspanLevelsWithRef = (levels, format, time) => {
  if (GLOBAL_DEBUG) console.debug('Trying to create spans');

  const canParseLevels = [
    levels,
    format,
    time?.interval?.unit,
    time?.interval?.count,
  ].every(
    (prop) => typeof prop !== 'undefined' && prop !== null && prop !== '',
  );

  if (GLOBAL_DEBUG) {
    if (canParseLevels) {
      console.debug(`%ccanParseLevels: ${canParseLevels}`, colors.green);
    } else {
      console.debug(`%ccanParseLevels: ${canParseLevels}`, colors.red);
    }
  }

  if (typeof levels === 'undefined' || levels.length === 0) {
    if (GLOBAL_DEBUG)
      console.warn(`fieldWithSpans: tried to create spans without any levels`);
    return { time };
  }

  if (!canParseLevels) {
    return { time };
  }

  // levels :: [[value, count]]
  const dates = levels.map((l) => l[0]).filter((d) => d !== '');
  if (dates.length === 0) {
    console.warn(
      `fieldWithSpans: tried to create spans with empty date values`,
    );
    return { time };
  }

  const moments = validDates(format, dates, true);

  if (moments.length === 0) {
    console.warn(`fieldWithSpans: could not convert data/time -> moment`);
    return { time };
  }

  // generate output, then extract
  // TODO: I don't think the seedReference is being used correctly.
  // For now, we log a warning if null.
  const { reference, 'levels-mspan': levelsMspan } = mkSpansFromDates({
    format,
    interval: time.interval,
  })(dates, moments);

  return {
    time: {
      interval: time.interval,
      reference, // new
    },
    'levels-mspan': levelsMspan, // new
  };
};

/**
 * Determines if headerView is ready for the 'levels-mspan' prop.
 * Checks for a complete set of field.prop values and valid date/times.
 *
 * This is only called when field purpose moves from non-mspan to mspan
 * (so, clean-up/removal of time prop is limited accordingly)
 *
 * Utilized by
 *
 *   👉 file-field (source type: RAW)
 *   👉 wide-to-long-fields (WIDE)
 *
 * @function
 * @param {Object} field
 * @param {('RAW'|'WIDE')='RAW'} sourceType
 * @param {boolean} DEBUG
 * @return field with or without 'levels-span' prop
 * @throws DesignWarning
 *
 */
export const trySpanEnabledField = ({
  field,
  sourceType = 'RAW',
  DEBUG = GLOBAL_DEBUG,
}) => {
  if (DEBUG) {
    console.group('%cspan-levels try', COLOR);
    console.dir(field);
  }

  try {
    if (field.purpose !== 'mspan') {
      throw new DesignWarning(
        `Tried to add 'span-levels' to the wrong field type: ${
          field.purpose || 'undefined'
        }`,
      );
    }
  } catch (e) {
    console.warn(e.message);
    return H.removeProp(['time', 'levels-mspan'], field);
  }

  try {
    if (
      typeof field.levels === 'undefined' ||
      (field.levels.length === 0 && sourceType === 'RAW')
    ) {
      throw new DesignWarning(`Missing levels required to add 'span-levels'`);
    }
  } catch (e) {
    console.warn(e.message);
    return field;
  }

  const entries = [
    ...Object.values(field.time.interval),
    field.format, // << format spec for the levels (not isoFormat)
    field.levels,
  ];
  const isComplete = [
    ...Object.values(field.time.interval),
    field.format, // << format spec for the levels
    field.levels,
  ].every(
    (entry) => typeof entry !== 'undefined' && entry !== null && entry !== '',
  );

  if (DEBUG) {
    console.log(`%cisComplete: ${isComplete}`, COLOR);
    console.dir(field);
    console.dir(entries);
  }

  // field with 'span-levels'
  // replace empty values with null-value
  const levelsNoNull = field.levels
    .map((tuple) =>
      tuple[0] === '' ? [field['null-value'] || '', tuple[1]] : tuple,
    )
    .filter((tuple) => tuple[0] !== '');

  const hasValidDates = validDates(field.format, levelsNoNull);

  if (DEBUG) {
    console.log('%cno-null-levels', COLOR);
    console.dir(levelsNoNull);
    // 🚨 the levels format is specified using the generic format prop
    // This is not the same format as what is used in the reference prop.
    console.log(`%care the dates valid? ${hasValidDates}`, COLOR);
  }

  const result =
    isComplete && hasValidDates
      ? {
          ...field,
          ...mspanLevelsWithRef(levelsNoNull, field.format, field.time),
        }
      : H.removeProp('levels-mspan', field);

  if (DEBUG) {
    console.log(
      `%cResult (levels-mspan when complete and valid: ${
        hasValidDates && isComplete
      })`,
      COLOR,
    );
    console.dir(result);
    console.groupEnd(result);
  }

  return result;
};

/**
 * Tries to build the 'levels-mspans' prop for the mspan fields in the
 * headerView. The time value can be in either hv.fields or
 * hv.wideToLongFields.fields.
 *
 * 🚧 Strictly speaking, there should only be one mspan field, so processing
 * as if otherwise is a place for potential optimization.
 *
 * @function
 * @param hv headerView
 * @returns hv headerView with mspan props with or without 'levels-mspans'
 */
export const buildSpanEnabledFields = (hv) => {
  // local subroutine
  const goTry = (fields) =>
    fields.map((f) => (f.purpose === 'mspan' ? trySpanEnabledField(f) : f));

  // process wide-to-long fields
  // add keys to wideToLongFields
  const wideFields = hv.wideToLongFields
    ? goTry(Object.values(hv.wideToLongFields.fields)).reduce((acc, field) => {
        acc[field['field-alias']] = field;
        return acc;
      }, {})
    : null;

  if (wideFields) {
    /* eslint-disable-next-line no-param-reassign */
    hv.wideToLongFields = {
      ...hv.wideToLongFields,
      fields: wideFields,
    };
  }

  /* eslint-disable-next-line no-param-reassign */
  hv.fields = goTry(hv.fields);

  return hv;
};

/**
 * Utility to display the range of mspans
 *
 * @function
 * @param field headerView field
 * @return string
 */
export const timeRange = (field) => {
  const mkMoment = (str) => moment(str, field.format, true);
  const { time, levels } = field;
  const moments = levels.map((l) => mkMoment(l[0]));
  const minDate = moments.reduce(
    (min, m) => (min > m ? m : min),
    mkMoment(levels[0]),
  );
  const maxDate = moments.reduce(
    (max, m) => (max < m ? m : max),
    mkMoment(levels[0]),
  );

  return maxDate.diff(minDate, isoUnit(time.interval.unit));
};
