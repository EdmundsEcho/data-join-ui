import { transformLevelsToValues } from '../LevelEditor';

describe('LevelEditor', () => {
  describe('Transformation functions', () => {
    describe('transformLevelsToValues', () => {
      it('should return an object of all levels with null values by default', () => {
        const levelKeys = ['surgeon', 'surjen'];
        const mapSymbols = { arrows: {} };
        const expected = { surgeon: null, surjen: null };
        expect(transformLevelsToValues(levelKeys, mapSymbols)).toEqual(
          expected,
        );
      });

      it('should return an object with values prefilled based on arrows object', () => {
        const levelKeys = ['surgeon', 'surjen'];
        const arrows = { surjen: 'surgeon' };
        const expected = { surgeon: null, surjen: 'surgeon' };
        expect(transformLevelsToValues(levelKeys, arrows)).toEqual(expected);
      });
    });
  });
});
