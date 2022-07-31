/**
 * @module lib/span/
 * @description
 * Jest testing module for the `span/spanSetOps` module.
 */
import {
  consolidateSpans,
  intersection,
  spansOverlap,
  spansUnion,
} from '../span/spanSetOps';
import { isContinuous, isSubset } from '../span/span-helper';

//------------------------------------------------------------------------------
/**
 * Tests
 */
const span1 = {
  rangeStart: 0,
  rangeLength: 18,
  reduced: false,
};
const span1_1 = {
  rangeStart: 1,
  rangeLength: 16,
  reduced: false,
};
const span2 = {
  rangeStart: 3,
  rangeLength: 18,
  reduced: false,
};
const span2_0 = {
  rangeStart: 0,
  rangeLength: 18,
  reduced: false,
};
const span2_1 = {
  rangeStart: 1,
  rangeLength: 18,
  reduced: false,
};
const span3 = {
  rangeStart: 1,
  rangeLength: 10,
  reduced: false,
};
const span4 = {
  rangeStart: 5,
  rangeLength: 17,
  reduced: false,
};
const span5 = {
  rangeStart: 18,
  rangeLength: 1,
  reduced: false,
};
const span6 = {
  rangeStart: 30,
  rangeLength: 1,
  reduced: false,
};
const spanFail = {
  rangeStart: 0,
  rangeLength: 18,
  reduced: true,
};

//------------------------------------------------------------------------------
test('Values with equal span values are subsets', () => {
  const expectValue = isSubset(span1, span1);
  const tobeValue = true;
  expect(expectValue).toBe(tobeValue);
});

//------------------------------------------------------------------------------
test('Values with equal span values: are subsets', () => {
  const expectValue = isSubset(span2, span2);
  const tobeValue = true;
  expect(expectValue).toBe(tobeValue);
});

//------------------------------------------------------------------------------
test('The first is a subset of the second', () => {
  const expectValue = isSubset(span1_1, span1);
  const tobeValue = true;
  expect(expectValue).toBe(tobeValue);
});

//------------------------------------------------------------------------------
test('But not the other way around', () => {
  const expectValue = isSubset(span1, span1_1);
  const tobeValue = false;
  expect(expectValue).toBe(tobeValue);
});

//------------------------------------------------------------------------------
test('Continuous span values', () => {
  const expectValue = isContinuous(span1, span5);
  const tobeValue = true;
  expect(expectValue).toBe(tobeValue);
});

//------------------------------------------------------------------------------
test('Continuous span values', () => {
  const expectValue = isContinuous(span1, span2_1);
  const tobeValue = true;
  expect(expectValue).toBe(tobeValue);
});

//------------------------------------------------------------------------------
test('Continuous operation is communative', () => {
  const expectValue = isContinuous(span2_1, span1);
  const tobeValue = true;
  expect(expectValue).toBe(tobeValue);
});

//------------------------------------------------------------------------------
test('Continuous spans are not subsets', () => {
  const expectValue = isContinuous(span1, span1_1);
  const tobeValue = false;
  expect(expectValue).toBe(tobeValue);
});

//------------------------------------------------------------------------------
test('Continuous spans do not have gaps larger than 1 between them', () => {
  const expectValue = isContinuous(span1_1, span5);
  const tobeValue = false;
  expect(expectValue).toBe(tobeValue);
});

//------------------------------------------------------------------------------
test('Continuous operation is communative', () => {
  const expectValue = isContinuous(span5, span1_1);
  const tobeValue = false;
  expect(expectValue).toBe(tobeValue);
});

