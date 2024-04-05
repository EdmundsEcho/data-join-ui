/**
 * Try SlidingPopper with the SymbolMapMaker component.
 */

import React from 'react';

import ConsoleLog from '../../core-app/components/shared/ConsoleLog';
import { ScrubToolTip } from '../../core-app/components/shared/ValueGridFileLevels';
import { SymbolMapMaker } from '../../core-app/components/SymbolMapMaker';
import SlidingPopper from '../SlidingPopper';

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
    <div style={{ margin: '20px', width: '300px' }}>
      <div
        className='stage-container'
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          width: '500px',
          height: '600px',
          border: '1px solid white',
        }}
      >
        <SlidingPopper
          className='Luci-SymbolMapMaker-dialog'
          horizontal='left'
          vertical='up'
          title='Levels Scrub Configuration'
          slots={{
            trigger: ScrubToolTip,
            content: SymbolMapMaker, // must have onDone
          }}
          slotProps={{
            content: {
              options,
              filename,
              headerIdx,
              onClose: () => console.log('onClose: Closing'),
            },
          }}
        />
      </div>
      <p />
      <ConsoleLog value={options} advancedView expanded />
    </div>
  );
};

export default <Component />;
