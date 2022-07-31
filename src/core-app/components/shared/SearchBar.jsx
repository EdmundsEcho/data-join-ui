import React, {
  cloneElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useCallback,
  useState,
} from 'react';

import clsx from 'clsx';

import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import Paper from '@mui/material/Paper';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';

//
// source: TeamWertarbyte/material-ui-search-bar
//
// ⬜ emulate best practice for textInput
// ✅ streamline the styling, move to theme override
//
// 🦀 The clear icon is not in the same position as the search
//
//
const SearchBar = React.forwardRef(
  (
    {
      cancelOnEscape,
      className,
      closeIcon,
      disabled,
      onCancelSearch,
      onRequestSearch,
      searchIcon,
      ...inputProps
    },
    ref,
  ) => {
    const inputRef = useRef();

    const [value, setValue] = useState(inputProps.value);

    // input props .value -> local state setValue
    useEffect(() => {
      setValue(inputProps.value);
    }, [inputProps.value]);

    const handleFocus = useCallback(
      (e) => {
        if (inputProps.onFocus) {
          inputProps.onFocus(e);
        }
      },
      [inputProps],
    );

    const handleBlur = useCallback(
      (e) => {
        setValue((v) => v.trim());
        if (inputProps.onBlur) {
          inputProps.onBlur(e);
        }
      },
      [inputProps],
    );

    const handleInput = useCallback(
      (e) => {
        setValue(e.target.value);
        if (inputProps.onChange) {
          inputProps.onChange(e.target.value);
        }
      },
      [inputProps],
    );

    const handleCancel = useCallback(() => {
      setValue('');
      if (onCancelSearch) {
        onCancelSearch();
      }
    }, [onCancelSearch]);

    const handleRequestSearch = useCallback(() => {
      if (onRequestSearch) {
        onRequestSearch(value);
      }
    }, [onRequestSearch, value]);

    const handleKeyUp = useCallback(
      (e) => {
        if (e.charCode === 13 || e.key === 'Enter') {
          handleRequestSearch();
        } else if (
          cancelOnEscape &&
          (e.charCode === 27 || e.key === 'Escape')
        ) {
          handleCancel();
        }
        if (inputProps.onKeyUp) {
          inputProps.onKeyUp(e);
        }
      },
      [cancelOnEscape, inputProps, handleRequestSearch, handleCancel],
    );

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current.focus();
      },
      blur: () => {
        inputRef.current.blur();
      },
    }));

    /* eslint-disable react/jsx-props-no-spreading */
    return (
      <Paper className={clsx(className, 'Luci-Search-Bar', 'root')}>
        <div className='searchContainer'>
          <Input
            {...inputProps}
            inputRef={inputRef}
            onBlur={handleBlur}
            value={value}
            onChange={handleInput}
            onKeyUp={handleKeyUp}
            onFocus={handleFocus}
            fullWidth
            className='input'
            disableUnderline
            disabled={disabled}
          />
        </div>
        <IconButton
          onClick={handleRequestSearch}
          className={clsx('iconButton', 'searchIconButton', {
            iconButtonHidden: value !== '',
          })}
          disabled={disabled}
          size="large">
          {cloneElement(searchIcon)}
        </IconButton>
        <IconButton
          onClick={handleCancel}
          className={clsx('iconButton', {
            iconButtonHidden: value === '',
          })}
          disabled={disabled}
          size="large">
          {cloneElement(closeIcon)}
        </IconButton>
      </Paper>
    );
  },
);

SearchBar.displayName = 'SearchBar';

SearchBar.propTypes = {
  /** Whether to clear search on escape */
  cancelOnEscape: PropTypes.bool,
  /** Custom top-level class */
  className: PropTypes.string,
  /** Override the close icon. */
  closeIcon: PropTypes.node,
  /** Disables text field. */
  disabled: PropTypes.bool,
  /** Fired when the search is cancelled. */
  onCancelSearch: PropTypes.func,
  /** Fired when the text value changes. */
  onChange: PropTypes.func,
  /** Fired when the search icon is clicked. */
  onRequestSearch: PropTypes.func,
  /** Sets placeholder text for the embedded text field. */
  placeholder: PropTypes.string,
  /** Override the search icon. */
  searchIcon: PropTypes.node,
  /** The value of the text field. */
  value: PropTypes.string,
};

SearchBar.defaultProps = {
  className: '',
  closeIcon: <ClearIcon />,
  disabled: false,
  placeholder: 'Search',
  searchIcon: <SearchIcon />,
  value: '',
  cancelOnEscape: false,
  onCancelSearch: undefined,
  onChange: undefined,
  onRequestSearch: undefined,
};

export default SearchBar;
