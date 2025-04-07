/**
 * @description
 * Menu presentation component. Used to display a menu when a child is clicked.
 * Returns a *required* function which must be used by it's child to trigger the
 * menu. This allows for precise onClick detection for whatever your use case is.
 *
 * @example
 * <Menu>
 *  { onClick => (
 *    <Child onClick={ onClick } />
 *  )}
 * </Menu>
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import MaterialMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const Menu = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpen, setOpen] = React.useState(false);
  const { options, onItemClick, children } = props;

  // This is a hacky way to pass the anchor element without
  // requiring the parent of this component to deal with refs
  const handleClick = useCallback(({ target }) => {
    setAnchorEl(target);
    setOpen(true);
  }, []);

  const handleItemClick = (option, index) => {
    setOpen(false);
    onItemClick(option, index);
  };

  return options.length === 0 ? null : (
    <>
      {children(handleClick)}
      <MaterialMenu anchorEl={anchorEl} open={isOpen} onClose={() => setOpen(false)}>
        {options &&
          options.map((option, idx) => (
            <MenuItem key={option} onClick={() => handleItemClick(option, idx)}>
              {option}
            </MenuItem>
          ))}
      </MaterialMenu>
    </>
  );
};

Menu.propTypes = {
  children: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.string),
  onItemClick: PropTypes.func.isRequired,
};

Menu.defaultProps = {
  options: [],
  children: null,
};

export default Menu;
