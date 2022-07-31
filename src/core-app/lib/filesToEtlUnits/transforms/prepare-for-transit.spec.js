import { sanitizeFieldName, createNameMap } from './prepare-for-transit';
import etlObject from '../../../datasets/etlObject';

describe('prepare-for-transit', () => {
  describe('sanitizeFieldName', () => {
    test('replaces spaces', () => {
      expect(sanitizeFieldName('Payer Of Rx')).toEqual('payerofrx');
    });
    test('removes dashes', () => {
      expect(sanitizeFieldName('Payer-Of-Rx')).toEqual('payerofrx');
    });
    test('... and other non-alpha-numerical chars', () => {
      expect(sanitizeFieldName('-Payer!Of.Rx4')).toEqual('payerofrx4');
    });
  });
  describe('create a map from sanitized -> fieldName', () => {
    test('replaces spaces', () => {
      const tobe = {
        npinumber: 'NPI Number',
        nrxcount: 'NRx Count',
        paymenttypegroup: 'Payment Type Group',
        practitionerstate: 'Practitioner State',
        practitionerzipcode: 'Practitioner Zip Code',
        primaryspecialtydesc: 'Primary Specialty Desc',
        yearmonth: 'Year-Month',
      };
      expect(createNameMap(etlObject.etlFields)).toEqual(tobe);
    });
  });
});
