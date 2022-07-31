/**
 * @module test/lib/filesToEtlUnits/transforms/etl-unit-helpers.test.js
 *
 * @description
 * Jest testing module for the `etl-unit-helpers` module.
 *
 */

import {
  isNameInEtlUnit,
  getPurpose,
  getNextDisplayField,
  selectRelatedRemovableFields,
  mapFieldToPurpose,
  mapUnitsToPurpose,
} from './etl-unit-helpers';
import { PURPOSE_TYPES as TYPES } from '../../sum-types';
import { selectPropsInObj } from '../headerview-helpers';

const data = {
  etlUnits: {
    'Primary Specialty Desc': {
      type: 'quality',
      subject: 'NPI Number',
      codomain: 'Primary Specialty Desc',
      'codomain-reducer': 'FIRST',
    },
    State: {
      type: 'quality',
      subject: 'NPI Number',
      codomain: 'State',
      'codomain-reducer': 'FIRST',
    },
    'NRx Count': {
      type: 'mvalue',
      subject: 'NPI Number',
      mspan: 'Year-Month',
      mcomps: ['Practitioner Zip Code', 'Payment Type Group'],
      codomain: 'NRx Count',
      'codomain-reducer': 'SUM',
      'slicing-reducer': 'SUM',
    },
    brand_seg: {
      type: 'quality',
      subject: 'NPI Number',
      codomain: 'brand_seg',
      'codomain-reducer': 'FIRST',
    },
    reach: {
      type: 'mvalue',
      subject: 'NPI Number',
      mspan: 'MM-YYYY',
      mcomps: ['hc_match', 'hc_GT'],
      codomain: 'reach',
      'codomain-reducer': 'SUM',
      'slicing-reducer': 'SUM',
    },
  },
};

const testMvalue = data.etlUnits['NRx Count'];
const testQuality = data.etlUnits.State;
const singleQualityUnit = selectPropsInObj(['State'], data.etlUnits);
const twoQualityUnit = selectPropsInObj(
  ['State', 'Primary Specialty Desc'],
  data.etlUnits,
);
const singleMvalueUnit = selectPropsInObj(['NRx Count'], data.etlUnits);

const listOfFieldNames = [
  'NPI Number',
  'Primary Specialty Desc',
  'State',
  'brand_seg',
  'NRx Count',
  'reach',
  'Practitioner Zip Code',
  'Payment Type Group',
  'hc_match',
  'Year-Month',
  'MM-YYYY',
];

