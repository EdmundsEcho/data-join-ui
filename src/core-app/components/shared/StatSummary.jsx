// src/components/shared/StatSummary

/**
 *
 * View of the levels::summary from the api
 *
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import invariant from 'invariant';
import clsx from 'clsx';
import { mean as ssmean, mode, median, standardDeviation } from 'simple-statistics';

import numeral from 'numeral';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// api
import { fetchFileLevels } from '../../services/api';
import useAbortController from '../../../hooks/use-abort-controller';
import { useFetchApi, STATUS } from '../../../hooks/use-fetch-api';
import { fileLevelsRequest } from '../../lib/filesToEtlUnits/levels-request';

import { FIELD_TYPES, SOURCE_TYPES, PURPOSE_TYPES } from '../../lib/sum-types';
import { InvalidStateError } from '../../lib/LuciErrors';
import { range } from '../../utils/common';

/**
 * Generate summary stats for implied mvalue
 *
 * TODO: consider how to replicate for WIDE fields
 *
 * @function
 * @param {Object} impliedMvalueConfig
 * @return {Object} summary statistics
 */
function impliedMvalueStats(impliedMvalueConfig) {
  const { 'null-value-count': zeros = 0, nrows: total = 0 } =
    impliedMvalueConfig.config;
  if (total === 0) {
    return undefined;
  }
  const measurements = Array(zeros)
    .fill(0)
    .concat(Array(total - zeros).fill(1));
  return {
    withZeroValues: {
      min: 0,
      max: 1,
      mean: ssmean(measurements),
      mode: mode(measurements),
      median: median(measurements),
      ser: standardDeviation(measurements) / Math.sqrt(measurements.length),
      n: measurements.length,
      'null-count': zeros,
    },
    withoutZeroValues: {
      max: 1,
      mean: 1.0,
      median: 1,
      min: 1,
      mode: [1],
      n: total - zeros,
      'null-count': 0,
      ser: 0.0,
    },
  };
}

/**
 * @function
 * @param {Object} data
 * @return {Object} displayVersion and component
 */
const getStatView = (data) => {
  if (data.status === 'Error') {
    return {
      displayVersion: 'one',
      component: (
        <Grid item xs={12}>
          <Typography>{data?.message ?? 'Something went wrong'}</Typography>
        </Grid>
      ),
    };
  }
  const displayVersion = displayData('show', false, data) ? 'two' : 'one';
  return {
    displayVersion,
    component: (
      <>
        <Grid className='left' xs={displayVersion === 'one' ? 4 : 5} item>
          {displayVersion === 'one' ? title('right') : summaryView(true, data)}
        </Grid>
        <Grid className='spacer' xs={1} item />
        <Grid className='right' xs={displayVersion === 'one' ? true : 6} item>
          {summaryView(displayVersion === 'one' /* with zero */, data)}
        </Grid>
      </>
    ),
  };
};

/**
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
function displayData(prop, withZero, data, withZeroOnly = false) {
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
      value: Math.round(result[0]) / 10 ** result[1], // 🦀 ? changed from Math.power
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
    woZero: withZeroOnly
      ? null
      : {
          show: data.withZeroValues['null-count'] > 0,
          mean: numeral(getMean(data.withoutZeroValues.mean)).format(
            meanFormat(getMagnitude(data.withoutZeroValues.mean)),
          ),
          n: numeral(data.withoutZeroValues.n).format('###,###'),
          nullCount: numeral(data.withoutZeroValues['null-count']).format('###,###'),
        },
  };

  return withZero ? struct.wZero[prop] : struct.woZero[prop];
}

/**
 * @function
 * @param {string} fieldType
 * @param {function} getValue
 * @return {bool}
 */
function isImpliedMvalue(fieldType, getValue) {
  invariant(
    getValue('purpose') === PURPOSE_TYPES.MVALUE,
    `Failed invariant: purpose must be mvalue - purpose:${getValue('purpose')}`,
  );
  if (fieldType === FIELD_TYPES.WIDE) return false;
  if (fieldType === FIELD_TYPES.FILE)
    return typeof getValue('implied-mvalue') !== 'undefined';
  if (fieldType === FIELD_TYPES.ETL)
    return getValue('sources')[0]['source-type'] === SOURCE_TYPES.IMPLIED;
  throw new InvalidStateError(`isImpliedMvalue - Unsupported fieldType:${fieldType}`);
}
/**
 * @function
 * @param {string} fieldType
 * @param {function} getValue
 * @return {bool}
 */
