// src/components/HeaderFieldDetailView.jsx

/**
 * @module /components/HeaderFieldDetailView
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import FieldDetailView from './FieldDetailView';

import { FIELD_TYPES } from '../constants/field-input-config';

// debug
import { debug, useTraceUpdate } from '../constants/variables';

/* eslint-disable no-console */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

/**
 *
 * @component
 *
 */
function HeaderFieldDetailView(props) {
  const { fieldIdx, filename, getValue, fieldType, ...leftSideProps } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering HeaderFieldDetailView`, debug.color.green);
  }

  if (DEBUG) {
    console.dir(props);
  }

  const stateId = `${filename}-${fieldIdx}`;

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <FieldDetailView
      stateId={stateId}
      fieldType={fieldType}
      getValue={getValue}
      {...leftSideProps}
    />
  );
}

HeaderFieldDetailView.propTypes = {
  fieldIdx: PropTypes.number.isRequired,
  filename: PropTypes.string.isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
  getValue: PropTypes.func.isRequired,
  saveChange: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
  hasNullValues: PropTypes.bool.isRequired,
};

HeaderFieldDetailView.defaultProps = {
  onChange: undefined,
  onBlur: undefined,
  onKeyDown: undefined,
  onKeyUp: undefined,
};

export default HeaderFieldDetailView;