//------------------------------------------------------------------------------
describe('isNameInEtlUnit', () => {
  //------------------------------------------------------------------------------
  test('isNameInEtlUnit: field subject (etlUnit:mvalue)', () => {
    const expectValue = isNameInEtlUnit('NPI Number', testMvalue);
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('isNameInEtlUnit: field subject (etlUnit:quality)', () => {
    const expectValue = isNameInEtlUnit('NPI Number', testQuality);
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('isNameInEtlUnit: field mvalue', () => {
    const expectValue = isNameInEtlUnit('NPI Number', testMvalue);
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('isNameInEtlUnit: field mcomps', () => {
    const expectValue = isNameInEtlUnit('Payment Type Group', testMvalue);
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('isNameInEtlUnit: field mspan', () => {
    const expectValue = isNameInEtlUnit('Year-Month', testMvalue);
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('isNameInEtlUnit: field quality', () => {
    const expectValue = isNameInEtlUnit('State', testQuality);
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('isNameInEtlUnit: returns false when matches a non-fieldName prop', () => {
    const expectValue = isNameInEtlUnit('FIRST', testQuality);
    const tobeValue = false;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('isNameInEtlUnit: returns false when otherwise not there', () => {
    const expectValue = isNameInEtlUnit('Not there', testQuality);
    const tobeValue = false;
    expect(expectValue).toEqual(tobeValue);
  });
});
describe('getPurpose', () => {
  //------------------------------------------------------------------------------
  test('field subject (etlUnit:mvalue)', () => {
    const expectValue = getPurpose('NPI Number', testMvalue);
    const tobeValue = TYPES.SUBJECT;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('field subject (etlUnit:quality)', () => {
    const expectValue = getPurpose('NPI Number', testQuality);
    const tobeValue = TYPES.SUBJECT;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('field mvalue', () => {
    const expectValue = getPurpose('NRx Count', testMvalue);
    const tobeValue = TYPES.MVALUE;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('field mcomps', () => {
    const expectValue = getPurpose('Payment Type Group', testMvalue);
    const tobeValue = TYPES.MCOMP;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('field mspan', () => {
    const expectValue = getPurpose('Year-Month', testMvalue);
    const tobeValue = TYPES.MSPAN;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('field quality', () => {
    const expectValue = getPurpose('State', testQuality);
    const tobeValue = TYPES.QUALITY;
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('Throws an error when the fieldName does not exist', () => {
    expect(() => {
      getPurpose('Not there', testMvalue);
    }).toThrow();
  });
});
describe('selectRelatedRemovableFields - returns removable fields related to the field', () => {
  //------------------------------------------------------------------------------
  test('field subject (etlUnit:mvalue); throws an error; not removable', () => {
    expect(() => {
      selectRelatedRemovableFields('NPI Number', testMvalue);
    }).toThrow();
  });
  //------------------------------------------------------------------------------
  test('field subject (etlUnit:quality); throws an error; not removable', () => {
    expect(() => {
      selectRelatedRemovableFields('NPI Number', testQuality);
    }).toThrow();
  });
  //------------------------------------------------------------------------------
  test('field mvalue -> all removable fields in the etlUnit', () => {
    const expectValue = selectRelatedRemovableFields('NRx Count', testMvalue);
    const tobeValue = [
      'NRx Count',
      'Year-Month',
      'Practitioner Zip Code',
      'Payment Type Group',
    ];
    expect(expectValue).toEqual(tobeValue);
  });
  /*
      type: 'mvalue',
      subject: 'NPI Number',
      mspan: 'Year-Month',
      mcomps: ['Practitioner Zip Code', 'Payment Type Group'],
      codomain: 'NRx Count',
      */
  //------------------------------------------------------------------------------
  test('field mcomp -> field mcomp', () => {
    const expectValue = selectRelatedRemovableFields(
      'Payment Type Group',
      testMvalue,
    );
    const tobeValue = ['Payment Type Group'];
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('⚠️  field mspan -> all removable fields in the etlUnit', () => {
    const expectValue = selectRelatedRemovableFields('Year-Month', testMvalue);
    const tobeValue = [
      'NRx Count',
      'Year-Month',
      'Practitioner Zip Code',
      'Payment Type Group',
    ];
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('field quality', () => {
    const expectValue = selectRelatedRemovableFields('State', testQuality);
    const tobeValue = ['State'];
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('Throws an error when the fieldName does not exist', () => {
    expect(() => {
      selectRelatedRemovableFields('Not there', testMvalue);
    }).toThrow();
  });
});
describe('mapFieldToPurpose', () => {
  //------------------------------------------------------------------------------
  test('etlUnit:quality', () => {
    const expectValue = mapFieldToPurpose(testQuality);
    const tobeValue = {
      'NPI Number': TYPES.SUBJECT,
      State: TYPES.QUALITY,
    };
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('e etlUnit:mvalue', () => {
    const expectValue = mapFieldToPurpose(testMvalue);
    const tobeValue = {
      'NPI Number': TYPES.SUBJECT,
      'Year-Month': TYPES.MSPAN,
      'Payment Type Group': TYPES.MCOMP,
      'Practitioner Zip Code': TYPES.MCOMP,
      'NRx Count': TYPES.MVALUE,
    };
    expect(expectValue).toEqual(tobeValue);
  });
});
describe('mapUnitsToPurpose', () => {
  //------------------------------------------------------------------------------
  test('single etlUnit:quality in the collection', () => {
    const expectValue = mapUnitsToPurpose(singleQualityUnit);
    const tobeValue = {
      'NPI Number': TYPES.SUBJECT,
      State: TYPES.QUALITY,
    };
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('more than one etlUnit:quality in the collection', () => {
    const expectValue = mapUnitsToPurpose(twoQualityUnit);
    const tobeValue = {
      'NPI Number': TYPES.SUBJECT,
      'Primary Specialty Desc': TYPES.QUALITY,
      State: TYPES.QUALITY,
    };
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('single etlUnit:mvalue in the collection', () => {
    const expectValue = mapUnitsToPurpose(singleMvalueUnit);
    const tobeValue = {
      'NPI Number': TYPES.SUBJECT,
      'Year-Month': TYPES.MSPAN,
      'Payment Type Group': TYPES.MCOMP,
      'Practitioner Zip Code': TYPES.MCOMP,
      'NRx Count': TYPES.MVALUE,
    };
    expect(expectValue).toEqual(tobeValue);
  });
});
describe('getNextDisplayField', () => {
  //------------------------------------------------------------------------------
  test('remove a non-last-in-list quality; return the next quality in the list', () => {
    const removeField = listOfFieldNames[2];
    const expectValue = getNextDisplayField(
      removeField,
      listOfFieldNames,
      data.etlUnits,
    );
    const tobeValue = listOfFieldNames[3];
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('remove a non-last-in-list mspan; return the next mvalue in the list', () => {
    const removeField = listOfFieldNames[9];
    const expectValue = getNextDisplayField(
      removeField,
      listOfFieldNames,
      data.etlUnits,
    );
    const tobeValue = listOfFieldNames[5];
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
  test('remove a last-in-list mspan; return the previous mvalue in the list', () => {
    const removeField = listOfFieldNames[10];
    const expectValue = getNextDisplayField(
      removeField,
      listOfFieldNames,
      data.etlUnits,
    );
    const tobeValue = listOfFieldNames[4];
    expect(expectValue).toEqual(tobeValue);
  });
  //------------------------------------------------------------------------------
});
