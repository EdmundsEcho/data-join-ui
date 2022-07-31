import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';
import Icon from '@mui/icons-material/HelpOutline';

const HelperIcon = ({ text, size }) => (
  <Tooltip title={text}>
    <Icon style={{ fontSize: size, cursor: 'pointer' }} />
  </Tooltip>
);

HelperIcon.propTypes = {
  text: PropTypes.string.isRequired,
  size: PropTypes.string,
};

HelperIcon.defaultProps = {
  size: '12px',
};

export default HelperIcon;
