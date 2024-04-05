import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export const DeleteButton = ({ hide, onDelete, ...rest }) => (
  <IconButton
    sx={{
      visibility: hide ? 'hidden' : 'visible',
      fontSize: '1.2em',
    }}
    aria-label='delete'
    onClick={onDelete}
    {...rest}
  >
    <DeleteIcon sx={{ fontSize: '1.2em' }} />
  </IconButton>
);
// propTypes and defaultProps
DeleteButton.propTypes = {
  hide: PropTypes.bool,
  onDelete: PropTypes.func,
  rest: PropTypes.shape({}),
};
DeleteButton.defaultProps = {
  hide: false,
  onDelete: () => {},
  rest: {},
};

export const ForwardArrow = ({ hide }) => (
  <ArrowForwardIosIcon
    sx={{
      visibility: hide ? 'hidden' : 'visible',
      fontSize: '1.2em',
    }}
  />
);

ForwardArrow.propTypes = {
  hide: PropTypes.bool,
};
ForwardArrow.defaultProps = {
  hide: false,
};
