/**
 *
 * Component used to list FileRow components and filters
 * based on filterText prop.
 *
 * ⬆ LeftPane
 * 📖 files (as prop)
 * ⬇ FileRowItem
 *
 * @todo Get styling to work properly in cosmos.
 *
 * @module components/FileDialog/ListOfFiles
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import FileRowItem from './FileRowItem';
import DriveRowItem from './DriveRowItem';
// import { getParentPath } from '../../../utils/common';

/**
 * @component
 */
function ListOfFiles(props) {
  const {
    className,
    files,
    fetchDirectory,
    fetchProjectDrives,
    selected,
    toggleFile,
    selectProvider,
    isFilesView,
    isLoading,
  } = props;

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <TableContainer className={className}>
      <Table
        stickyHeader
        size='small'
        className={clsx('Luci-Table-fileDirectory')}
      >
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell className='filename'>
              <Typography noWrap>File Name</Typography>
            </TableCell>
            <TableCell className='filesize' align='right'>
              <Typography noWrap>File Size</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow
              sx={{
                mt: '55px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
              }}
            >
              <td>
                <i className='spinner spinner-lucivia spinner-lg' />
              </td>
            </TableRow>
          )}
          {/* First row depends on presence of dir */}
          {isFilesView && !isLoading && (
            <>
              <FileRowItem
                is_directory
                display_name='Show all drives...'
                path='root'
                file_id='root'
                fetchDirectory={fetchProjectDrives}
              />
              <FileRowItem
                is_directory
                display_name='Up Directory...'
                path='root'
                file_id='root'
                fetchDirectory={fetchDirectory}
              />
            </>
          )}
          {/* subsequent rows... */}
          {files.map((file) =>
            file.drive_provider ? (
              <DriveRowItem
                key={`${file.drive_provider}${file.project_id}`}
                {...file}
                selectProvider={selectProvider}
              />
            ) : (
              <FileRowItem
                key={file.path}
                file_id={file.file_id}
                {...file}
                toggleFile={toggleFile}
                fetchDirectory={fetchDirectory}
                isSelected={selected.indexOf(file.path) !== -1}
              />
            ),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ListOfFiles.propTypes = {
  className: PropTypes.string.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  path: PropTypes.string.isRequired,
  fetchDirectory: PropTypes.func.isRequired,
  fetchProjectDrives: PropTypes.func.isRequired,
  selectProvider: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.string),
  toggleFile: PropTypes.func.isRequired,
  parent: PropTypes.string,
  isFilesView: PropTypes.bool,
  isLoading: PropTypes.bool,
};

ListOfFiles.defaultProps = {
  selected: [],
  parent: 'root',
  isFilesView: true,
  isLoading: false,
};

export default ListOfFiles;
