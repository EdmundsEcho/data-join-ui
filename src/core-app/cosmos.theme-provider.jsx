import React from 'react';
import PropTypes from 'prop-types';

import { ThemeProvider as ThemeInternal } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // fixes some html

import { LicenseInfo } from '@mui/x-data-grid-pro';
import luciviaTheme from './lucivia-theme';

LicenseInfo.setLicenseKey(
  'fa029d42fde6eb619eeabfea6cfb9c30T1JERVI6MjQ4NTgsRVhQSVJZPTE2NTI2NTE0NDIwMDAsS0VZVkVSU0lPTj0x',
);

const ThemeProvider = ({ children }) => (
  <ThemeInternal theme={luciviaTheme}>
    <CssBaseline>{children}</CssBaseline>
  </ThemeInternal>
);

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

ThemeProvider.defaultProps = {};

export default ThemeProvider;
