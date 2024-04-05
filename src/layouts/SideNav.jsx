import React, { useContext } from 'react';
import { PropTypes } from 'prop-types';
import { Link } from 'react-router-dom';

import clsx from 'clsx';

import { styled, useTheme } from '@mui/material';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
// icons
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { usePageWidth } from '../hooks';
import { ThemeContext } from '../contexts/ThemeContext';
import { mainListItems } from '../router';
import Copyright from '../components/shared/Copyright';

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

export const SideNav = ({ open, toggleDrawer, className }) => {
  const pageWidth = usePageWidth();
  const isMobile = pageWidth < 770;

  return (
    <Drawer
      className={clsx('Luci-Drawer', className)}
      anchor='left'
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
    >
      <Toolbar className='Luci-Toolbar side-nav'>
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List className='dashboard main side-nav links' component='nav'>
        {mainListItems.map((menuItem) => (
          <Link
            key={menuItem.text}
            to={menuItem.disabled ? '/coming-soon' : menuItem.path}
            onClick={() => {
              if (isMobile) toggleDrawer();
            }}
          >
            <ListItemButton>
              <ListItemIcon>{menuItem.icon}</ListItemIcon>
              <ListItemText primary={menuItem.text} />
            </ListItemButton>
          </Link>
        ))}
        <ThemeToggle />
      </List>
      <Copyright className='copyright' />
    </Drawer>
  );
};

SideNav.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
};
SideNav.defaultProps = {
  open: true,
};

/**
 * Toggle with absolute position bottom: 0
 */
function ThemeToggle() {
  const theme = useTheme();
  const { toggleThemeMode } = useContext(ThemeContext);

  return (
    <ListItemButton
      className='dashboard theme-mode-toggle'
      onClick={() => toggleThemeMode()}
      sx={{
        bottom: 0,
        position: 'absolute',
        marginTop: 'auto',
        marginBottom: '10px',
        width: '100%',
      }}
    >
      <ListItemIcon>
        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </ListItemIcon>
      <ListItemText
        primary={`${theme.palette.mode === 'dark' ? 'Dark' : 'Light'} mode`}
      />
    </ListItemButton>
  );
}
export default SideNav;
