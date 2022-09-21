/**
 *
 * 🚧 WIP
 *
 * Generic Error page.  Ideally should include some sort of
 * "retry" strategy to help the end-use.
 *
 */
import { PropTypes } from 'prop-types';
import { Box, Button, Paper, Typography, Container } from '@mui/material';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

export const ErrorPage = ({
  message: msgProp = 'Error',
  longMessage: longMsgProp = undefined,
}) => {
  //
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const message = search.get('message') || msgProp;
  const longMessage = search.get('longMessage') || longMsgProp;

  const location = useLocation();
  const origin = location.state?.fromPathname || '/';

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
            onClick={() => navigate(origin)}>
            Go back
          </Button>
        </Paper>
      </Box>
      <Container>{longMessage}</Container>
    </Box>
  );
};
ErrorPage.propTypes = {
  message: PropTypes.string,
  longMessage: PropTypes.string,
};
ErrorPage.defaultProps = {
  message: undefined,
  longMessage: undefined,
};
export default ErrorPage;
