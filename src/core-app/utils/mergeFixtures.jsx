import React from 'react';
import { deepRightMerge } from './common';

/**
 * Helper function that takes a default fixture object and an array of fixture objects.
 * Each fixture object is mapped and merged into the defaultFixture overriding any keys
 * that are found in both.
 * @module utils/mergeFixtures
 * @param {object} defaultFixture
 * @param {array} fixtures List of fixtures to be deep merged with default fixture
 * @returns {array} mergedFixtures Array of merged fixtures
 *
 * @example
 * // mycomponent.fixture.js
 * import mergeFixtures from '../../utils/mergeFixtures';
 *
 * const defaultFixture = {
 *   component: MyComponent,
 *   props: {
 *   }
 * };
 *
 * const fixtures = [
 *   {
 *     props: {
 *       type: 'measurement'
 *     }
 *   },
 *   {
 *     props: {
 *       type: 'quality'
 *     }
 *   },
 * ];
 *
 * export default mergeFixtures (defaultFixture, fixtures);
 */

const mergeFixtures = (defaultFixture = undefined, fixtures = undefined) => {
  if (typeof defaultFixture === 'undefined') return null;
  if (typeof fixtures === 'undefined') return null;

  /* eslint-disable react/jsx-props-no-spreading */
  return fixtures
    .map(curry(deepRightMerge)(defaultFixture))
    .reduce((acc, spec) => {
      acc[spec.name] = <spec.Component {...spec.props} />;
      return acc;
    }, {});
};

function curry(fn) {
  return (a) => (b) => fn(a, b);
}

/*
export default {
  primary: (
    <TextField
      key={`${stateId}|format`}
      stateId={`${stateId}|format`}
      name='format'
      disabled={getValue('enabled')}
      margin='dense'
      value={getValue('format')}
      saveChange
    />
  ),
}; */

export default mergeFixtures;
