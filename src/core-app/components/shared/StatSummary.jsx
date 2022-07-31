// src/components/shared/StatSummary

/**
 *
 * View of the levels::summary from the api
 *
 */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import numeral from 'numeral';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// api
import { getLevels as getLevelsInternal } from '../../services/api';
import { fileLevelsRequest } from '../../lib/filesToEtlUnits/levels-request';

import { FIELD_TYPES, SOURCE_TYPES } from '../../lib/sum-types';
import { InvalidStateError } from '../../lib/LuciErrors';
import { range } from '../../utils/common';

/**
 *
 * 🚧 WIP
 *
 * 1️⃣  Extract the summary data
 * 2️⃣  Format the data (a sub-routine)
 *
 * @function
 * @param {string} prop property name
 * @param {bool} withZero which of the two statistics
 * @param {Object} data source data from the api
 * @return {(number | bool)}
 */
const displayData = (prop, withZero, data) => {
  if (typeof data === 'undefined') {
    return undefined;
  }
  // use this when 5 digits
  const twoSignificantDigits = (value) => {
    if (value === 0) return { value: 0, magnitude: 1 };
    const result = range(1, 7).reduce(
      ([searchValue, expX], nextExp) => {
        if (searchValue > 0 && searchValue > 100) {
          return [searchValue, expX];
        }
        if (searchValue < 0 && searchValue * -1 > 100) {
          return [searchValue, expX];
        }
        return [searchValue * 10, nextExp];
      },
      [value, 1],
    );
    return {
      value: Math.round(result[0]) / Math.pow(10, result[1]),
      magnitude: result[1],
    };
  };

  // 🚧 Change the font size in relation to digit count
  /*
  const displaySize = (magnitude) => {
    switch (true) {
      case magnitude < 3:
        return 'h3';
      case magnitude < 5:
        return 'h4';
      case magnitude < 8:
        return 'h5';
      default:
        return 'h6';
    }
  };
*/

  const meanFormat = (magnitude) => {
    return magnitude <= 1 ? '0.0' : `0.${new Array(magnitude + 1).join('0')}`;
  };

  const getMean = (mean) => {
    return twoSignificantDigits(mean).value;
  };
  const getMagnitude = (mean) => {
    return twoSignificantDigits(mean).magnitude;
  };

  const struct = {
    wZero: {
      show: true,
      mean: numeral(getMean(data.withZeroValues.mean)).format(
        meanFormat(getMagnitude(data.withZeroValues.mean)),
      ),
      n: numeral(data.withZeroValues.n).format('###,###'),
      nullCount: numeral(data.withZeroValues['null-count']).format('###,###'),
    },
    woZero: {
      show: data.withZeroValues['null-count'] > 0,
      mean: numeral(getMean(data.withoutZeroValues.mean)).format(
        meanFormat(getMagnitude(data.withoutZeroValues.mean)),
      ),
      n: numeral(data.withoutZeroValues.n).format('###,###'),
      nullCount: numeral(data.withoutZeroValues['null-count']).format(
        '###,###',
      ),
    },
  };
  return withZero ? struct.wZero[prop] : struct.woZero[prop];
};

/**
 * Two sources:
 *
 *    👉 tnc-py api call
 *
 *    👉 Redux + computation WIP
 *
 * @component
 */
function StatSummary({ getValue, fieldType }) {
  //
  // local state
  //
  const [localStore, setLocalStore] = useState(() => undefined);
  const [status, setStatus] = useState(() => 'idle');
  // error | success | idle | pending

  //
  // identify when impliedMvalue to avoid the api call for now
  //
  const hasImpliedMvalue =
    fieldType === FIELD_TYPES.FILE
      ? typeof getValue('implied-mvalue') !== 'undefined'
      : getValue('sources')[0]['source-type'] === SOURCE_TYPES.IMPLIED;

  //
  // ⌛ async call to the api
  //
  const getLevels = useCallback(
    async (isMounted, callback) => {
      //
      // short-circuit the effect when...
      //
      if (hasImpliedMvalue) {
        setLocalStore({ message: 'Implied measurement' });
        setStatus('error');
        return;
      }
      const response = await getLevelsInternal(
        fileLevelsRequest(getValue, fieldType),
      );
      if (!isMounted) {
        return;
      }
      if (response.status > 200) {
        setStatus('error');
        return;
      }
      callback(response);
      setStatus('success');
    },
    [fieldType, getValue, hasImpliedMvalue],
  );

  useEffect(() => {
    let isMounted = true;
    if (typeof localStore === 'undefined') {
      setStatus('pending');
      getLevels(isMounted, (response) => {
        setLocalStore(response.data.payload);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [getLevels, localStore]);

  //
  // Individual chunks of information
  //
  const title = (leftOrRight) => (
    <Typography align={leftOrRight} variant='h6'>
      Stats per interval
    </Typography>
  );

  let view = null;
  let displayVersion = 'one';
  switch (true) {
    case ['pending', 'idle'].includes(status):
      view = (
        <Grid item xs={12}>
          <Typography>...fetching</Typography>
        </Grid>
      );
      break;
    case status === 'error':
      view = (
        <Grid item xs={12}>
          <Typography>
            {localStore?.message ?? 'Something went wrong'}
          </Typography>
        </Grid>
      );
      break;
    case status === 'success': {
      displayVersion = displayData('show', false, localStore) ? 'two' : 'one';

      view = (
        <>
          <Grid className='left' xs={displayVersion === 'one' ? 4 : 5} item>
            {displayVersion === 'one'
              ? title('right')
              : summaryView(true, localStore)}
          </Grid>
          <Grid className='spacer' xs={1} item />
          <Grid className='right' xs={displayVersion === 'one' ? true : 6} item>
            {summaryView(displayVersion === 'one' /* with zero */, localStore)}
          </Grid>
        </>
      );
      break;
    }

    default:
      throw new InvalidStateError(`Unreachable`);
  }
  /* eslint-disable no-nested-ternary */

  return (
    <Grid container className={clsx('statsSummary', status)} spacing={2}>
      <Grid item className='title' xs={12}>
        {status !== 'success' && title('left')}
        {status === 'success' && displayVersion === 'two' && title('left')}
      </Grid>
      {view}
    </Grid>
  );
}
StatSummary.propTypes = {
  getValue: PropTypes.func.isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
};

function summaryView(withZero, data) {
  return (
    <>
      <Typography variant='subtitle1'>
        {withZero ? 'mean' : '...without zero values'}
      </Typography>
      <Typography variant='h4'>
        {displayData('mean', withZero, data)}
      </Typography>
      <Typography variant='h6'>{displayData('n', withZero, data)}</Typography>
      <Typography noWrap variant='h6'>
        Nulls: {displayData('nullCount', withZero, data)}
      </Typography>
    </>
  );
}

export default StatSummary;
