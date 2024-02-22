/**
 * @module test/lib/filesToEtlUnits/transforms/combineTimeObjs
 *
 * @description
 * Jest testing module for the `combineTimeObjs` module.
 *
 */

import { combineTimeObjs } from './combineTimeObjs';
import { reference, interval } from './span/etl-time';

//------------------------------------------------------------------------------
/**
 * Tests
 */
const resultOfPivot = {
  date: {
    sources: [
      {
        'field-alias': 'npi',
        enabled: true,
        'header-idx': 0,
        'default-name': 'npi',
        purpose: 'mspan',
        'null-value': null,
        'map-symbols': {},
        time: {
          reference: {
            idx: 0,
            value: '28-07-15',
          },
          interval: {
            unit: 'years',
            count: 1,
          },
          'resampling-fn': 'null,AVG|SUM',
        },
        format: 'DD-MM-YY',
        levels: [Array],
        filename: 'targetList.csv',
      },
      {
        'field-alias': 'npi',
        enabled: true,
        'header-idx': 0,
        'default-name': 'npi',
        purpose: 'mspan',
        'null-value': null,
        'map-symbols': { this: 'one', that: 'two' },
        time: {
          reference: {
            idx: 0,
            value: '28-07-15',
          },
          interval: {
            unit: 'years',
            count: 1,
          },
          'resampling-fn': 'null,AVG|SUM',
        },
        format: 'DD-MM-YY',
        levels: [Array],
        filename: 'warfarin.csv',
      },
      {
        'field-alias': 'npi',
        enabled: true,
        'header-idx': 0,
        'default-name': 'npi',
        purpose: 'mspan',
        'null-value': null,
        'map-symbols': { that: 'three', other: 'four' },
        time: {
          reference: {
            idx: 0,
            value: '28-01-15',
          },
          interval: {
            unit: 'years',
            count: 1,
          },
          'resampling-fn': 'null,AVG|SUM',
        },
        format: 'DD-MM-YY',
        levels: [Array],
        filename: 'brand_sales.csv',
      },
    ],
  },
};
const arrayOfFiles = [
  {
    filename: 'warfarin.csv',
    'header-idx': 1,
    time: {
      reference: {
        idx: 0,
        value: '28-07-15',
      },
      interval: {
        unit: 'years',
        count: 1,
      },
      'resampling-fn': 'null,AVG|SUM',
    },
    format: 'DD-MM-YY',
    'field-alias': 'Date',
    'null-value': null,
    levels: [],
  },
  {
    filename: 'brand_sales.csv',
    'header-idx': 1,
    time: {
      reference: {
        idx: 0,
        value: '28-01-15',
      },
      interval: {
        unit: 'years',
        count: 1,
      },
      'resampling-fn': 'null,AVG|SUM',
    },
    format: 'DD-MM-YY',
    'field-alias': 'Date',
    'null-value': null,
    levels: [],
  },
];

//------------------------------------------------------------------------------
test('Format the min date to match the top-level spec', () => {
  const expectValue = reference(resultOfPivot.date.sources)('YY-MM');
  const tobeValue = {
    idx: 0,
    value: '15-01',
  };
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Top-level `interval` is the max `unit` using `Ord` definition', () => {
  const expectValue = interval(arrayOfFiles);
  const tobeValue = {
    unit: 'years',
    count: 1,
  };
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Combine `time` props from sources', () => {
  const expectValue = combineTimeObjs(resultOfPivot.date.sources)('YY-MM');
  const tobeValue = {
    reference: {
      idx: 0,
      value: '15-01',
    },
    interval: {
      unit: 'years',
      count: 1,
    },
  };
  expect(expectValue).toEqual(tobeValue);
});
