import { testOnlyExports } from './validations';

const { hasRelatedComps } = testOnlyExports;

const equal = {
  unit1: {
    type: 'mvalue',
    subject: 'npi',
    mcomps: ['product'],
    mspan: 'date',
    codomain: 'nrx',
  },
  unit2: {
    type: 'mvalue',
    subject: 'npi',
    mcomps: ['product'],
    mspan: 'date',
    codomain: 'nrx',
  },
};

describe('valid-field-alias', () => {
  //------------------------------------------------------------------------------
  test('Compares etlUnits - related [mcomp],  true', () => {
    const expectValue = hasRelatedComps(equal.unit1, equal.unit2);
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });

  //------------------------------------------------------------------------------
  test('Compares etlUnits - different codomain values returns true', () => {
    const similar = {
      ...equal,
      unit2: {
        ...equal.unit2,
        codomain: 'trx',
      },
    };

    const expectValue = hasRelatedComps(similar.unit1, similar.unit2);
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });

  //------------------------------------------------------------------------------
  test('Compares etlUnits - different [mcomp] values returns false', () => {
    const notRelated = {
      ...equal,
      unit2: {
        ...equal.unit2,
        mcomps: ['not-product'],
      },
    };

    const expectValue = hasRelatedComps(notRelated.unit1, notRelated.unit2);
    const tobeValue = false;
    expect(expectValue).toEqual(tobeValue);
  });

  //------------------------------------------------------------------------------
  test('Compares etlUnits - [mcomp] values where one is the subset of the other returns true', () => {
    const notRelated = {
      ...equal,
      unit2: {
        ...equal.unit2,
        mcomps: ['not-product', 'product'],
      },
    };

    const expectValue = hasRelatedComps(notRelated.unit1, notRelated.unit2);
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });

  //------------------------------------------------------------------------------
  test('Compares etlUnits - returns true when compared to undefined', () => {
    const expectValue = hasRelatedComps(equal.unit1, undefined);
    const tobeValue = true;
    expect(expectValue).toEqual(tobeValue);
  });

  //------------------------------------------------------------------------------
  test('Will generate a true (pass) when the first value is undefined ?🦀?', () => {
    expect(() => {
      hasRelatedComps(undefined, equal.unit2);
    }).toBe(true);
  });
});
