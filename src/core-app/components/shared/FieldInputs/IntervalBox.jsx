// src/components/EtlFieldForm/components.jsx

/**
 * @module components/IntervalBox
 * @description
 * UI form for the mspan field's time.interval props unit and count
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import {
  debug,
  useTraceUpdate,
  timeIntervalUnitOptions,
} from '../../../constants/variables';

/* eslint-disable no-console */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

/**
 * TimeInterval user input
 *
 * Used for both the file-field and etl-field values.
 *
 * @todo the null value field does not maintain focus in the rendered context.
 * However, it does work in the null-value-expansion context.
 * onChange
 *
 * @component
 *
 */
const IntervalBox = (props) => {
  const { count = 1, unit = '', onChange, stateId } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering IntervalBox`, debug.color.green);
  }
  if (DEBUG) {
    console.dir(props);
  }

  // the Value postfix ~ recorded in state
  const [countValue, setCountValue] = useState(() => count);
  const [unitValue, setUnitValue] = useState(() => unit);

  // time.interval.unit
  const handleUnitChange = (e) => {
    setUnitValue(e.target.value);
    onChange(e);
  };

  // time.interval.count
  const handleCountChange = (e) => {
    const newValue = Math.max(1, parseInt(e.target.value, 10));
    setCountValue(newValue);
    onChange(e);
  };

  return (
    <Grid container className={clsx('Luci-IntervalBox', 'time-config')}>
      {/* Row 1 */}
      {typeof unit !== 'undefined' && (
        <Grid item xs={12} container>
          {/* field name */}
          <Grid item xs={6} className='fieldname'>
            <Typography>Unit:</Typography>
          </Grid>

          {/* field value/input */}
          <Grid item xs={6} className='select-menu'>
            <FormControl className='form-control'>
              <Select
                id={`${stateId}|select-menu`}
                className='select-controller time-interval-unit'
                name='time.interval.unit'
                value={unitValue}
                onChange={handleUnitChange}
                variant='standard'>
                {Object.keys(timeIntervalUnitOptions).map((key) => (
                  <MenuItem key={key} value={key}>
                    {timeIntervalUnitOptions[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}

      {/* Row 2 */}
      {typeof count !== 'undefined' && (
        <Grid item xs={12} container>
          <Grid item xs={6} className='fieldname'>
            <Typography>Count:</Typography>
          </Grid>

          <Grid item xs={6} className='select-menu'>
            <TextField
              id={`${stateId}|number-field`}
              className='select-controller time-interval-count'
              type='text'
              name='time.interval.count'
              value={countValue}
              onChange={handleCountChange}
              variant='standard'
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

IntervalBox.propTypes = {
  unit: PropTypes.string,
  count: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  stateId: PropTypes.string.isRequired,
};

IntervalBox.defaultProps = {
  unit: '',
  count: undefined,
};

export default IntervalBox;
