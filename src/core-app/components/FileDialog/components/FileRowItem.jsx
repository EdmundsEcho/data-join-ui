/**
 *
 * Part of the File dialog
 * Displays a single file entry.
 *
 * @component
 */
import React from 'react';
import PropTypes from 'prop-types';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Folder from '@mui/icons-material/Folder';
import CheckBoxRounded from '@mui/icons-material/CheckBoxRounded';
import CheckBoxOutlineRounded from '@mui/icons-material/CheckBoxOutlineBlankRounded';

import { formatFileSize } from '../../../utils/common';
// import { filesConfirmRemovingFileText } from '../../../constants/strings';

/* eslint camelcase: "off" */

function FileRow(props) {
  const {
    display_name: displayName,
    is_directory: isDirectory,
    size,
    isSelected,
    fetchDirectory, // pre-configured fn
    toggleFile, // pre-configured fn
  } = props;

  return (
    <TableRow
      hover
      onClick={() => (isDirectory ? fetchDirectory() : toggleFile(!isSelected))}
    >
      {isDirectory ? (
        <TableCell align='center'>
          <Folder className='folderIcon' />
        </TableCell>
      ) : (
        <TableCell align='center'>
          <Checkbox
            className='checkbox'
            size='small'
            checked={isSelected}
            icon={<CheckBoxOutlineRounded color='disabled' />}
            checkedIcon={<CheckBoxRounded />}
            color='secondary'
          />
        </TableCell>
      )}
      <TableCell className='filename' align='left'>
        {displayName}
      </TableCell>
      <TableCell className='filesize' align='right'>
        {formatFileSize(size)}
      </TableCell>
    </TableRow>
  );
}

FileRow.propTypes = {
  display_name: PropTypes.string.isRequired,
  is_directory: PropTypes.bool.isRequired,
  fetchDirectory: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  size: PropTypes.number,
  toggleFile: PropTypes.func,
};
FileRow.defaultProps = {
  size: null,
  isSelected: false,
  toggleFile: undefined,
};

export default FileRow;
