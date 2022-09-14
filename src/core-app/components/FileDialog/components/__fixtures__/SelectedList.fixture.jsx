import SelectedListOfFiles from '../ListOfFiles';
import mergeFixtures from '../../../../utils/mergeFixtures';

SelectedListOfFiles.displayName = 'FileDialog/SelectedListOfFiles';

const defaultFixture = {
  Component: SelectedListOfFiles,
  mui: true,
};

const fixtures = [
  {
    name: 'No Cards',
    props: {
      files: [],
    },
  },
  {
    name: 'With Cards',
    props: {
      files: [
        {
          display_name: 'Card Name',
          path: '/this/is/a/path',
          size: 1230,
        },
        {
          display_name: 'Card Name 2',
          path: '/this/is/a/path',
          size: 3230,
        },
      ],
    },
  },
];

export default mergeFixtures(defaultFixture, fixtures);
