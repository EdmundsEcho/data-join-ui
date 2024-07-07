// src/components/shared/TextField.jsx

/**
 * @module components/shared/TextField
 */
import React from 'react';
import PropTypes from 'prop-types';

import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';

import TextInput from './TextInput';

/**
 * Generic, augmented TextInput
 *
 * ⬜ Don't assume empty values mean do not display. Provide
 *    a way to always include label and helpertext.  This will
 *    help keep things aligned regardless of content.
 *
 * @component
 *
 * @category Components
 *
 */
const TextField = ({
  label,
  helperText,
  saveChange,
  InputProps,
  InputLabelProps,
  FormHelperTextProps,
  value,
  required,
  ...CustomInputProps
}) => {
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <FormControl
      variant='standard'
      className='Luci-TextField'
      error={required && value === ''}>
      {label ? <InputLabel {...InputLabelProps}>{label}</InputLabel> : null}
      <TextInput
        saveChange={saveChange}
        value={value}
        {...InputProps}
        {...CustomInputProps}
      />
      {helperText ? (
        <FormHelperText {...FormHelperTextProps}>{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

TextField.propTypes = {
  stateId: PropTypes.string.isRequired,
  helperText: PropTypes.string,
  label: PropTypes.string,
  InputProps: PropTypes.shape({}),
  InputLabelProps: PropTypes.shape({}),
  FormHelperTextProps: PropTypes.shape({}),
  saveChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  required: PropTypes.bool,
};
TextField.defaultProps = {
  helperText: '',
  label: '',
  InputProps: {},
  InputLabelProps: {},
  FormHelperTextProps: {},
  required: false,
};

export default TextField;
