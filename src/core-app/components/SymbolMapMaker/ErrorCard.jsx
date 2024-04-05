// src/core-app/components/SymbolMapMaker/ErrorCard.jsx

/**
 *
 * @component
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ErrorIcon from '@mui/icons-material/ErrorOutline';

import { Div } from '../../../luci-styled';

/**
 * Display errors objects
 * { message, fix, key }
 */
export default function ErrorCard({ errors, showFix }) {
  const hasErrors = errors && errors.length > 0;

  return hasErrors
    ? errors.map((error) => {
        return (
          <Div className='Luci-ErrorCard symbolMapMaker'>
            <ErrorIcon className='error-icon' />
            <ErrorItem error={error} showFix={showFix} />
          </Div>
        );
      })
    : null;
}
/*
    // This invisible item ensures the Card maintains its layout space
    <Div className='Luci-ErrorCard symbolMapMaker' style={{ visibility: 'hidden' }}>
      <ErrorIcon />
      <ErrorItem error='Placeholder' />
    </Div>
*/

ErrorCard.propTypes = {
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string.isRequired,
      fix: PropTypes.string,
    }),
  ),
  showFix: PropTypes.bool,
};
ErrorCard.defaultProps = {
  errors: [],
  showFix: false,
};

/**
 * @component
 *
 * Sub-component for ErrorCard
 *
 */
function ErrorItem({ error, showFix }) {
  const { message, fix = null } = error;
  return (
    <ListItemText
      className='error-item'
      primary={message}
      secondary={
        showFix && fix ? (
          <Typography
            component='span'
            variant='body2'
            color='textSecondary'
          >{`Fix: ${fix}`}</Typography>
        ) : null
      }
    />
  );
}

ErrorItem.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    fix: PropTypes.string,
  }).isRequired,
  showFix: PropTypes.bool,
};
ErrorItem.defaultProps = {
  showFix: false,
};