function isWideMvalue(fieldType, getValue) {
  invariant(
    getValue('purpose') === PURPOSE_TYPES.MVALUE,
    `Failed invariant: purpose must be mvalue - purpose:${getValue('purpose')}`,
  );
  return fieldType === FIELD_TYPES.WIDE;
}

//
/**
 * Two mvalue sources:
 *    👉 tnc-py api call
 *    👉 synthetic for impliedMvalue
 *
 * @component
 */
function StatSummary({ getValue, fieldType }) {
  invariant(
    getValue('purpose') === PURPOSE_TYPES.MVALUE,
    `Failed StatSummary invariant: ${getValue('purpose')} is not supported`,
  );
  //
  const [localStore, setLocalStore] = useState(() => undefined);
  const { projectId } = useParams();
  const abortController = useAbortController();

  const hasImpliedMvalue = isImpliedMvalue(fieldType, getValue);
  const hasWideMvalue = isWideMvalue(fieldType, getValue);
  invariant(!hasWideMvalue, 'StatSummary encountered an unexpected Wide Value mvalue');

  // ---------------------------------------------------------------------------
  // 💢 Side-effect
  //    consumeDataFn: dispatch action required to load the redux store with the
  //    fetched data
  //    Note: memoization often required b/c used in effect
  //    See stat-summary-model.json for a sample.
  const consumeDataFn = (resp) =>
    setLocalStore(() => {
      if (resp.status !== 'Successful') {
        return {
          status: resp.status,
          message: resp.message,
        };
      }
      return resp.data;
    });
  const { execute, status, cancel } = useFetchApi({
    asyncFn: fetchFileLevels,
    consumeDataFn,
    caller: 'StatSummary',
    equalityFnName: 'equal',
    abortController,
    immediate: false,
    useSignal: true,
  });
  // ---------------------------------------------------------------------------
  // 💢 async api call
  // 🟢 Pull new data when project id changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // short-circuit the effect when...
    if (hasImpliedMvalue) {
      setLocalStore(() =>
        impliedMvalueStats({
          config: {
            'null-value-count': getValue('sources')[0]['null-value-count'],
            nrows: getValue('sources')[0].nrows,
          },
        }),
      );
      return cancel;
    }
    execute({
      projectId,
      ...fileLevelsRequest(getValue, fieldType),
    });
    return cancel;
  }, [
    projectId,
    cancel,
    execute,
    fieldType,
    getValue,
    hasImpliedMvalue,
    hasWideMvalue,
  ]);

  //
  // Update values that host chunks of each version of the view
  //
  let view = null;
  let displayVersion = 'one';

  if (hasImpliedMvalue && localStore) {
    ({ displayVersion, component: view } = getStatView(localStore));
  } else {
    switch (status) {
      case STATUS.UNINITIALIZED:
      case STATUS.PENDING:
        view = (
          <Grid item xs={12}>
            <Typography>...fetching</Typography>
          </Grid>
        );
        break;

      case STATUS.REJECTED:
        view = (
          <Grid item xs={12}>
            <Typography>{localStore?.message ?? 'Something went wrong'}</Typography>
          </Grid>
        );
        break;

      case STATUS.RESOLVED: {
        ({ displayVersion, component: view } = getStatView(localStore));
        break;
      }

      default:
        throw new InvalidStateError(`StatSummary - Unreachable status:${status}`);
    }
  }

  return (
    <Grid container className={clsx('statsSummary', status)} spacing={2}>
      <Grid item className='title' xs={12}>
        {status !== STATUS.RESOLVED && title('left')}
        {status === STATUS.RESOLVED && displayVersion === 'two' && title('left')}
      </Grid>
      {view}
    </Grid>
  );
}
StatSummary.propTypes = {
  getValue: PropTypes.func.isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
};

function title(leftOrRight) {
  return (
    <Typography align={leftOrRight} variant='h6'>
      Stats per interval
    </Typography>
  );
}

function summaryView(withZero, data, withZeroOnly = false) {
  return (
    <>
      <Typography variant='subtitle1'>
        {withZero ? 'mean' : '...without zero values'}
      </Typography>
      <Typography variant='h4'>
        {displayData('mean', withZero, data, withZeroOnly)}
      </Typography>
      <Typography variant='h6'>
        {displayData('n', withZero, data, withZeroOnly)}
      </Typography>
      <Typography noWrap variant='h6'>
        Nulls: {displayData('nullCount', withZero, data, withZeroOnly)}
      </Typography>
    </>
  );
}

export default StatSummary;
