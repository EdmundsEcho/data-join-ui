// import React from 'react';

import mergeFixtures from '../../../utils/mergeFixtures';

import data from '../../../datasets/store-headerviews_v2.json';
import * as selectors from '../../../ducks/rootSelectors';

import TextField from '../TextField';

const field = Object.values(selectors.getHeaderViews(data))[0].fields[3];
TextField.displayName = 'Augmented TextField';

const getValue = (name) => {
  return field[name];
};

const saveAlias = () => {};
const saveChange = () => {};

const stateId = `${getValue('filename')}|${getValue('header-idx')}`;

const defaultFixture = {
  Component: TextField,
  props: {
    name: 'format',
    props: {
      key: `${stateId}|format`,
      stateId: `${stateId}|format`,
      name: 'format',
      disabled: getValue('enabled'),
      margin: 'dense',
      value: getValue('format'),
      saveChange,
    },
  },
};

const fixtures = [
  {
    name: 'field-alias',
    props: {
      key: `${stateId}|field-alias`,
      stateId: `${stateId}|field-alias`,
      name: 'field-alias',
      value:
        getValue('header-name') === getValue('field-alias')
          ? ''
          : getValue('field-alias'),
      saveChange: saveAlias,
    },
  },
  {
    name: 'format',
    props: {
      key: `${stateId}|format`,
      stateId: `${stateId}|format`,
      name: 'format',
      value: getValue('format'),
      saveChange,
    },
  },
];

export default mergeFixtures(defaultFixture, fixtures);
