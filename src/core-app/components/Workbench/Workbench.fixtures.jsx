import mergeFixtures from '../../utils/mergeFixtures';
import Container from './Workbench';
import obsetl from '../../datasets/workbench/obsetl-response';

Container.displayName = 'Workbench2/Container';

const defaultFixture = {
  component: Container,
  mui: true,
  beautifulDnD: true,
  reduxState: {},
};

const fixtures = [
  {
    name: 'Default',
    props: {
      obsetl,
    },
  },
];

export default mergeFixtures(defaultFixture, fixtures);
