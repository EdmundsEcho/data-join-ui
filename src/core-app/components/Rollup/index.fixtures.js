//import React from 'react';
import Rollup from './index';
import mergeFixtures from '../../utils/mergeFixtures';

Rollup.displayName = 'RollupDialog/Component';

//const valueProps = [
//  'medicare',
//  'medicaid',
//  'private'
//];

const groups = [
  'Government Aid',
  'Private',
  'Another 1',
  'Another 2',
  'Another 3',
  'Another 4',
  'Another 5',
];

const mkValues = (count) => {
  let values = {};
  for (var i = 0; i < count; i++) {
    values['Value ' + (i + 1)] = null;
  }
  return values;
};

const mkGroups = (count) => {
  let groups = [];
  for (var i = 0; i < count; i++) {
    groups.push('Group ' + (i + 1));
  }
  return groups;
};

const valuesWithGroups = {
  Payer: groups[0],
  Another: groups[1],
  Unfilled: groups[3],
};

const valuesWithSomeGroups = {
  Payer: null,
  Another: groups[1],
  Unfilled: null,
};

const values = {
  Payer: null,
  Another: null,
  Unfilled: null,
};

const defaultFixture = {
  component: Rollup,
  mui: true,
};

const fixtures = [
  {
    name: 'With Rollup Groups',
    props: {
      debug: true,
      values: mkValues(10),
      groups,
    },
  },
  {
    name: 'Without Rollup Groups',
    props: {
      debug: true,
      values: values,
    },
  },
  {
    name: 'Pre-Defined Associations',
    props: {
      debug: true,
      values: valuesWithGroups,
    },
  },
  {
    name: 'Allow Empty',
    props: {
      debug: true,
      groups,
      values: valuesWithSomeGroups,
      allowEmpty: true,
    },
  },
  {
    name: 'A lot of Groups',
    props: {
      debug: true,
      groups: mkGroups(100),
      values: values,
    },
  },
  {
    name: 'Custom Domain & Codomain',
    props: {
      debug: true,
      values: values,
      codomainDescription: 'Custom Domain',
      domainDescription: 'Custom Codomain',
    },
  },
];

export default mergeFixtures(defaultFixture, fixtures);
