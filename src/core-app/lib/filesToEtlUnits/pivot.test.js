/**
 * @module test/lib/filesToEtlUnits/pivot
 *
 * @description
 * Jest testing module for the `pivot` module.
 *
 * 🚧 callback() is deprecated.
 *
 * Needs to be updated using the latest approach in the update-field.js
 * module.
 *
 *   ⬜ Update the tests that once depended on callbacks.
 *
 *   ⬜ Update the tests now using  etl-from-pivot module
 *
 */

import { pivot } from './pivot';

// test data
import {
  // fileFields
  headerViews,
  // resultOfPivot as resultForTest,
} from './filesToEtlUnits-test-data';

//------------------------------------------------------------------------------
describe('Pivot:: files-fields -> field-files ~ etlFields', () => {
  describe('Setting field values', () => {
    /*
    it('Pivot the header view to an etl-field view (partial)', () => {
      const expectValue = pivotToEtlFields(headerViews);
      const tobeValue = resultForTest;
      expect(expectValue).toEqual(tobeValue);
    });

    //------------------------------------------------------------------------------
    it('User disables the specialty field in target-list.csv', () => {
      const expectValue = pivotToEtlFields(
        Object.values(headerViews).map((view) => {
          const { fields } = view;

          if (view.filename === 'targetList.csv') {
            return {
              ...view,
              fields: fields.map((field) => {
                if (field['field-alias'] === 'specialty') {
                  return {
                    ...field,
                    enabled: false, // CHANGE IS HERE
                  };
                }
                return field;
              }),
            };
          }
          return view;
        }),
      );

      const tobeValue = {
        ...resultForTest,
        specialty: {
          sources: [
            // sources that excludes targetList.csv
            {
              'field-alias': 'specialty',
              enabled: true,
              'header-idx': 1,
              'header-name': 'specialty',
              purpose: 'quality',
              'null-value': null,
              format: null,
              'map-symbols': {},
              levels: [
                ['OBGYN', 45],
                ['SURGEON', 32],
              ],
              filename: 'warfarin.csv',
            },
            {
              'field-alias': 'specialty',
              enabled: true,
              'header-idx': 1,
              'header-name': 'specialty',
              purpose: 'quality',
              'null-value': null,
              format: null,
              'map-symbols': {},
              levels: [
                ['OBGYN', 45],
                ['SURGEON', 32],
              ],
              filename: 'brand_sales.csv',
            },
          ],
        },
      };

      expect(expectValue).toEqual(tobeValue);
    });

    //------------------------------------------------------------------------------
    it('User changes the alias of specialty in the targetList.csv file', () => {
      const expectValue = pivotToEtlFields(
        Object.values(headerViews).map((view) => {
          const { fields } = view;

          if (view.filename === 'targetList.csv') {
            return {
              ...view,
              fields: fields.map((field) => {
                if (field['field-alias'] === 'specialty') {
                  return {
                    ...field,
                    'field-alias': 'not-specialty', // CHANGE IS HERE
                  };
                }
                return field;
              }),
            };
          }
          return view;
        }),
      );

      const tobeValue = {
        ...resultForTest,
        specialty: {
          sources: [
            // sources that excludes targetList.csv
            {
              'field-alias': 'specialty',
              enabled: true,
              'header-idx': 1,
              'header-name': 'specialty',
              purpose: 'quality',
              'null-value': null,
              format: null,
              'map-symbols': {},
              levels: [
                ['OBGYN', 45],
                ['SURGEON', 32],
              ],
              filename: 'warfarin.csv',
            },
            {
              'field-alias': 'specialty',
              enabled: true,
              'header-idx': 1,
              'header-name': 'specialty',
              purpose: 'quality',
              'null-value': null,
              format: null,
              'map-symbols': {},
              levels: [
                ['OBGYN', 45],
                ['SURGEON', 32],
              ],
              filename: 'brand_sales.csv',
            },
          ],
        },
        'not-specialty': {
          sources: [
            // one source = targetList.csv
            {
              'field-alias': 'not-specialty',
              enabled: true,
              'header-idx': 1,
              'header-name': 'specialty',
              purpose: 'quality',
              'null-value': null,
              format: null,
              'map-symbols': {},
              levels: [
                ['OBGYN', 45],
                ['SURGEON', 32],
              ],
              filename: 'targetList.csv',
            },
          ],
        },
      };

      expect(expectValue).toEqual(tobeValue);
    });

    //------------------------------------------------------------------------------
    it('User then disables the not-specialty field', () => {
      const expectValue = pivotToEtlFields(
        Object.values(headerViews).map((view) => {
          const { fields } = view;

          if (view.filename === 'targetList.csv') {
            return {
              ...view,
              fields: fields.map((field) => {
                if (field['field-alias'] === 'specialty') {
                  return {
                    ...field,
                    'field-alias': 'not-specialty', // CHANGE IS HERE
                    enabled: false, // CHANGE IS HERE
                  };
                }
                return field;
              }),
            };
          }
          return view;
        }),
      );

      const tobeValue = {
        ...resultForTest,
        specialty: {
          sources: [
            // sources that excludes targetList.csv
            {
              'field-alias': 'specialty',
              enabled: true,
              'header-idx': 1,
              'header-name': 'specialty',
              purpose: 'quality',
              'null-value': null,
              format: null,
              'map-symbols': {},
              levels: [
                ['OBGYN', 45],
                ['SURGEON', 32],
              ],
              filename: 'warfarin.csv',
            },
            {
              'field-alias': 'specialty',
              enabled: true,
              'header-idx': 1,
              'header-name': 'specialty',
              purpose: 'quality',
              'null-value': null,
              format: null,
              'map-symbols': {},
              levels: [
                ['OBGYN', 45],
                ['SURGEON', 32],
              ],
              filename: 'brand_sales.csv',
            },
          ],
        },
      };

      expect(expectValue).toEqual(tobeValue);
    });
    */

    //------------------------------------------------------------------------------
    it('Pivot over-all functionality - validates presence of keys', () => {
      const expectValue = {
        etlFields: Object.keys(pivot(Object.values(headerViews)).etlFields),
        etlUnits: Object.keys(pivot(Object.values(headerViews)).etlUnits),
      };
      const tobeValue = {
        etlFields: ['npi', 'specialty', 'nrx', 'date'],
        etlUnits: ['specialty', 'nrx'],
      };
      expect(expectValue).toEqual(tobeValue);
    });
  });
});

