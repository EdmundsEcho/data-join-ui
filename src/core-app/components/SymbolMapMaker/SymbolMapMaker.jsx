import React, { useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';

import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Div } from '../../../luci-styled';
import NewPair from './AutocompleteNewPair';
import SymbolMapItem from './SymbolMapItem';
import ErrorCard from './ErrorCard';
import { DeleteButton, ForwardArrow } from './SymbolMapShared';
import { useLevelsApiContext, FIELD_TYPES } from '../../contexts/LevelsDataContext';

import {
  addOrUpdateSymbolItem as addOrUpdateItemHeaderView,
  deleteSymbolItem as deleteItemHeaderView,
  addOrUpdateSymbolItemWideConfig as addOrUpdateItemWideConfig,
  deleteSymbolItemWideConfig as deleteItemWideConfig,
} from '../../ducks/actions/headerView.actions';
import {
  addOrUpdateSymbolItem as addOrUpdateItemEtlView,
  deleteSymbolItem as deleteItemEtlView,
} from '../../ducks/actions/etlView.actions';

import {
  selectSymbolMapHeaderView,
  selectSymbolMapEtlView,
  selectSymbolMapWideConfig,
} from '../../ducks/rootSelectors';

//------------------------------------------------------------------------------
//
const DEBUG = process.env.REACT_APP_DEBUG_LEVELS === 'true';
/* eslint-disable no-console */

const sortOptions = (options) => options.sort((a, b) => a.localeCompare(b));

// local placeholders
const LEFT_TITLE = 'Old value';
const RIGHT_TITLE = 'New value';
const MIN_DISPLAY_ROWS = 0;
const MIN_CHARS = 5;

/**
 * Input levels for a given field.
 * Builds a symbolMap for a given field.
 * Maintains a list of options = options minus keys in the symbolMap
 *
 * ***  NEXT: Get the list of options from the parent, ValudGridLevels
 *
 * Arrows::Object hosts the old/new key value pair.
 *
 * @param {Object} props
 * @param {Array} props.options
 */
