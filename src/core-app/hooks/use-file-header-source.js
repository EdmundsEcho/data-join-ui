// src/hooks/use-file-header-source.js

import { debug } from '../constants/variables';

const DEBUG = false;

/**
 * @function
 *
 * @description
 * To be used in conjunction with the 'DataWrapper' component.
 * A component is required in order to provide the useState and
 * useDispatch hooks.
 *
 * Returns data update related props.
 *
 * Note: onKeyDown(Esc -> clear), onKeyUp (Enter -> commit)
 *
 * @param {object} machine xstate machine data source
 * @param {object} field redux data source
 * @return {object}
 *
 */
export const useSourceInterface = (
  machine = undefined,
  reduxField = undefined,
) => {
  /* eslint-disable no-console */
  console.assert(
    (typeof machine === 'undefined' && typeof reduxField !== 'undefined') ||
      (typeof machine !== 'undefined' && typeof reduxField === 'undefined'),
    'The use-file-header-source did not receive expected data',
  );

  if (typeof reduxField !== 'undefined' || reduxField !== null) {
    if (DEBUG) {
      console.debug('useSourceInterface data source: reduxField');
      console.dir(reduxField);
    }

    const {
      dispatch,
      updateField,
      filename,
      fieldIdx,
      field,
      buffer,
      setBuffer,
    } = reduxField; // input to configure the redux version of the interface

    if (field === null) {
      throw new Error(
        `use-file-header-source invalid data: ${reduxField.filename} ${reduxField.fieldIdx}`,
      );
    }

    const saveIfNeeded = (e) => {
      if (
        (typeof (buffer[`${e.target.name}-saved`] === 'undefined') &&
          e.target.value !== '') ||
        buffer[`${e.target.name}-saved`] !== e.target.value
      ) {
        dispatch(
          updateField(filename, fieldIdx, e.target.name, e.target.value),
        );
        setBuffer({ [`${e.target.name}-saved`]: e.target.value });
      }
    };

    return {
      // retrieve from the buffer created using onChange
      // otherwise, the value stored in redux
      getValue: (name) => {
        if (DEBUG) {
          console.debug(`%cBUFFER name: ${name}`, debug.color.red);
          console.debug(buffer[name]);
        }
        if (field === null) {
          console.error('Null field');
          console.dir(reduxField);
          throw new Error(`Null field: ${JSON.stringify(reduxField)}`);
        }
        return buffer[name] || field[name];
      },

      // (e) => {...}
      // write to the buffer used to echo the input to the user
      onChange: (e) => {
        setBuffer({ [e.target.name]: e.target.value });
      },

      // use the event value to update the store
      saveChange: (e) => saveIfNeeded(e),

      // use the event value to update the store
      onKeyUp: (e) => {
        if (e.key === 'Enter') {
          saveIfNeeded(e);
        }
      },

      // use the event value to update the store
      onBlur: (e) => saveIfNeeded(e),

      // placeholder for 'Escape' to clear the value
      onKeyDown: () => {},
    };
  }

  if (DEBUG) {
    console.debug('useSourceInterface data source: machine');
    console.dir(machine);
  }

  return {
    // create values for these that work in each of field, and machine sources
    getValue: machine.getValue,

    // (e) => implement
    onChange: machine.onChange,
    saveChange: machine.saveChange,
    onBlur: machine.onBlur,
    onKeyUp: machine.commit,
    onKeyDown: machine.clear,
  };
};

export default useSourceInterface;
