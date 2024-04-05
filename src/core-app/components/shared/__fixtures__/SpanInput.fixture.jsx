import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useValue } from 'react-cosmos/client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ConsoleLog from '../ConsoleLog';

import ReduxMock from '../../../cosmos.mock-store';
import initialState from '../../../datasets/store_v4.json';

// 📖
import {
  selectSpanValueFromNode,
  selectEtlField,
  selectNodeState,
  getEtlFields,
} from '../../../ducks/rootSelectors';
import { PURPOSE_TYPES } from '../../../lib/sum-types';

// ☎️
import {
  setSpanValue,
  toggleValue,
  updateEtlUnitIdentifier,
  toggleReduced,
} from '../../../ducks/actions/workbench.actions';

import SpanInput from '../SpanInput';

/* eslint-disable no-console */

const Component = () => {
  // cosmos
  const [id] = useValue('id', { defaultValue: 13 });
  // const dispatch = useDispatch();

  const etlUnit = useSelector((state) => selectNodeState(state, id).data.value);
  const dispatch = useDispatch();
  /*

  const mspanName = useSelector((state) =>
    selectEtlUnit(state, mea.measurementType),
  );
  */

  // from Quality: (valueIdx)
  // from Component: (valueIdx, componentName)
  const handleToggleValue =
    (valueIdx = 0, componentName = 'time') =>
    () => {
      console.log(`dispatch toggleValue:`);
      console.log(`${id} ${componentName} ${valueIdx}`);
      console.dir(valueIdx);
      // dispatch(toggleValue(id, valueIdx, componentName));
    };
  const timeProp = useSelector(
    (state) =>
      Object.values(getEtlFields(state)).find(
        (field) => field.purpose === PURPOSE_TYPES.MSPAN,
      ).time,
  );

  const spanObject = useSelector(
    (state) => selectSpanValueFromNode(state, id, 'time', 0) ?? null,
  );
  if (spanObject === null) {
    return null;
  }
  const { value: span, request } = spanObject;

  const handleUpdate = (newSpan) => {
    console.log(`dispatch setSpanValue:`);
    console.dir(newSpan);
    console.dir(
      setSpanValue(
        id,
        'time', // 🦀
        0, // 🦀
        newSpan,
      ),
    );
  };

  return (
    <div style={{ width: '300px', margin: '20px' }}>
      <Typography variant='body1'>
        The different <code>SpanInput</code> display options. The option to
        disable the input is only available using the toggle display type; a
        type only used when there is more than one span value.
      </Typography>
      <Box
        display='flex'
        flexDirection='column'
        alignItems='stretch'
        component='div'
        width={200}>
        <p />
        <SpanInput
          span={span}
          timeProp={timeProp}
          formatOut={null}
          handleUpdate={handleUpdate}
          handleToggleValue={handleToggleValue(0, 'time')}
          displayType='toggle'
          request
        />
        <p />
        <SpanInput
          span={span}
          timeProp={timeProp}
          formatOut={null}
          handleUpdate={handleUpdate}
          handleToggleValue={handleToggleValue}
          displayType='toggle'
          request={false}
        />
        <p />
        <SpanInput
          span={span}
          timeProp={timeProp}
          formatOut={null}
          handleUpdate={handleUpdate}
          handleToggleValue={handleToggleValue}
          displayType='icon'
          request={false}
        />
        <p />
        <SpanInput
          span={span}
          timeProp={timeProp}
          formatOut={null}
          handleUpdate={handleUpdate}
          handleToggleValue={handleToggleValue}
        />
      </Box>
      <p />
      <p />
      <ConsoleLog value={spanObject} advancedView collapsed={false} />
      <ConsoleLog value={timeProp} advancedView collapsed={false} />
      <ConsoleLog value={etlUnit} advancedView collapsed />
    </div>
  );
};
const fixtures = (
  <ReduxMock initialState={initialState}>
    <Component />
  </ReduxMock>
);
export default fixtures;
