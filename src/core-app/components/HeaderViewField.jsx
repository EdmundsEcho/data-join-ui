// src/components/HeaderViewField.jsx

/**
 *
 * ⬆ Parent: HeaderView, provides filename (uid prop)
 * 📖 headerView retrieved using filename
 *
 * ⬇ Table with a row for each field in the header
 *   (presents summary view, and toggles a detailed view)
 *
 *   ⬇  HeaderViewField for each field in the header
 *   ✨ useSourceInterface for the field instance
 *      📖 field instance in headerView.fields (filename, fieldIdx)
 *      ☎️  excludeField (active in "summary-view")
 *      ☎️  handleUpdateAlias (active in "summary-view")
 *
 *      ... detailed view:
 *      ⬇  HeaderViewFieldDelegate for each field in the header
 *         📖 field instance in headerView.fields (filename, fieldIdx)
 *         ☎️  onChange (uses updateField)
 *
 * @module components/HeaderViewField
 *
 */
import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import { useSelector, shallowEqual, useDispatch } from 'react-redux';

// import Input from '@mui/material/Input';
import Link from '@mui/material/Link';
import TableCell from '@mui/material/TableCell';

// import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import HeaderFieldDetailView from './HeaderFieldDetailView';

import ToggleIncludeField from './shared/ToggleIncludeField';
import SummaryDetailRow from './shared/SummaryDetailRow';
import PurposeButtons from './shared/PurposeButtons';
import TextField from './shared/TextField';

import { prettyNumber } from '../utils/common';

// data
import { updateFileField } from '../ducks/actions/headerView.actions';
import {
  selectFieldInHeader,
  getHasImpliedMvalue,
} from '../ducks/rootSelectors';
import { FIELD_TYPES } from '../lib/sum-types';

import { Context as HeaderViewContext } from './HeaderViewContext';

// debug
import { debug } from '../constants/variables';

/* eslint-disable no-console */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER === 'true';

/**
 * Render a table row. Each row represents a field.
 * There are two layers of field data:
 * * summary view (enabled, alias, purpose)
 * * "detail-view" (purpose-specific props)
 *
 * @component
 *
 */
const HeaderViewField = ({ fieldIdx, stateId }) => {
  //
  const { filename, hideInactive } = useContext(HeaderViewContext);

  if (DEBUG) {
    console.debug(`%crendering HeaderViewField`, debug.color.green);
  }

  const dispatch = useDispatch();

  const fieldData = useSelector(
    (state) => selectFieldInHeader(state, filename, fieldIdx),
    shallowEqual,
  );

  const hasImpliedMvalue = useSelector((state) =>
    getHasImpliedMvalue(state, filename),
  );

  const getValue = useCallback(
    (fieldName) => fieldData[fieldName],
    [fieldData],
  );

  const handleSaveChange = useCallback(
    (e) =>
      dispatch(
        updateFileField(filename, fieldIdx, e.target.name, e.target.value),
      ),
    [dispatch, fieldIdx, filename],
  );

  const handleExcludeField = useCallback(
    () =>
      dispatch(
        updateFileField(filename, fieldIdx, 'enabled', !fieldData.enabled),
      ),
    [dispatch, fieldData.enabled, fieldIdx, filename],
  );

  const saveAlias = useCallback(
    (e) => {
      // do nothing if no change
      if (getValue('field-alias') === e.target.value) return;

      // reset to default if blank
      if (e.target.value === '') {
        const syntheticEvent = {
          target: {
            name: 'field-alias',
            value: getValue('default-name'),
          },
        };
        handleSaveChange(syntheticEvent);
        return;
      }

      // otherwise, update field-alias
      handleSaveChange(e);
    },
    [getValue, handleSaveChange],
  );

  const hasNullValues = getValue('null-value-count') > 0;

  return hideInactive && !getValue('enabled') ? null : (
    <SummaryDetailRow
      className='Luci-HeaderViewField'
      key={`${stateId}|expansion-row`}
      stateId={`${stateId}|expansion-row`}
      fieldType={FIELD_TYPES.FILE}
      isDisabled={!fieldData.enabled}
      isExpandable
      viewDetail={false}
      togglerCellPosition='last' // 'first' | 'last'
      DetailViewComponent={
        /* detailed view */
        /* delegate purpose-specific inputs */
        <HeaderFieldDetailView
          key={`${stateId}|expansion-row-delegate`}
          stateId={`${stateId}|expansion-row-delegate`}
          fieldType={FIELD_TYPES.FILE}
          fieldIdx={fieldIdx}
          filename={filename}
          getValue={getValue}
          saveChange={handleSaveChange}
          hasNullValues={hasNullValues}
          hasImpliedMvalue={hasImpliedMvalue}
        />
      }
    >
      {/* Summary view */}
      {/* Children of SummaryDetailRow */}

      {/* Exclude Button - read/write */}
      <TableCell align='center'>
        <Button
          id={`${stateId}|enabled`}
          size='small'
          disableElevation
          onClick={handleExcludeField}
          style={{
            cursor: 'pointer',
          }}
        >
          <ToggleIncludeField color='primary' checked={fieldData.enabled} />
        </Button>
      </TableCell>

      {/* Field Name - read-only */}
      <TableCell align='left'>
        <button
          type='button'
          tabIndex={-1}
          underline='none'
          variant='body1'
          color='textSecondary'
          style={{ cursor: 'pointer' }}
          onClick={handleExcludeField}
        >
          <Typography>{getValue('default-name')}</Typography>
        </button>
      </TableCell>

      {/* Alias - read-write */}
      {/* Note: only display alias when different from default-name */}
      <TableCell align='left'>
        <TextField
          key={`${stateId}|field-alias|${getValue('field-alias')}`}
          stateId={`${stateId}|field-alias`}
          name='field-alias'
          disabled={!fieldData.enabled}
          margin='dense'
          value={
            getValue('default-name') === getValue('field-alias')
              ? ''
              : getValue('field-alias')
          }
          saveChange={saveAlias}
        />
      </TableCell>

      {/* Purpose - read-write */}
      <TableCell align='center'>
        <PurposeButtons
          key={`${stateId}|purpose`}
          stateId={`${stateId}|purpose`}
          disabled={!fieldData.enabled}
          name='purpose'
          value={getValue('purpose')}
          onChange={handleSaveChange}
          showSubject
          showQuality
          showComponent
          showTiming
          showValue
        />
      </TableCell>

      {/* Number of Levels - read-only */}
      <TableCell align='center'>{prettyNumber(getValue('nlevels'))}</TableCell>

      {/* Number of Null values - read-only */}
      <TableCell align='center'>
        {hasNullValues ? prettyNumber(getValue('null-value-count')) : null}
      </TableCell>

      {/* 'last' Toggle TableCell comes for free */}
    </SummaryDetailRow>
  );
};

// 🔧
HeaderViewField.whyDidYouRender = true;
HeaderViewField.displayName = 'HeaderViewField';

HeaderViewField.propTypes = {
  fieldIdx: PropTypes.number.isRequired,
  stateId: PropTypes.string.isRequired,
};

HeaderViewField.whyDidYouRender = {
  logOnDiffentValues: true,
};
export default React.memo(HeaderViewField);
