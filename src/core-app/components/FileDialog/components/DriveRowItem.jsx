/**
 * @description
 * Part of the Drive dialog
 * Displays a single drive entry.
 *
 * @component
 */
import React from 'react';
import PropTypes from 'prop-types';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { Google } from '@mui/icons-material';
import Icon from '@mui/material/Icon';

function DriveRow(props) {
  const {
    displayName,
    fetchDirectory, // pre-configured fn
  } = props;

  // Map displayName -> Icon
  const providerIcon = {
    google: <Google />,
    msgraph: <span className='iconify' data-icon='mdi:microsoft-azure'></span>,
    dropbox: <span className='iconify' data-icon='mdi:dropbox'></span>,
  }[displayName];

  return (
    <TableRow hover onClick={fetchDirectory}>
      <TableCell align='center'>
        <span className='google-drive'>
          <Icon>{providerIcon}</Icon>
        </span>
      </TableCell>
      <TableCell className='filename' align='left'>
        {displayName}
      </TableCell>
      <TableCell className='filesize' align='right'>
        {}
      </TableCell>
    </TableRow>
  );
}

DriveRow.propTypes = {
  displayName: PropTypes.string.isRequired,
  fetchDirectory: PropTypes.func.isRequired,
};

export default DriveRow;
