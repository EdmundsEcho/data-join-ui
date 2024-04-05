import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { DeleteButton, ForwardArrow } from './SymbolMapShared';

const SymbolMapItem = ({
  leftValue,
  rightValue: rightValueProp,
  onDelete,
  onUpdate,
  hideDelete,
  leftWidth,
  rightWidth,
  onUpdateStart,
  onUpdateEnd,
  disabled,
  ...fieldProps
}) => {
  const [rightValue, setRightValue] = useState(rightValueProp);

  const handleUpdate = () => {
    rightValue ? onUpdate(rightValue) : onDelete();
    onUpdateEnd();
  };
  return (
    <TableRow className='Luci-SymbolMapItem'>
      <TableCell size='small' sx={{ width: leftWidth }}>
        <TextField
          className='field left'
          {...fieldProps}
          disabled={disabled}
          align='left'
          required
          fullWidth
          variant='standard'
          value={leftValue}
          InputProps={{
            readOnly: true,
          }}
        />
      </TableCell>
      <TableCell align='center'>
        <ForwardArrow />
      </TableCell>
      <TableCell sx={{ width: rightWidth }}>
        <TextField
          className='field right'
          {...fieldProps}
          disabled={disabled}
          required
          align='left'
          fullWidth
          variant='standard'
          value={rightValue}
          onFocus={onUpdateStart}
          onChange={(e) => {
            setRightValue(e.target.value);
          }}
          onBlur={handleUpdate}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleUpdate();
            }
          }}
        />
      </TableCell>
      <TableCell>
        <DeleteButton hide={hideDelete} onDelete={onDelete} disabled={disabled} />
      </TableCell>
    </TableRow>
  );
};

SymbolMapItem.propTypes = {
  leftValue: PropTypes.string.isRequired,
  rightValue: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  hideDelete: PropTypes.bool,
  leftWidth: PropTypes.string.isRequired,
  rightWidth: PropTypes.string.isRequired,
  onUpdateStart: PropTypes.func,
  onUpdateEnd: PropTypes.func,
  disabled: PropTypes.bool,
};

/* eslint-disable no-console */
SymbolMapItem.defaultProps = {
  hideDelete: false,
  onUpdate: () => console.error('onUpdate not configured'),
  onDelete: () => console.error('onDelete not configured'),
  onUpdateStart: () => console.error('onUpdateStart not configured'),
  onUpdateEnd: () => console.error('onUpdateEnd not configured'),
  disabled: false,
};

export default SymbolMapItem;
