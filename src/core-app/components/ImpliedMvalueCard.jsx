import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';

import Typography from '@mui/material/Typography';

import TextField from './shared/TextField';
import HeadingBox from './shared/HeadingBox';
import ERRORS from '../constants/error-messages';

// data callbacks
import { updateImpliedMvalue } from '../ducks/actions/headerView.actions';

import { debug, useTraceUpdate } from '../constants/variables';

/* eslint-disable no-console */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

/**
 * @component
 *
 * ⬆  HeaderView (provides headerView exFields)
 * 📖 headerView['implied-mvalue']
 *    ☎️  onFieldChange
 * ⬇  HeadingBox
 *
 * TODO: uses debounce...
 */

function ImpliedMvalueCard(props) {
  const { stateId, filename, impliedMvalueConfig } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering ImpliedMvalueCard`, debug.color.green);
  }
  if (DEBUG) {
    console.dir(props);
  }

  if (typeof impliedMvalueConfig === 'undefined') {
    throw new Error(`ImpliedMvalueCard does not have a valid configuration`);
  }
  if (typeof impliedMvalueConfig.field === 'undefined') {
    throw new Error(
      `ImpliedMvalueCard does not have a valid config.field prop`,
    );
  }
  if (typeof impliedMvalueConfig.config === 'undefined') {
    throw new Error(
      `ImpliedMvalueCard does not have a valid config.config prop`,
    );
  }

  const dispatch = useDispatch();

  const valueName = impliedMvalueConfig.field['field-alias'];

  const handleOnChange = useCallback(
    (e) => {
      dispatch(updateImpliedMvalue(filename, e.target.value));
    },
    [dispatch, filename],
  );

  return (
    <HeadingBox
      key={`${stateId}|implied-mvalue`}
      stateId={`${stateId}|implied-mvalue`}
      expanded
      heading='Implied Value'
      canCollapse>
      {valueName === '' ? (
        <Typography>{ERRORS.impliedMvalueConfig.doc}</Typography>
      ) : null}

      <TextField
        key={`${stateId}-text-field`}
        stateId={`${stateId}-text-field`}
        name='field-alias'
        label='New measurement'
        error={valueName === ''}
        value={valueName}
        saveChange={handleOnChange}
      />
    </HeadingBox>
  );
}

ImpliedMvalueCard.propTypes = {
  impliedMvalueConfig: PropTypes.shape({
    config: PropTypes.shape({
      mvalue: PropTypes.string,
      mspan: PropTypes.string,
    }).isRequired,
    field: PropTypes.shape({
      'field-alias': PropTypes.string,
    }),
  }).isRequired,
  stateId: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
};

export default ImpliedMvalueCard;
