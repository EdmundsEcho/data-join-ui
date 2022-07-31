/**
 * @module test/lib/filesToEtlUnits/create-etl-field
 *
 * @description
 * Jest testing module for the `create-etl-field` module.
 *
 */

// import * as fn from './create-etl-field';
// import { tryRebuildImpliedField } from './create-etl-field';

// 📖 data for the original tests
// import { etlObject } from './create-etl-field.data';
// import etlObject2 from '../../datasets/etlObject';

// const reduceErrors = file.__get__('reduceErrors');

// const impliedField = {
/* WIP */
// };

/* tryRebuildImpliedField
export const tryRebuildImpliedField = (
  impliedField,
  etlFields,
  derivedFieldIdx, // used to increment the base idx = max(fields)
) */

// //------------------------------------------------------------------------------
// describe('tryRebuildImpliedField:: { fileKey: [errors] }', () => {
//   describe('...', () => {
//     it('...', () => {
//       const expectValue = tryRebuildImpliedField(
//         impliedField,
//         etlObject2.etlFields,
//         3,
//       );
//       const tobeValue = {
//         // WIP
//       };
//       expect(expectValue).toEqual(tobeValue);
//     });
//
//     //------------------------------------------------------------------------------
//     it('child present in all files are removed', () => {
//       const expectValue = reduceErrors({
//         fileOne: [ERRORS.sameAsOtherSubjects],
//         fileTwo: [ERRORS.oneSubject, ERRORS.sameAsOtherSubjects],
//       });
//       const tobeValue = {
//         fileOne: [],
//         fileTwo: [ERRORS.oneSubject],
//       };
//       expect(expectValue).toEqual(tobeValue);
//     });
//     //------------------------------------------------------------------------------
//     it('parent/dominant error present in all files; unchanged', () => {
//       const expectValue = reduceErrors({
//         fileOne: [ERRORS.oneSubject],
//         fileTwo: [ERRORS.oneSubject, ERRORS.sameAsOtherSubjects],
//       });
//       const tobeValue = {
//         fileOne: [ERRORS.oneSubject],
//         fileTwo: [ERRORS.oneSubject],
//       };
//       expect(expectValue).toEqual(tobeValue);
//     });
//     //------------------------------------------------------------------------------
//   });
// });
//     */
//
// //------------------------------------------------------------------------------
//
// describe('create-etlf-field', () => {
//   /*
//   describe('createEtlField()', () => {
//     const hvs = {
//       Existed: {
//         idx: 1,
//         name: 'Existed',
//       },
//     };
//
//     // Before we only had the Existed key in our hvs
//     expect(hvs.Existed.idx).toEqual(1);
//
//     it('should create a quality etl field', () => {
//       const field = {
//         name: 'New Field',
//         purpose: 'quality',
//         'null-value-expansion': '1',
//         levels: [['myfile', 110]],
//         'map-files': {
//           arrows: {
//             '/my/file': 'myfile',
//           },
//         },
//       };
//
//       const result = fn.createEtlField(hvs, field);
//       // It should use the next available idx
//       expect(result.idx).toEqual(2);
//       expect(result.name).toEqual(field.name);
//       expect(result.enabled).toEqual(true);
//       expect(result.purpose).toEqual(field.purpose);
//     });
//     it('should create a mcomp etl field', () => {
//       const field = {
//         name: 'New Field',
//         purpose: 'mcomp',
//         'null-value-expansion': '1',
//         levels: [['myfile', 110]],
//         'map-files': {
//           arrows: {
//             '/my/file': 'myfile',
//           },
//         },
//       };
//
//       const result = fn.createEtlField(hvs, field);
//       // It should use the next available idx
//       expect(result.idx).toEqual(2);
//       expect(result.name).toEqual(field.name);
//       expect(result.enabled).toEqual(true);
//       expect(result.purpose).toEqual(field.purpose);
//     });
//   });
//   describe('createEtlUnit', () => {
//     describe('adding an mcomp field', () => {
//       it('should append to etlUnit.mvalue.mcomps', () => {
//         const result = fn.createEtlUnit(etlObject, newCompField);
//
//         // Should have the name of the new mcomp appended to the value mcomps array
//         expect(result.mval.mcomps).toEqual(['ExistingComp', newCompField.name]);
//         expect(result.mval.subject).toEqual('sub');
//         expect(result.mval.mspan).toEqual('span');
//       });
//     });
//     describe('adding a new quality field', () => {
//       it('should return a new quality field', () => {
//         const result = fn.createEtlUnit(etlObject, newQualField);
//
//         expect(result.newQuality.type).toEqual('quality');
//         expect(result.newQuality.codomain).toEqual(newQualField.name);
//         expect(result.newQuality.subject).toEqual('sub');
//       });
//     });
//   });
// });
