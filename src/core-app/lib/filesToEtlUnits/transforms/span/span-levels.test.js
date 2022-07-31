/**
 * @module test/lib/filesToEtlUnits/transforms/span
 *
 * @description
 * Jest testing module for the `span/index.js` module.
 *
 */
//
// import {
//   _mkSpansFromDates,
//   fromDatesToSpans, // :: field -> field
//   // may be deprecated, we use field -> prop
// } from '../span/source-spans';
//
// //------------------------------------------------------------------------------
// /**
//  * Test 01
//  */
// const dateField01 = [
//   '05012017',
//   '04012017',
//   '02012017',
//   '12012016',
//   '06012017',
// ];
//
// test('Dates that generate 3 span values', () => {
//   const expectValue = _mkSpansFromDates({
//     format: 'MM-DD-YYYY',
//     interval: { unit: 'months', count: 1 },
//   })(dateField01);
//
//   const tobeValue = {
//     reference: {
//       idx: 0,
//       value: '12-01-2016',
//     },
//     'levels-mspan': [
//       {
//         rangeStart: 0,
//         rangeLength: 1,
//         reduced: false,
//       },
//       {
//         rangeStart: 2,
//         rangeLength: 1,
//         reduced: false,
//       },
//       {
//         rangeStart: 4,
//         rangeLength: 3,
//         reduced: false,
//       },
//     ],
//   };
//
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// /**
//  * Test 02
//  */
// const dateField02 = ['052017', '042017', '022017', '012017', '032017'];
//
// test('Dates that generates a single span', () => {
//   const expectValue = _mkSpansFromDates({
//     format: 'MM-YYYY',
//     interval: { unit: 'months', count: 1 },
//   })(dateField02);
//
//   const tobeValue = {
//     reference: {
//       idx: 0,
//       value: '01-2017',
//     },
//     'levels-mspan': [
//       {
//         rangeStart: 0,
//         rangeLength: 5,
//         reduced: false,
//       },
//     ],
//   };
//
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// /**
//  * Test 03
//  */
// const dateField03 = ['052017', '042017', '022017', '122016', '062017'];
//
// test('Dates that generate 3 span values using a different config', () => {
//   const expectValue = _mkSpansFromDates({
//     format: 'MM-YYYY',
//     interval: { unit: 'months', count: 1 },
//   })(dateField03);
//
//   const tobeValue = {
//     reference: {
//       idx: 0,
//       value: '12-2016',
//     },
//     'levels-mspan': [
//       {
//         rangeStart: 0,
//         rangeLength: 1,
//         reduced: false,
//       },
//       {
//         rangeStart: 2,
//         rangeLength: 1,
//         reduced: false,
//       },
//       {
//         rangeStart: 4,
//         rangeLength: 3,
//         reduced: false,
//       },
//     ],
//   };
//
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// /**
//  * Test 04
//  */
// const dateField04 = ['052017'];
//
// test('A single date that generates a single span', () => {
//   const expectValue = _mkSpansFromDates({
//     format: 'MM-YYYY',
//     interval: { unit: 'months', count: 1 },
//   })(dateField04);
//
//   const tobeValue = {
//     reference: {
//       idx: 0,
//       value: '05-2017',
//     },
//     'levels-mspan': [
//       {
//         rangeStart: 0,
//         rangeLength: 1,
//         reduced: false,
//       },
//     ],
//   };
//
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// /**
//  * Test 05
//  */
// const levelsBefore = [
//   ['05012017', 2300],
//   ['04012017', 2300],
//   ['02012017', 2300],
//   ['12012016', 2300],
//   ['06012017', 2300],
// ];
// const timeBefore = {
//   interval: {
//     unit: 'months',
//     count: 1,
//   },
//   'resampling-fn': null,
// };
// const sourceElementBefore = {
//   filename: 'warfarin.csv',
//   'header-idx': 1,
//   time: { ...timeBefore },
//   'field-alias': 'Date',
//   format: 'MM-DD-YYYY',
//   'null-value': null,
//   levels: [...levelsBefore],
// };
//
// test('Update a source-element', () => {
//   const expectValue = fromDatesToSpans(sourceElementBefore);
//   const tobeValue = {
//     ...sourceElementBefore,
//     time: {
//       reference: {
//         idx: 0,
//         value: '12-01-2016',
//       },
//       interval: {
//         unit: 'months',
//         count: 1,
//       },
//       'resampling-fn': null,
//     },
//     'levels-mspan': [
//       {
//         rangeStart: 0,
//         rangeLength: 1,
//         reduced: false,
//       },
//       {
//         rangeStart: 2,
//         rangeLength: 1,
//         reduced: false,
//       },
//       {
//         rangeStart: 4,
//         rangeLength: 3,
//         reduced: false,
//       },
//     ],
//   };
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
