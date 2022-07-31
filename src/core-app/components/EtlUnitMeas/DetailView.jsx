// src/components/EtlUnitMeas/DetailView.jsx

/**
 *
 * Detail view of the EtlUnitMeas component
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import EtlUnitParameter from '../shared/EtlUnitParameter';

import { debug, useTraceUpdate } from '../../constants/variables';

//-----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';
/* eslint-disable no-console */

/**
 * Measurement EtlUnit Detail view
 */
const DetailView = (props) => {
  const {
    meaRelatedFields, // for this specific etlUnit
    selectedFieldName, // parent state
    handleClick, // update parent state
    tableCellTrash, // ~ render prop component
    hover,
  } = props;

  useTraceUpdate(props);

  if (DEBUG) {
    console.debug(`%crendering EtlUnitMeas DetailView`, debug.color.green);
    console.dir(props);
  }

  return (
    <Table className={clsx('Luci-Table', 'detailView', 'etlUnitMeas')}>
      <TableBody>
        {meaRelatedFields.map((field, rowId) => (
          <EtlUnitParameter
            key={field.name}
            data={{ field, rowId }}
            tableCellTrash={tableCellTrash}
            handleClick={handleClick}
            className={field.name === selectedFieldName ? 'selected' : 'active'}
            onClick={() => handleClick(field.name)}
            hover={hover}
          />
        ))}
      </TableBody>
    </Table>
  );
};

DetailView.propTypes = {
  meaRelatedFields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  handleClick: PropTypes.func.isRequired,
  selectedFieldName: PropTypes.string.isRequired,
  tableCellTrash: PropTypes.func.isRequired, // (fieldName, purpose)
  hover: PropTypes.bool,
};
DetailView.defaultProps = {
  hover: false,
};

export default DetailView;
