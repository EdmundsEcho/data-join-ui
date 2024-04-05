// src/components/shared/SpanInput.jsx

/**
 * @module src/components/Span
 *
 */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import TimeSpanIcon from '@mui/icons-material/DateRange';

import Switch from './Switch';

import { timeIntervalUnitOptions } from '../../constants/variables';
import { getFormattedDate } from '../../lib/filesToEtlUnits/transforms/span/span-helper';
import { range } from '../../utils/common';
import { InputError } from '../../lib/LuciErrors';
import { Div } from '../../../luci-styled';

import ToggleIncludeField from './ToggleIncludeField';
import SelectMenu from './SelectMenu';

//------------------------------------------------------------------------------
const DEBUG = false;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
/**
 * Display and record user input.
 * Display a summary span version of a time series.
 *
 * 💡 update parent with what remains of the time span (not already selected)
 *    -> Use the remainder as the basis for the next span value.
 *
 * The start date computation depends on unit selection in
 * the UI aligning with the moment package definition of units.
 *
 * ⬜ When the unit does not align with the format (e.g., trying to
 *    display weeks with monthly data), the computation of spans fails.
 *
 * 🦀 Truncates the available options when the action updates the store.
 *     ... was part of the original intent: create a new request for each
 *     subset.
 *
 * 🚧 Flaw: Making a selection changes what the component understands
 *          what ther range value is.  The only way to retrieve the
 *          actual value is to start over with new dropped chip.
 *          TODO: Likely drop the dynamic update of remaining.  Use
 *          the 💡 instead. Keep in mind the request will limit the
 *          request as needed.
 *
 * @component
 *
 */
const SpanInput = (props) => {
  // --------------------------------------------------------------------
  const {
    span,
    formatOut,
    timeProp,
    handleUpdate,
    handleToggleValue,
    displayType,
    request,
  } = props;

  // console.log(`Time prop: ${JSON.stringify(timeProp)}`);
  // --------------------------------------------------------------------
  // Relation between disabled and request
  const disabled = !request && displayType === 'toggle';

  //
  //          33 timeProp.reference.idx
  //          v
  // universe |-----------------|
  // span     |------------|
  //          ^
  //          0 span.rangeStart
  //
  //

  //----------------------------------------------------------------------------
  // independent state values
  // absolute about the available data
  // 🦀 the available amount changes with earch re-render
  const [availableSpanStart] = useState(() => span.rangeStart);
  const [availableSpanLength] = useState(() => span.rangeLength);
  //
  // dynamic span values to determine when to adjust one value based on the value
  // of another.
  const [requestedSpanStart, setRequestedSpanStart] = useState(() => span.rangeStart);

  const [requestedSpanLength, setRequestedSpanLength] = useState(
    () => span.rangeLength,
  );

  const [requestedSpanSeries, setRequestedSpanSeries] = useState(() => !span.reduced);

  const availableValueOptions = range(
    span.rangeStart,
    span.rangeStart + span.rangeLength,
  ).map((offset) => ({
    value: offset,
    option: getFormattedDate(offset, {
      reference: timeProp.reference,
      unit: timeProp.interval.unit,
      formatOut,
    }),
  }));

  const availableSpanLengthOptions = range(1, availableSpanLength + 1)
    .map((value) => ({
      value,
      option: value,
    }))
    .reverse();

  if (DEBUG) {
    console.debug(`span value:`);
    console.dir({
      span,
      requestedSpanStart,
      requestedSpanSeries,
      availableValueOptions,
      availableSpanLengthOptions,
    });
  }
  //
  // 👉 Set when loaded
  // 👉 Set with every change in selected value
  // 👉 May be updated with a start date change
  //
  // compute options for length based on the start date
  //
  // 🔑 requestedStart values are limited to startDateOptions
  //    (built-in valid)
  //    relies on local state
  //
  const remainingSpanLength = useCallback(
    (newSpanValue = undefined) => {
      const spanStart = newSpanValue ?? requestedSpanStart;
      // e.g., 0 - 0, 1 - 0
      const moveTimeUnitForward = spanStart - span.rangeStart;
      // the lowest value = 1
      const remaining = span.rangeLength - moveTimeUnitForward;
      if (remaining < 1) {
        throw new InputError(
          `The span length is less than 1: ${span.rangeLength} - ${moveTimeUnitForward}`,
        );
      }
      return remaining;
    },
    [requestedSpanStart, span.rangeLength, span.rangeStart],
  );

  const handleChangeSpanLength = useCallback(
    (event) => {
      setRequestedSpanLength(+event.target.value);
      // in the event startDate is now too late,
      // update the value to the new latest possible time
      //
      // length is 20. want 21.
      // how know when to update start?
      // 🟢 1, 20
      // ... then change 20 -> 21
      // 🚫 1, 21           (maybeAdjust = 22 - 21)
      // 🛈  1 -> 0, 21
      // ✅ 0, 21
      //
      const maybeAdjustStart =
        requestedSpanStart +
        +event.target.value -
        (availableSpanStart + availableSpanLength);
      if (maybeAdjustStart > 0) {
        setRequestedSpanStart(requestedSpanStart - maybeAdjustStart); // triggers a re-render
      }
      // 📬
      handleUpdate({
        request: true,
        value: {
          rangeStart:
            +requestedSpanStart - (maybeAdjustStart > 0 ? maybeAdjustStart : 0),
          rangeLength: +event.target.value,
          reduced: !requestedSpanSeries,
        },
      });
    },
    [
      availableSpanLength,
      availableSpanStart,
      handleUpdate,
      requestedSpanSeries,
      requestedSpanStart,
    ],
  );

  const handleChangeSpanStart = useCallback(
    (event) => {
      setRequestedSpanStart(+event.target.value);
      // in the event spanLength is now too long,
      // update the value to the new possible max
      const remainingLength = remainingSpanLength(+event.target.value);
      if (remainingLength < requestedSpanLength) {
        setRequestedSpanLength(remainingLength); // triggers a re-render
      }
      // 📬
      handleUpdate({
        request: true,
        value: {
          rangeStart: +event.target.value,
          rangeLength:
            +remainingLength < +requestedSpanLength
              ? +remainingLength
              : +requestedSpanLength,
          reduced: !requestedSpanSeries,
        },
      });
    },
    [handleUpdate, remainingSpanLength, requestedSpanLength, requestedSpanSeries],
  );

  const handleReducedToggle = useCallback(() => {
    const tmp = !requestedSpanSeries;
    setRequestedSpanSeries(tmp);
    // 📬
    handleUpdate({
      request: true,
      value: {
        rangeStart: requestedSpanStart,
        rangeLength: requestedSpanLength,
        reduced: !tmp,
      },
    });
  }, [handleUpdate, requestedSpanLength, requestedSpanSeries, requestedSpanStart]);

  //
  // Each card
  // 👉 is responsible for making sure the input is valid
  // 👉 represents a time-span
  // 👉 card can be "subset'ed"
  // 👉 has a toggle for reduced or series
  //
  return (
    <Div className={clsx('Luci-SpanInput root', { list: displayType !== 'icon' })}>
      <DisplayType
        className='displayType'
        displayType={displayType}
        disabled={disabled}
        handleToggleValue={handleToggleValue}
        request={request}
      />
      <SelectMenu
        className='selectMenu-spanStart'
        key='selectMenu-spanStart'
        options={availableValueOptions}
        name='spanStart'
        value={requestedSpanStart}
        label='start'
        onChange={handleChangeSpanStart}
        disabled={disabled}
        disableUnderline
      />
      <SelectMenu
        className='selectMenu-spanLength'
        key='selectMenu-spanLength'
        options={availableSpanLengthOptions}
        name='spanLength'
        value={requestedSpanLength}
        label={`${timeIntervalUnitOptions[timeProp.interval.unit].toLowerCase()}${
          requestedSpanLength > 1 ? 's' : ''
        }`}
        onChange={handleChangeSpanLength}
        disabled={disabled}
        disableUnderline
      />
      <Switch
        className='switch'
        checked={requestedSpanSeries}
        onChange={handleReducedToggle}
        labelOne='series'
        labelTwo='rollup'
        name='reduced'
        color='primary'
        disabled={disabled || span.rangeLength === 1 || requestedSpanLength === 1}
      />
    </Div>
  );
};

