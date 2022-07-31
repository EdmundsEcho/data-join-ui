/**
 * @module test/lib/filesToEtlUnits/file-to-header
 *
 * @description
 * Jest testing module for the `/file-to-header` module.
 *
 */
import { uniqueArray } from './etl-field-helper';
import { forTesting } from './file-to-header';

// test data
import {
  fileFields,
  headerForFile0,
  headerForFile1,
} from './filesToEtlUnits-test-data';

const { defaultConfig, addFileToHeaderViews } = forTesting;

const testConfig = defaultConfig;
const customConfig = {
  ...testConfig,
  configFile: (file) => ({
    newField: 'LOOK AT ME',
    enabled: true,
    filename: file.filename,
    header: file.header,
    nrows: file.nrows,
    fields: file.fields,
  }),
  configField: (file, field) => ({
    newField: 'LOOK AT ME',
    enabled: true,
    'header-idx': field.idx,
    'default-name': uniqueArray(file.header)[field.idx],
    'field-alias': uniqueArray(file.header)[field.idx],
    purpose: field.purpose,
    'null-value': null,
    format: null,
    'map-symbols': {
      arrows: {},
    },
    levels: field.levels,
    filename: file.filename,
  }),
};

const testFieldKeys = Object.keys(headerForFile0.fields[0]);

const result0 = addFileToHeaderViews(fileFields.files[0], {}, testConfig);
// back out the callbacks prop
const expectValue00 = Object.keys(result0['targetList.csv'])
  .filter((key) => key !== 'callbacks')
  .reduce((obj, key) => {
    obj[key] = result0['targetList.csv'][key];
    return obj;
  }, {});

const expectValue0 = {
  'targetList.csv': {
    ...expectValue00,
    fields: expectValue00.fields.map((field) =>
      testFieldKeys.reduce((newField, testKey) => {
        newField[testKey] = field[testKey];
        return newField;
      }, {}),
    ),
  },
};

// repeat for second hv
const result1 = addFileToHeaderViews(
  fileFields.files[1],
  expectValue0, // continuation
  testConfig,
);
// back out the callbacks prop
const expectValue11 = Object.keys(result1['warfarin.csv'])
  .filter((key) => key !== 'callbacks')
  .reduce((obj, key) => {
    obj[key] = result1['warfarin.csv'][key];
    return obj;
  }, {});

const expectValue1 = {
  'warfarin.csv': {
    ...expectValue11,
    fields: expectValue11.fields.map((field) =>
      testFieldKeys.reduce((newField, testKey) => {
        newField[testKey] = field[testKey];
        return newField;
      }, {}),
    ),
  },
};

describe('file-to-header unit tests', () => {
  //------------------------------------------------------------------------------
  test(`1. Raw File -> HeaderView: Add a header view to an empty collection.`, () => {
    const tobeValue = {
      'targetList.csv': {
        ...headerForFile0,
      },
    };
    expect(expectValue0).toEqual(tobeValue);
  });

  //------------------------------------------------------------------------------
  test(`2. Raw File -> HeaderView: Add a header view to an existing collection.`, () => {
    const expectValue = {
      ...expectValue0,
      ...expectValue1,
    };
    const tobeValue = {
      'targetList.csv': {
        ...headerForFile0,
      },
      'warfarin.csv': {
        ...headerForFile1,
      },
    };
    expect(expectValue).toEqual(tobeValue);
  });

  //------------------------------------------------------------------------------
  test(`3. File 0: Augment and sub-select ... using a non-default
  configuration.`, () => {
    const testFieldKeysCust = [...testFieldKeys, 'newField'];

    const result0 = addFileToHeaderViews(fileFields.files[0], {}, customConfig);
    // back out the callbacks prop
    const expectValue00 = Object.keys(result0['targetList.csv'])
      .filter((key) => key !== 'callbacks')
      .reduce((obj, key) => {
        obj[key] = result0['targetList.csv'][key];
        return obj;
      }, {});

    const expectValue0 = {
      'targetList.csv': {
        ...expectValue00,
        fields: expectValue00.fields.map((field) =>
          testFieldKeysCust.reduce((newField, testKey) => {
            newField[testKey] = field[testKey];
            return newField;
          }, {}),
        ),
      },
    };
    const { fields, ...rest } = headerForFile0;
    const tobeValue = {
      'targetList.csv': {
        ...rest,
        newField: 'LOOK AT ME',
        fields: fields.map((field) => ({
          ...field,
          newField: 'LOOK AT ME',
        })),
      },
    };
    expect(expectValue0).toEqual(tobeValue);
  });

  //------------------------------------------------------------------------------
  test(`4. File 0: Test the callbacks.`, () => {
    const expectValue = true;
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });

  /*
  //------------------------------------------------------------------------------
  describe('callbacks', () => {
    const fieldName = 'testField';
    const field = {
      'header-idx': 0,
      'field-alias': fieldName,
      enabled: true,
      format: null,
      'map-symbols': {
        arrows: {
          levelOld: 'levelNew',
        },
      },
    };

    it(`field format:: should update the format prop of a field`, () => {
      const newValue = 'new value';
      const updatedField = fieldCallbacksF().setFormat(newValue, field);

      // We start with format=null
      expect(field.format).toEqual(null);

      // Then it should equal `new value`
      expect(newValue).toEqual(updatedField.format);
    });

    it(`field alias:: should update the field-alias prop of a field`, () => {
      const newValue = 'new value';
      const updatedField = fieldCallbacksF().setFieldAlias(newValue, field);

      // We start with field alias...
      expect(fieldName).toEqual(field['field-alias']);

      // Then it should equal `new value`
      expect(newValue).toEqual(updatedField['field-alias']);
    });

    // defined here to generate incremental results for the next two tests
    const newValue = {
      levelOld2: 'levelNew',
    };
    const updatedField = fieldCallbacksF().addArrow(newValue, field);

    it(`field arrow:: should add an arrow to arrows of a field`, () => {
      // We start with arrows
      expect(field['map-symbols'].arrows).toEqual({
        levelOld: 'levelNew',
      });

      // Then it should equal `new value`
      expect(updatedField['map-symbols'].arrows).toEqual({
        levelOld: 'levelNew',
        ...newValue,
      });
    });

    it(`field arrow:: should remove an arrow from field`, () => {
      const updatedFieldTwo = fieldCallbacksF().removeArrow(
        'levelOld2',
        updatedField,
      );

      // We start with arrows
      expect(updatedField['map-symbols'].arrows).toEqual({
        levelOld: 'levelNew',
        levelOld2: 'levelNew',
      });

      // Then it should equal `new value`
      expect(updatedFieldTwo['map-symbols'].arrows).toEqual({
        levelOld: 'levelNew',
      });
    });

    it(`field time-interval:: should update time.interval`, () => {
      const mspanField = {
        ...field,
        time: {
          reference: {
            '0': '05-16',
          },
          interval: null,
        },
        format: 'YYYY-MM',
        purpose: 'mspan',
        levels: [
          ['2015-03', 1],
          ['2015-04', 2],
        ],
      };

      const {
        time: { interval },
        'levels-mspan': levelsMspan,
      } = fieldCallbacksF().setTimeInterval(
        {
          count: 1,
          unit: 'M',
        },
        mspanField,
      );

      expect(interval).toEqual({
        count: 1,
        unit: 'M',
      });

      expect(levelsMspan).toEqual([
        {
          rangeStart: 0,
          rangeLength: 2,
          reduced: false,
        },
      ]);
    });
  });
    */
  //------------------------------------------------------------------------------
});
