/**
 * @module test/lib/filesToEtlUnits/transforms/implied-mvalue
 *
 * @description
 * Jest testing module for the `implied-mvalue` module.
 *
 */

import {
  buildImpliedMvalue,
  appendImpliedFields,
  setMvalue,
} from './implied-mvalue';
import { headerViewsThree } from '../filesToEtlUnits-test-data';

const [mspan] = headerViewsThree['targetList.csv'].fields.filter(
  (field) => field.purpose === 'mspan',
);

const hv = headerViewsThree['targetList.csv'];

//------------------------------------------------------------------------------
describe('implied-mvalue', () => {
  test('Integration test: Add implied mvalue', () => {
    const hvWithConfig = {
      'targetList.csv': {
        ...hv,
        'implied-mvalue': buildImpliedMvalue({
          mspan,
          nrows: hv.nrows,
        }),
      },
    };

    const config = hvWithConfig['targetList.csv']['implied-mvalue'];
    const step2 = setMvalue('wasLostNowFound', config);
    const expectValue = step2.config.mvalue;
    const tobeValue = 'wasLostNowFound';
    expect(expectValue).toEqual(tobeValue);
  });
  test('Should append implied value to hv.fields', () => {
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
      'implied-mvalue': {
        field: 'implied',
      },
    };
    const result = appendImpliedFields(hv);

    expect(result.fields.length).toEqual(3);
  });
});
