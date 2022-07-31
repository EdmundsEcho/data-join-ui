// src/components/shared/SummaryDetailRow.jsx

/**
 * @module components/shared/SummaryDetailRow
 *
 * @description
 * Renders a summary and detail view.<br>
 *
 * Wraps a TableRow with the following:
 *
 * * children (summary view)
 * * DetailViewComponent
 * * TogglerCellComponent (display/hide detail)
 *
 * Utilized by:
 *
 * 1. HeaderViewField
 * 2. EtlUnitMeas
 * 3. WideToLongCard
 *
 * @category Components
 *
 */
import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Collapse from '@mui/material/Collapse';

import usePersistedState from '../../hooks/use-persisted-state';

import { debug, useTraceUpdate } from '../../constants/variables';
import { FIELD_TYPES } from '../../lib/sum-types';

/* eslint-disable no-console */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

/**
 * Generic table row that can "expand" into a detailed view.
 * The row includes a toggle in the last TableCell.
 *
 * State features
 *
 *     * isSelected -> first row color change (EtlFieldView only)
 *     * disabled   -> active/inactive row format (HeaderView only)
 *     * collapsed  -> show/hide "expandable component"
 *     * expandable -> off when disabled (not redundant)
 *
 * The component utilizes its own classes required to help display
 * the states of the component:
 *
 *    * active/inactive
 *    * active: '',
 *    * disabled: '',
 *    * selectedField: '',
 *
 * Note: When defining the header row in the table hosting this
 * component  (a TableRow), be sure to have a placeholder for
 * the extra, toggler controller cell.
 *
 * ⚠️  Be careful what state might cause re-renders
 *
 * @component
 *
 */
const SummaryDetailRow = (props) => {
  const {
    className,
    stateId,
    DetailViewComponent,
    togglerCellPosition,
    fieldType,
    children,
    viewDetail: viewDetailProp,
    isDisabled,
    isSelected,
    handleClick,
    onToggleDetailView,
    hover,
  } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering SummaryDetailRow`, debug.color.green);
  }
  if (DEBUG) {
    console.dir(props);
  }

  // const DetailView = (props) => { <> }

  // indirection to clarify definition
  const cellCount = children.length;
  const hideToggle = typeof DetailViewComponent === 'undefined';
  const noDetailView = hideToggle;

  const [viewDetail, setViewDetail] = usePersistedState(
    stateId,
    viewDetailProp,
  );

  // when the value of collapsed changes, the component
  // gets re-rendered (the state is expressed in the return value)
  const handleToggle = useCallback(() => {
    setViewDetail(!viewDetail); // local, persisted state
    onToggleDetailView(stateId);
  }, [onToggleDetailView, setViewDetail, stateId, viewDetail]);

  // viewDetail also depends on isDisabled...
  // (viewDetail => false when disabled)
  useEffect(() => {
    if (isDisabled && viewDetail) {
      setViewDetail(false);
    }
  }, [isDisabled, setViewDetail, viewDetail]);

  const rowState = () => {
    if (isDisabled) {
      return 'disabled';
    }
    if (isSelected) {
      return 'selected';
    }
    return 'active';
  };

  const zeroPaddingStyle = { padding: 0 };

  const togglerCell = (
    <TogglerCellComponent
      hidden={hideToggle}
      viewDetail={viewDetail}
      isDisabled={isDisabled}
      handleToggle={handleToggle}
    />
  );

  return (
    <>
      {/* 🔑  */}
      {/* This is the crux of the summary/detail toggled view */}
      <TableRow
        className={clsx(
          className,
          'Luci-SummaryDetail-Row',
          'summaryView',
          rowState(),
          fieldType,
        )}
        onClick={handleClick}
        hover={hover}
      >
        {togglerCellPosition === 'first' ? togglerCell : null}
        {children /* TableCells */}
        {togglerCellPosition === 'last' ? togglerCell : null}

        {/* Concat a Toggler TableCell */}
      </TableRow>
      {/* zero height row for the detail view */}
      <TableRow
        className={clsx(
          'Luci-FileField-Row',
          'detailView',
          `${viewDetail ? 'nowInView' : 'hidden'}`,
        )}
      >
        <TableCell colSpan={cellCount + 1} style={zeroPaddingStyle}>
          <Collapse in={viewDetail} timeout='auto' unmountOnExit>
            {noDetailView ? null : DetailViewComponent}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

SummaryDetailRow.whyDidYouRender = true;
SummaryDetailRow.displayName = 'ExpandableRow';
SummaryDetailRow.propTypes = {
  className: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.element), // should be required
  viewDetail: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
  isSelected: PropTypes.bool,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
  handleClick: PropTypes.func, // callback when row encodes user selection
  stateId: PropTypes.string, // uid to rw the state of the component, should be required
  DetailViewComponent: PropTypes.node,
  togglerCellPosition: PropTypes.oneOf(['first', 'last']),
  onToggleDetailView: PropTypes.func, // optional callback
  hover: PropTypes.bool,
};
SummaryDetailRow.defaultProps = {
  isDisabled: false,
  isSelected: false, // headerView does not use this prop
  stateId: undefined, // uid to rw the state of the component
  children: [], // uid to rw the state of the component
  handleClick: undefined,
  DetailViewComponent: undefined,
  togglerCellPosition: 'first',
  onToggleDetailView: () => {},
  hover: false,
};

/**
 * Table cell that hosts a toggler.
 */
function TogglerCellComponent(props) {
  const { hidden, handleToggle, viewDetail: expanded, isDisabled } = props;

  return (
    <TableCell align='center' className={clsx('Luci-Toggle', 'fileField')}>
      <IconButton
        className={clsx('expand', { expandOpen: expanded }, { hidden })}
        size='small'
        onClick={handleToggle}
        disabled={isDisabled}
        tabIndex={-1}
      >
        <ExpandMoreIcon />
      </IconButton>
    </TableCell>
  );
}

TogglerCellComponent.whyDidYouRender = true;
TogglerCellComponent.propTypes = {
  hidden: PropTypes.bool,
  handleToggle: PropTypes.func.isRequired,
  viewDetail: PropTypes.bool,
  isDisabled: PropTypes.bool,
};
TogglerCellComponent.defaultProps = {
  hidden: false,
  viewDetail: false,
  isDisabled: false,
};

export default SummaryDetailRow;
