// src/components/EtlFieldForm/components/SlicingReducerRow.jsx

/**
 * @module components/EtlFieldForm/components/SlicingReducerRow
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// reducers with a domain::number
const slicingOptions = ['SUM', 'AVG', 'COUNT'];

/**
 * SlicingReducer dialog
 * Part of EtlFieldForm
 *
 * @component
 *
 */
const SlicingReducerRow = (props) => {
  const { name, value, onChange } = props;

  return (
    <FormControl
      variant='standard'
      className={clsx('Luci-FileField-FormControl')}
    >
      <InputLabel id='slicing-reducer'>Combine values with</InputLabel>
      <Select
        className={clsx('Luci-FileField-SelectMenu')}
        name={name}
        value={value}
        onChange={onChange}
      >
        <MenuItem value='null'>None</MenuItem>
        {slicingOptions.map((option, idx) => (
          <MenuItem key={idx} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

SlicingReducerRow.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SlicingReducerRow;
