/**
 * @module src/components/Span
 * @description
 * Display only (mostly).  It reflects the state of the parent LevelSpans.
 *
 * The start date computation present here depends on unit selection in
 * the UI aligning with the moment package definition of units.
 *
 * @todo When the unit does not align with the format (e.g., trying to
 * display weeks with monthly data), the computation of spans fails.
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TimeSpanIcon from '@mui/icons-material/DateRange';

import { timeIntervalUnitOptions } from '../../constants/variables';
import { getFormattedDate } from '../../lib/filesToEtlUnits/transforms/span/span-helper';

/**
 * Display a summary span version of a time series.
 *
 * @component
 */
const Span = (props) => {
  const { className, reference, unit, span, spanIndex, format } = props;

  const length = span.rangeLength;

  // 🚧 EtlView only: Is there a way to toggle to the format-out when present?
  const formattedDate = getFormattedDate(span.rangeStart, {
    reference,
    unit,
    formatOut: format,
  });

  return (
    <Grid container className={clsx(className)}>
      <Grid item className='icon'>
        <TimeSpanIcon color='secondary' />
      </Grid>
      <Grid item>
        <Typography className='title' variant='h6'>
          {`${length} ${timeIntervalUnitOptions[unit]}${length > 1 ? 's' : ''}`}
        </Typography>
        <Typography className='subtitle' variant='body2'>
          {`${formattedDate} ${spanIndex === 0 ? '(start)' : ''}`}
        </Typography>
      </Grid>
    </Grid>
  );
};

Span.propTypes = {
  className: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  span: PropTypes.shape({
    rangeStart: PropTypes.number,
    rangeLength: PropTypes.number,
  }).isRequired,
  reference: PropTypes.shape({
    isoFormat: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  spanIndex: PropTypes.number.isRequired,
  format: PropTypes.string,
};

Span.defaultProps = {
  format: null,
};

export default Span;
