import React, { useCallback, useState } from 'react';
import { PropTypes } from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import clsx from 'clsx';

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';

import SideNav2 from './SideNav2';
import AppBar from '../components/AppBar';
import { useLocationChange, usePageWidth, usePersistedState } from '../hooks';
import { lookupDisplayTypeCfg } from '../router/routes';
import { colors } from '../core-app/constants/variables';

//-----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_LAYOUT === 'true';
const COLOR = colors.blue;
//-----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Dashboard layout
 * Rendered by App.V2
 *
 * composed SideNav and AppBar configured with displayTypeCfg
 *
 */
function WithSideBar({ children: routesElement }) {
  //
  const location = useLocation();
  // Update the display configuration with every change in location
  const [displayTypeCfg, setDisplayTypeCfg] = useState(() =>
    lookupDisplayTypeCfg(`/${location.pathname.split('/')[1]}`),
  );
  const setDisplayCfg = useCallback(
    (loc) => {
      setDisplayTypeCfg(() =>
        lookupDisplayTypeCfg(`/${location.pathname.split('/')[1]}`),
      );
    },
    [location.pathname],
  );
  useLocationChange(setDisplayCfg);
  // debugging
  const [origin] = usePersistedState('origin'); // debugging read-only

  //
  // mobile-dependent display of drawer
  const pageWidth = usePageWidth();
  const isMobile = pageWidth < 770;
  const [openDrawer, setOpenDrawer] = useState(() => !isMobile);
  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  if (DEBUG) {
    console.debug('%c----------------------------------------', COLOR);
    console.debug(`%c📋 HorizontalLayout loaded state summary:`, COLOR, {
      displayTypeCfg,
      isMobile,
      origin,
      location,
    });
  }

  return (
    <div className='dashboard-layout-root nostack nowrap nogap'>
      <SideNav2
        className={clsx('side-nav', {
          hidden: !displayTypeCfg?.showSideNav,
        })}
        open={openDrawer}
        toggleDrawer={toggleDrawer}
      />
      {/* Main menu - controls what is displayed in main-viewport */}
      <HorizontalLayout
        className={clsx('appbar-show-hide', {
          hidden: !displayTypeCfg?.showAppBar,
        })}
        toggleDrawer={toggleDrawer}
        open={openDrawer}
        isMobile={isMobile}>
        {/* Main viewport */}
        {routesElement}
      </HorizontalLayout>
    </div>
  );
}

WithSideBar.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Display AppBar with main view of router elements
 */
function HorizontalLayout({
  children,
  open,
  toggleDrawer,
  secondaryElement,
  isMobile,
  className,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const enqueueSnackbar = useSnackbar();
  // feature in-process
  const notificationsCount = 0;

  // AppBar link
  const handleLogOut = (event) => {
    event.preventDefault();
    navigate('/login?logout=true');
    try {
      enqueueSnackbar('Succesfully logged out', {
        variant: 'info',
      });
    } catch (e) {
      /* do nothing */
    }
  };

  return (
    <>
      <AppBar
        position='absolute'
        className={clsx(
          'luci-toolbar',
          `${theme.palette.mode}-toolbar`,
          className,
        )}
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
      <Box
        component='main'
        className='main'
        sx={{
          backgroundColor:
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}>
        <Toolbar className='appbar-toolbar' />
        <div className='main-view sizing noradius'>
          <Grid container className='horizontal-layout root'>
            {secondaryElement && (
              <Grid
                item
                xs={12}
                md={4}
                className='horizontal-layout secondary-root'>
                <Paper
                  className='horizontal-layout secondary-main'
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  {secondaryElement()}
                </Paper>
              </Grid>
            )}
            <Grid
              item
              xs={12}
              md={secondaryElement ? 8 : 12}
              className='horizontal-layout primary-root'>
              <Box className='horizontal-layout primary-main nostack nogap'>
                <div className={clsx('main-view', 'route-elements')}>
                  {children}
                </div>
              </Box>
            </Grid>
          </Grid>
        </div>
      </Box>
    </>
  );
}

HorizontalLayout.propTypes = {
  children: PropTypes.node.isRequired,
  open: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
  secondaryElement: PropTypes.element,
  /*
  displayTypeCfg: PropTypes.shape({
    showAppBar: PropTypes.bool.isRequired,
    showSideNav: PropTypes.bool.isRequired,
  }).isRequired, */
};
HorizontalLayout.defaultProps = {
  secondaryElement: null,
};

export default WithSideBar;
