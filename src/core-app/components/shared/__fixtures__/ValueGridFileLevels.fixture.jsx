import React from 'react';

import { useSelector } from 'react-redux';

// 📖
import { getSelected, selectHeaderView } from '../../../ducks/rootSelectors';

import ValueGridFileLevels from '../ValueGridFileLevels';
import ConsoleLog from '../ConsoleLog';
import { PURPOSE_TYPES, FIELD_TYPES } from '../../../lib/sum-types';

/* eslint-disable no-shadow, react/prop-types */

const Component = ({ hideConsole }) => {
  const filename = useSelector((state) => getSelected(state)).find((filename) =>
    filename.includes('sava'),
  );

  const qualityField = useSelector((state) =>
    selectHeaderView(state, filename),
  ).fields.find(
    (field) =>
      field.purpose === PURPOSE_TYPES.QUALITY &&
      field.enabled &&
      field.nlevels > 100,
  );

  return (
    <div style={{ margin: '30px' }}>
      <ConsoleLog value={qualityField} advancedView collapsed={hideConsole} />
      <ValueGridFileLevels
        getValue={(prop) => qualityField[prop]}
        fieldType={FIELD_TYPES.FILE}
      />
    </div>
  );
};

export default Component;
