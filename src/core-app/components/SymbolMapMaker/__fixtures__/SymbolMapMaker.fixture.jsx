import React from 'react';

import ConsoleLog from '../../shared/ConsoleLog';
import SymbolMapMaker from '../SymbolMapMaker';

/* eslint-disable no-console */

const css = `
  .Luci-SymbolMapMaker {
    margin-top: auto;
  }
`;

const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

const options = [
  'good',
  'bad',
  'this',
  'that',
  'the o',
  'thing',
  'stuff',
  'junk',
  'jive',
  'jelly',
  'jam',
];
const filename =
  '/shared/datafiles/24c4bb67-2357-4cc0-a9ce-6280d8359999/dropbox/4bdff8/lE0WdposqDkAAAAAABppzw/productA_Units.csv';
const headerIdx = 5;

const Component = () => {
  return (
    <div style={{ margin: '20px' }}>
      <SymbolMapMaker
        options={options}
        onClose={() => console.log('onClose: Closing')}
        filename={filename}
        headerIdx={headerIdx}
      />
      <p />
      <ConsoleLog value={options} advancedView expanded />
    </div>
  );
};

export default <Component />;
