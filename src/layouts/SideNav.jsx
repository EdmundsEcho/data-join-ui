import React, { useCallback, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  styled,
  Toolbar,
  useTheme,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';

import { useLocationChange, usePageWidth, useThemeMode } from '../hooks';
import isValidRoute from '../router/isValidRoute';
import { ThemeContext } from '../contexts/ThemeContext';
import { mainListItems } from '../router';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(11),
      },
    }),
  },
}));

export const SideNav = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const pageWidth = usePageWidth();
  const isMobile = pageWidth < 770;
  const [showSidenav, setShowSidenav] = useState(false);

  const setSidenavState = useCallback((location) => {
    const { pathname } = location;
    const show = isValidRoute(pathname) && !['/login', '/'].includes(pathname);
    setShowSidenav(show);
  }, []);

  useLocationChange(setSidenavState);

  const { toggleThemeMode } = useContext(ThemeContext);

  if (!showSidenav) {
    return null;
  }

  return (
    <Drawer
      anchor='left'
      className='luci-drawer'
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}>
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List component='nav' sx={{ height: 'inherit' }}>
        {mainListItems.map((route, index) =>
          route.url ? (
            <Link
              to={route.url}
              key={`${route.text}-${index}`}
              onClick={() => {
                if (isMobile) toggleDrawer();
              }}>
              <ListItemButton>
                <ListItemIcon>{route.icon ?? ''}</ListItemIcon>
                <ListItemText primary={route.text} />
              </ListItemButton>
            </Link>
          ) : (
            <div key={`${route.text}-${index}`}>
              <Divider sx={{ my: 1 }} />
              <ListSubheader component='div' inset>
                {route.text}
              </ListSubheader>
            </div>
          ),
        )}
        <ListItemButton
          onClick={() => toggleThemeMode()}
          sx={{
            bottom: 0,
            position: 'absolute',
            marginTop: 'auto',
            marginBottom: '10px',
            width: '100%',
          }}>
          <ListItemIcon>
            {theme.palette.mode === 'dark' ? (
              <Brightness7Icon />
            ) : (
              <Brightness4Icon />
            )}
          </ListItemIcon>

          <ListItemText
            primary={`${theme.palette.mode === 'dark' ? 'Dark' : 'Light'} mode`}
          />
        </ListItemButton>
      </List>
    </Drawer>
  );
};

SideNav.propTypes = {
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
};

export default SideNav;
