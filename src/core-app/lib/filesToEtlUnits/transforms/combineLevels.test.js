/**
 * @module test/lib/filesToEtlUnits/transforms/combineLevels
 *
 * @description
 * Jest testing module for the `combineLevels` module.
 *
 */
import { combine as combineLevels } from './combineLevels';

//------------------------------------------------------------------------------
/**
 * Tests
 */

// {{{
const testData1 = [
  [
    ['this', 10],
    ['that', 3],
  ],
  [
    ['this', 10],
    ['that', 3],
  ],
];

const testData2 = [
  [
    ['this', 1],
    ['that', 3],
  ],
  [
    ['this', 2],
    ['that', 3],
    ['other', 9],
  ],
];

const testData3 = [
  [
    ['this', 10],
    ['that', 3],
  ],
  [
    ['this2', 10],
    ['that2', 3],
  ],
  [
    ['this3', 10],
    ['that3', 3],
  ],
];

const testData4 = [
  [
    ['this', 1],
    ['that', 3],
  ],
];
// }}}

//------------------------------------------------------------------------------
test('Combine copies of the same [level]', () => {
  const expectValue = combineLevels(testData1);
  const tobeValue = [
    ['this', 20],
    ['that', 6],
  ];
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Combine [level] of different lengths', () => {
  const expectValue = combineLevels(testData2);
  const tobeValue = [
    ['this', 3],
    ['that', 6],
    ['other', 9],
  ];
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Combine 3 x [level] all with unique values', () => {
  const expectValue = combineLevels(testData3);
  const tobeValue = [
    ['this', 10],
    ['that', 3],
    ['this2', 10],
    ['that2', 3],
    ['this3', 10],
    ['that3', 3],
  ];
  expect(expectValue).toEqual(tobeValue);
});
//------------------------------------------------------------------------------
test('Works with just one [level]', () => {
  const expectValue = combineLevels(testData4);
  const tobeValue = [
    ['this', 1],
    ['that', 3],
  ];
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
