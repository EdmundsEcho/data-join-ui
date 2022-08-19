/**
 *
 * Part of the File dialog
 * Displays a single file entry.
 *
 * @component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Folder from '@mui/icons-material/Folder';
import CheckBoxRounded from '@mui/icons-material/CheckBoxRounded';
import CheckBoxOutlineRounded from '@mui/icons-material/CheckBoxOutlineBlankRounded';

import { formatFileSize } from '../../../utils/common';
// import { filesConfirmRemovingFileText } from '../../../constants/strings';

// 📖 Redux
import { isFileSelected } from '../../../ducks/rootSelectors';

function FileRowItem(props) {
  const { path, displayName, isDirectory, size, fetchDirectory, toggleFile } =
    props;

  // "keep state local"
  // Computing isSelected locally may help prevent re-rendering the whole
  // list of files with each toggle.
  const isSelected = useSelector((state) => isFileSelected(state, path));

  return (
    <TableRow
      hover
      onClick={
        isDirectory ? () => fetchDirectory() : () => toggleFile(!isSelected)
      }>
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

FileRowItem.propTypes = {
  path: PropTypes.string, // not required for directories
  displayName: PropTypes.string.isRequired,
  isDirectory: PropTypes.bool.isRequired,
  fetchDirectory: PropTypes.func,
  toggleFile: PropTypes.func,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
FileRowItem.defaultProps = {
  size: null,
  toggleFile: undefined,
  fetchDirectory: undefined,
  path: undefined,
};

export default FileRowItem;
