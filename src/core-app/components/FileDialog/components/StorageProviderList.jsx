/**
 *
 * Display the list of shared drive services.
 * Manage the authorization process.
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import { IconButton } from '@mui/material';
import { Google } from '@mui/icons-material';

//------------------------------------------------------------------------------
const DRIVE_AUTH_URL = process.env.REACT_APP_DRIVE_AUTH_URL;
// e.g., http://localhost:3099/drive
//------------------------------------------------------------------------------

const CustomButton = (props) => {
  return <IconButton {...props} className='auth-button' />;
};

/**
 *
 * Render the shared-drive provider buttons; onClick, authenticate.
 *
 * @component
 *
 */
const StorageProviderList = ({ projectId, className }) => {
  const handleAuth = (serviceName) => {
    const driveAuthURL = `${DRIVE_AUTH_URL}/${serviceName}/${projectId}`;
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
        columnGap='18px'>
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
              onClick={() => handleAuth('msgraph')}>
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
  projectId: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
};

StorageProviderList.defaultProps = {};

export default StorageProviderList;
