// src/lib/filesToEtlUnits/transforms/span/span-helper.js

/**
 * @module lib/filesToEtlUnits/transforms/span/span-helper
 * @description
 * Support the creation and merging of span values.
 */
import moment from 'moment';
import initialTimeProp from './initial-time-prop';
import { DesignError } from '../../../LuciErrors';

/**
 * Uses the user-specified 'format-out' to create a time value.
 *
 * 🔑 relativePosition is relative to the reference.idx
 *
 * 🚧 This should accept a request for a series.
 *
 * @function
 * @param {number} relativePosition
 * @param {Object} input
 * @param {Object} input.reference
 * @param {('M'|'W'|'D')} input.unit // WIP partial
 * @param {string=null} input.formatOut
 */
export const getFormattedDate = (
  relativePosition,
  { reference, unit, formatOut = null },
) => {
  const offset = relativePosition - reference.idx;
  if (formatOut && formatOut !== '') {
    try {
      return moment(reference.value, reference.isoFormat)
        .add(offset, unit)
        .format(formatOut);
    } catch (e) {
      return moment(reference.value, reference.isoFormat)
        .add(offset, unit)
        .format(reference.isoFormat);
    }
  }
  // ... else when no formatOut
  try {
    return moment(reference.value, reference.isoFormat)
      .add(offset, unit)
      .format(reference.isoFormat);
  } catch (e) {
    return '';
  }
};
export const Span = {
  rangeEnd: ({ rangeStart: s, rangeLength: l }) => s + l - 1,
  rangeLength: (rangeStart, rangeEnd) => rangeEnd - rangeStart + 1,
};

/**
 * Utilized by Interval UI component
 *
 * Input: change + time object
 * Output: time object
 *
 * Update the time object
 *
 *     reference:  value, isoFormat,
 *     interval:  unit, count,
 *
 *
 * @function
 * @param {string} key
 * @param {any} value
 * @param {object} timeObject
 * @return {object}
 *
 */
export const setTimeProp = (key, newValue, timeProp = initialTimeProp) => {
  const { reference, interval } = timeProp;

  const changeTimeDelegate = {
    'time.reference.value': () => ({
      reference: {
        ...reference,
        value: +newValue,
      },
      interval,
    }),
    'time.reference.isoFormat': () => ({
      reference: {
        ...reference,
        isoFormat: newValue,
      },
      interval,
    }),
    'time.interval.unit': () => ({
      interval: {
        ...interval,
        unit: newValue,
      },
      reference,
    }),
    'time.interval.count': () => ({
      interval: {
        ...interval,
        count: +newValue,
      },
      reference,
    }),
  };

  const result = changeTimeDelegate[key]();
  if (!result) {
    throw new Error(`Failed to update time prop with key: ${key}`);
  }
  return result;
};

/** higher-order fn isAny
 * (x -> x -> Bool) -> x -> [x] -> Bool
 */
export const isAny = (predicate) => (x, xs) => {
  /* eslint-disable-next-line no-shadow */
  const go = (x, xs) => {
    if (!xs.length) {
      // reached the end of search
      return false;
    }
    const [test, ...rest] = xs;
    if (predicate(x, test)) {
      return true;
    }
    return go(x, rest);
  };

  return go(x, xs);
};

/** higher-order flip parameters
 * :: (a -> b -> c) -> b -> a -> c
 */
export const flip = (fn) => (a, b) => fn(b, a);

/**
 * isSubset :: span -> span -> Bool
 * return true when span1 is a subset of span2
 * @throws Error when span reduce = true
 */
export const isSubset = (span1, span2) => {
  const { rangeStart: s1, rangeLength: l1, reduced: red1 } = span1;
  const { rangeStart: s2, rangeLength: l2, reduced: red2 } = span2;

  if (red1 || red2) {
    // this function does not support reduced span values
    throw 'invalid span value'; //eslint-disable-line
  }

  return s1 >= s2 && s1 + l1 <= s2 + l2;
};

export const isProperSubset = (span1, span2) => {
  const { rangeStart: s1, rangeLength: l1, reduced: red1 } = span1;
  const { rangeStart: s2, rangeLength: l2, reduced: red2 } = span2;

  if (red1 || red2) {
    // this function does not support reduced span values
    throw 'invalid span value'; //eslint-disable-line
  }

  return (
    (s1 > s2 && s1 + l1 <= s2 + l2) || //eslint-disable-line
    (s1 >= s2 && s1 + l1 < s2 + l2) //eslint-disable-line
  );
};

/** span -> [span] -> Bool */
export const isSubsetOfAny = (span, spans) => isAny(isSubset)(span, spans);

/**
 * span -> span -> Bool
 * @throws Error when span reduce = true
 * Returns true when subset || overlaps
 */
export const isContinuous = (span1, span2) => {
  if (span1.reduced || span2.reduced) {
    throw 'tried to merge reduced (Red) span values'; //eslint-disable-line
  }
  return (
    (span1.rangeStart < span2.rangeStart &&
      Span.rangeEnd(span1) + 1 >= span2.rangeStart &&
      Span.rangeEnd(span1) < Span.rangeEnd(span2)) ||
    (span2.rangeStart < span1.rangeStart &&
      Span.rangeEnd(span2) + 1 >= span1.rangeStart &&
      Span.rangeEnd(span2) < Span.rangeEnd(span1))
  );
};

// utility
// :: [span] -> [bigSpan]::~Maybe
export const combine = (contSpans) => {
  if (contSpans.length === 0) {
    throw new DesignError(
      'Tried to combine spans with an empty list of span values',
    );
  }
  if (contSpans.length === 1) {
    const [result] = contSpans;
    return result; // min content = head of top spans, or remaining
  }

  const rangeStart = Math.min(...contSpans.map((s) => s.rangeStart));
  const rangeLength = Span.rangeLength(
    rangeStart,
    Math.max(...contSpans.map((s) => Span.rangeEnd(s))),
  );
  return {
    // new span
    rangeStart,
    rangeLength,
    reduced: false,
  };
};
