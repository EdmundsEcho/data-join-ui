import React from 'react';
import Divider from '@mui/material/Divider';

import logo from '../core-app/assets/images/Logo.png';

/**
 * @component
 */
export const Documentation = () => {
  return (
    <div className='documentation root'>
      <img src={logo} alt='Lucivia LLC' style={{ width: '140px' }} />
      <h5>Coming soon</h5>
      <p />
      <Divider />
    </div>
  );
};

Documentation.propTypes = {};

export default Documentation;
