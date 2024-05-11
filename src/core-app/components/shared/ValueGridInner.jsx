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
 *               ** rowCountTotal **, a Footer prop
 *
 *   📌  Also exports filterOperator used to configure columns
 *
 *
 *     apiRef.current.publishEvent('headerSelectionCheckboxChange', params);
 */
import React from 'react';
import PropTypes from 'prop-types';

import {
  gridRowCountSelector,
  useGridSelector,
  useGridApiContext,
  useGridApiRef,
  DataGridPro as DataGrid,
  GridOverlay,
  getGridStringOperators,
} from '@mui/x-data-grid-pro';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import ReplayIcon from '@mui/icons-material/Replay';
import LinearProgress from '@mui/material/LinearProgress';
import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';

import { Div } from '../../../luci-styled';
import ValueGridTools from './ValueGridTools';
import GridToolbarFilterButton from './ValueGridFilterButton';
import { useLevelsDataContext } from '../../contexts/LevelsDataContext';
//------------------------------------------------------------------------------
//
const DEBUG = process.env.REACT_APP_DEBUG_LEVELS === 'true';
/* eslint-disable no-console */

//----------------------------------------------------------------------------
// Display settings
//----------------------------------------------------------------------------
const HEADER_HEIGHT = 45;
const ROW_HEIGHT = 31;
const FOOTER_HEIGHT = 37;
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
// Custom components for the grid
// ⬜ reverse the css highlighting
//------------------------------------------------------------------------------
const CustomCheckbox = React.forwardRef(({ indeterminate, ...props }, ref) => {
  return (
    <Checkbox
      ref={ref}
      {...props}
      indeterminate={indeterminate}
      icon={<Check className='selected' />}
      checkedIcon={<Clear className='deselected' />}
      indeterminateIcon={<IndeterminateCheckBoxIcon />}
    />
  );
});
//------------------------------------------------------------------------------
// Counter located in the footer
// Reload and filter tools
function Footer({
  showScrubTools,
  rowCountTotal,
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
      {showScrubTools && <ValueGridTools />}
      {rowCount && rowCountTotal && (
        <div className='record-counts'>{`${rowCount} of ${rowCountTotal}`}</div>
      )}
    </div>
  );
}
Footer.propTypes = {
  showScrubTools: PropTypes.bool,
  rowCountTotal: PropTypes.number,
  clearFilterFn: PropTypes.func.isRequired,
  resetFn: PropTypes.func.isRequired,
  inFilterState: PropTypes.bool,
};
Footer.defaultProps = {
  showScrubTools: false,
  rowCountTotal: undefined,
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
 * has been derived or returned from the api.
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
const customComponents = (footerProps) => ({
  slots: {
    loadingOverlay: CustomLoadingOverlay,
    baseCheckbox: CustomCheckbox,
    footer: Footer,
  },
  slotProps: {
    baseCheckbox: { size: 'small' },
    footer: footerProps,
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
  rowCountTotal,
  rowHeight,
  headerHeight,
  gridHeightProp, // use the exported gridHeight fn
  gridWidthProp,
  inFilterState,
  handleClearFilter,
  onRowClick,
  onToggleAll,
  resetFn,
  rowClassName,
  ...rest
}) => {
  const apiRef = useGridApiRef();
  const { context } = useLevelsDataContext();
  const initialHeight = 66;
  const gridHeight = Number.isNaN(gridHeightProp) ? initialHeight : gridHeightProp;

  const gridStyle = {
    height: `${gridHeight || initialHeight}px`,
    width: '100%',
    minWidth: gridWidthProp,
    overFlowY: 'scroll',
    overFlowX: 'scroll',
  };
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <Div className='Luci-Datagrid' style={gridStyle}>
      <DataGrid
        // for accessising isRowSelected
        apiRef={apiRef}
        // filtering
        filterRowMode='server'
        // other options
        rowCount={undefined} // be sure not to pass this prop on
        rowHeight={rowHeight || ROW_HEIGHT}
        columnHeaderHeight={headerHeight || HEADER_HEIGHT}
        disableColumnSelector
        onRowClick={({ row: rowModel }) => {
          // applies the callback passing it a synthetic event making sure
          // the display matches what is passed.
          if (onRowClick) {
            onRowClick({
              id: rowModel.id,
              level: rowModel.level,
              isSelected: apiRef.current.isRowSelected(rowModel.id),
            });
          }
        }}
        // patched mui event
        onHeaderSelectionCheckboxChange={({ value }) => {
          // reverse the logic (b/c default is select all)
          if (onToggleAll) {
            onToggleAll(!value);
          }
        }}
        {...options}
        {...customComponents({
          showScrubTools: !['workbench', 'matrix'].includes(context),
          rowCountTotal,
          inFilterState,
          clearFilterFn: handleClearFilter,
          resetFn,
        })}
        {...rest}
      />
    </Div>
  );
};

ValueGridInner.propTypes = {
  headerHeight: PropTypes.number,
  rowHeight: PropTypes.number,
  rowCountTotal: PropTypes.number,
  gridHeightProp: PropTypes.number.isRequired, // limiting factor
  gridWidthProp: PropTypes.number, // limiting factor
  resetFn: PropTypes.func.isRequired,
  // filter-related
  inFilterState: PropTypes.bool.isRequired,
  onFilterModelChange: PropTypes.func.isRequired,
  handleClearFilter: PropTypes.func.isRequired,
  // formatting
  rowClassName: PropTypes.string,
  // checkbox related
  onRowClick: PropTypes.func,
  onToggleAll: PropTypes.func,
};

ValueGridInner.defaultProps = {
  rowClassName: undefined,
  headerHeight: undefined,
  gridWidthProp: undefined,
  rowHeight: undefined,
  rowCountTotal: undefined,
  onRowClick: () => {},
  onToggleAll: undefined,
};

export default ValueGridInner;
