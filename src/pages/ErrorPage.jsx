/**
 *
 * 🚧 WIP
 *
 * Generic Error page.  Ideally should include some sort of
 * "retry" strategy to help the end-use.
 *
 */
import { PropTypes } from 'prop-types';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

export const ErrorPage = ({
  message: msgProp = 'Error',
  longMessage: longMsgProp = undefined,
}) => {
  //
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const message = search.get('message') || msgProp;
  const status = search.get('status') || 500;
  const longMessage = search.get('longMessage') || longMsgProp;

  const location = useLocation();
  const origin = location.state?.origin || '/';

  return (
    <Box
      className='login-background error-page root'
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}>
      <div className='single-page-dialog'>
        <Typography variant='h2' component='h2'>
          {status}
        </Typography>
        <Typography variant='h5' component='h5'>
          {message}
        </Typography>
        <Button
          className='error-page button'
          variant='contained'
          color='primary'
          type='submit'
          onClick={() => navigate(origin)}>
          Go back
        </Button>
      </div>
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
