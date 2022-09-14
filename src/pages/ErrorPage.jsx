/**
 *
 * 🚧 WIP
 *
 * Generic Error page.  Ideally should include some sort of
 * "retry" strategy to help the end-use.
 *
 */
import { PropTypes } from 'prop-types';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ErrorPage = ({ message: msgProp = 'Error' }) => {
  const [search] = useSearchParams();
  //
  const navigate = useNavigate();
  const message = search.get('message') || msgProp;

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
          <Typography variant='h2' component='h2'>
            500
          </Typography>
          <Typography variant='h5' component='h5'>
            {message}
          </Typography>
          <Button
            sx={{ width: '30%', mt: 6, height: '36px' }}
            variant='contained'
            color='primary'
            type='submit'
            onClick={() => navigate('/')}>
            Go back
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};
ErrorPage.propTypes = {
  message: PropTypes.string,
};
ErrorPage.defaultProps = {
  message: undefined,
};
export default ErrorPage;
