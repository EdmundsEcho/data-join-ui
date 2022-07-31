/**
 * @module test/lib/filesToEtlUnits/span/etl-time
 *
 * @description
 * Jest testing module for the `span/etl-time.js` module.
 */
import { reference, interval, etlSpanTime } from './etl-time';

//------------------------------------------------------------------------------
/**
 * Tests
 */
const sources1 = [
  {
    time: {
      reference: {
        idx: 0,
        value: '01-06-16',
      },
      interval: {
        unit: 'months',
        count: 1,
      },
      'resampling-fn': 'null,AVG|SUM',
    },
    'field-alias': 'Date',
    format: 'MM-DD-YY',
    'null-value': null,
  },
  {
    time: {
      reference: {
        idx: 0,
        value: '05-01-16',
      },
      interval: {
        unit: 'months',
        count: 1,
      },
      'resampling-fn': 'null,AVG|SUM',
    },
    'field-alias': 'Date',
    format: 'MM-DD-YY',
    'null-value': null,
  },
  {
    time: {
      reference: {
        idx: 0,
        value: '28-02-16',
      },
      interval: {
        unit: 'weeks',
        count: 1,
      },
      'resampling-fn': 'null,AVG|SUM',
    },
    'field-alias': 'Date',
    format: 'DD-MM-YY',
    'null-value': null,
  },
];

const sources2 = [
  ...sources1,
  {
    time: {
      reference: {
        idx: 0,
        value: '28-02-15',
      },
      interval: {
        unit: 'years',
        count: 1,
      },
      'resampling-fn': 'null,AVG|SUM',
    },
    'field-alias': 'Date',
    format: 'DD-MM-YY',
    'null-value': null,
  },
];

const etlFieldTimeBefore = {
  idx: 2,
  name: 'Date',
  'etl-unit': {
    subject: 0,
    codomain: 6,
    mspan: 2,
    mcomps: [3, 4, 5],
  },
  purpose: 'mspan',
  levels: null,
  'level-overlap': null,
  time: null,
  format: 'YY-MM',
  sources: [...sources1],
};

const etlFieldTimeBefore2 = {
  ...etlFieldTimeBefore,
  sources: [...sources2],
};

//------------------------------------------------------------------------------
test('Top-level `reference` is the min date using date::string', () => {
  const expectValue = reference(sources1)('MM-DD-YY');
  const tobeValue = {
    idx: 0,
    value: '01-06-16',
  };
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Format the min date to match the top-level spec', () => {
  const expectValue = reference(sources1)('YY-MM');
  const tobeValue = {
    idx: 0,
    value: '16-01',
  };
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Top-level `interval` is the max `unit` using `Ord` definition', () => {
  const expectValue = interval(sources1);
  const tobeValue = {
    unit: 'months',
    count: 1,
  };
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Top-level `interval` is the max `unit` using `Ord` definition', () => {
  const expectValue = interval(sources2);
  const tobeValue = {
    unit: 'years',
    count: 1,
  };
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Update the etl-field `time` property - deprecated', () => {
  const expectValue = etlSpanTime(etlFieldTimeBefore);
  const tobeValue = {
    ...etlFieldTimeBefore,
    time: {
      reference: {
        idx: 0,
        value: '16-01',
      },
      interval: {
        unit: 'months',
        count: 1,
      },
    },
  };

  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Update the etl-field `time` property', () => {
  const expectValue = etlSpanTime(etlFieldTimeBefore2);
  const tobeValue = {
    ...etlFieldTimeBefore2,
    time: {
      reference: {
        idx: 0,
        value: '15-02',
      },
      interval: {
        unit: 'years',
        count: 1,
      },
    },
  };
  expect(expectValue).toEqual(tobeValue);
});
