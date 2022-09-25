import React, { useCallback, useState } from 'react';
import { PropTypes } from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
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

import AppBar from '../components/AppBar';
import { useLocationChange, usePageWidth, usePersistedState } from '../hooks';
import { showAppBar as showAppBarCfg } from '../router/routes';
import { colors } from '../core-app/constants/variables';

//-----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_LAYOUT === 'true';
const COLOR = colors.blue;
//-----------------------------------------------------------------------------
/* eslint-disable no-console */

const HorizontalLayout = ({
  children,
  open,
  toggleDrawer,
  secondaryElement,
}) => {
  const theme = useTheme();
  const pageWidth = usePageWidth();
  const navigate = useNavigate();
  const enqueueSnackbar = useSnackbar();
  const isMobile = pageWidth < 770;
  const [showAppBar, setShowAppBar] = useState(() => false);
  const [origin] = usePersistedState('origin'); // debugging read-only

  const setAppBarState = useCallback((location) => {
    const { pathname } = location;
    const show = showAppBarCfg(pathname);
    setShowAppBar(show);
  }, []);

  useLocationChange(setAppBarState);

  const handleLogOut = (event) => {
    event.preventDefault();
    navigate('/login?logout=true');
    enqueueSnackbar('Succesfully logged out', {
      variant: 'info',
    });
  };

  const notificationsCount = 0;
  if (DEBUG) {
    console.debug('%c----------------------------------------', COLOR);
    console.debug(`%c📋 HorizontalLayout loaded state summary:`, COLOR, {
      showAppBar: showAppBarCfg(location.pathname),
      isMobile,
      pathname: location.pathname,
      origin,
    });
  }

  return (
    <>
      {showAppBar && (
        <AppBar
          position='absolute'
          className={`luci-toolbar ${theme.palette.mode}-toolbar`}
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
        <Container className='core-app-main' sx={{ mt: 4, mb: 4 }}>
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
        </Container>
      </Box>
    </>
  );
};

HorizontalLayout.propTypes = {
  children: PropTypes.node.isRequired,
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  secondaryElement: PropTypes.element,
};
HorizontalLayout.defaultProps = {
  secondaryElement: null,
};

export default HorizontalLayout;
