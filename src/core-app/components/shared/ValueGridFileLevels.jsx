// src/components/Workbench/components/shared/ValueGridFileLevels.jsx

import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useSelector } from 'react-redux';

import Grid from '@mui/material/Grid';
// import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grow from '@mui/material/Grow';
import IconButton from '@mui/material/IconButton';
import ToolTip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import WeightIcon from '@mui/icons-material/FitnessCenter';
import SeriesIcon from '@mui/icons-material/LinearScale';

import { SymbolMapMaker } from '../SymbolMapMaker';
// 📡 Note: does not use actions (levels is outside of redux scope)
import { fetchFileLevels as fetchLevelsInner } from '../../services/api';

import { fileLevelsRequest } from '../../lib/filesToEtlUnits/levels-request';
import { InvalidStateError } from '../../lib/LuciErrors';
import { FIELD_TYPES, PURPOSE_TYPES } from '../../lib/sum-types';

import {
  getSelectionModelFile,
  getSelectionModelEtl,
} from '../../ducks/rootSelectors';
import ValueGridCore, { filterOperators, ROW_HEIGHT } from './ValueGridCore';
import useAbortController from '../../../hooks/use-abort-controller';

//------------------------------------------------------------------------------
const DEBUG = false;
//-----------------------------------------------------------------------------
const PAGE_SIZE =
  parseInt(process.env.REACT_APP_DEFAULT_VALUE_GRID_PAGE_SIZE, 10) || 90;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//
// ⚙️  for the value grid
//
const limitGridHeight = 9 * ROW_HEIGHT;
//
const gridOptions = {
  disableSelectionOnClick: true,
};
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
  (projectId, signal) =>
  ({ filter, ...rest }) => {
    return fetchLevelsInner({ projectId, signal, ...filter, ...rest });
  };
const parseRespData = (data) => data.levels;

/**
 * pre-process for tools version of levels
 */
const levelsForOptions = (parseRespData_) =>
  Object.values(parseRespData_).map((item) => item.level);
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
  const abortController = useAbortController();

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
  const hasArrows = getValue('map-files')?.arrows ?? false;

  let isDerivedField = hasArrows || fieldType === FIELD_TYPES.WIDE;

  if (!selectionModel.type === 'levels' && !isDerivedField && isDerivedField) {
    console.warn(
      `The assertion failed - model ${selectionModel.type} isDerived: ${isDerivedField} hasArrows: ${hasArrows}`,
    );
    console.dir(getValue('map-files'));
  }
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
        fetchFn={fetchLevels(projectId, abortController.signal)}
        abortController={abortController}
        limitGridHeight={limitGridHeight}
        normalizer={parseRespData}
        edgeToGridRowFn={edgeToGridRowFn}
        // required to determine the height of the grid
        selectionModel={selectionModel}
        // version of the grid
        feature='LIMIT'
        checkboxSelection={false}
        pageSize={PAGE_SIZE}
        // when data is a derivedField 📖
        rows={
          isDerivedField
            ? selectionModel.selectionModel.map(rowFromLevel)
            : undefined
        }
        DEBUG={DEBUG}
        {...gridOptions}
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

/**
 * v0.3.11
 * Transition for the dialog
 */
const CustomGrowTransition = React.forwardRef((props, ref) => {
  return (
    <Grow ref={ref} {...props} style={{ transformOrigin: 'bottom right' }} />
  );
});
CustomGrowTransition.displayName = 'CustomGrowTransition';

/**
 * v0.3.11
 * Tools with dialog.  Todo: consider refactoring how we access and reference
 * this functionality.
 *
 */
function Tools({ purpose, fieldType, levels = [] }) {
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid className={clsx('Luci-ValueGrid-actions', fieldType)} item>
      {purpose === PURPOSE_TYPES.MCOMP ? (
        <ToolTip title='Series function'>
          <IconButton
            className={clsx('Luci-IconButton', 'small', 'series')}
            tabIndex={-1}
            size='large'
          >
            <SeriesIcon />
          </IconButton>
        </ToolTip>
      ) : (
        <ToolTip title='Rollup function'>
          <IconButton
            className={clsx('Luci-IconButton', 'small', 'rollup')}
            tabIndex={-1}
            size='large'
          >
            <LabelIcon />
          </IconButton>
        </ToolTip>
      )}
      {purpose === PURPOSE_TYPES.MCOMP ? (
        <ToolTip title='Weighting function'>
          <IconButton
            className={clsx('Luci-IconButton', 'small', 'weight')}
            tabIndex={-1}
            size='large'
          >
            <WeightIcon />
          </IconButton>
        </ToolTip>
      ) : null}
      <ToolTip title='Scrub function'>
        <IconButton
          className={clsx('Luci-IconButton', 'small')}
          tabIndex={-1}
          onClick={handleClickOpen}
          size='large'
        >
          <EditIcon />
        </IconButton>
      </ToolTip>

      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={CustomGrowTransition}
        aria-labelledby='symbol-map-maker-dialog-title'
        aria-describedby='symbol-map-maker-dialog-description'
      >
        <SymbolMapMaker onClose={handleClose} levels={levels} />
      </Dialog>
    </Grid>
  );
}
Tools.propTypes = {
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
  purpose: PropTypes.oneOf(Object.values(PURPOSE_TYPES)).isRequired,
  levels: PropTypes.arrayOf(PropTypes.string),
};
Tools.defaultProps = {
  levels: [],
};

export default ValueGridFileLevels;
