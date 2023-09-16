/**
 *
 * Display the list of shared drive services.
 * Manage the authorization process.
 *
 * Display icons align with DriveRowItem
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import { IconButton } from '@mui/material';
import { Google, CloudUpload } from '@mui/icons-material';

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
const StorageProviderList = ({ authFn, className }) => {
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
            <CustomButton title='Google' onClick={() => authFn('google')}>
              <Google />
            </CustomButton>
          </Grid>
          <Grid item>
            <CustomButton title='One Drive' onClick={() => authFn('msgraph')}>
              <span className='iconify' data-icon='mdi:microsoft-azure'></span>
            </CustomButton>
          </Grid>
          <Grid item>
            <CustomButton title='Dropbox' onClick={() => authFn('dropbox')}>
              <span className='iconify' data-icon='mdi:dropbox'></span>
            </CustomButton>
          </Grid>
          <Grid item>
            <CustomButton title='Upload' onClick={() => authFn('lucidrive')}>
              <CloudUpload />
            </CustomButton>
          </Grid>
        </Grid>
      </Grid>
    </Toolbar>
  );
};

StorageProviderList.propTypes = {
  authFn: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
};

StorageProviderList.defaultProps = {};

export default StorageProviderList;
