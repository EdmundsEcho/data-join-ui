/**
 * @description
 * Jest testing module for the `header-aliases` module.
 *
 * ⬜ the function have been updated and moved.
 *
 */

// import { validHvAlias, validHvs } from './valid-headerviews';

/**
 * test data
 */
// import {
//   headerViews,
//   headerViewsTwo,
//   headerViewsThree,
//   headerViewsNoSpan,
//   headerViewsNoSpanWmvalue,
//   headerViewsNoSpanWmvalueS,
//   headerViewsWinSeries,
// } from '../filesToEtlUnits-test-data';
//
// //------------------------------------------------------------------------------
// test('Validate Subject alias - Valid when name matches other subject field names', () => {
//   const [field] = headerViews['targetList.csv'].fields.filter(
//     (f) => f['field-alias'] === 'npi',
//   );
//
//   const expectValue = validHvAlias(
//     field, // field
//     headerViews,
//   ); // headerViews
//   const tobeValue = headerViews['targetList.csv'];
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Validate Subject alias - Invalid when name does not match other subject field names', () => {
//   const [field] = headerViews['targetList.csv'].fields.filter(
//     (f) => f['field-alias'] === 'npi',
//   );
//
//   const failField = {
//     ...field,
//     'field-alias': 'not-npi',
//   };
//
//   const otherFields = headerViews['targetList.csv'].fields.filter(
//     (f) => f['field-alias'] !== 'npi',
//   );
//
//   const failHeaderView = {
//     ...headerViews['targetList.csv'],
//     fields: [...otherFields, failField],
//   };
//
//   const failHeaderViews = {
//     ...headerViews,
//     targetList: failHeaderView,
//   };
//
//   const expectValue = validHvAlias(
//     failField, // field
//     failHeaderViews,
//   ); // headerViews
//   const tobeValue = null;
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Validate Quality alias - Valid when name is unique in the header', () => {
//   const [field] = headerViews['targetList.csv'].fields.filter(
//     (f) => f['field-alias'] === 'specialty',
//   );
//
//   const expectValue = validHvAlias(
//     field, // field
//     headerViews,
//   ); // headerViews
//   const tobeValue = headerViews['targetList.csv'];
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Validate Quality alias - Invalid when name is not unique in the header', () => {
//   const [field] = headerViews['targetList.csv'].fields.filter(
//     (f) => f['field-alias'] === 'specialty',
//   );
//
//   const failField = {
//     ...field,
//     'field-alias': 'npi',
//   };
//
//   const otherFields = headerViews['targetList.csv'].fields.filter(
//     (f) => f['field-alias'] !== 'specialty',
//   );
//
//   const failHeaderView = {
//     ...headerViews['targetList.csv'],
//     fields: [...otherFields, failField],
//   };
//
//   const failHeaderViews = {
//     ...headerViews,
//     'targetList.csv': failHeaderView,
//   };
//
//   const expectValue = validHvAlias(
//     failField, // field
//     failHeaderViews,
//   ); // headerViews
//   const tobeValue = null;
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Validate mvalue alias - Valid when unique or shared with related units', () => {
//   const [field] = headerViews['warfarin.csv'].fields.filter(
//     (f) => f['field-alias'] === 'nrx',
//   );
//
//   const expectValue = validHvAlias(
//     field, // field
//     headerViews,
//   ); // headerViews
//   const tobeValue = headerViews['warfarin.csv'];
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test(`Validate mspan alias - Must be the only mspan in a file and unique
//       among unrelated units`, () => {
//   const [field] = headerViews['warfarin.csv'].fields.filter(
//     (f) => f['field-alias'] === 'date',
//   );
//
//   const expectValue = validHvAlias(
//     field, // field
//     headerViews,
//   ); // headerViews
//   const tobeValue = headerViews['warfarin.csv'];
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test(`Validate mspan alias - Must be the only mspan in a file and unique
//       among unrelated units`, () => {
//   const [field] = headerViewsTwo['warfarin.csv'].fields.filter(
//     (f) => f['field-alias'] === 'date2',
//   );
//
//   const expectValue = validHvAlias(
//     field, // field
//     headerViewsTwo,
//   ); // headerViews
//   const tobeValue = null;
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test(`Validate mcomp alias - [mcomp] must be relatable if they share a codomain.
//       Notes:
//       1. The mspan value will be set to that of the current relatable units.
//       2. This hv has > 1 mvalues and thus will have a config prop attached`, () => {
//   const [fieldWithNewAlias] = headerViewsTwo['brand_sales.csv'].fields.filter(
//     (f) => f['field-alias'] === 'payer',
//   );
//
//   const expectValue = validHvAlias(
//     fieldWithNewAlias, // field
//     headerViewsTwo,
//   ); // headerViews
//
//   const hv = headerViewsTwo['brand_sales.csv'];
//
//   const { fields } = hv;
//
//   const tobeValue = {
//     ...hv,
//     fields: fields.map((field) => ({
//       ...field,
//       inSeries: field.purpose === 'mvalue',
//     })),
//     wideToLongFields: expect.any(Function),
//   };
//
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Validate subject alias - When the current units = {}', () => {
//   const [field] = headerViewsTwo['brand_sales.csv'].fields.filter(
//     (f) => f['field-alias'] === 'npi',
//   );
//
//   const expectValue = validHvAlias(field, {
//     'brand_sales.csv': headerViewsTwo['brand_sales.csv'],
//   });
//   const tobeValue = {
//     ...headerViewsTwo['brand_sales.csv'],
//     fields: headerViewsTwo['brand_sales.csv'].fields.map((field) => ({
//       ...field,
//       inSeries: field.purpose === 'mvalue',
//     })),
//     wideToLongFieldsConfig: expect.any(Function),
//   };
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Validate quality alias - When the current units = {}', () => {
//   const [field] = headerViewsTwo['brand_sales.csv'].fields.filter(
//     (f) => f['field-alias'] === 'specialty',
//   );
//
//   const expectValue = validHvAlias(field, {
//     'brand_sales.csv': headerViewsTwo['brand_sales.csv'],
//   });
//   const tobeValue = {
//     ...headerViewsTwo['brand_sales.csv'],
//     fields: headerViewsTwo['brand_sales.csv'].fields.map((field) => ({
//       ...field,
//       inSeries: field.purpose === 'mvalue',
//     })),
//     wideToLongFieldsConfig: expect.any(Function),
//   };
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Validate mcomp alias - When the current units = {}', () => {
//   const [field] = headerViewsTwo['brand_sales.csv'].fields.filter(
//     (f) => f['field-alias'] === 'payer',
//   );
//
//   const expectValue = validHvAlias(field, {
//     'brand_sales.csv': headerViewsTwo['brand_sales.csv'],
//   });
//   const tobeValue = {
//     ...headerViewsTwo['brand_sales.csv'],
//     fields: headerViewsTwo['brand_sales.csv'].fields.map((field) => ({
//       ...field,
//       inSeries: field.purpose === 'mvalue',
//     })),
//     wideToLongFieldsConfig: expect.any(Function),
//   };
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Validate mspan alias - When the current units = {}', () => {
//   const [field] = headerViewsTwo['brand_sales.csv'].fields.filter(
//     (f) => f['field-alias'] === 'date',
//   );
//
//   const expectValue = validHvAlias(field, {
//     'brand_sales.csv': headerViewsTwo['brand_sales.csv'],
//   });
//   const tobeValue = {
//     ...headerViewsTwo['brand_sales.csv'],
//     fields: headerViewsTwo['brand_sales.csv'].fields.map((field) => ({
//       ...field,
//       inSeries: field.purpose === 'mvalue',
//     })),
//     wideToLongFieldsConfig: expect.any(Function),
//   };
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Validate mvalue alias - When the current units = {}', () => {
//   const [field] = headerViewsTwo['brand_sales.csv'].fields.filter(
//     (f) => f['field-alias'] === 'nrx',
//   );
//
//   const expectValue = validHvAlias(field, {
//     'brand_sales.csv': headerViewsTwo['brand_sales.csv'],
//   });
//   const tobeValue = {
//     ...headerViewsTwo['brand_sales.csv'],
//     fields: headerViewsTwo['brand_sales.csv'].fields.map((field) => ({
//       ...field,
//       inSeries: field.purpose === 'mvalue',
//     })),
//     wideToLongFieldsConfig: expect.any(Function),
//   };
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// test('Adjust headerView with an mspan but no mvalue', () => {
//   const [field] = headerViewsThree['targetList.csv'].fields.filter(
//     (f) => f['field-alias'] === 'date-reach',
//   );
//
//   const expectValue = validHvAlias(field, {
//     'targetList.csv': headerViewsThree['targetList.csv'],
//   });
//   const tobeValue = {
//     ...headerViewsThree['targetList.csv'],
//     'implied-mvalue': expect.anything(),
//   };
//   expect(expectValue).toEqual(tobeValue);
// });
//
// //------------------------------------------------------------------------------
// const returns = validHvs(headerViewsWinSeries);
// // console.log("PREVIEW", returns)
//
// test('Valid hvs: Returns 3 file/hv objects', () => {
//   // console.log(returns)
//   const expectValue = Object.keys(returns).length;
//   const tobeValue = 3;
//   expect(expectValue).toEqual(tobeValue);
// });
//
// test('Valid hvs: Returns 3 null error properties', () => {
//   const expectValue = Object.values(returns).reduce(
//     (acc, hv) => [...acc, hv.error],
//     [],
//   );
//   const tobeValue = [null, null, null];
//   expect(expectValue).toEqual(tobeValue);
// });
//
// test('Valid hvs: File with no mspan', () => {
//   const expectValue = Object.values(validHvs(headerViewsNoSpan)).reduce(
//     (acc, hv) => [...acc, hv.error],
//     [],
//   );
//   const tobeValue = [null];
//   expect(expectValue).toEqual(tobeValue);
// });
//
// test('Valid hvs: File with no mspan with mvalue', () => {
//   const expectValue = Object.values(validHvs(headerViewsNoSpanWmvalue)).reduce(
//     (acc, hv) => [...acc, hv.error],
//     [],
//   );
//   const tobeValue = [null];
//   expect(expectValue).toEqual(tobeValue);
// });
//
// test('Valid hvs: Mix, file with mspan with mvalue, mspan', () => {
//   const expectValue = Object.values(validHvs(headerViewsNoSpanWmvalueS)).reduce(
//     (acc, hv) => [...acc, hv.error],
//     [],
//   );
//
//   console.log(JSON.stringify(headerViewsNoSpanWmvalueS, null, 2));
//
//   const tobeValue = [null, null];
//   expect(expectValue).toEqual(tobeValue);
// });
