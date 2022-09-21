import { useEffect, useReducer, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { Box, Divider, IconButton, Paper, Typography } from '@mui/material';
import { Google, GitHub, Twitter } from '@mui/icons-material';

import clsx from 'clsx';

import { purgeStoredState } from 'redux-persist';

import { persistConfig } from '../core-app/redux-persist-cfg';
import { logout as logoutApi } from '../services/dashboard.api';
import usePersistedState from '../core-app/hooks/use-persisted-state';

import './LoginPage.css';

//------------------------------------------------------------------------------
const AUTH_PROVIDERS = process.env.REACT_APP_AUTH_PROVIDERS.split(',');
//------------------------------------------------------------------------------
/* eslint-disable camelcase, no-console */

/* eslint-disable react/jsx-props-no-spreading */
const AuthButton = (props) => {
  return <IconButton {...props} className='auth-button' />;
};
/* eslint-enable react/jsx-props-no-spreading */

export const LoginPage = ({ logout }) => {
  //
  const [isLoading, setLoading] = useState(() => false);

  // 1. persist the history stored in location to local storage
  // (consumed by the RedirectPage, navigate(origin))
  const location = useLocation();
  const origin = location.state?.fromPathname || '/';
  usePersistedState(`tncAuthRedirectOrigin`, origin);

  // 2. proceed with the login routine

  // generic for supported authenticating services
  const errorMsg = 'this auth provider is not supported';
  const handleAuth = (provider) => (event) => {
    // 🚧 assert using supported auth provider
    console.assert(AUTH_PROVIDERS.includes(provider), {
      provider,
      errorMsg,
    });

    if (event) event.preventDefault();

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const authURL = `http://localhost:3099/auth/${provider}`;
      window.location.replace(authURL);
    }, 1000);
  };

  useEffect(() => {
    if (logout) {
      logoutApi();
    }
    // clear the user-agent's persisted state
    (async () => {
      try {
        await purgeStoredState(persistConfig);
        await purgeStoredState(persistConfig);
      } catch (e) {
        console.error(`Failed to purge local state`);
        console.dir(e);
      }
    })();
  }, [logout]);

  return (
    <Box
      className='login-background'
      sx={{
        height: 'calc(100vh - 100px)',
        alignItems: 'center',
        justifyItems: 'center',
        display: 'grid',
        width: '100%',
        textAlign: 'center',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}>
      <Paper sx={{ zIndex: 2, p: 6, width: '300px' }}>
        <Box
          sx={{
            display: 'flex',
            flexFlow: 'column nowrap',
            gap: '12px',
            zIndex: 2,
          }}>
          <Typography variant='h5' component='h2'>
            Sign in
          </Typography>
          <Divider />
          <Box
            sx={{
              mb: 1,
              mt: 1,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
            <AuthButton onClick={handleAuth('google')} disabled={isLoading}>
              <Google />
            </AuthButton>
            <AuthButton onClick={handleAuth('discord')} disabled={isLoading}>
              <span className='iconify' data-icon='akar-icons:discord-fill' />
            </AuthButton>
            <AuthButton onClick={handleAuth('azure')} disabled={isLoading}>
              <span className='iconify' data-icon='mdi:microsoft-azure'></span>
            </AuthButton>
            <AuthButton onClick={handleAuth('github')} disabled={isLoading}>
              <GitHub />
            </AuthButton>
            <AuthButton onClick={handleAuth('twitter')} disabled={isLoading}>
              <Twitter />
            </AuthButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

LoginPage.propTypes = {
  logout: PropTypes.bool,
};
LoginPage.defaultProps = {
  logout: false,
};

export default LoginPage;
