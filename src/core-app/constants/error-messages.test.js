/**
 * @module test/constants/error-messages
 *
 * @description
 * Jest testing module for the `error-messages` module.
 *
 */

import ERRORS, { reduceErrors } from './error-messages';

// import file from './error-messages';
// const reduceErrors = file.__get__('reduceErrors');

//------------------------------------------------------------------------------
describe('reduceErrors:: { fileKey: [errors] }', () => {
  describe('the errorInteraction config informs how to reduce redundant messages', () => {
    it('errors present in all files; reduced', () => {
      const expectValue = reduceErrors({
        fileOne: [ERRORS.oneSubject, ERRORS.sameAsOtherSubjects],
        fileTwo: [ERRORS.oneSubject, ERRORS.sameAsOtherSubjects],
      });
      const tobeValue = {
        fileOne: [ERRORS.oneSubject],
        fileTwo: [ERRORS.oneSubject],
      };
      expect(expectValue).toEqual(tobeValue);
    });

    //------------------------------------------------------------------------------
    it('child present in all files are removed', () => {
      const expectValue = reduceErrors({
        fileOne: [ERRORS.sameAsOtherSubjects],
        fileTwo: [ERRORS.oneSubject, ERRORS.sameAsOtherSubjects],
      });
      const tobeValue = {
        fileOne: [],
        fileTwo: [ERRORS.oneSubject],
      };
      expect(expectValue).toEqual(tobeValue);
    });
    //------------------------------------------------------------------------------
    it('parent/dominant error present in all files; unchanged', () => {
      const expectValue = reduceErrors({
        fileOne: [ERRORS.oneSubject],
        fileTwo: [ERRORS.oneSubject, ERRORS.sameAsOtherSubjects],
      });
      const tobeValue = {
        fileOne: [ERRORS.oneSubject],
        fileTwo: [ERRORS.oneSubject],
      };
      expect(expectValue).toEqual(tobeValue);
    });
    //------------------------------------------------------------------------------
  });
});

//------------------------------------------------------------------------------
