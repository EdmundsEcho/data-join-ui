// src/components/shared/ToggleExpandTableCell.jsx

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DownArrow from '@mui/icons-material/ArrowDropDown';
import UpArrow from '@mui/icons-material/ArrowDropUp';

/**
 * Often used toggle to display/hide a detailed view.
 *
 * @component
 */
const Toggle = ({ onClick, collapsedState, align, style }) => {
  const toggle = useCallback((collapsed) => onClick(!collapsed), [onClick]);
  return (
    <TableCell align={align} onClick={() => toggle(collapsedState)}>
      <IconButton style={style} size="large">
        {collapsedState ? <UpArrow /> : <DownArrow />}
      </IconButton>
    </TableCell>
  );
};

Toggle.propTypes = {
  onClick: PropTypes.func.isRequired,
  collapsedState: PropTypes.bool,
  align: PropTypes.oneOf(['left', 'center', 'right']),
  style: PropTypes.shape(),
};

Toggle.defaultProps = {
  collapsedState: true,
  align: 'center',
  style: { padding: 0 },
};

export default Toggle;
