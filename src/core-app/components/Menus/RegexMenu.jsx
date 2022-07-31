// src/components/Menues/RegexMenu

/**
 * @module components/Menus/RegexMenu
 * @description
 */
import React from 'react';
import PropTypes from 'prop-types';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// import ErrorBoundary from '../shared/ErrorBoundary';

import { regexTags } from '../../lib/regex';
import { ValueError } from '../../lib/LuciErrors';

const ITEM_HEIGHT = 48;

/**
 * WIP - likely want to create a generic version, where the menu items are a
 * prop.
 *
 * @component
 *
 * @category Components
 */
function RegexMenu({ name, purpose, handleParseCommand, disabled }) {
  if (!Object.keys(regexTags).includes(purpose)) {
    throw new ValueError(
      `The purpose sent to the regex menue is not supported: ${purpose}\nSupported: ${JSON.stringify(
        Object.keys(regexTags),
      )}`,
    );
  }

  const [anchorEl, setAnchorEl] = React.useState(() => null);
  const open = Boolean(anchorEl);

  // display the menu
  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  // close and propogate e ->  synthetic event
  const handleClose = (e) => {
    const { tag: value } = e.currentTarget.dataset;
    if (typeof value !== 'undefined')
      handleParseCommand({ target: { name, value } });
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        size='small'
        aria-label='parsers'
        onClick={handleClick}
        disabled={disabled}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={name}
        key={name}
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
          },
        }}
      >
        {regexTags[purpose].map((tag) => (
          <MenuItem key={tag} dense data-tag={tag} onClick={handleClose}>
            {tag}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

RegexMenu.propTypes = {
  name: PropTypes.string.isRequired,
  purpose: PropTypes.string.isRequired,
  handleParseCommand: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default RegexMenu;
