import React from 'react';

import { useSelector } from 'react-redux';
import { getSelected } from '../../ducks/rootSelectors';

import HeaderView from '../HeaderView';
import ConsoleLog from '../shared/ConsoleLog';

HeaderView.displayName = 'FileDialog/HeaderView';

const HeaderView1 = () => {
  const filenames = useSelector(getSelected);
  return (
    <>
      <HeaderView filename={filenames[0]} displayName='test 1' />
      <ConsoleLog value={filenames} />
    </>
  );
};

const HeaderView2 = () => {
  const filenames = useSelector(getSelected);
  return (
    <>
      <HeaderView filename={filenames[1]} displayName='test 2' />
      <ConsoleLog value={filenames} />
    </>
  );
};

const HeaderView3 = () => {
  const filenames = useSelector(getSelected);
  return (
    <>
      <HeaderView filename={filenames[2]} displayName='test 3' />
      <ConsoleLog value={filenames} />
    </>
  );
};

const fixtures = {
  'long-file': (
    <div style={{ padding: '30px' }}>
      <HeaderView1 />
    </div>
  ),
  'implied-mvalue': (
    <div style={{ padding: '30px' }}>
      <HeaderView2 />
    </div>
  ),
  'wide-file': (
    <div style={{ padding: '30px' }}>
      <HeaderView3 />
    </div>
  ),
};

export default fixtures;
