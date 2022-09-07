import { Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

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
          <Typography variant='h2' component='h2'>
            404
          </Typography>
          <Typography variant='h5' component='h5'>
            Page not found
          </Typography>
          <Button
            sx={{ width: '100%', mt: 6, height: '36px' }}
            variant='contained'
            color='primary'
            type='submit'
            onClick={() => navigate('/')}
          >
            Go back
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};
