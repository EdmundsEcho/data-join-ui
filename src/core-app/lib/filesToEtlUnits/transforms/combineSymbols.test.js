/**
 * @module test/lib/filesToEtlUnits/transforms/combineSymbols
 *
 * @description
 * Jest testing module for the `combineSymbols` module.
 *
 */

import combineSymbols from './combineSymbols';

const resultOfPivot = {
  npi: {
    sources: [
      {
        'field-alias': 'npi',
        enabled: true,
        'header-idx': 0,
        'header-name': 'npi',
        purpose: 'subject',
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
        purpose: 'subject',
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
test('Combine the `map-symbol` prop from sources', () => {
  const expectValue = combineSymbols(resultOfPivot.npi.sources);
  const tobeValue = {
    this: 'one',
    that: 'three',
    other: 'four',
  };
  expect(expectValue).toEqual(tobeValue);
});
