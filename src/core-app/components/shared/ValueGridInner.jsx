// src/components/Workbench/components/shared/ValueGridInner.jsx

/**
 *
 * The DataGrid for displaying "levels" has a 3-layer configuration.
 *
 * The most inner component in the following:
 *
 *   👉 MatrixGrid, ValueGridWorkbench, ValueGridFileLevels
 *
 *      👉 ValueGridCore
 *         - provides the data-fetching interface
 *
 *         ✅ ValueGridInner
 *
 *           💡 Props remain unchanged given the set of values it displays
 *
 *            - Composes the DataGrid with custom components
 *            - Layout-specific configuration
 *            - Little-to-no local state
 *
 *            🔖 There is only one prop that triggers a re-render:
 *               ** MAX_ROWS **, a Footer prop
 *
 *   📌  Also exports filterOperator used to configure columns
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import {
  DataGridPro as DataGrid,
  GridOverlay,
  getGridStringOperators,
} from '@mui/x-data-grid-pro';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReplayIcon from '@mui/icons-material/Replay';
import LinearProgress from '@mui/material/LinearProgress';
import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';

//------------------------------------------------------------------------------
const DEBUG = false;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//----------------------------------------------------------------------------
// Display settings
//----------------------------------------------------------------------------
const HEADER_HEIGHT = 33;
const ROW_HEIGHT = 35;
const FOOTER_HEIGHT = 24;
const ADJUST_HEIGHT = 0;
export { ROW_HEIGHT };

/**
 *
 * Set the column prop filterOperators to this value to access the supported
 * string-related filters.
 *
 * 3 filter operators for levels
 *
 */
export const filterOperators = getGridStringOperators().filter(({ value }) =>
  ['contains', 'endsWith', 'startsWith'].includes(value),
);

//------------------------------------------------------------------------------
// grid selection model -> is row selected
const isRowSelectedWithReverseLogic = (rowId, model) =>
  model.findIndex((id) => id === rowId) === -1;
//------------------------------------------------------------------------------
// Custom components for the grid
// ⬜ reverse the css highlighting
//------------------------------------------------------------------------------
const Checkbox = React.forwardRef((e, ref) => {
  switch (true) {
    case e?.indeterminate ?? false:
      return <IndeterminateCheckBoxIcon ref={ref} color='primary' />;
    case e.checked:
      return <Clear ref={ref} />;
    default:
      return <Check ref={ref} color='primary' />;
  }
});
Checkbox.displayName = 'GridCheckbox';

//------------------------------------------------------------------------------
// Counter located in the footer
function Footer({
  apiRef,
  totalCount,
  inFilterState,
  clearFilterCallback: clearFilter,
  resetCallback: reset,
}) {
  return typeof totalCount === 'undefined' ? null : (
    <div className={clsx('MuiDataGrid-footer', 'EtlUnit-ValueGrid')}>
      <div className='tools'>
        <IconButton size='small' aria-label='reset' onClick={reset}>
          <ReplayIcon />
        </IconButton>
        <IconButton
          size='small'
          aria-label='toggle-filter'
          disabled={!inFilterState}
          onClick={clearFilter}>
          <FilterListIcon size='small' />
        </IconButton>
      </div>
      <div className={clsx('record-counts')}>
        {apiRef.current.getVisibleRowModels().size} of {totalCount}
      </div>
    </div>
  );
}
Footer.propTypes = {
  apiRef: PropTypes.shape({
    current: PropTypes.shape({
      getVisibleRowModels: PropTypes.func.isRequired,
    }),
  }).isRequired,
  totalCount: PropTypes.number,
  clearFilterCallback: PropTypes.func.isRequired,
  resetCallback: PropTypes.func.isRequired,
  inFilterState: PropTypes.bool,
};
Footer.defaultProps = {
  totalCount: undefined,
  inFilterState: false,
};
//------------------------------------------------------------------------------
// Grid overlay when loading
const CustomLoadingOverlay = () => {
  return (
    <GridOverlay>
      <div style={{ position: 'absolute', top: 0, width: '100%' }}>
        <LinearProgress />
      </div>
    </GridOverlay>
  );
};

/**
 * User is the parent, import to set the gridHeight prop
 *
 * Set the grid height using this function once the maxRecords
 * has been returned from the api.
 *
 * Schema:
 *      👉 MaxRecords is small: gridBody size based on maxRecords
 *      👉 MaxRecords is big: gridBody size using limitSize
 *
 * @function
 * @return {number}
 */
export const gridHeightFn = (
  maxRecords,
  limitGridHeight,
  rowHeightProp = undefined,
  headerHeightProp = undefined,
  gridHeightAdjustment = 0,
) => {
  if (DEBUG) {
    console.debug('gridHeightFn parameters:', {
      maxRecords,
      limitGridHeight,
      rowHeightProp,
      headerHeightProp,
    });
  }
  const headerHeight = headerHeightProp || HEADER_HEIGHT;
  const rowHeight = rowHeightProp || ROW_HEIGHT;
  const nonBody = headerHeight + FOOTER_HEIGHT + ADJUST_HEIGHT;
  const limitBodyHeight = limitGridHeight - nonBody;
  const gridBody =
    Math.min(limitBodyHeight, Math.max(2, maxRecords) * rowHeight) +
    gridHeightAdjustment;
  return gridBody + headerHeight + FOOTER_HEIGHT + ADJUST_HEIGHT;
};

