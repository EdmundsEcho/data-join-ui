// src/pages/RedirectPage.jsx

/**
 * First page after the person logs-in
 * Routes root element
 */
import { useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useFetchApi, STATUS } from '../hooks/use-fetch-api';
import usePersistedState from '../core-app/hooks/use-persisted-state';
import { fetchUserProfile } from '../services/dashboard.api';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
const USER_PROFILE_ENDPOINT = '/user-profile';
const DEFAULT_ENDPOINT = '/projects';
const OFF = false;
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Dashboard entry point
 * redirects user to default when the user-profile is sufficiently complete.
 */
export const RedirectPage = () => {
  const navigate = useNavigate();

  const [origin, setOrigin] = usePersistedState('tncAuthRedirectOrigin');

  const {
    cache: dataToGuideRedirect,
    status,
    cancel,
  } = useFetchApi({
    asyncFn: fetchUserProfile,
    immediate: true,
    useSignal: true,
    equalityFnName: 'similarObjects',
    caller: 'RedirectPage',
    DEBUG,
  });

  // First choice for redirect
  // 💢 redirect when origin is defined
  useEffect(() => {
    if (typeof origin !== 'undefined') {
      const tmp = origin;
      setOrigin(undefined);
      navigate(tmp);
    }
    return cancel;
  }, [navigate, cancel, origin, setOrigin]);

  const isReady = status === STATUS.RESOLVED;

  // Second, user-profile when incomplete
  // 💢 fetch user profile
  useEffect(() => {
    if (isReady) {
      const {
        email,
        last_name: lastName,
        first_name: firstName,
      } = dataToGuideRedirect;
      if (OFF || !email || !lastName || !firstName) {
        navigate(USER_PROFILE_ENDPOINT);
      } else {
        navigate(DEFAULT_ENDPOINT);
      }
    }
    return cancel;
  }, [isReady, cancel, dataToGuideRedirect, navigate]);

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
      <Box sx={{ zIndex: 2 }}>
        <Paper sx={{ p: '20px', width: '300px' }}>
          <Typography variant='h5' component='h5'>
            Redirecting...
          </Typography>

          <Box
            sx={{
              mt: 4,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <span className='spinner spinner-lucivia spinner-lg' />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

RedirectPage.propTypes = {};
RedirectPage.defaultProps = {};
export default RedirectPage;
