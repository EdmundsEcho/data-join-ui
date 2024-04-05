import React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';

// import clsx from 'clsx';

import Typography from '@mui/material/Typography';

// content
import ValueGridFileLevels from './ValueGridFileLevels';
import LevelSpans from '../LevelsView/LevelSpans';
import StatSummary from './StatSummary';

import { PURPOSE_TYPES, FIELD_TYPES } from '../../lib/sum-types';

function Levels({ getValue, fieldType, stateId }) {
  invariant(
    getValue instanceof Function && fieldType,
    'getValue must be a function and fieldType must be defined',
  );
  // levels format depends on the purpose
  const purpose = getValue('purpose');

  switch (purpose) {
    case PURPOSE_TYPES.MVALUE:
      if (fieldType === FIELD_TYPES.WIDE) {
        // for the initial render, the mvalue field isn't available
        // for now, always return null. TODO: eventually include in StatSummary
        // for mvalues.
        return null;
      }
      return (
        <StatSummary
          key={`${stateId}|statSummary`}
          getValue={getValue}
          fieldType={fieldType}
        />
      );

    case PURPOSE_TYPES.QUALITY:
    case PURPOSE_TYPES.MCOMP:
      return (
        <ValueGridFileLevels
          key={`${stateId}|valueGrid`}
          getValue={getValue}
          fieldType={fieldType}
        />
      );

    case PURPOSE_TYPES.MSPAN:
      if (getValue('levels-mspan')?.length > 0) {
        return (
          <LevelSpans
            key={`${stateId}|span-levels`}
            stateId={`${stateId}|span-levels`}
            time={getValue('time')}
            format={getValue('format')}
            spans={getValue('levels-mspan')}
            fieldType={fieldType}
          />
        );
      }
      return <ValueGridFileLevels getValue={getValue} fieldType={fieldType} />;

    case PURPOSE_TYPES.SUBJECT: {
      return getValue('null-value-count') > 0 ? (
        <Typography className='Luci-warning'>{`${getValue(
          'null-value-count',
        )} records will be ignored`}</Typography>
      ) : (
        <Typography>Looks great!</Typography>
      );
    }

    default:
  }
}

Levels.propTypes = {
  getValue: PropTypes.func.isRequired,
  stateId: PropTypes.string.isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
};

export default Levels;
