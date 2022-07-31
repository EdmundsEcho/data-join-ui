// src/components/shared/ToggleIncludeField.jsx

/**
 *
 * @module /components/shared/ToggleIncludeField
 *
 * @description
 * Display check or x to signal enabled vs disabled.
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
// import iconStyles from './styles/icons';

const ToggleIncludeField = ({ checked, fontSize, ...iconProps }) => {
  /* eslint-disable react/jsx-props-no-spreading */

  return checked ? (
    <Check fontSize={fontSize} {...iconProps} />
  ) : (
    <Clear fontSize={fontSize} {...iconProps} />
  );
};

ToggleIncludeField.propTypes = {
  checked: PropTypes.bool,
  fontSize: PropTypes.string,
};
ToggleIncludeField.defaultProps = {
  checked: false,
  fontSize: 'small',
};

export default ToggleIncludeField;
