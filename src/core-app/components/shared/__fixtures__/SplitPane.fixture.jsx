// import React from 'react';

import mergeFixtures from '../../../utils/mergeFixtures';

import SplitPane from '../SplitPane';

const defaultFixture = {
  Component: SplitPane,
  props: {
    name: 'template',
    props: {},
  },
};

const fixtures = [
  {
    name: 'default',
    props: {},
  },
  {
    name: 'initial left width: 240',
    props: { leftSideWidth: 240 },
  },
];

export default mergeFixtures(defaultFixture, fixtures);
