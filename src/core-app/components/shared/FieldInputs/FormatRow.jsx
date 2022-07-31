import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import TextField from '../TextField';

import { debug, useTraceUpdate } from '../../../constants/variables';

/* eslint-disable no-console */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

/**
 * Input row used for file-field value.
 * @component
 *
 */
const FormatRow = (props) => {
  const {
    stateId,
    name,
    value,
    saveChange,
    onChange,
    onBlur,
    onKeyDown,
    onKeyUp,
    label,
  } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering FormatRow`, debug.color.green);
  }
  if (DEBUG) {
    console.dir(props);
  }

  return (
    <TextField
      className={clsx('Luci-FormatRow')}
      label={label}
      key={`${stateId}|format-row`}
      stateId={`${stateId}|format-row`}
      name={name}
      value={value || ''}
      saveChange={saveChange}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    />
  );
};

FormatRow.propTypes = {
  label: PropTypes.oneOf(['Format in', 'Format out']).isRequired,
  stateId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  saveChange: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
};

FormatRow.defaultProps = {
  onChange: undefined,
  onBlur: undefined,
  onKeyDown: undefined,
  onKeyUp: undefined,
};

export default FormatRow;
