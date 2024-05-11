import React from 'react';
import PropTypes from 'prop-types';

import FormatRow from './shared/FieldInputs/FormatRow';
import NullValueRow from './shared/FieldInputs/NullValueRow';
import CodomainReducerRow from './shared/FieldInputs/CodomainReducerRow';
import SlicingReducerRow from './shared/FieldInputs/SlicingReducerRow';
import IntervalBox from './shared/FieldInputs/IntervalBox';

// ⚙️
import {
  displayInput as init,
  FIELD_TYPES,
  PURPOSE_TYPES,
} from '../constants/field-input-config';

/**
 * todo: disable null-value-expansion when set by the system
 */
const FieldDelegate = ({
  fieldType,
  saveChange,
  onBlur,
  onChange,
  onKeyDown,
  onKeyUp,
  hasNullValues,
  hasImpliedMvalue,
  getValue,
  stateId,
}) => {
  //
  // ⚙️
  // instantiate given field type and purpopse
  //
  // ⚠️  The WIDE field type uses the FILE config
  // (manual override because config only covers ETL/FILE x purpose)
  //
  const displayInput =
    fieldType === FIELD_TYPES.WIDE
      ? init(FIELD_TYPES.FILE, getValue('purpose'))
      : init(fieldType, getValue('purpose'));

  // null value: explicit expression of subtle difference
  const nullValueFieldName =
    fieldType === FIELD_TYPES.FILE ? 'null-value' : 'null-value-expansion';

  //
  // ⬜ Unit tests to validate the logic
  // do not show the null-value input when...
  // 🔖 WIDE format does not need to consider null values
  //
  const impliedMvalueDate =
    hasImpliedMvalue && getValue('purpose') === PURPOSE_TYPES.MSPAN;

  const hideNullValueOverride =
    impliedMvalueDate || !hasNullValues || !displayInput(nullValueFieldName);

  // 🚧 The permit-null configuration seems redundant
  const nullValueRequired = !displayInput('permit-null') && !hideNullValueOverride;

  return (
    <>
      {!displayInput('format') ? null : (
        <div className='delegate-item'>
          {/* Format in || out */}
          <FormatRow
            key={`${stateId}|format-${getValue('format')}`}
            stateId={`${stateId}|format`}
            name='format'
            label={fieldType === FIELD_TYPES.FILE ? 'Format in' : 'Format out'}
            value={getValue('format') || ''}
            saveChange={saveChange}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
          />
        </div>
      )}

      {/* Design note */}
      {/* null-value is a field-level concept */}
      {/* null-value-expansion is an ETL-level concept */}
      {/* 🔖  Note the override for wide-to-long caller */}

      {!hideNullValueOverride ? (
        <div className='delegate-item'>
          {/* Null */}
          <NullValueRow
            key={`${stateId}|${nullValueFieldName}`}
            stateId={`${stateId}|${nullValueFieldName}`}
            fieldType={fieldType}
            name={nullValueFieldName}
            value={getValue(nullValueFieldName) ?? ''}
            saveChange={saveChange}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            required={nullValueRequired}
          />
        </div>
      ) : null}

      {/* Design note */}
      {/* ETL displays this field elsewhere */}
      {!displayInput('codomain-reducer') || fieldType === FIELD_TYPES.ETL ? null : (
        <div className='delegate-item'>
          {/* Dedup */}
          <CodomainReducerRow
            key={`${stateId}|codomain-reducer`}
            stateId={`${stateId}|codomain-reducer`}
            name='codomain-reducer'
            value={
              getValue('codomain-reducer') ||
              (getValue('purpose') === 'mvalue' ? 'SUM' : 'FIRST')
            }
            onChange={saveChange}
          />
        </div>
      )}
      {/* Design note */}
      {/* The codomain slicing reducer is ultimately an etl-level concept */}
      {!displayInput('slicing-reducer') ? null : (
        <div className='delegate-item'>
          {/* Combine when reducing */}
          <SlicingReducerRow
            key={`${stateId}|slicing-reducer`}
            stateId={`${stateId}|slicing-reducer`}
            name='slicing-reducer'
            value={getValue('slicing-reducer') || 'SUM'}
            onChange={saveChange}
          />
        </div>
      )}
      {!displayInput('time') ? null : (
        <div className='delegate-item'>
          <IntervalBox
            key={`${stateId}|time.interval`}
            stateId={`${stateId}|time.interval`}
            unit={getValue('time').interval.unit || ''}
            count={parseInt(getValue('time').interval.count, 10)}
            onChange={saveChange}
          />
        </div>
      )}
    </>
  );
};

FieldDelegate.propTypes = {
  stateId: PropTypes.string.isRequired,
  fieldType: PropTypes.oneOf(Object.values(FIELD_TYPES)).isRequired,
  getValue: PropTypes.func.isRequired,
  saveChange: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
  hasNullValues: PropTypes.bool.isRequired,
  hasImpliedMvalue: PropTypes.bool,
};

FieldDelegate.defaultProps = {
  onChange: undefined,
  onBlur: undefined,
  onKeyDown: undefined,
  onKeyUp: undefined,
  hasImpliedMvalue: false,
};

export default FieldDelegate;
