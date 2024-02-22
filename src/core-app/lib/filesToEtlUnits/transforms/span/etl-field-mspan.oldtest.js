/**
 * @module lib/span/etl-field-mspan-test
 *
 * @description
 * Jest testing module for the `span/etl-field-mspan` module.
 *
 */
// import { etlField as etlSpanField } from './etl-field-mspan';
//
// //------------------------------------------------------------------------------
// /**
//  * Tests
//  */
//
// // {{{
// const levelsStart1 = [
//   ['06012019', 2300],
//   ['06012018', 2300],
//   ['06012017', 2300],
//   ['06012016', 2300],
//   // ["07012018",2300],
//   // ["05012018",2300],
//   // ["04012018",2300],
//   // ["03012018",2300],
//   // ["02012018",2300],
//   // ["01012018",2300],
//   ['12012016', 2300],
//   ['11012016', 2300],
//   ['10012016', 2300],
//   ['09012016', 2300],
//   ['08012016', 2300],
//   ['07012016', 2300],
//   ['05012016', 2300],
//   ['04012016', 2300],
//   ['03012016', 2300],
//   ['02012016', 2300],
//   ['01012016', 2300],
// ];
// const levelsStart2 = [
//   ['06012019', 2300],
//   ['06012018', 2300],
//   // ["06012017",2300],
//   ['06012016', 2300],
//   // ["07012018",2300],
//   // ["05012018",2300],
//   // ["04012018",2300],
//   // ["03012018",2300],
//   // ["02012018",2300],
//   // ["01012018",2300],
//   ['12012016', 2300],
//   ['11012016', 2300],
//   ['10012016', 2300],
//   ['09012016', 2300],
//   ['08012016', 2300],
//   ['07012016', 2300],
//   ['05012016', 2300],
//   ['04012016', 2300],
//   ['03012016', 2300],
//   ['02012016', 2300],
//   ['01012016', 2300],
// ];
// const etlStart = {
//   idx: 2,
//   name: 'Date',
//   'etl-unit': {
//     subject: 0,
//     codomain: 6,
//     mspan: 2,
//     mcomps: [3, 4, 5],
//   },
//   purpose: 'mspan',
//   levels: null,
//   time: {
//     'sample-by': 'YY-MM',
//   },
//   format: 'YY-MM',
//   'map-symbols': null,
//   'map-files': null,
//   'map-weights': null,
//   'codomain-reducer': null,
//   'null-value-expansion': null,
//   'slicing-reducer': null,
//   sources: [
//     {
//       filename: 'warfarin.csv',
//       'header-idx': 1,
//       time: {
//         reference: null,
//         interval: {
//           unit: 'months',
//           count: 1,
//         },
//         'resampling-fn': 'SUM',
//       },
//       'field-alias': 'Date',
//       format: 'MM-DD-YYYY',
//       'null-value': null,
//       levels: [...levelsStart1],
//     },
//     {
//       filename: 'brand_sales.csv',
//       'header-idx': 1,
//       time: {
//         reference: null,
//         interval: {
//           unit: 'months',
//           count: 1,
//         },
//         'resampling-fn': 'SUM',
//       },
//       'field-alias': 'Date',
//       format: 'MM-DD-YYYY',
//       'null-value': null,
//       levels: [...levelsStart2],
//     },
//   ],
// };
// const etlSpansAfter = {
//   spans: [
//     { rangeStart: 0, rangeLength: 12, reduced: false },
//     { rangeStart: 17, rangeLength: 1, reduced: false },
//     { rangeStart: 29, rangeLength: 1, reduced: false },
//   ],
//   'levels-overlap': [
//     { rangeStart: 0, rangeLength: 12, reduced: false },
//     { rangeStart: 29, rangeLength: 1, reduced: false },
//   ],
// };
// const etlTimeAfter = {
//   time: {
//     'sample-by': 'YY-MM',
//     reference: { idx: 0, value: '16-01' },
//     interval: { unit: 'months', count: 1 },
//   },
// };
//
// // }}}
//
// //------------------------------------------------------------------------------
// test('Etl-field top-level values', () => {
//   const expectValue = {
//     ...etlStart,
//     ...etlSpanField(etlStart),
//     sources: null,
//   };
//   const tobeValue = {
//     ...etlStart,
//     ...etlSpansAfter,
//     ...etlTimeAfter,
//     sources: null,
//   };
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Etl-field sources', () => {
//   const expectValue = {
//     ...etlSpanField(etlStart).sources.map((file) => file.spans),
//   };
//   const tobeValue = {
//     0: [
//       { rangeStart: 0, rangeLength: 12, reduced: false },
//       { rangeStart: 17, rangeLength: 1, reduced: false },
//       { rangeStart: 29, rangeLength: 1, reduced: false },
//     ],
//     1: [
//       { rangeStart: 0, rangeLength: 12, reduced: false },
//       { rangeStart: 29, rangeLength: 1, reduced: false },
//     ],
//   };
//   expect(expectValue).toEqual(tobeValue);
// });
