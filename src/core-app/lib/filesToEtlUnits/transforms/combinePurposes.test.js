/**
 * @module test/lib/filesToEtlUnits/transforms/combinePurposes
 *
 * @description
 * Jest testing module for the `combinePurposes` module.
 *
 */

import { combinePurposes, combine } from './combinePurposes';

const resultOfPivot = {
  npi: {
    sources: [
      {
        'field-alias': 'npi',
        enabled: true,
        'header-idx': 0,
        'header-name': 'npi',
        purpose: 'subject', // HERE
        'null-value': null,
        format: null,
        'map-symbols': {},
        levels: [Array],
        filename: 'targetList.csv',
      },
      {
        'field-alias': 'npi',
        enabled: true,
        'header-idx': 0,
        'header-name': 'npi',
        purpose: 'subject',
        'null-value': null,
        format: null,
        'map-symbols': { this: 'one', that: 'two' },
        levels: [Array],
        filename: 'warfarin.csv',
      },
      {
        'field-alias': 'npi',
        enabled: true,
        'header-idx': 0,
        'header-name': 'npi',
        purpose: 'subject', // HERE
        'null-value': null,
        format: null,
        'map-symbols': { that: 'three', other: 'four' },
        levels: [Array],
        filename: 'brand_sales.csv',
      },
    ],
  },
};

//------------------------------------------------------------------------------
test('Combine the `purpose` prop from sources', () => {
  const expectValue = combinePurposes(resultOfPivot.npi.sources);
  const tobeValue = 'subject';
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Testing the combine function with LAST', () => {
  const expectValue = combine(['', 'subject', ''], 'LAST');
  const tobeValue = 'subject';
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Testing the combine function with FIRST', () => {
  const expectValue = combine(['', 'subject', ''], 'FIRST');
  const tobeValue = 'subject';
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Throws an error when a purpose cannot be found', () => {
  expect(() => {
    combine(['', ''], 'FIRST');
  }).toThrow();
});
