/**
 * First page after the person logs-in
 * Routes root element
 */
import { useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { withSnackbar } from 'notistack';

import { fetchUserProfile } from '../services/dashboard.api';

/* eslint-disable no-console */

const RedirectPage = (props) => {
  const { enqueueSnackbar } = props;
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await fetchUserProfile();
      console.assert(
        response?.data ?? false,
        `fetchUserProfile response with no data: ${Object.keys(
          response || {},
        )}`,
      );
      console.log('fetchUser response');
      console.dir(response);
      const { error, status } = response.data;

      if (!error && status !== 'Error' && response?.status === 200) {
        // 🚧 temp skip user-profile
        /*
        const { data } = response
        const { email, last_name, first_name } = data[0]
        if (!email || !last_name || !first_name) {
          navigate('/user-profile')
          enqueueSnackbar('Welcome! Please fill your basic user information.', {
            variant: 'info',
          })
        } else {
*/
        // localhost:5005/v1/projects
        navigate('/projects');
        enqueueSnackbar('Welcome!', {
          variant: 'success',
        });
        //        }
      } else {
        navigate('/login');
        enqueueSnackbar(`Error: ${error || response?.data?.message}`, {
          variant: 'error',
        });
      }
    } catch (e) {
      // false && error
      console.log('catching error in redirect');
      console.log(e);
      navigate('/projects');
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchUser();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

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
      }}
    >
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
            }}
          >
            <span className='spinner spinner-lucivia spinner-lg' />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

RedirectPage.propTypes = {
  enqueueSnackbar: PropTypes.func,
};
RedirectPage.defaultProps = {
  enqueueSnackbar: undefined,
};
export default withSnackbar(RedirectPage);
