// src/components/EtlUnitMeas.jsx

/**
 *
 * @module components/EtlUnitMeas
 *
 * @description
 * Display the etlUnit::measurement. Parent is EtlFieldView.
 *
 */
// import React, { useState, useEffect, useRef } from 'react';
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

import SummaryDetailRow from './shared/SummaryDetailRow';
import EtlUnitsTitleRow from './EtlUnitMeas/MeaUnitTitleRow';
import DetailView from './EtlUnitMeas/DetailView';

import {
  timeIntervalUnitOptions,
  debug,
  useTraceUpdate,
} from '../constants/variables';
import { FIELD_TYPES } from '../lib/sum-types';
import { InvalidStateError } from '../lib/LuciErrors';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';
/* eslint-disable no-console */

/**
 * Each row represents an etlUnit::measurement.
 *
 * The onOpenNewCompDialog prop is a callback that updates
 * the local state of the EtlFieldView/component component.
 *
 * @component
 *
 * @category Component
 *
 */
const EtlUnitMeas = (props) => {
  const {
    meaEtlUnits, // 📖
    meaRelatedEtlFields, // 📖
    onRowSelect, // ☎️
    onOpenNewCompDialog, // ☎️
    selectedFieldName, // state
    enableAddNewField, // func
    tableCellTrash, // func
  } = props;

  useTraceUpdate(props);

  /* eslint-disable no-console */
  if (process.env.REACT_APP_DEBUG_RENDER === 'true')
    console.debug(`%crendering EtlUnitMeas (Measurement)`, debug.color.green);

  if (DEBUG) {
    console.dir(props);
  }

  const etlUnitFieldsData = (mvalueName) => {
    const result = [
      meaEtlUnits[mvalueName].mspan,
      ...meaEtlUnits[mvalueName].mcomps,
    ].map((meaRelatedFieldName) =>
      meaRelatedEtlFields.find((field) => field.name === meaRelatedFieldName),
    );

    return result;
  };

  // mvalue fields in the related fields
  const meaEtlFields = meaRelatedEtlFields.filter(
    (field) => field.purpose === 'mvalue',
  );

  const handleOpenNewCompDialog = (mvalue) => {
    onOpenNewCompDialog(mvalue);
  };

  const mkTimeSpan = ({ time }) => {
    try {
      if (time == null || time.interval == null) return '';
      return `${time.interval.count} ${
        timeIntervalUnitOptions[time.interval.unit]
      }`;
    } catch (e) {
      return console.warn('Failed mspan creation attempt');
    }
  };

  return (
    <Main
      titleRow={<EtlUnitsTitleRow />}
      tableBody={
        <EtlUnits
          enableAddNewField={enableAddNewField}
          etlUnitFieldsData={etlUnitFieldsData}
          handleOpenNewCompDialog={handleOpenNewCompDialog}
          meaEtlFields={meaEtlFields}
          meaEtlUnits={meaEtlUnits}
          meaRelatedEtlFields={meaRelatedEtlFields}
          mkTimeSpan={mkTimeSpan}
          onRowSelect={onRowSelect}
          selectedFieldName={selectedFieldName}
          tableCellTrash={tableCellTrash}
        />
      }
    />
  );
};

EtlUnitMeas.propTypes = {
  meaRelatedEtlFields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  meaEtlUnits: PropTypes.objectOf(
    PropTypes.shape({
      type: PropTypes.string,
      subject: PropTypes.string,
      mspan: PropTypes.string,
      mcomps: PropTypes.arrayOf(PropTypes.string),
      codomain: PropTypes.string,
      'codomain-reducer': PropTypes.oneOf([
        'SUM',
        'AVG',
        'FIRST',
        'LAST',
        'COUNT',
      ]),
      'slicing-reducer': PropTypes.oneOf(['SUM', 'AVG', 'COUNT']),
    }),
  ).isRequired,
  selectedFieldName: PropTypes.string.isRequired,
  onRowSelect: PropTypes.func.isRequired,
  onOpenNewCompDialog: PropTypes.func.isRequired,
  enableAddNewField: PropTypes.func.isRequired,
  tableCellTrash: PropTypes.func.isRequired, // (fieldName, purpose)
};