//------------------------------------------------------------------------------
/*
describe('callbacks', () => {
  describe('Setting field values', () => {
    it('should update null-value-expansion', () => {
      const prop = 'null-value-expansion';
      const etlField = {
        'null-value-expansion': null,
        other: 'unaltered',
      };

      const newValue = 'New Value';

      // Before the value is null
      expect(etlField[prop]).toEqual(null);
      expect(etlField.other).toEqual('unaltered');

      // After it should be set to newValue
      const result = callbacks().setNullExpansion(newValue, etlField);
      expect(result[prop]).toEqual(newValue);
      expect(result.other).toEqual('unaltered');
    });
    it('should update format', () => {
      const prop = 'format';
      const etlField = {
        [prop]: null,
      };

      const newValue = 'New Value';

      // Before the value is null
      expect(etlField[prop]).toEqual(null);

      // After it should be set to newValue
      expect(callbacks().setFormat(newValue, etlField)[prop]).toEqual(newValue);
    });
    it('should update codomain-reducer', () => {
      const prop = 'codomain-reducer';
      const etlField = {
        [prop]: null,
        other: 'unaltered',
      };

      const newValue = 'New Value';

      // Before the value is null
      expect(etlField[prop]).toEqual(null);
      expect(etlField.other).toEqual('unaltered');

      // After it should be set to newValue
      const result = callbacks().setCodomainRed(newValue, etlField);
      expect(result[prop]).toEqual(newValue);
      expect(result.other).toEqual('unaltered');
    });
    it('should update slicing-reducer', () => {
      const prop = 'slicing-reducer';
      const etlField = {
        'slicing-reducer': null,
        other: 'unaltered',
      };

      const newValue = 'New Value';

      // Before the value is null
      expect(etlField[prop]).toEqual(null);
      expect(etlField.other).toEqual('unaltered');

      // After it should be set to newValue
      const result = callbacks().setSlicingRed(newValue, etlField);
      expect(result[prop]).toEqual(newValue);
      expect(result.other).toEqual('unaltered');
    });
  });
  describe('Adding Arrows', () => {
    it('should add arrows when none exist', () => {
      const etlField = {
        'map-symbols': null,
        other: 'unaltered',
      };

      const newValue = { newArrow: 'myValue' };

      // Before the value is null
      expect(etlField['map-symbols']).toEqual(null);
      expect(etlField.other).toEqual('unaltered');

      // After it should be set to newValue
      const result = callbacks().addSymbolArrow(newValue, etlField);
      expect(result['map-symbols'].arrows).toEqual(newValue);
      expect(result.other).toEqual('unaltered');
    });
    it('should append arrows to existing map-symbols.arrows', () => {
      const etlField = {
        'map-symbols': {
          arrows: {
            existing: 'value',
          },
        },
        other: 'unaltered',
      };

      const newValue = { newArrow: 'myValue' };

      // Before the value is null
      expect(etlField['map-symbols'].arrows.existing).toEqual('value');

      // After it should be set to newValue
      const result = callbacks().addSymbolArrow(newValue, etlField);

      expect(result['map-symbols'].arrows.existing).toEqual('value');
      expect(result['map-symbols'].arrows.newArrow).toEqual('myValue');
      expect(result.other).toEqual('unaltered');
    });
  });
  describe('Removing Arrows', () => {
    it('should remove a single arrow', () => {
      const etlField = {
        'map-symbols': {
          arrows: {
            remove: 'me',
            unchanged: 'value',
          },
        },
        other: 'unaltered',
      };

      // Before the value is null
      expect(etlField['map-symbols'].arrows.remove).toEqual('me');
      expect(etlField['map-symbols'].arrows.unchanged).toEqual('value');

      // After it should be set to newValue
      const result = callbacks().removeSymbolArrow('remove', etlField);

      expect(result['map-symbols'].arrows.remove).toEqual(undefined);
      expect(result['map-symbols'].arrows.unchanged).toEqual('value');
      expect(result.other).toEqual('unaltered');
    });
  });
});
*/
