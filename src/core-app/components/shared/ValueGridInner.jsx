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

import {
  gridRowCountSelector,
  useGridSelector,
  useGridApiContext,
  DataGridPro as DataGrid,
  GridOverlay,
  getGridStringOperators,
} from '@mui/x-data-grid-pro';
import IconButton from '@mui/material/IconButton';
import ReplayIcon from '@mui/icons-material/Replay';
import LinearProgress from '@mui/material/LinearProgress';
import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';

import { Div } from '../../../luci-styled';
import ValueGridTools from './ValueGridTools';
import GridToolbarFilterButton from './ValueGridFilterButton';
//------------------------------------------------------------------------------
//
const DEBUG = process.env.REACT_APP_DEBUG_LEVELS === 'true';
/* eslint-disable no-console */

//----------------------------------------------------------------------------
// Display settings
//----------------------------------------------------------------------------
const HEADER_HEIGHT = 33;
const ROW_HEIGHT = 35;
const FOOTER_HEIGHT = 40;
const ADJUST_HEIGHT = 0;
export { ROW_HEIGHT, HEADER_HEIGHT, FOOTER_HEIGHT, ADJUST_HEIGHT };

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
// Reload and filter tools
function Footer({
  totalCount,
  inFilterState,
  clearFilterFn: clearFilter,
  resetFn: reset,
}) {
  const apiRef = useGridApiContext();
  const rowCount = useGridSelector(apiRef, gridRowCountSelector) ?? undefined;

  // gridVisibleSortedRowEntriesSelector
  return (
    <div className='Luci-Datagrid-footer'>
      <div className='tools'>
        <IconButton size='small' aria-label='reset' onClick={reset}>
          <ReplayIcon />
        </IconButton>
        <GridToolbarFilterButton disabled={!inFilterState} onClick={clearFilter} />
      </div>
      <ValueGridTools />
      {rowCount && totalCount && (
        <div className='record-counts'>{`${rowCount} of ${totalCount}`}</div>
      )}
    </div>
  );
}
Footer.propTypes = {
  totalCount: PropTypes.number,
  clearFilterFn: PropTypes.func.isRequired,
  resetFn: PropTypes.func.isRequired,
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
      <div className='Luci-LinearProgress root'>
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
  rowHeight = ROW_HEIGHT,
  headerHeight = HEADER_HEIGHT,
  gridHeightAdjustment = ADJUST_HEIGHT,
) => {
  if (DEBUG) {
    console.debug('gridHeightFn parameters:', {
      maxRecords,
      limitGridHeight,
      rowHeight,
      headerHeight,
    });
  }
  const nonBody = headerHeight + FOOTER_HEIGHT + ADJUST_HEIGHT;
  const limitBodyHeight = limitGridHeight - nonBody;
  const gridBody =
    Math.min(limitBodyHeight, Math.max(2, maxRecords + 1) * rowHeight) +
    gridHeightAdjustment;
  return gridBody + headerHeight + FOOTER_HEIGHT + ADJUST_HEIGHT;
};

//------------------------------------------------------------------------------
// Data grid options
// See the theme overrides for other formatting options
const options = {
  hideFooterSelectedRowCount: true,
  initialState: {
    columns: {
      columnVisibilityModel: {
        id: false,
        newSymbol: false,
      },
    },
  },
};
const customComponents = ({
  maxRows: MAX_ROWS,
  inFilterState,
  clearFilterFn,
  resetFn,
}) => ({
  slots: {
    loadingOverlay: CustomLoadingOverlay,
    baseCheckbox: Checkbox,
    footer: Footer,
  },
  slotProps: {
    footer: {
      totalCount: MAX_ROWS,
      inFilterState,
      clearFilterFn,
      resetFn,
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
  selectedRows, // new 0.3.11
  inFilterState,
  loading,
  error,
  ...rest
}) => {
  //
  // ---------------------------------------------------------------------------
  // State-machine toggles :/
  // ---------------------------------------------------------------------------
  // 🛈  🦀 Indirection seems required... not sure why (remains empty)
  const [iniRows] = useState(() => rows ?? []);

  const initialHeight = 66;
  const gridHeight = Number.isNaN(gridHeightProp) ? initialHeight : gridHeightProp;

  const gridStyle = {
    height: `${gridHeight || initialHeight}px`,
    width: '100%',
  };
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <Div className='Luci-Datagrid' style={gridStyle}>
      <DataGrid
        className={className}
        apiRef={apiRef}
        rows={iniRows}
        selectionModel={selectedRows}
        columns={columns}
        error={error}
        onRowsScrollEnd={onRowsScrollEnd}
        loading={loading}
        // filtering
        filterRowMode='server'
        onFilterModelChange={onFilterModelChange}
        // user input
        checkboxSelection={checkboxSelection}
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
            isSelected: apiRef.current.isRowSelected(rowModel.id),
          });
        }}
        onColumnHeaderClick={onToggleAll}
        {...options}
        {...customComponents({
          maxRows: MAX_ROWS,
          inFilterState,
          clearFilterFn: handleClearFilter,
          resetFn,
        })}
        {...rest}
      />
    </Div>
  );
};

ValueGridInner.whyDidYouRender = true;
ValueGridInner.propTypes = {
  apiRef: PropTypes.shape({
    current: PropTypes.shape({ isRowSelected: PropTypes.func }),
  }).isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape({})),
  selectedRows: PropTypes.arrayOf(PropTypes.string), // 0.3.11, set mui-grid selection model
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
  selectedRows: [],
};

export default ValueGridInner;
