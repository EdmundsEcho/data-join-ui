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

import DriveRowItem from './DriveRowItem';
import FileRowItem from './FileRowItem';

import { STATUS } from '../../../ducks/rootSelectors';

/* eslint-disable no-console */

/**
 * @component
 */
function ListOfFiles(props) {
  const {
    className,
    files,
    fetchDirectory,
    fetchParentPath,
    toggleFile,
    viewStatus,
  } = props;

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <TableContainer className={className}>
      <Table
        stickyHeader
        size='small'
        className={clsx('Luci-Table-fileDirectory')}>
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
          {/* Spinner while pending */}
          {viewStatus === STATUS.pending && (
            <TableRow
              sx={{
                mt: '55px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
              }}>
              <td>
                <i className='spinner spinner-lucivia' />
              </td>
            </TableRow>
          )}
          {/* First row link to parent when exists */}
          {fetchParentPath && (
            <FileRowItem
              displayName='Up Directory...'
              fetchDirectory={fetchParentPath}
              isDirectory
            />
          )}
          {/* subsequent rows: drive or files ... */}
          {/* 🗄️  or 📁 subsequent rows: drive or files ... */}
          {files.length > 0 &&
            files.map((file) =>
              file.is_drive ? (
                <DriveRowItem
                  key={file.file_id}
                  displayName={file.display_name}
                  fetchDirectory={() =>
                    fetchDirectory({
                      token_id: file.token_id,
                      path_query: null,
                      display_name: file.display_name,
                    })
                  }
                />
              ) : (
                <FileRowItem
                  key={file.file_id}
                  displayName={file.display_name}
                  isDirectory={file.is_directory}
                  {...file}
                  // when directory, search the remote drive
                  fetchDirectory={() =>
                    fetchDirectory({
                      path_query: file.file_id, // for searching remote drive
                    })
                  }
                  // OR when !directory, download and analyze a file
                  toggleFile={(isSelected) =>
                    toggleFile({
                      fileId: file.file_id,
                      path: file.path,
                      displayName: file.display_name,
                      isSelected,
                    })
                  }
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
  fetchParentPath: PropTypes.func,
  fetchDirectory: PropTypes.func.isRequired,
  toggleFile: PropTypes.func,
  viewStatus: PropTypes.oneOf(Object.values(STATUS)).isRequired,
};

ListOfFiles.defaultProps = {
  fetchParentPath: undefined,
  toggleFile: undefined,
};

export default ListOfFiles;
