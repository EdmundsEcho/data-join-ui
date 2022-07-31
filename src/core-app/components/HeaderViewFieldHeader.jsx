// src/components/HeaderViewFieldHeader.jsx

/**
 * @module components/HeaderViewFieldHeader
 *
 */
import React from 'react';
// import PropTypes from 'prop-types';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import ToggleIncludeField from './shared/ToggleIncludeField';

/**
 * HeaderView Title Row
 * Static
 *
 * 🔖 See HeaderViewField for the data rows.
 *
 */
function HeaderViewFieldHeader() {
  return (
    <TableRow>
      {/* Placeholder Exclude Button */}
      <TableCell className='excludeCell' align='center'>
        <ToggleIncludeField color='primary' checked />
      </TableCell>

      <TableCell className='fieldnameCell' align='left'>
        <Typography noWrap>Field Name</Typography>
      </TableCell>

      <TableCell className='aliasCell' align='left'>
        <Typography noWrap>Alias</Typography>
      </TableCell>

      <TableCell className='purposeCell' align='center'>
        <Typography noWrap>Purpose</Typography>
      </TableCell>

      <TableCell className='levelsCell' align='center'>
        <Typography noWrap>Levels</Typography>
      </TableCell>

      <TableCell className='nullsCell' align='center'>
        <Typography>Nulls</Typography>
      </TableCell>

      {/* toggle placeholder */}
      <TableCell className='toggleDetailCell' />
    </TableRow>
  );
}
HeaderViewFieldHeader.propTypes = {};

export default HeaderViewFieldHeader;
