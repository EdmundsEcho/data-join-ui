// src/components/shared/EtlUnitParameter.jsx

/**
 *
 * EtlView-related (see EtlUnit/workbench for related but different)
 *
 * Display a quality, component or mspan in a table row format.
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import MeasurementCutIcon from '@mui/icons-material/PieChart';
import TimeSpanIcon from '@mui/icons-material/DateRange';

import { isEtlFieldDerived as isDerived } from '../../lib/filesToEtlUnits/headerview-helpers';

import { PURPOSE_TYPES as TYPES } from '../../lib/sum-types';

//-----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Row view of an EtlUnit parameter
 */
const EtlUnitParameterTbl = (props) => {
  const {
    className,
    data: { field, rowId },
    handleClick, // update parent state
    tableCellTrash, // ~ render prop component
    hover,
  } = props;

  return (
    <TableRow
      key={field.name}
      className={clsx(className)}
      onClick={() => handleClick(field.name)}
      hover={hover}
    >
      <TableCell align='center' className={clsx('etlUnitParameter', 'iconCell')}>
        {field.purpose === TYPES.MSPAN ? (
          <TimeSpanIcon
            className={clsx('Luci-Icon', 'mspan', 'small')}
            color='secondary'
          />
        ) : (
          <MeasurementCutIcon
            className={clsx('Luci-Icon', 'component', 'small')}
            color='secondary'
          />
        )}
      </TableCell>
      <TableCell align='left'>
        <Typography variant='body1' noWrap>
          {field.name}
          {isDerived(field) && <span> (derived)</span>}
        </Typography>
      </TableCell>
      {tableCellTrash(field.name, rowId === 0 ? TYPES.MSPAN : TYPES.MCOMP)}
    </TableRow>
  );
};

EtlUnitParameterTbl.propTypes = {
  className: PropTypes.string.isRequired,
  data: PropTypes.shape({
    field: PropTypes.shape({
      name: PropTypes.string.isRequired,
      purpose: PropTypes.oneOf(Object.values(TYPES)).isRequired,
    }).isRequired,
    rowId: PropTypes.number.isRequired,
  }).isRequired,
  handleClick: PropTypes.func.isRequired,
  tableCellTrash: PropTypes.func.isRequired, // (fieldName, purpose)
  hover: PropTypes.bool,
};
EtlUnitParameterTbl.defaultProps = {
  hover: false,
};

export default EtlUnitParameterTbl;
