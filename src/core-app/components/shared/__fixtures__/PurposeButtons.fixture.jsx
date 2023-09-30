// import makeStyles from '@mui/styles/makeStyles';
import React, { useState, useCallback } from 'react';
import numeral from 'numeral';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import PurposeButtons from '../PurposeButtons';
import ConsoleLog from '../ConsoleLog';
import { PURPOSE_TYPES } from '../../../lib/sum-types';
// api
import { fetchFileLevels as getLevelsInternal } from '../../../services/api';

import data from '../../../datasets/store-headerviews_v2.json';

/* eslint-disable no-console, no-shadow */

/*
const useStyles = makeStyles((theme) => ({
  zero: {
    backgroundColor: theme.palette.primary.light,
  },
  rest: {
    backgroundColor: theme.palette.primary.main,
  },
})); */

const field = Object.values(data.headerView.headerViews)[0].fields.find(
  (fld) => fld.enabled && fld.purpose === 'mvalue',
);

const getLevels = (purpose, postProcessing) =>
  getLevelsInternal({
    sources: [
      {
        filename: field.filename,
        'header-index': field?.['header-index'] || 7,
      },
    ],
    purpose,
    arrows: field?.['map-symbols']?.arrows ?? {},
  }).then(({ data }) => postProcessing(data));

const Component = () => {
  //
  // local state
  //
  const [purposeValue, setPurpose] = useState(() => '');
  const [data, setData] = useState(() => undefined);

  const renderTriangle = ({ countZero, countAll, height }) => {
    const countZeroHeight = (countZero / countAll) * height;
    const countRestHeight = height - countZeroHeight;

    return {
      zero: {
        width: '30px',
        height: `${countZeroHeight}px`,
        margin: '0 20px',
      },
      rest: {
        width: '30px',
        height: `${countRestHeight}px`,
        margin: '0 20px',
      },
    };
  };

  const handleSaveChange = useCallback(({ target }) => {
    console.log(`purpose change: ${target.value}`);
    setPurpose(target.value);

    if (PURPOSE_TYPES.MVALUE) {
      /* get the data */
      getLevels(target.value, setData);
    }
    if (PURPOSE_TYPES.MSPAN) {
      /* get the mspan data */
      getLevels(target.value, setData);
    }
  }, []);

  const getZeroAllCount = (data, zeroOrAll) => {
    const thisProp = zeroOrAll === 'zero' ? 'null-count' : 'n';

    const result = data?.payload?.withZeroValues?.[thisProp] ?? 1;
    console.log(`zeroOrAll: ${result}`);
    return result;
  };

  return (
    <div style={{ width: '300px', margin: '30px' }}>
      <PurposeButtons
        stateId='cosmosTesting'
        showSubject
        showQuality
        showComponent
        showTiming
        showValue
        onChange={handleSaveChange}
        value={purposeValue}
      />
      <p />
      <ConsoleLog value={field} advancedView />
      <p />
      {typeof data === 'undefined' ? (
        <Typography>Data appears when select mvalue</Typography>
      ) : (
        <Grid alignItems='flex-end' container className='LuciZeroCount'>
          <Grid item>
            <Typography variant='h2'>
              {numeral(data.payload.withZeroValues?.mean).format('0.0')}
            </Typography>
          </Grid>
          <Grid item>
            <div
              style={
                renderTriangle({
                  countZero: getZeroAllCount(data, 'zero'),
                  countAll: getZeroAllCount(data, 'all'),
                  height: 100,
                }).zero
              }
            />
            <div
              style={
                renderTriangle({
                  countZero: getZeroAllCount(data, 'zero'),
                  countAll: getZeroAllCount(data, 'all'),
                  height: 100,
                }).rest
              }
            />
          </Grid>
          <Grid item>
            <Typography variant='h2' elementType='span'>
              {numeral(data.payload.withoutZeroValues?.mean ?? 'NA').format(
                '0.0',
              )}
            </Typography>
          </Grid>
          <Grid item>
            <ConsoleLog value={data} advancedView expanded />
          </Grid>
        </Grid>
      )}
      <p />
      {typeof data === 'undefined' ? (
        <Typography>Data appears when select mvalue</Typography>
      ) : (
        <Grid alignItems='flex-end' container className='LuciZeroCount'>
          <Grid item>
            <Typography variant='body2'>
              The mean for N of {data.payload.withZeroValues.n}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant='h2'>
              {numeral(data.payload.withZeroValues?.mean).format('0.0')}
            </Typography>
            <Typography variant='h6'>
              {`${numeral(data.payload.withoutZeroValues?.mean).format(
                '0.0',
              )} without ${
                data.payload.withZeroValues?.['null-count']
              } null values`}
            </Typography>
          </Grid>
          <Grid item>
            <ConsoleLog value={data} advancedView expanded />
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default <Component testProp />;