function Main({ titleRow, tableBody }) {
  return (
    <Table className={clsx('Luci-Table', 'etlUnitMeas')}>
      <TableHead>{titleRow}</TableHead>
      <TableBody>{tableBody}</TableBody>
    </Table>
  );
}
Main.propTypes = {
  titleRow: PropTypes.node.isRequired,
  tableBody: PropTypes.node.isRequired,
};

/**
 *
 * Display for each EtlUnit:meas named using mvalue.
 *
 *    👉 Summary row: mvalue summary
 *    👉 Detail view: ?mcomps and mspan
 *
 * 🚧 Mostly read-only for now
 *
 *    ⬜ Allow the user to change the field names
 *       👉 change each of the alias values in eeach of the header views
 *       👉 and re-run the pivot routines)
 *
 *    ✅ Allow the addition of a new group-by-file field
 *
 * ⚠️  State depends on selectedFieldName, meaEtlFields.
 *
 */
function EtlUnits({
  enableAddNewField, // func
  etlUnitFieldsData,
  handleOpenNewCompDialog,
  meaEtlFields,
  meaEtlUnits,
  meaRelatedEtlFields, // 📖
  mkTimeSpan,
  onRowSelect,
  selectedFieldName,
  tableCellTrash,
}) {
  if (typeof meaRelatedEtlFields === 'undefined') {
    throw new InvalidStateError(`EtlUnitMeas did not get the data`);
  }

  return meaEtlFields.map((mvalue) => {
    return (
      <SummaryDetailRow
        key={`${mvalue.name}`}
        className='Luci-EtlFieldView'
        stateId={`${mvalue.name}`}
        fieldType={FIELD_TYPES.ETL}
        isSelected={mvalue.name === selectedFieldName}
        viewDetail={false}
        hover
        onToggleDetailView={() => onRowSelect(mvalue.name)}
        togglerCellPosition='first' // 'first' | 'last'
        DetailViewComponent={
          <DetailView
            meaRelatedFields={etlUnitFieldsData(mvalue.name)}
            handleClick={onRowSelect} // selected field name
            selectedFieldName={selectedFieldName} // local
            tableCellTrash={tableCellTrash}
            hover
          />
        }
      >
        {/* Field Name */}
        <TableCell onClick={() => onRowSelect(mvalue.name)}>
          <Typography variant='body1' noWrap>
            {mvalue.name}
          </Typography>
        </TableCell>

        {/* Data Cuts */}
        <TableCell align='center'>
          <Grid container className={clsx('componentCountCell')}>
            <Grid item xs>
              <Typography>{meaEtlUnits[mvalue.name].mcomps.length}</Typography>
            </Grid>
            {enableAddNewField(mvalue.name) ? (
              <Grid item xs={6}>
                <IconButton
                  className={clsx('Luci-Icon', 'addMeaImpliedFieldButton')}
                  onClick={() => handleOpenNewCompDialog(mvalue.name)}
                  size="large">
                  <AddIcon fontSize='small' />
                </IconButton>
              </Grid>
            ) : null}
          </Grid>
        </TableCell>

        {/* Timing */}
        <TableCell align='center' onClick={() => onRowSelect(mvalue.name)}>
          <Typography variant='body1' noWrap>
            {
              meaRelatedEtlFields.find(
                (field) => field.name === meaEtlUnits[mvalue.name].mspan,
              ).name
            }
          </Typography>
        </TableCell>

        {/* Interval */}
        <TableCell align='center'>
          <Typography variant='body1' noWrap>
            {mkTimeSpan(
              meaRelatedEtlFields.find(
                (field) => field.name === meaEtlUnits[mvalue.name].mspan,
              ),
            )}
          </Typography>
        </TableCell>

        {/* Toggle TableCell comes for free */}
        {/* <SummaryDetailRow.TogglerCell /> */}
      </SummaryDetailRow>
    );
  });
}
EtlUnits.propTypes = {
  enableAddNewField: PropTypes.func.isRequired, // func
  etlUnitFieldsData: PropTypes.func.isRequired,
  handleOpenNewCompDialog: PropTypes.func.isRequired,
  meaEtlFields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  meaEtlUnits: PropTypes.shape({}).isRequired,
  // meaRelatedEtlFields: PropTypes.shape({}).isRequired,
  mkTimeSpan: PropTypes.func.isRequired,
  onRowSelect: PropTypes.func.isRequired,
  selectedFieldName: PropTypes.string.isRequired,
};

export default EtlUnitMeas;
