import * as helpers from './headerview-helpers';

/* eslint-disable no-console */

describe.only('lib/filesToEtlUnits/headerview-helpers', () => {
  describe('transformLevels', () => {
    it('should not fail if no arrows given', () => {
      const levels = [['111', 3]];

      expect(helpers.transformLevels(levels)).toEqual(levels);
      expect(helpers.transformLevels(levels, null)).toEqual(levels);
    });

    it('should return a new levels list with counts summed based on arrows', () => {
      const levels = [
        ['123', 3],
        ['111', 1],
        ['222', 3],
      ];
      const arrows = {
        111: '222',
      };

      const expected = [
        ['123', 3],
        ['222', 4],
      ];

      expect(helpers.transformLevels(levels, arrows)).toEqual(expected);
    });

    it('should handle multiple mapped integer values with the same codomain', () => {
      const levels = [
        ['123', 3],
        ['111', 1],
        ['222', 3],
        ['333', 6],
      ];
      const arrows = {
        111: 222,
        333: 222,
      };

      const expected = [
        ['123', 3],
        ['222', 10],
      ];

      expect(helpers.transformLevels(levels, arrows)).toEqual(expected);
    });

    it('should handle multiple mapped values with the same codomain', () => {
      const levels = [
        ['123', 3],
        ['111', 1],
        ['222', 3],
        ['333', 6],
      ];
      const arrows = {
        111: '222',
        333: '222',
      };

      const expected = [
        ['123', 3],
        ['222', 10],
      ];

      expect(helpers.transformLevels(levels, arrows)).toEqual(expected);
    });

    it('should create new domain values if they did not exist before', () => {
      const levels = [
        ['AL', 3],
        ['TN', 1],
        ['UT', 3],
        ['NY', 6],
        ['NJ', 2],
      ];

      const arrows = {
        NY: 'New Place',
        NJ: 'New Place',
      };

      const expected = [
        ['AL', 3],
        ['New Place', 8],
        ['TN', 1],
        ['UT', 3],
      ];

      expect(helpers.transformLevels(levels, arrows)).toEqual(expected);
    });

    it('should not create level if no entry found for arrows', () => {
      const levels = [
        ['AL', 3],
        ['TN', 1],
        ['UT', 3],
        ['NY', 6],
        ['NJ', 2],
      ];

      const arrows = {
        YYY: 'I do not exist',
        XXX: 'Neither do I',
      };

      const expected = [
        ['AL', 3],
        ['NJ', 2],
        ['NY', 6],
        ['TN', 1],
        ['UT', 3],
      ];

      expect(helpers.transformLevels(levels, arrows)).toEqual(expected);
    });
  });
});
