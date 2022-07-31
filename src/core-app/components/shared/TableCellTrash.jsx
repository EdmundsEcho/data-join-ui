// src/components/shared/TableCellTrash.jsx

/**
 *
 * @module components/shared/TableCellTrash
 *
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import TableCell from '@mui/material/TableCell';
import TrashIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

import clsx from 'clsx';

import { PURPOSE_TYPES as TYPES } from '../../lib/sum-types';

function TableCellTrash({ className, purpose, fieldName, handleDelete }) {
  return (
    <TableCell align='center' className={clsx('trashCell', className)}>
      <IconButton
        className={clsx(
          'Luci-IconButton',
          {
            hover: ![TYPES.SUBJECT].includes(purpose),
          },
          { hidden: [TYPES.SUBJECT].includes(purpose) },
        )}
        onClick={() => handleDelete(fieldName)}
        aria-label='delete'
        size="large">
        <TrashIcon />
      </IconButton>
    </TableCell>
  );
}
TableCellTrash.propTypes = {
  className: PropTypes.string.isRequired,
  purpose: PropTypes.oneOf(Object.values(TYPES)).isRequired,
  fieldName: PropTypes.string.isRequired,
  handleDelete: PropTypes.func,
};
TableCellTrash.defaultProps = {
  handleDelete: () => {},
};

export default TableCellTrash;
