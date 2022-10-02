import React from 'react';
import Divider from '@mui/material/Divider';

import logo from '../core-app/assets/images/Logo.png';

/**
 * @component
 */
export const ComingSoon = () => {
  return (
    <div className='main-page coming-soon root'>
      <img src={logo} alt='Lucivia LLC' />
      <p />
      <h5>Coming soon</h5>
      <p />
      <Divider />
    </div>
  );
};

ComingSoon.propTypes = {};

export default ComingSoon;
