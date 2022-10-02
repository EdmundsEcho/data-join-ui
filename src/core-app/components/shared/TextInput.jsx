// src/components/shared/TextInput.jsx

/**
 * @module components/shared/TextInput
 *
 * @description
 * Text field with augmented capacity to deal with changes.
 *
 * Only requires a callback for saving the user input.
 *     saveChange(e)
 *
 * @category Components
 */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Input from '@mui/material/Input';
import { useForm } from 'react-hook-form';

/* eslint-disable no-console */

const DEBUG = false;

// keyCode values
// const LEFT_ARROW = 37;
const UP_ARROW = 38;
// const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const ENTER = 13;

function WrappedInput(props) {
  const {
    stateId,
    name,
    value,
    saveChange, // required; ref to external
    onChange,
    onBlur,
    onKeyUp,
    onKeyDown,
    label,
    ...inputProps
  } = props;

  const { register } = useForm();

  // buffer used only for user feedback
  // initialize state to the prop value
  const [buffer, setBuffer] = useState(() => value);
  const [savedValue, setSavedValue] = useState(() => value);

  const saveIfNeeded = useCallback(
    (e) => {
      if (savedValue !== e.target.value) {
        saveChange(e);
        setSavedValue(e.target.value);
      }
    },
    [saveChange, savedValue],
  );

  const handleOnChange = (e) => {
    if (typeof onChange !== 'undefined') {
      onChange(e);
    } else {
      setBuffer(e.target.value);
    }
  };

  const handleOnKeyUp = useCallback(
    (e) => {
      if (typeof onKeyUp !== 'undefined') {
        onKeyUp(e);
      } else if (e.key === 'Enter' && !focusOnNext(e)) {
        saveIfNeeded(e);
      }
    },
    [onKeyUp, saveIfNeeded],
  );

  /*
  const handleOnKeyDown = useCallback(
    (e) => {
      if (typeof onKeyDown !== 'undefined') {
        onKeyDown(e);
      } else if (e.key === 'Esc' || e.key === 'Escape') {
        setBuffer('');
      }

      // focusOnNext(e);
    },
    [onKeyDown],
  );
  */

  const handleOnBlur = (e) => {
    /*
    if (typeof onBlur !== 'undefined') {
      onBlur(e);
    } else {
    */
    saveIfNeeded(e);
    //  }
  };

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <Input
      key={`${stateId}`}
      id={`${stateId}`}
      name={name}
      inputRef={register}
      value={buffer}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
      // onKeyDown={handleOnKeyDown}
      onKeyUp={handleOnKeyUp}
      label={label}
      {...inputProps}
    />
  );
}

WrappedInput.propTypes = {
  stateId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  saveChange: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
  label: PropTypes.string,
};
WrappedInput.defaultProps = {
  label: '',
  onChange: undefined,
  onBlur: undefined,
  onKeyDown: undefined,
  onKeyUp: undefined,
};

/**
 * DOM side-effect: Focus on the next component.
 * Returns true when succeeded to find a node to focus on.
 *
 * @function
 * @param {Event} e dom event
 * @return {boolean}
 */
function focusOnNext(e) {
  // the key combination determines what nodes to include in the
  // tabindex queue.
  let relatedNodes = [];
  if (!e.ctrlKey) {
    relatedNodes = [...document.querySelectorAll('input, button')];
    if (!relatedNodes.length) return false;
  } else {
    relatedNodes = [...document.getElementsByName(e.target.name)];
    if (!relatedNodes.length) return false;
  }

  // 1. get id and name from the specific event.target
  // 2. retrieve the collection of nodes using name
  // 3. find the position of name in that collection
  // 4. set the focus on the next node in the collection
  const activeNodes = relatedNodes.filter((node) => !node.disabled);
  const currentIdx = activeNodes.findIndex((node) => node.id === e.target.id);

  const nextIdx = () =>
    currentIdx + 1 === activeNodes.length ? 0 : currentIdx + 1;

  const prevIdx = () =>
    currentIdx === 0 ? activeNodes.length - 1 : currentIdx - 1;

  // move to next DOWN
  if (e.keyCode === ENTER || e.keyCode === DOWN_ARROW) {
    const node = document.getElementById(activeNodes[nextIdx()].id);
    if (node) {
      node.focus(); // does this trigger onBlur?
      if (DEBUG) {
        console.log(`Moving to next tabIndex`);
        console.dir(e.target.value);
      }
      return true;
    }
    console.warn(`Failed to find the next tabindex node.`);
    return false;
  }
  // move to next UP
  if (e.keyCode === UP_ARROW || e.shiftKey) {
    const node = document.getElementById(activeNodes[prevIdx()].id);
    if (node) {
      node.focus();
      return true;
    }
    console.warn(`Failed to find the next tabindex node.`);
    return false;
  }
  return false;
}

export default WrappedInput;