//------------------------------------------------------------------------------
test('Merging continuous span values', () => {
  const expectValue = consolidateSpans([span1, span2]);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 21,
      reduced: false,
    },
  ];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('Merging continuous span values', () => {
  const expectValue = consolidateSpans([span1, span2_0]);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 18,
      reduced: false,
    },
  ];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('Merging continuous span values', () => {
  const expectValue = consolidateSpans([span1, span2_1]);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 19,
      reduced: false,
    },
  ];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('Merging continuous span values returns seperate spans', () => {
  const expectValue = consolidateSpans([span1, span2_1, span6]);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 19,
      reduced: false,
    },
    span6,
  ];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('Communative - Merging continuous span values returns seperate spans', () => {
  const expectValue = consolidateSpans([span6, span1, span2_1]);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 19,
      reduced: false,
    },
    span6,
  ];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('Consolidate [span1, span1] to [span1]', () => {
  const expectValue = consolidateSpans([span1, span1]);
  const tobeValue = [span1];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('Consolidate [span1, span5] to [span1, span5]', () => {
  const expectValue = consolidateSpans([span1, span5]);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 19,
      reduced: false,
    },
  ];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('Consolidate [span1, span2, span5] to [new]', () => {
  const expectValue = consolidateSpans([span1, span2, span5]);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 21,
      reduced: false,
    },
  ];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('Consolidate [span1, span2, span6] to [new, span6]', () => {
  const expectValue = consolidateSpans([span6, span1, span2, span5, span6]);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 21,
      reduced: false,
    },
    span6,
  ];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('The intersection [[span]] -> [span] of identical spans is [span] (discontinuous)', () => {
  const expectValue = intersection([span1, span5])([span1, span5]);
  const tobeValue = consolidateSpans([span1, span5]);
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('The intersection [[span]] -> [span] of identical spans is [span] (continuous)', () => {
  const expectValue = intersection([span1, span2])([span1, span2]);
  const tobeValue = consolidateSpans([span1, span2]);
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('The intersection of [span1_1, span1] and [span1] is [span1]', () => {
  const expectValue = intersection([span1_1, span1])([span1]);
  const tobeValue = [span1];
  expect(JSON.stringify(expectValue)).toBe(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('The intersection of [span1] and [span1, span2] is [span1]', () => {
  const expectValue = intersection([span1])([span1, span2]);
  const tobeValue = [span1];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('The intersection of [span1, span2] and [span1] is [span1] flip', () => {
  const expectValue = intersection([span1, span2])([span1]);
  const tobeValue = [span1];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('The intersection of [span1, span3] and [span1, span2] is [span1]', () => {
  const expectValue = intersection([span1, span3])([span1, span2]);
  const tobeValue = [span1];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('The intersection of [span1, span2] and [span1, span3] is [span1] flip', () => {
  const expectValue = intersection([span1, span2])([span1, span3]);
  const tobeValue = [span1];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('The intersection of [span1, span2] and [span1, span3, span4] is [new]', () => {
  const expectValue = intersection([span1, span2])([span1, span3, span4]);
  const tobeValue = consolidateSpans([span1, span2]);
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('The intersection of [span1, span3, span4] and [span1, span2] is [new] flip', () => {
  const expectValue = intersection([span1, span3, span4])([span1, span2]);
  const tobeValue = consolidateSpans([span1, span2]);
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('The intersection as a monoidal operation (neutral = [])', () => {
  const expectValue = [
    [span1, span2, span5],
    [span1, span2],
  ].reduce((acc, levels) => intersection(acc)(levels), []);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 21,
      reduced: false,
    },
  ];
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
// error
test('Find the intersection of all [span]', () => {
  const expectValue = spansOverlap([
    [span1, span2, span5],
    [span1, span2],
  ]);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 21,
      reduced: false,
    },
  ];
  expect(expectValue).toEqual(tobeValue);
});

//------------------------------------------------------------------------------
test('Find the union of all [span]', () => {
  const expectValue = spansUnion([
    [span1, span2, span6],
    [span1, span2],
  ]);
  const tobeValue = [
    {
      rangeStart: 0,
      rangeLength: 21,
      reduced: false,
    },
    span6,
  ];
  expect(JSON.stringify(expectValue)).toEqual(JSON.stringify(tobeValue));
});

//------------------------------------------------------------------------------
test('Throws an error when trying to test a "reduced"', () => {
  expect(() => {
    isSubset(span1, spanFail);
  }).toThrow();
});

//------------------------------------------------------------------------------
test('Top-level: Throws an error when trying to test a "reduced"', () => {
  expect(() => {
    intersection([span1, span2])([span1, spanFail]);
  }).toThrow();
});
