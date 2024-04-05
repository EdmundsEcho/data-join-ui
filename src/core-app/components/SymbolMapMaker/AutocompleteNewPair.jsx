import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

import Autocomplete from '@mui/material/Autocomplete';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';

import { DeleteButton, ForwardArrow } from './SymbolMapShared';
import ERRORS from './errors.js';

//------------------------------------------------------------------------------
//
const DEBUG = process.env.REACT_APP_DEBUG_LEVELS === 'true';
/* eslint-disable no-console */

const root = {};

const CustomPaper = ({ props, children }) => {
  return (
    <Paper className='Luci-AutocompleteNewPair Luci-PopperPaper' {...props}>
      {children}
    </Paper>
  );
};
CustomPaper.propTypes = {
  children: PropTypes.node.isRequired,
  props: PropTypes.shape({}).isRequired,
};

/**
 * Main component
 */
const AutocompleteNewPair = ({
  options,
  onSubmit,
  onError,
  leftLabel,
  rightLabel,
  leftWidth,
  rightWidth,
}) => {
  const [leftInputValue, setLeftInputValue] = useState(''); // Renamed from leftFreesoloValue for clarity
  const [leftInput, setLeftInput] = useState(''); // Now using leftInput to track the submitted value
  const [rightValue, setRightValue] = useState('');
  const [rightOptions, setRightOptions] = useState(() => []);
  const [leftInputError, setLeftInputError] = useState(() => false);
  const [rightInputError, setRightInputError] = useState(() => false);
  const [postSubmit, setPostSubmit] = useState(() => false);
  // refs for fast navigation (for left autocomplete)
  const leftInputRef = useRef(null);

  // reset state
  const clearFields = () => {
    setLeftInputValue('');
    setLeftInput('');
    setRightValue('');
    setRightOptions([]);
    setLeftInputError(false);
    setRightInputError(false);
    setPostSubmit(true);
    if (leftInputRef.current) {
      leftInputRef.current.focus();
    }
  };

  useEffect(() => {
    if (postSubmit) {
      if (leftInputRef.current) {
        leftInputRef.current.focus();
      }
      setPostSubmit(false);
    }
  }, [postSubmit]);

  const isValidLeftValue = (value) => options.includes(value);

  const handleSubmit = () => {
    const leftValueTrimmed = leftInput.trim() || leftInputValue.trim();
    const rightValueTrimmed = rightValue.trim();

    if (!leftValueTrimmed) {
      onError(ERRORS.doesNotExist('empty string'));
      setLeftInputError(true);
      return;
    }

    if (!options.includes(leftValueTrimmed)) {
      onError(ERRORS.doesNotExist(leftValueTrimmed));
      setLeftInputError(true);
      return;
    }

    if (leftValueTrimmed === rightValueTrimmed) {
      onError(ERRORS.matching());
      setRightInputError(true);
      return;
    }

    if (!rightValueTrimmed) {
      onError(ERRORS.missingScrubValue(leftValueTrimmed));
      setRightInputError(true);
      return;
    }

    onError(null);
    onSubmit(leftValueTrimmed, rightValueTrimmed);
    clearFields();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleLeftInputChange = (_, newInputValue) => {
    setLeftInputValue(newInputValue);
  };

  const handleLeftChange = (_, newValue) => {
    const value = newValue?.trim() ?? '';
    setLeftInputValue(value); // Synchronize leftInputValue with the confirmed selection
    setLeftInput(value); // Update leftInput with the confirmed or typed value

    if (isValidLeftValue(value)) {
      setRightOptions([value]); // Update the right field's options based on the left field
    }
  };

  const handleLeftBlur = () => {
    // skip if empty
    if (!leftInput.trim() || !leftInputValue.trim()) {
      onError(null); // Clear errors if validation passes
      return;
    }
    if (!isValidLeftValue(leftInput)) {
      setLeftInputError(true);
      onError(ERRORS.doesNotExist(leftInput));
    } else {
      setLeftInputError(false);
      onError(null);
    }
  };

  const handleRightBlur = () => {
    // skip if empty
    if (!rightValue.trim()) {
      onError(null);
      return;
    }
    handleSubmit();
  };

  useEffect(() => {
    if (DEBUG) {
      const state = {
        leftInputValue,
        leftInput,
        rightValue,
        rightOptions,
        leftInputError,
        rightInputError,
        postSubmit,
      };
      console.debug(`%cAutoCompleteNewPair state`, 'color:lightblue');
      console.debug(state);
    }
  });

  return (
    <TableRow className='Luci-AutocompleteNewPair'>
      <TableCell
        className='left-value'
        size='small'
        sx={{ width: `calc(${leftWidth} + 7px)` }}
      >
        <Autocomplete
          freeSolo
          fullWidth
          disableClearable
          options={options}
          inputValue={leftInputValue}
          onInputChange={handleLeftInputChange}
          onChange={handleLeftChange}
          onBlur={handleLeftBlur}
          onKeyDown={handleKeyDown}
          renderInput={(params) => (
            <TextField
              {...params}
              inputRef={leftInputRef}
              type='search'
              size='small'
              label={leftLabel}
              error={leftInputError}
              fullWidth
            />
          )}
          ListboxProps={{ sx: root }}
          PaperComponent={CustomPaper}
        />
      </TableCell>
      <TableCell size='small'>
        <ForwardArrow hide />
      </TableCell>
      <TableCell className='right-value' size='small' sx={{ width: rightWidth }}>
        <Autocomplete
          fullWidth
          options={rightOptions}
          value={rightValue}
          onInputChange={(_, newValue) => setRightValue(newValue)}
          onKeyDown={handleKeyDown}
          onBlur={handleRightBlur}
          renderInput={(params) => (
            <TextField
              {...params}
              type='search'
              size='small'
              label={rightLabel}
              error={rightInputError}
              fullWidth
            />
          )}
          ListboxProps={{ sx: root }}
          PaperComponent={CustomPaper}
          componentsProps={{
            popupIndicator: {
              component: () => null,
            },
          }}
        />
      </TableCell>
      <TableCell size='small'>
        <DeleteButton hide />
      </TableCell>
    </TableRow>
  );
};

AutocompleteNewPair.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  leftLabel: PropTypes.string,
  rightLabel: PropTypes.string,
  leftWidth: PropTypes.string.isRequired,
  rightWidth: PropTypes.string.isRequired,
  resetStateProp: PropTypes.bool,
};
/* eslint-disable no-console */
AutocompleteNewPair.defaultProps = {
  onSubmit: () => console.warn('onSubmit not yet specified'),
  onError: () => console.warn('onError not yet specified'),
  leftLabel: 'Left',
  rightLabel: 'Right',
  resetStateProp: false,
};

export default AutocompleteNewPair;
