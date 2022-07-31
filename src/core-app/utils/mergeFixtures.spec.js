import mergeFixtures from './mergeFixtures';

describe('mergeFixtures', () => {
  describe('using an empty fixture array', () => {
    it('should return an empty array', () => {
      const defaultFixture = {
        props: { a: 2 },
      };

      const fixtures = [];

      expect(mergeFixtures(defaultFixture, fixtures)).toEqual([]);
    });
  });

  describe('using only defaultFixture data', () => {
    it('should return an array of n defaultFixtures', () => {
      const defaultFixture = {
        props: { a: 2 },
      };

      const fixtures = [{}, {}];

      expect(mergeFixtures(defaultFixture, fixtures)).toEqual([
        defaultFixture,
        defaultFixture,
      ]);
    });
  });

  describe('overriding defaultFixture data', () => {
    it('should override data', () => {
      const defaultFixture1 = {
        root: 'level',
      };

      const defaultFixture2 = {
        nested: {
          obj: 'original',
        },
      };

      const fixtures1 = [{ root: 'changed' }];
      const fixtures2 = [{ nested: { obj: 'changed' } }];

      expect(mergeFixtures(defaultFixture1, fixtures1)).toEqual([
        { root: 'changed' },
      ]);
      expect(mergeFixtures(defaultFixture2, fixtures2)).toEqual([
        { nested: { obj: 'changed' } },
      ]);
    });

    it('should not lose keys not being overridden', () => {
      const defaultFixture1 = {
        root: 'level',
        unchanged: 'value',
      };

      const fixtures1 = [{ root: 'changed' }];

      expect(mergeFixtures(defaultFixture1, fixtures1)).toEqual([
        { root: 'changed', unchanged: 'value' },
      ]);
    });
  });
});
