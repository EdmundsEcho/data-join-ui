import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { Box, Divider, IconButton, Paper, Typography } from '@mui/material';
import { Google, GitHub, Twitter } from '@mui/icons-material';

// import { persistConfig } from '../core-app/redux-persist-cfg';
import { Copyright } from '../components/shared/Copyright';
import { logout as logoutApi } from '../services/dashboard.api';
import { usePersistedState, useAbortController, useFetchApi } from '../hooks';
import { colors } from '../core-app/constants/variables';

import './LoginPage.css';

//-----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_LOGIN === 'true';
//-----------------------------------------------------------------------------
const AUTH_PROVIDERS = process.env.REACT_APP_USER_AUTH_PROVIDERS.split(',');
const AUTH_URL = process.env.REACT_APP_USER_AUTH_URL;
const COLOR = colors.blue;
//-----------------------------------------------------------------------------
/* eslint-disable no-console, react/jsx-props-no-spreading */

const AuthButton = (props) => {
  return <IconButton {...props} className='auth-button' />;
};

export const LoginPage = ({ logout: logoutProp }) => {
  //
  const [isLoading, setLoading] = useState(() => false);
  const [search] = useSearchParams();
  const logoutRequest = search.get('logout') ?? logoutProp ?? false;

  // 1. Persist the history stored in location to local storage
  // (consumed by the RedirectPage, navigate(origin))
  const location = useLocation();
  const origin = location.state?.origin || '/';
  usePersistedState('origin', origin, 'db-tncui');

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
      const authURL = `${AUTH_URL}/${provider}`;
      window.location.replace(authURL);
    }, 1000);
  };

  // ---------------------------------------------------------------------------
  // 💢 fetch projects
  // 🔖 summary views only (detail view is part of the core-app)
  // ---------------------------------------------------------------------------
  const abortController = useAbortController();
  const { execute: logout } = useFetchApi({
    asyncFn: logoutApi,
    useSignal: true,
    immediate: false,
    abortController,
    caller: 'LoginPage:logout',
    DEBUG,
  });
  useEffect(() => {
    if (logoutRequest) {
      logout();
    }
  }, [logoutRequest, logout]);

  if (DEBUG) {
    console.debug('%c----------------------------------------', COLOR);
    console.debug(`%c📋 LoginPage loaded state summary:`, COLOR, {
      isLoading,
      search,
      logoutRequest,
      origin,
    });
  }

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
          <div className='login-providers'>
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
          </div>
        </Box>
      </Paper>

      <Copyright className='copyright' />
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
