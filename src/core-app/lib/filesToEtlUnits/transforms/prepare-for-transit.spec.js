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
        m_nrxcount: 'NRx Count',
        npinumber: 'NPI Number',
        paymenttypegroup: 'Payment Type Group',
        q_practitionerstate: 'Practitioner State',
        q_practitionerzipcode: 'Practitioner Zip Code',
        q_primaryspecialtydesc: 'Primary Specialty Desc',
        time: 'Year-Month',
      };
      expect(createNameMap(etlObject.etlFields)).toEqual(tobe);
    });
  });
});
