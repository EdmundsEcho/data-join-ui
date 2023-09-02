// src/cosmos/tree-seed-values.js

/**
 *
 * Generally, use this directory to host:
 *
 *    Utilities for data -> cosmos data
 *
 * Use this module to host the different ways to pull tree-data from the
 * cosmos mock-store.
 *
 * Broadly, anything related to cosmos data processing.
 *
 * @module cosmos/tree-seed-values
 *
 */

/**
 * Returns object of options keyed by the display name.
 * The value is the prop settings for the ValueGridPagination.fixture.
 *
 * @function
 * @param {Object} tree
 * @return {Object<string, Object>} options
 */
export const getTreeValuesOptions = (tree) => {
  const nodes = Object.values(tree)
    .filter((node) => node?.height === 4)
    .filter(({ data }) => data.type.includes('etlUnit'))
    .flatMap(({ data }) => {
      return data.type === 'etlUnit::quality'
        ? [{ identifier: data?.value?.qualityName }]
        : Object.values(data?.value?.values)
            .filter(({ tag }) => tag !== 'spanValues')
            .map(({ componentName }) => ({
              identifier: componentName,
              measurementType: data?.value?.measurementType,
            })) ?? [];
    })
    .reduce((acc, option) => {
      acc[option.identifier] = option;
      return acc;
    }, {});
  return nodes;
};