function SymbolMapMaker({
  options: optionsProp,
  onDone: onClose,
  fieldType,
  flagActive,
}) {
  const dispatch = useDispatch();

  const { getFieldValue } = useLevelsApiContext();

  /* eslint-disable one-var */
  let selector, addOrUpdateAction, deleteAction, lookupParams;

  switch (fieldType) {
    case FIELD_TYPES.FILE:
      selector = selectSymbolMapHeaderView;
      addOrUpdateAction = addOrUpdateItemHeaderView;
      deleteAction = deleteItemHeaderView;
      lookupParams = {
        filename: getFieldValue('filename'),
        headerIdx: getFieldValue('header-idx'),
      };
      break;
    case FIELD_TYPES.WIDE:
      selector = selectSymbolMapWideConfig;
      addOrUpdateAction = addOrUpdateItemWideConfig;
      deleteAction = deleteItemWideConfig;
      lookupParams = {
        filename: getFieldValue('filename'),
        fieldAlias: getFieldValue('field-alias'),
      };
      break;
    case FIELD_TYPES.ETL:
      selector = selectSymbolMapEtlView;
      addOrUpdateAction = addOrUpdateItemEtlView;
      deleteAction = deleteItemEtlView;
      lookupParams = { fieldName: getFieldValue('name') };
      break;
    default:
      throw new Error(`Invalid fieldType: ${fieldType}`);
  }

  const symbolItemsMap = useSelector((state) =>
    selector(state, ...Object.values(lookupParams)),
  ) || { arrows: {} };

  // notify parent to flag use of this configuration
  const hasSymbols = Object.keys(symbolItemsMap).length > 0;
  useEffect(() => {
    flagActive(hasSymbols);
  }, [hasSymbols, flagActive]);

  const symbolArrows = Object.entries(symbolItemsMap?.arrows ?? {}).map(
    ([left, right]) => ({ left, right }),
  );
  const [options, setLevelOptions] = useState(sortOptions(optionsProp) || []);
  const [errorState, setErrorState] = useState(() => false);
  const [resetState, setResetState] = useState(() => false);

  // child state; we track it to know when to prevent scrolling
  const [isUpdating, setIsUpdating] = useState(false);
  const handleStartUpdate = () => setIsUpdating(true);
  const handleEndUpdate = () => setIsUpdating(false);

  // to pull the scolling table body to the latest new entry
  const tableRef = useRef(null);

  const chars = optionsProp.reduce(
    (max, option) => Math.max(max, option.length),
    MIN_CHARS,
  );

  const padding = 7;
  const leftWidth = `${chars + padding}ch`;
  const rightWidth = `${chars + 0.3 * chars + padding}ch`;

  const handleNewPair = useCallback(
    (left, right) => {
      dispatch(
        addOrUpdateAction({
          ...lookupParams,
          left,
          right,
        }),
      );
      // recompute the available options
      setLevelOptions((prevLevelOptions) =>
        prevLevelOptions.filter((option) => option !== left),
      );
    },
    [dispatch, lookupParams, addOrUpdateAction],
  );

  // Update
  const handleUpdate = handleNewPair;

  // Delete
  const handleDelete = useCallback(
    (left) => {
      // forces this component to re-render
      dispatch(deleteAction({ ...lookupParams, left }));
      setErrorState(() => false);
      setResetState(() => true);

      // add the left value back to options
      setLevelOptions((prevLevelOptions) => sortOptions([...prevLevelOptions, left]));
    },
    [dispatch, deleteAction, lookupParams],
  );

  // effect that scrolls the table body when making new
  // entries (not when updating an existing entry)
  useEffect(() => {
    if (!isUpdating && tableRef.current) {
      const { current: container } = tableRef;
      container.scrollTop = container.scrollHeight;
    }
  }, [isUpdating, symbolArrows]);

  return (
    <Div className='Luci-SymbolMapMaker'>
      <div className='layout'>
        <TableContainer className='body' ref={tableRef}>
          <Table
            className={clsx('Luci-Table', 'symbolMapMaker')}
            size='medium'
            stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: leftWidth }}>
                  <Typography>{LEFT_TITLE}</Typography>
                </TableCell>
                <TableCell>
                  <ForwardArrow hide />
                </TableCell>
                <TableCell sx={{ width: rightWidth }}>
                  <Typography>{RIGHT_TITLE}</Typography>
                </TableCell>
                <TableCell>
                  <DeleteButton hide />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Rows for each SymbolMapItem */}
              {symbolArrows.map((pair) => (
                <SymbolMapItem
                  key={pair.left}
                  leftValue={pair.left}
                  rightValue={pair.right}
                  onDelete={() => handleDelete(pair.left)}
                  onUpdate={(newValue) => handleUpdate(pair.left, newValue)}
                  leftWidth={leftWidth}
                  rightWidth={rightWidth}
                  onUpdateStart={handleStartUpdate}
                  onUpdateEnd={handleEndUpdate}
                />
              ))}
              {/* Dummy Rows */}
              {Array.from({
                length: Math.max(MIN_DISPLAY_ROWS - symbolArrows.length, 0),
              }).map((_, idx) => (
                <SymbolMapItem
                  key={`dummy-row-${idx}`}
                  leftValue=''
                  rightValue=''
                  leftWidth={leftWidth}
                  rightWidth={rightWidth}
                  hideDelete={false}
                  disabled
                />
              ))}
            </TableBody>

            <TableFooter className='symbolMapMaker footer'>
              {/* Row for NewPair entry */}
              <NewPair
                options={options}
                onSubmit={handleNewPair}
                leftWidth={leftWidth}
                rightWidth={rightWidth}
                leftLabel='Old'
                rightLabel='New'
                resetState={resetState}
                onError={setErrorState}
              />
              <TableRow>
                <TableCell className='symbolMapMaker footer-cell' colSpan={4}>
                  <Div className='stack symbolMapMaker'>
                    <ErrorCard errors={errorState ? [errorState] : []} />
                    <Button variant='contained' onClick={onClose} color='primary'>
                      Done
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </div>
    </Div>
  );
}

SymbolMapMaker.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onDone: PropTypes.func, // onClose
  flagActive: PropTypes.func,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
};

SymbolMapMaker.defaultProps = {
  onDone: () => {},
  flagActive: () => {
    if (DEBUG) {
      console.warn('flagActive callback not provided');
    }
  },
};

export default SymbolMapMaker;
