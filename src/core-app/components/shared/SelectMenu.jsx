// src/components/shared/SelectMenu.jsx

/**
 * @module src/components/shared/SelectMenu
 *
 */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

/* eslint-disable react/jsx-props-no-spreading */

/**
 * options is an array of objects with option and value props.
 *
 * @component
 */
const SelectMenu = (props) => {
  const {
    options,
    name,
    value: valueProp,
    label,
    onChange: onChangeProp,
    className: classNameProp,
    disabled,
    ...restSelectProps
  } = props;

  const [value, setValue] = useState(() =>
    valueProp === null ? '' : valueProp,
  );

  const onChange = useCallback(
    (e) => {
      onChangeProp(e);
      setValue(e.target.value);
    },
    [onChangeProp],
  );

  return (
    <FormControl
      disabled={disabled}
      className={clsx('LuciSelectMenu', {
        [classNameProp]: classNameProp !== '',
      })}
      error={value === '' || value === null || typeof value === 'undefined'}
    >
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={`${name}-label`}
        value={value}
        onChange={onChange}
        inputProps={{
          name,
          id: name,
        }}
        autoWidth
        {...restSelectProps}
      >
        {options.map((option) => (
          <MenuItem
            key={`${name}-option-${option.value}`}
            value={`${option.value}`}
            dense
          >
            {option.option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

SelectMenu.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      option: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

SelectMenu.defaultProps = {
  className: '',
  value: undefined,
  disabled: false,
};

export default SelectMenu;
