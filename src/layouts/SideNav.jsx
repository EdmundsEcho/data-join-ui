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
  Assignment,
  Layers,
  Dashboard,
  Chat,
  Person,
  BackupTable,
} from '@mui/icons-material';

import {
  IconButton,
  ListItemIcon,
  ListItemText,
  styled,
  Toolbar,
  useTheme,
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';

import { mainListItems, isValidRoute } from '../router';

import { useLocationChange, usePageWidth, useThemeMode } from '../hooks';
import { ThemeContext } from '../contexts/ThemeContext';

const Drawer = styled(MuiDrawer)(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
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

export const SideNav = () => {
  return (
    <div>
      {mainListItems.map((menuItem) => (
        <Link key={menuItem.text} to={menuItem.path}>
          <ListItemButton>
            <ListItemIcon>{menuItem.icon}</ListItemIcon>
            <ListItemText primary={menuItem.text} />
          </ListItemButton>
        </Link>
      ))}
    </div>
  );
};

SideNav.propTypes = {};
SideNav.defaultProps = {
  open: true,
};

export default SideNav;
