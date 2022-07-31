// src/components/EtlFieldForm/components/CodomainReducerRow.jsx

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

import { debug, useTraceUpdate } from '../../../constants/variables';

/* eslint-disable no-console, react/jsx-props-no-spreading */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

const codomainOptions = ['FIRST', 'LAST', 'AVG', 'SUM'];

/**
 * @component
 */
function CodomainReducerRow(props) {
  useTraceUpdate(props);
  const { name, value, onChange } = props;

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering CodomainReducerRow`, debug.color.green);
  }
  if (DEBUG) {
    console.dir(props);
  }
  return (
    <FormControl
      variant='standard'
      className={clsx('Luci-FileField-FormControl')}
    >
      <InputLabel id='dedup-label'>Dedup using</InputLabel>
      <Select
        className={clsx('Luci-FileField-SelectMenu')}
        name={name}
        value={value}
        onChange={onChange}
      >
        <MenuItem value='null'>None</MenuItem>
        {codomainOptions.map((option, idx) => (
          <MenuItem key={idx} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

CodomainReducerRow.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
export default CodomainReducerRow;
