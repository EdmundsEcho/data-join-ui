import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ToolTip from '@mui/material/Tooltip';

import {
  useGridApiContext,
  gridExpandedSortedRowIdsSelector as gridRowIdsSelector,
  useGridSelector,
} from '@mui/x-data-grid-pro';

import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import SeriesIcon from '@mui/icons-material/LinearScale';
import WeightIcon from '@mui/icons-material/FitnessCenter';

import { SymbolMapMaker } from '../SymbolMapMaker';
import SlidingPopper from '../../../widgets/SlidingPopper';
import { PURPOSE_TYPES } from '../../lib/sum-types';
import {
  useLevelsApiContext,
  useLevelsDataContext,
  CONTEXTS,
} from '../../contexts/LevelsDataContext';
//------------------------------------------------------------------------------
//
const DEBUG = process.env.REACT_APP_DEBUG_LEVELS === 'true';
/* eslint-disable no-console */

/**
 * v0.3.11
 * Tools with dialog.  Todo: consider refactoring how we access and reference
 * this functionality.
 *
 */
const ValueGridTools = () => {
  const { getFieldValue, handleUpdateSymbols } = useLevelsApiContext();
  // print the type of handleUpdateSymbols, I want to confirm it's a function
  console.log('handleUpdateSymbols', typeof handleUpdateSymbols);
  const { purpose, fieldType, context } = useLevelsDataContext();
  const apiRef = useGridApiContext();

  // options for the symbol map maker
  const consumedOptions = useMemo(() => {
    return Object.keys((getFieldValue('map-symbols') ?? { arrows: {} }).arrows);
  }, [getFieldValue]);

  const options_ = useGridSelector(apiRef, gridRowIdsSelector);

  // options = levels ex options already configured
  const options = useMemo(
    () => options_.filter((o) => !consumedOptions.includes(o)),
    [options_, consumedOptions],
  );

  return [CONTEXTS.MATRIX, CONTEXTS.WORKBENCH].includes(context) ? null : (
    <Grid className={clsx('Luci-DataGrid-actions', fieldType)} item>
      {purpose === PURPOSE_TYPES.MCOMP ? (
        <ToolTip title='Series function'>
          <IconButton
            className='Luci-IconButton small series'
            tabIndex={-1}
            size='large'
          >
            <SeriesIcon />
          </IconButton>
        </ToolTip>
      ) : (
        <ToolTip title='Rollup function'>
          <IconButton
            className='Luci-IconButton small rollup'
            tabIndex={-1}
            size='large'
          >
            <LabelIcon />
          </IconButton>
        </ToolTip>
      )}
      {purpose === PURPOSE_TYPES.MCOMP && (
        <ToolTip title='Weighting function'>
          <IconButton
            className='Luci-IconButton small weight'
            tabIndex={-1}
            size='large'
          >
            <WeightIcon />
          </IconButton>
        </ToolTip>
      )}

      <SlidingPopper
        className='Luci-SymbolMapMaker-dialog'
        handle='.MuiTableHead-root' // class found in SymbolMapMaker
        placement='left-end'
        title='Levels Scrub Configuration'
        slots={{
          trigger: ScrubToolTip,
          content: SymbolMapMaker, // must have onDone
        }}
        slotProps={{
          content: {
            options,
            fieldType,
            onDone: () => {
              // will update gridRows newSymbol column
              if (handleUpdateSymbols) {
                handleUpdateSymbols();
              }
              console.log('symbol map onDone');
              if (DEBUG) {
                console.log('symbol map onDone');
              }
            },
          },
        }}
      />
    </Grid>
  );
};
ValueGridTools.propTypes = {};
ValueGridTools.defaultProps = {};

/* export for debugging */
export function ScrubToolTip({ onClick }) {
  return (
    <ToolTip title='Scrub function'>
      <IconButton
        className={clsx('Luci-IconButton', 'small')}
        tabIndex={-1}
        onClick={onClick} // handleClickOpen
        size='large'
      >
        <EditIcon />
      </IconButton>
    </ToolTip>
  );
}
ScrubToolTip.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default ValueGridTools;