//------------------------------------------------------------------------------
// Data grid options
// See the theme overrides for other formatting options
const options = (
  apiRef,
  MAX_ROWS,
  inFilterState,
  clearFilterCallback,
  resetCallback,
) => ({
  hideFooterSelectedRowCount: true,
  components: {
    LoadingOverlay: CustomLoadingOverlay,
    BaseCheckbox: Checkbox,
    Footer: function customFooter() {
      return (
        <Footer
          apiRef={apiRef}
          totalCount={MAX_ROWS}
          inFilterState={inFilterState}
          clearFilterCallback={clearFilterCallback}
          resetCallback={resetCallback}
        />
      );
    },
  },
});

//------------------------------------------------------------------------------
// The main component
//------------------------------------------------------------------------------
/**
 *
 * @component
 *
 */
const ValueGridInner = ({
  apiRef,
  columns,
  rows,
  // optional
  headerHeight,
  rowHeight,
  // grid height related
  MAX_ROWS,
  gridHeightProp, // use the exported gridHeight fn
  checkboxSelection,
  onFilterModelChange,
  handleClearFilter,
  onRowsScrollEnd,
  onToggleAll,
  onRowClick,
  resetFn,
  className,
  rowClassName,
  // state-related
  inFilterState,
  loading,
  error,
  ...rest
}) => {
  //
  // ---------------------------------------------------------------------------
  // State-machine toggles :/
  // ---------------------------------------------------------------------------
  // 🛈  🦀 Indirection seems required... not sure why
  const [iniRows] = useState(() => rows ?? []);

  const initialHeight = 66;
  const gridHeight = Number.isNaN(gridHeightProp)
    ? initialHeight
    : gridHeightProp;

  const gridStyle = {
    height: `${gridHeight || initialHeight}px`,
    width: '100%',
  };
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div style={gridStyle}>
      <DataGrid
        className={className}
        apiRef={apiRef}
        rows={iniRows}
        columns={columns}
        error={error}
        onRowsScrollEnd={onRowsScrollEnd}
        loading={loading}
        // filtering
        filterRowMode='server'
        onFilterModelChange={onFilterModelChange}
        // user input
        checkboxSelection={checkboxSelection}
        /*
        rowSelectionCheckboxChange={(
          params, // GridRowSelectionCheckboxParams
          event, // MuiEvent<React.ChangeEvent<HTMLElement>>
          details, // GridCallbackDetails
        ) => { }}
        onSelectionModelChange={({ data: rowModel, isSelected }) => {
        */
        getRowClassName={() => rowClassName || 'EtlUnit-ValueGrid-Level'}
        // other options
        rowHeight={rowHeight || ROW_HEIGHT}
        headerHeight={headerHeight || HEADER_HEIGHT}
        disableColumnSelector
        onRowClick={({ row: rowModel }) => {
          // applies the callback passing it a synthetic event
          // that reverses the isRowSelected value
          return onRowClick({
            id: rowModel.id,
            level: rowModel.level,
            isSelected: apiRef.current.isRowSelected(rowModel.id), // 🟡 🦀 no-longer reversing
          });
        }}
        onColumnHeaderClick={onToggleAll}
        {...options(
          apiRef,
          MAX_ROWS,
          inFilterState,
          handleClearFilter,
          resetFn,
        )}
        {...rest}
      />
    </div>
  );
};

ValueGridInner.whyDidYouRender = true;
ValueGridInner.propTypes = {
  apiRef: PropTypes.shape({
    current: PropTypes.shape({ isRowSelected: PropTypes.func }),
  }).isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape({})),
  headerHeight: PropTypes.number,
  rowHeight: PropTypes.number,
  MAX_ROWS: PropTypes.number,
  onRowsScrollEnd: PropTypes.func.isRequired,
  // status-related
  gridHeightProp: PropTypes.number.isRequired, // limiting factor
  resetFn: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.shape({}),
  // filter-related
  inFilterState: PropTypes.bool.isRequired,
  onFilterModelChange: PropTypes.func.isRequired,
  handleClearFilter: PropTypes.func.isRequired,
  // formatting
  className: PropTypes.string,
  rowClassName: PropTypes.string,
  // checkbox related
  checkboxSelection: PropTypes.bool,
  onRowClick: PropTypes.func,
  onToggleAll: PropTypes.func,
};

ValueGridInner.defaultProps = {
  className: undefined,
  rowClassName: undefined,
  headerHeight: undefined,
  rowHeight: undefined,
  checkboxSelection: false,
  onToggleAll: undefined,
  error: undefined,
  onRowClick: () => {},
  MAX_ROWS: undefined,
  rows: undefined,
};

export default ValueGridInner;
