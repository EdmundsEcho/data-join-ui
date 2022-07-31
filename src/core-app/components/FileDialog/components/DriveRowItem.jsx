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

/* eslint camelcase: "off" */

function DriveRow(props) {
  const { drive_provider: driveProvider, selectProvider } = props;

  const providerIcon =
    {
      google: <Google />,
      msgraph: (
        <span className='iconify' data-icon='mdi:microsoft-azure'></span>
      ),
      dropbox: <span className='iconify' data-icon='mdi:dropbox'></span>,
    }[driveProvider] || null;

  return (
    <TableRow hover onClick={() => selectProvider(driveProvider)}>
      <TableCell align='center'>
        <Icon>{providerIcon}</Icon>
      </TableCell>
      <TableCell className='filename' align='left'>
        {driveProvider}
      </TableCell>
      <TableCell className='filesize' align='right'>
        {}
      </TableCell>
    </TableRow>
  );
}

DriveRow.propTypes = {
  drive_provider: PropTypes.string.isRequired,
  selectProvider: PropTypes.func.isRequired,
};

export default DriveRow;
