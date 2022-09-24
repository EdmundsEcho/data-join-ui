import React from 'react';
import { Link } from 'react-router-dom';
import ListItemButton from '@mui/material/ListItemButton';

import { ListItemIcon, ListItemText } from '@mui/material';

import { mainListItems } from '../router';

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
