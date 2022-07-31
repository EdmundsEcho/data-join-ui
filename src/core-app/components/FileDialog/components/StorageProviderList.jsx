import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import { IconButton } from '@mui/material';
import { Google } from '@mui/icons-material';

const CustomButton = (props) => {
  return <IconButton {...props} className='auth-button' />;
};

const StorageProviderList = ({ project_id: projectId, className }) => {
  const handleAuth = (serviceName) => {
    const driveAuthURL = `http://localhost:3099/drive/${serviceName}/${projectId}`;
    window.location.replace(driveAuthURL);
  };

  return (
    <Toolbar variant='dense' className={clsx('Luci-Toolbar', className)}>
      <Grid
        className='Luci-Toolbar'
        container
        direction='column'
        justifyContent='space-between'
        alignItems='center'
        wrap='nowrap'
        columnGap='18px'
      >
        <Grid container item alignItems='center' justifyContent='center'>
          Add new files:
        </Grid>
        <Grid container item alignItems='center'>
          <Grid item>
            <CustomButton title='Google' onClick={() => handleAuth('google')}>
              <Google />
            </CustomButton>
          </Grid>
          <Grid item>
            <CustomButton
              title='One Drive'
              onClick={() => handleAuth('msgraph')}
            >
              <span className='iconify' data-icon='mdi:microsoft-azure'></span>
            </CustomButton>
          </Grid>
          <Grid item>
            <CustomButton title='Dropbox' onClick={() => handleAuth('dropbox')}>
              <span className='iconify' data-icon='mdi:dropbox'></span>
            </CustomButton>
          </Grid>
        </Grid>
      </Grid>
    </Toolbar>
  );
};

StorageProviderList.propTypes = {
  project_id: PropTypes.string.isRequired,
  className: PropTypes.string,
  // files: PropTypes.arrayOf(PropTypes.shape({ length: PropTypes.number })),
  // fileSearchText: PropTypes.string,
};

StorageProviderList.defaultProps = {
  className: '',
  // files: [],
  // fileSearchText: '',
};

export default StorageProviderList;
