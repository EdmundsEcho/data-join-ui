// src/components/LevelsView/LevelSpans.jsx

/**
 * @module components/LevelsView/LevelSpans
 *
 * @description
 * Mspan specialized view of the time/date values.
 * Only available when 'span' values can be generated from the raw
 * date/time levels.
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import Grid from '@mui/material/Grid';

import Span from '../shared/Span';
import { Div } from '../../../luci-styled';
import { FIELD_TYPES } from '../../lib/sum-types';

/**
 * A specialized view of levels for when it is possible to display
 * data::time in the form of a time-span.
 *
 * 🔖 Note experimental capacity tag capacity to inform theme css
 *    format and layout. Likely something to abstract and configure.
 *
 * @component
 *
 * @category Component
 *
 */
const LevelSpans = ({ time, spans, fieldType, format }) => {
  //
  let capacityState = '';
  const minThreshold = 4;
  const maxBeforeScroll = 6;
  //
  switch (true) {
    case spans.length === 0:
      capacityState = 'empty';
      break;

    case spans.length === 1:
      capacityState = 'singleton';
      break;

    case spans.length > 1 && spans.length <= minThreshold:
      capacityState = 'belowCapacity';
      break;

    case spans.length > minThreshold && spans.length <= maxBeforeScroll:
      capacityState = 'atCapacity';
      break;

    default:
      capacityState = 'aboveCapacity';
  }

  return (
    <Grid container className={clsx('Luci-FileField-LevelSpans', capacityState)}>
      {spans.map((span, idx) => (
        <Div className='Luci-SpanLevel-Chip div' key={idx}>
          <Span
            className='chip'
            spanIndex={idx}
            reference={time.reference}
            unit={time.interval.unit}
            span={span}
            format={fieldType === FIELD_TYPES.ETL && format ? format : null}
          />
        </Div>
      ))}
    </Grid>
  );
};

LevelSpans.propTypes = {
  time: PropTypes.shape({
    reference: PropTypes.shape({
      idx: PropTypes.number.isRequired,
      value: PropTypes.string.isRequired,
      isoFormat: PropTypes.string.isRequired,
    }),
    interval: PropTypes.shape({
      unit: PropTypes.string,
    }),
  }).isRequired,
  spans: PropTypes.arrayOf(PropTypes.object),
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
  format: PropTypes.string,
};

LevelSpans.defaultProps = {
  spans: [],
  format: null,
};

export default LevelSpans;
