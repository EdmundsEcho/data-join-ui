// src/components/EtlUnitMeas/EtlUnitsTileRow.jsx

/**
 *
 * Title row for EtlUnitsMeas
 *
 */
import React from 'react';
// import PropTypes from 'prop-types';

import clsx from 'clsx';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import MeasurementCutIcon from '@mui/icons-material/PieChart';
import TimeSpanIcon from '@mui/icons-material/DateRange';
import TimeIntervalIcon from '@mui/icons-material/Timeline';

/**
 * Single row of column titles
 *
 * Field Name, Cuts, Timing, Interval
 *
 * 👍 Pure and fixed component value instantiated once and reused with
 *    subsequent renders driven elsewhere.
 *
 */
function MeaUnitTitleRow() {
  return (
    <TableRow>
      {/* placeholder */}
      <TableCell />

      {/* Field Name */}
      <TableCell align='left'>
        <Grid container className='headerWrapper'>
          <Grid item xs={12}>
            <Typography noWrap>Field Name</Typography>
          </Grid>
        </Grid>
      </TableCell>

      {/* Data Cuts */}
      <TableCell align='center'>
        <Grid container className='headerWrapper'>
          <Grid item xs={12}>
            <MeasurementCutIcon
              className={clsx('Luci-Icon', 'component', 'header')}
              color='secondary'
            />
          </Grid>
          <Grid item xs={12}>
            Cuts
          </Grid>
        </Grid>
      </TableCell>

      {/* Timing */}
      <TableCell align='center'>
        <Grid container className='headerWrapper'>
          <Grid item xs={12}>
            <TimeSpanIcon
              className={clsx('Luci-Icon', 'mspan', 'header')}
              color='secondary'
            />
          </Grid>
          <Grid item xs={12}>
            Timing
          </Grid>
        </Grid>
      </TableCell>

      {/* Interval */}
      <TableCell align='center'>
        <Grid container className='headerWrapper'>
          <Grid item xs={12}>
            <TimeIntervalIcon
              className={clsx('Luci-Icon', 'interval', 'header')}
              color='secondary'
            />
          </Grid>
          <Grid item xs={12}>
            Interval
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  );
}
MeaUnitTitleRow.propTypes = {};

export default MeaUnitTitleRow;
