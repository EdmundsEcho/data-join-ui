// src/components/Workbench/components/shared/ValueGridFileLevels.jsx

import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useSelector } from 'react-redux';

import Grid from '@mui/material/Grid';
// import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ToolTip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import WeightIcon from '@mui/icons-material/FitnessCenter';
import SeriesIcon from '@mui/icons-material/LinearScale';

// api (note: no use of action creators)
import { getFileLevels as fetchLevelsInner } from '../../services/api';
import { fileLevelsRequest } from '../../lib/filesToEtlUnits/levels-request';
import { InvalidStateError } from '../../lib/LuciErrors';
import { FIELD_TYPES, PURPOSE_TYPES } from '../../lib/sum-types';

import {
  getSelectionModelFile,
  getSelectionModelEtl,
} from '../../ducks/rootSelectors';
import ValueGridCore, { filterOperators } from './ValueGridCore';

//------------------------------------------------------------------------------
const DEBUG = false;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const columns = [
  { field: 'id', headerName: 'ID', hide: true },
  {
    field: 'level',
    headerName: 'Level',
    cellClassName: clsx('Luci-ValueGrid-cell', 'level'),
    sortable: true,
    filterOperators,
    flex: 1,
    // renderHeader: () => <SearchField />,
  },
  {
    field: 'newSymbol',
    headerName: 'Change to...',
    cellClassName: clsx('Luci-ValueGrid-cell', 'newLevel'),
    hide: true,
  },
  {
    field: 'count',
    headerName: 'Count',
    cellClassName: clsx('Luci-ValueGrid-cell', 'count'),
    type: 'number',
    hide: false,
    flex: 0.7,
  },
];
//-------------------------------------------------------------------------------
/**
 *
 * @function
 * @param {Object} edge
 * @return {GridRowModel} grid row model
 *
 */
const edgeToGridRowFn = (edge) => ({
  id: edge.node.level,
  level: edge.node.level,
  count: edge.node.count,
  newSymbol: edge?.newSymbol ?? '',
});
//-------------------------------------------------------------------------------
// api data -> grid
//
// 🔖 Calls the api directly
//    (i.e., without generating a redux action
//           thereby does not invoke middleware, nor reducers)
//
const fetchLevels =
  (projectId) =>
  ({ filter, ...rest }) => {
    return fetchLevelsInner({ projectId, ...filter, ...rest });
  };
const parseResponse = (response) => response.data.levels;
//-------------------------------------------------------------------------------
// When data :: derivedField
//
//     levels -> grid
//
const rowFromLevel = ([value, count]) => ({
  id: value,
  level: value,
  count,
  newSymbol: '',
});
//
//------------------------------------------------------------------------------
// 📌 The main component
//------------------------------------------------------------------------------
/**
 *
 * @component
 *
 */
const ValueGridFileLevels = ({ getValue, fieldType }) => {
  //
  // baseline selectAll levels
  //
  const selectAll = useMemo(
    () => fileLevelsRequest(getValue, fieldType),
    [fieldType, getValue],
  );

  const { projectId } = useParams();

  const selectionModel = useSelector((state) => {
    switch (fieldType) {
      case FIELD_TYPES.FILE:
        return getSelectionModelFile(
          state,
          getValue('filename'),
          getValue('header-idx'),
        );

      case FIELD_TYPES.ETL:
        return getSelectionModelEtl(state, getValue('name'));

      case FIELD_TYPES.WIDE:
        return {
          totalCount: getValue('levels').length,
          selectionModel: getValue('levels'),
          type: 'levels',
        };

      default:
        throw new InvalidStateError(`Unreachable`);
    }
  });

  //
  // group-by-file | wide-to-long-field
  //
  // ⬜ does not consider wide-to-long data in the ETL context
  // ... more generally, unify the wide etl view with what it
  //     the data presents when stacked with RAW
  //
  let isDerivedField =
    (getValue('map-files')?.arrows ?? false) || fieldType === FIELD_TYPES.WIDE;

  console.assert(
    (selectionModel.type === 'levels' && isDerivedField) || !isDerivedField,
    `The assertion failed: levels missing for derived: ${isDerivedField}`,
  );
  isDerivedField = selectionModel.type === 'levels';

  return (
    <div className='stack'>
      <Title fieldType={fieldType} />
      <ValueGridCore
        className={clsx('Luci-ValueGrid-fileLevels')}
        columns={columns}
        // 📖 both FILE and WIDE use the field-alias prop
        identifier={
          fieldType === FIELD_TYPES.ETL
            ? getValue('name')
            : getValue('field-alias')
        }
        purpose={getValue('purpose')}
        baseSelectAll={selectAll}
        fetchFn={fetchLevels(projectId)}
        normalizer={parseResponse}
        edgeToGridRowFn={edgeToGridRowFn}
        // required to determine the height of the grid
        selectionModel={selectionModel}
        // version of the grid
        feature='LIMIT'
        checkboxSelection={false}
        pageSize={30}
        // when data is a derivedField 📖
        rows={
          isDerivedField
            ? selectionModel.selectionModel.map(rowFromLevel)
            : undefined
        }
        DEBUG={DEBUG}
      />
      <Tools purpose={getValue('purpose')} fieldType={fieldType} />
    </div>
  );
};

// ValueGridFileLevels.whyDidYouRender = true;
ValueGridFileLevels.propTypes = {
  getValue: PropTypes.func.isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
};

ValueGridFileLevels.defaultProps = {};

function Title({ fieldType }) {
  return (
    <Grid container className={clsx('Luci-ValueGrid-header', fieldType)}>
      <Grid item>
        <Typography className={clsx('Luci-ValueGrid-title')} variant='h6'>
          Frequency count
        </Typography>
      </Grid>
    </Grid>
  );
}
Title.propTypes = {
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
};

function Tools({ purpose, fieldType }) {
  return (
    <Grid className={clsx('Luci-ValueGrid-actions', fieldType)} item>
      {purpose === PURPOSE_TYPES.MCOMP ? (
        <ToolTip title='Series function'>
          <IconButton
            className={clsx('Luci-IconButton', 'small', 'series')}
            tabIndex={-1}
            size='large'>
            <SeriesIcon />
          </IconButton>
        </ToolTip>
      ) : (
        <ToolTip title='Rollup function'>
          <IconButton
            className={clsx('Luci-IconButton', 'small', 'rollup')}
            tabIndex={-1}
            size='large'>
            <LabelIcon />
          </IconButton>
        </ToolTip>
      )}
      {purpose === PURPOSE_TYPES.MCOMP ? (
        <ToolTip title='Weighting function'>
          <IconButton
            className={clsx('Luci-IconButton', 'small', 'weight')}
            tabIndex={-1}
            size='large'>
            <WeightIcon />
          </IconButton>
        </ToolTip>
      ) : null}
      <ToolTip title='Scrubb function'>
        <IconButton
          className={clsx('Luci-IconButton', 'small')}
          tabIndex={-1}
          size='large'>
          <EditIcon />
        </IconButton>
      </ToolTip>
    </Grid>
  );
}
Tools.propTypes = {
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
  purpose: PropTypes.oneOf(Object.values(PURPOSE_TYPES)).isRequired,
};
export default ValueGridFileLevels;
