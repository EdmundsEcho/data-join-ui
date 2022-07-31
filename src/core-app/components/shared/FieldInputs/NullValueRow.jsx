import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import TextField from '../TextField';

import { debug, useTraceUpdate } from '../../../constants/variables';
import { FIELD_TYPES } from '../../../lib/sum-types';

/* eslint-disable no-console */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

/**
 * Input row used both for file-field and etl-field null values.
 *
 * 🦀 the null value field does not maintain focus in the rendered context.
 * However, it does work in the null-value-expansion context.
 *
 * This component operates in three contexts
 *
 *    👉 HeaderView
 *    👉 EtlFieldView
 *    👉 backtracking version of HeaderView
 *
 * @component
 *
 */
const NullValueRow = (props) => {
  const {
    stateId,
    name,
    value,
    fieldType,
    saveChange,
    onChange,
    onBlur,
    onKeyDown,
    onKeyUp,
    required,
  } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering NullValueRow`, debug.color.green);
  }
  if (DEBUG) {
    console.dir(props);
  }

  console.assert(
    (name === 'null-value' && fieldType === FIELD_TYPES.FILE) ||
      (name === 'null-value-expansion' && fieldType === FIELD_TYPES.ETL),
  );
  // There are two versions of the input, null value and null-value-expansion
  return name === 'null-value' ? (
    <TextField
      className={clsx('Luci-FileField-TextField', 'null-value')}
      key={`${stateId}|null-row`}
      stateId={`${stateId}|null-row`}
      name={name}
      label='Null value'
      value={value || ''}
      saveChange={saveChange}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      helperText='Subjects within this file'
      required={required}
    />
  ) : (
    <TextField
      className={clsx('Luci-FileField-TextField', 'null-value-expansion')}
      key={`${stateId}|null-ext-row`}
      stateId={`${stateId}|null-ext-row`}
      name={name}
      label='Null value expansion'
      value={value || ''}
      saveChange={saveChange}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      helperText='Subjects outside of the listed sources'
      required={required}
    />
  );
};

NullValueRow.propTypes = {
  stateId: PropTypes.string.isRequired,
  name: PropTypes.oneOf(['null-value', 'null-value-expansion']).isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
  value: PropTypes.string.isRequired,
  saveChange: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
  required: PropTypes.bool.isRequired,
};

NullValueRow.defaultProps = {
  onChange: undefined,
  onBlur: undefined,
  onKeyDown: undefined,
  onKeyUp: undefined,
};

export default NullValueRow;