SpanInput.propTypes = {
  handleUpdate: PropTypes.func.isRequired,
  handleToggleValue: PropTypes.func.isRequired,
  formatOut: PropTypes.string,
  span: PropTypes.shape({
    rangeStart: PropTypes.number.isRequired,
    rangeLength: PropTypes.number.isRequired,
    reduced: PropTypes.bool.isRequired,
  }).isRequired,
  timeProp: PropTypes.shape({
    reference: PropTypes.shape({
      isoFormat: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      idx: PropTypes.number.isRequired,
    }).isRequired,
    interval: PropTypes.shape({
      unit: PropTypes.oneOf(['M', 'D', 'W']).isRequired, // partial
      count: PropTypes.number,
    }).isRequired,
  }).isRequired,
  displayType: PropTypes.oneOf(['toggle', 'icon']),
  request: PropTypes.bool,
};

SpanInput.defaultProps = {
  formatOut: null,
  displayType: 'icon',
  request: true,
};

function DisplayType({ displayType, disabled, handleToggleValue, request }) {
  return displayType === 'icon' ? (
    <TimeSpanIcon
      className={clsx('span-icon', {
        disabled,
      })}
      color='secondary'
    />
  ) : (
    <Button size='small' disableElevation onClick={() => handleToggleValue()}>
      <ToggleIncludeField color='primary' checked={request} />
    </Button>
  );
}
DisplayType.propTypes = {
  displayType: PropTypes.oneOf(['toggle', 'icon']).isRequired,
  disabled: PropTypes.bool,
  handleToggleValue: PropTypes.func.isRequired,
  request: PropTypes.bool.isRequired,
};
DisplayType.defaultProps = {
  disabled: false,
};
export default SpanInput;

/*
  const valueOptions = range(
    span.rangeStart,
    span.rangeStart + span.rangeLength,
  ).map((offset) => ({
    value: offset,
    option: getFormattedDate(offset, {
      reference: timeProp.reference,
      unit: timeProp.interval.unit,
      formatOut,
    }),
  }));
  const spanLengthOptions = range(1, remainingSpanLength() + 1)
    .map((value) => ({
      value,
      option: value,
    }))
    .reverse();
*/
