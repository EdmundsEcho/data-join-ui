/**
 * @module /lib/filesToEtlUnits/transforms/span/etl-time
 * @description
 * Computes the `Etl-field` top-level `time::object` property derived from the
 * collection of `time` properties in `sources`.
 *
 * output - updated etl-field with:
 * "time": {
 *      "reference": {
 *        "0": "16-01"
 *      },
 *      "interval": {
 *        "unit": "month",
 *        "count": 1
 *      },
 *      "resample-by": "YY-MM"
 *    },
 * "sources": [...]
 */
import moment from 'moment';

/**
 * Top-level function that computes the top-level `time` property.
 * default export.
 *
 * :: sources -> format -> time
 *
 * Sequence
 * 1. configuration with sources
 * 2. user input to describe the format
 *
 * DEPRECATED?
 *
 * Tasks:
 * Time should be coordinated for all measurements; i.e., for several etlUnits.
 * Sources: Only useful for hosting a date. Idx = 0 for now means nothing.
 * Idx requires all etlUnits :: Meas to compute
 * Sources need to update idx using global date for idx 0
 *
 * Solution: During the pivot
 * *  compute the global reference date
 * *  record a copy in each etlUnit::Meas
 * *  set the idx value for each source
 *
 */
export const combine = (sources) => (format) => ({
  reference: reference(sources)(format),
  interval: interval(sources),
});

// for testing only
export const etlSpanTime = (etlSpan) => ({
  ...etlSpan,
  time: {
    ...etlSpan.time,
    reference: reference(etlSpan.sources)(etlSpan.format),
    interval: interval(etlSpan.sources),
  },
});

/**
 * Returns the min date using ::string
 * reduction :: [{idx, value}] -> {idx, value}
 */
export const reference = (sources) => (formatOut) => {
  const minSourceRef = sources.reduce((accMinRef, source) => {
    const accMinDate = moment(
      accMinRef.time.reference.value,
      accMinRef.time.reference.format,
    );
    const sDate = moment(
      source.time.reference.value,
      source.time.reference.format,
    );

    return accMinDate.isBefore(sDate) ? accMinRef : source;
  }, sources[0]);

  return {
    ...minSourceRef.time.reference,
    value: formatDate(
      minSourceRef.time.reference.value,
      minSourceRef.time.reference.format,
      formatOut,
    ),
  };
};
// type Date = string;
// type Reference = { [key: string]: Date };

export const interval = (sources) => {
  // Ord definition for unit
  const ordUnit = {
    milliseconds: 1,
    seconds: 2,
    minutes: 3,
    hours: 4,
    days: 5,
    weeks: 6,
    months: 7,
    // "quarter"    : 8, // for now unsupported
    years: 9,
  };

  const maxSrcInterval = sources.reduce((acc, s) => {
    if (!acc) {
      return s;
    }
    return ordUnit[acc.time.interval.unit] > ordUnit[s.time.interval.unit]
      ? acc
      : s;
  }, undefined);

  return maxSrcInterval.time.interval;
};

/**
 * date::string -> format::string -> format::string -> date::string
 * Utilized by time-reference module
 */
export const formatDate = (date, formatIn, formatOut = formatIn) => {
  return moment(date, formatIn).format(formatOut);
};
