import FileRow from '../FileRowItem';
import mergeFixtures from '../../../../utils/mergeFixtures';

FileRow.displayName = 'FileDialog/Row';

const defaultFixture = {
  Component: FileRow,
};

const fixtures = [
  {
    name: 'Single Row',
    props: {
      display_name: 'My File',
      path: '/this/is/a/path',
      size: 1230,
    },
  },
];

export default mergeFixtures(defaultFixture, fixtures);
