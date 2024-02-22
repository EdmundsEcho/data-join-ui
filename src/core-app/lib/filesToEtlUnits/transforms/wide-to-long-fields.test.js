/**
 * @module test/lib/filesToEtlUnits/transforms/wide-to-long-fields
 *
 * @description
 * Jest testing module for the `wide-to-long-fields` module.
 *
 */

import {
  buildWideToLongFields,
  appendWideToLongFields,
} from './wide-to-long-fields';
import { headerViewsThree } from '../filesToEtlUnits-test-data';

const mvalues = headerViewsThree['brand_sales.csv'].fields.filter(
  (field) => field.purpose === 'mvalue',
);

const { nrows } = headerViewsThree['brand_sales.csv'];

const testUI = {
  factors: [
    { name: 'rx-type', purpose: 'mcomp' },
    { name: 'date', purpose: 'mspan' },
  ],
  mvalueFieldAlias: 'rx-volume',
  fieldNameValues: {
    'rx-type': [
      { fieldAlias: 'jan-nrx', fieldAliasValue: 'NRx' },
      { fieldAlias: 'feb-nrx', fieldAliasValue: 'NRx' },
      { fieldAlias: 'jan-trx', fieldAliasValue: 'TRx' },
      { fieldAlias: 'feb-trx', fieldAliasValue: 'TRx' },
    ],
    date: [
      { fieldAlias: 'jan-nrx', fieldAliasValue: 'jan' },
      { fieldAlias: 'feb-nrx', fieldAliasValue: 'feb' },
      { fieldAlias: 'jan-trx', fieldAliasValue: 'jan' },
      { fieldAlias: 'feb-trx', fieldAliasValue: 'feb' },
    ],
    'date-array': {
      fieldAliases: ['jan-nrx', 'feb-nrx', 'jan-trx', 'feb-trx'],
      fieldAliasValues: ['jan', 'feb', 'jan', 'feb'],
    },
  },
};
// ----
// Single arrow input using: setFieldNameArrow (singular)
// user enters the factors encoded in the fieldNames :: mvalue
const out1 = buildWideToLongFields({
  mvalues,
  nrows,
});
const out2 = out1(testUI.factors);

// user enters the name of the etl-field :: mvalue
const wideToLongInput = out2.callbacks.setMvalue(testUI.mvalueFieldAlias, out2);

// in parallel get the functions and parameter
const fn1 = wideToLongInput.fields['rx-type'].callbacks.setFieldNameArrow;
const factor1 = testUI.fieldNameValues['rx-type'].reduce(
  (acc, input) => fn1(input, acc),
  wideToLongInput,
);

const fn2 = wideToLongInput.fields.date.callbacks.setFieldNameArrow;
const factor2 = testUI.fieldNameValues.date.reduce(
  (acc, input) => fn2(input, acc),
  wideToLongInput,
);

// ----
// Alternative input using: setFieldNameArrows (plural)
const fnArraysInput = wideToLongInput.fields.date.callbacks.setFieldNameArrows;
const f2ArrayInput = testUI.fieldNameValues['date-array'];
const f2ArrayResult = fnArraysInput(
  f2ArrayInput.fieldAliases,
  f2ArrayInput.fieldAliasValues,
  wideToLongInput,
);

//------------------------------------------------------------------------------
test('Integration test: new mvalue setting', () => {
  const expectValue = factor1.config.mvalue;
  const tobeValue = 'rx-volume';
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Integration test: new [factors] setting', () => {
  const expectValue = factor1.config.factors;
  const tobeValue = [
    { name: 'rx-type', purpose: 'mcomp' },
    { name: 'date', purpose: 'mspan' },
  ];
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Integration test: new header-idxs setting', () => {
  const expectValue = factor1.fields['rx-type']['header-idxs'];
  const tobeValue = [3, 4, 5, 6];
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Integration test: new field-aliases setting', () => {
  const expectValue = factor1.fields['rx-type']['field-aliases'][3];
  const tobeValue = 'feb-trx';
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Integration test: new [map-fieldnames] arrows setting for rx-type factor', () => {
  const expectValue =
    factor1.fields['rx-type']['map-fieldnames'].arrows['feb-trx'];
  const tobeValue = 'TRx';
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Integration test: new [map-fieldnames] arrows setting for date factor', () => {
  const expectValue = factor2.fields.date['map-fieldnames'].arrows['feb-trx'];
  const tobeValue = 'feb';
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Integration test: Update `map-fieldnames` using two arrays of fieldAliases and values', () => {
  const expectValue = f2ArrayResult.fields.date['map-fieldnames'];
  const tobeValue = {
    arrows: {
      'jan-nrx': 'jan',
      'feb-nrx': 'feb',
      'jan-trx': 'jan',
      'feb-trx': 'feb',
    },
  };
  expect(expectValue).toEqual(tobeValue);
});

describe('Integration test: Appending wide fields', () => {
  it('should append wide fields to hv.fields', () => {
    const hv = {
      enabled: true,
      fields: [
        {
          filename: '/myfile',
          purpose: 'subject',
        },
      ],
      wideToLongFields: {
        fields: {
          wide: {
            purpose: 'mcomp',
          },
        },
      },
    };
    const result = appendWideToLongFields(hv);

    expect(result.fields.length).toEqual(2);
  });
  it('should remove mvalue fields from hv.fields', () => {
    const hv = {
      enabled: true,
      fields: [
        {
          filename: '/myfile',
          purpose: 'subject',
        },
        {
          filename: '/myfile',
          purpose: 'mvalue',
        },
      ],
      wideToLongFields: {
        fields: {
          wide: {
            purpose: 'mcomp',
          },
        },
      },
    };
    const result = appendWideToLongFields(hv);

    expect(result.fields.length).toEqual(2);
  });
  it('should not crash if no wideToLongFields property is not found', () => {
    const hv = {
      enabled: true,
      fields: [
        {
          filename: '/myfile',
          purpose: 'subject',
        },
        {
          filename: '/myfile',
          purpose: 'mvalue',
        },
      ],
    };
    const result = appendWideToLongFields(hv);

    expect(result.fields.length).toEqual(2);
  });
});
