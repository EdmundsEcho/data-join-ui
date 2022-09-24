import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { withSnackbar } from 'notistack';

import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';

import Copyright from '../components/shared/Copyright';
import { useLocationChange, usePageWidth } from '../hooks';
import isValidRoute from '../router/isValidRoute';
import './HorizontalLayout.scss';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
  // @ts-ignore
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Layout = ({
  children,
  open,
  toggleDrawer,
  enqueueSnackbar,
  secondaryElement = null,
}) => {
  const theme = useTheme();
  const pageWidth = usePageWidth();
  const navigate = useNavigate();
  const isMobile = pageWidth < 770;
  const [showAppBar, setShowAppBar] = useState(false);

  const setAppbarState = useCallback((location) => {
    const { pathname } = location;
    const show = isValidRoute(pathname) && !['/login', '/'].includes(pathname);
    setShowAppBar(show);
  }, []);

  useLocationChange(setAppbarState);

  const handleLogOut = (event) => {
    event.preventDefault();
    navigate('/login');
    enqueueSnackbar('Succesfully logged out', {
      variant: 'info',
    });
  };

  const notificationsCount = 0;

  return (
    <>
      {showAppBar && (
        <AppBar
          position='absolute'
          className={`luci-toolbar ${theme.palette.mode}-toolbar`}
          // @ts-ignore
          open={open}>
          <Toolbar
            sx={{
              mr: '16px', // keep right padding when drawer closed
              ml: '16px',
            }}>
            <IconButton
              edge='start'
              color='inherit'
              aria-label='open drawer'
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}>
              <MenuIcon />
            </IconButton>{' '}
            <Typography
              component='h1'
              variant='h6'
              color='inherit'
              noWrap
              sx={{ flexGrow: 1 }}></Typography>
            {(!isMobile || !open) && (
              // @KM: handle logout by removing the cookie as well!
              <Link href='/login' onClick={handleLogOut} sx={{ mr: 2 }}>
                Log out
              </Link>
            )}
            <IconButton color='inherit'>
              <Badge badgeContent={notificationsCount} color='secondary'>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
      )}
      <Box
        component='main'
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}>
        {showAppBar && <Toolbar />}
        <Container sx={{ mt: 4, mb: 4 }} maxWidth='xl'>
          <Grid container>
            {secondaryElement && (
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  {secondaryElement()}
                </Paper>
              </Grid>
            )}
            <Grid item xs={12} md={secondaryElement ? 8 : 12}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  ...(!showAppBar && { backgroundColor: 'transparent' }),
                }}>
                {children}
              </Paper>
            </Grid>
          </Grid>
          <Copyright />
        </Container>
      </Box>
    </>
  );
};

const mapStateToProps = (state) => ({
  themeMode: state.uiConfig.theme,
});

const HorizontalLayout = withSnackbar(connect(mapStateToProps)(Layout));

export default HorizontalLayout;
