/**
 * @module components/PurposeButtons
 *
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';
import ButtonGroup from '@mui/material/ButtonGroup';

import { PURPOSE_TYPES as TYPES } from '../../lib/sum-types';

/**
 * Top-level export
 * @category Components
 *
 * @component
 */
const PurposeControl = (props) => {
  const {
    showSubject,
    showQuality,
    showComponent,
    showTiming,
    showValue, // mvalue
    onChange, // must process react onClick synthetic event
    disabled,
    name,
    value,
    stateId,
  } = props;

  // Note: onChange: (e) => {...}
  // So, each button has the same name, each value is different.
  // The group value = the latest clicked Circle where value = purpose.

  return (
    <ButtonGroup
      className='Luci-ButtonGroup-purpose'
      variant='contained'
      fullWidth={false}
      size='small'
      disabled={disabled}
      disableElevation>
      <div className='subgroup'>
        {showSubject && (
          <Circle
            key={`${stateId}-S`}
            id={`${stateId}-S`}
            name={name}
            value={value}
            onChange={onChange}
            title='Subject'
            purpose={TYPES.SUBJECT}>
            S
          </Circle>
        )}
        {showQuality && (
          <Circle
            key={`${stateId}-Q`}
            id={`${stateId}-Q`}
            name={name}
            value={value}
            onChange={onChange}
            title='Quality'
            purpose={TYPES.QUALITY}>
            Q
          </Circle>
        )}
      </div>
      <div className='subgroup'>
        {showComponent && (
          <Circle
            key={`${stateId}-C`}
            id={`${stateId}-C`}
            name={name}
            value={value}
            onChange={onChange}
            title='Component'
            purpose={TYPES.MCOMP}>
            C
          </Circle>
        )}
        {showTiming && (
          <Circle
            key={`${stateId}-T`}
            id={`${stateId}-T`}
            name={name}
            value={value}
            onChange={onChange}
            title='Timing'
            purpose={TYPES.MSPAN}>
            T
          </Circle>
        )}
        {showValue && (
          <Circle
            key={`${stateId}-V`}
            id={`${stateId}-V`}
            name={name}
            value={value}
            onChange={onChange}
            title='Value'
            purpose={TYPES.MVALUE}>
            V
          </Circle>
        )}
      </div>
    </ButtonGroup>
  );
};

PurposeControl.propTypes = {
  showSubject: PropTypes.bool,
  showQuality: PropTypes.bool,
  showComponent: PropTypes.bool,
  showTiming: PropTypes.bool,
  showValue: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  stateId: PropTypes.string,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  value: PropTypes.string,
};

PurposeControl.defaultProps = {
  showSubject: false,
  showQuality: false,
  showComponent: false,
  showTiming: false,
  showValue: false,
  disabled: false,
  name: 'purpose',
  value: '',
  stateId: 'LuciPurposeButton-default-stateId',
};

function Circle(props) {
  const { disabled, id, onChange, purpose, name, value, title, children } =
    props;
  // Note: onChange: (e) => {...}

  return (
    <button
      type='button'
      id={id}
      title={title}
      className={clsx('Luci-Button', 'purpose', {
        selected: value === purpose,
      })}
      disabled={disabled}
      name={name} // e.g., 'purpose'
      value={purpose}
      onClick={onChange} // sends (e) with name and value.
    >
      {children}
    </button>
  );
}

Circle.propTypes = {
  children: PropTypes.node.isRequired,
  onChange: PropTypes.func.isRequired,
  purpose: PropTypes.oneOf(Object.values(TYPES)).isRequired,
  disabled: PropTypes.bool,
  name: PropTypes.string.isRequired,
  value: PropTypes.string, // parent/group value
  title: PropTypes.string,
  id: PropTypes.string.isRequired,
};

Circle.defaultProps = {
  disabled: false,
  value: null,
  title: '',
};

export default PurposeControl;
