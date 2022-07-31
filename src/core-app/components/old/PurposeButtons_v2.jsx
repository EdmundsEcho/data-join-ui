/**
 * @module components/PurposeButtons_v2
 *
 * @description
 * User input similar to a group of radio buttons.
 * Returns a single value based on the which of the buttons is active.
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import ButtonGroup from '@mui/material/ButtonGroup';

/**
 *
 * name: purpose (used to update configured value)
 * value: unique identifyer for the circle component
 * activeCircle: the active circle
 *
 * @category Components
 *
 * @component
 *
 */
function Circle(props) {
  const { activeButton, name, value, title, children, onClick } = props;
  const isSelected = activeButton === value;

  const style = {
    backgroundColor: isSelected ? '#999' : '#FFF',
    border: '1px solid #999',
    borderRadius: 15,
    color: isSelected ? '#FFF' : '#333',
    cursor: 'pointer',
    float: 'left',
    height: 27,
    marginRight: 3,
    padding: 0,
    width: 27,
  };

  return (
    <button
      name={name}
      value={value}
      title={title}
      onClick={onClick}
      style={style}
      className={isSelected ? 'selected' : ''}
    >
      {children}
    </button>
  );
}

function PurposeButtonGroup(props) {
  const {
    onClick,
    value,
    showSubject,
    showQuality,
    showComponent,
    showTiming,
    showValue,
  } = props;

  const buttonBoxWidth =
    [showSubject, showQuality, showComponent, showTiming, showValue].filter(
      (showBool) => showBool,
    ).length * 30;

  const [activeButton, setActiveButton] = useState(() => value);

  const handleOnClick = (e) => {
    onClick(e);
    setActiveButton(e.value);
  };
  return (
    <ButtonGroup
      variant='contained'
      fullWidth={false}
      size='small'
      disableElevation
      style={{
        width: buttonBoxWidth,
      }}
    >
      {showSubject && (
        <Circle
          onClick={handleOnClick}
          title='Subject'
          value='subject'
          name='purpose'
          activeButton={activeButton}
        >
          S
        </Circle>
      )}
      {showQuality && (
        <Circle
          onClick={onClick}
          title='Quality'
          value='quality'
          name='purpose'
          activeButton={activeButton}
        >
          Q
        </Circle>
      )}
      {showComponent && (
        <Circle
          onClick={handleOnClick}
          title='Component'
          value='mcomp'
          name='purpose'
          activeButton={activeButton}
        >
          C
        </Circle>
      )}
      {showTiming && (
        <Circle
          onClick={handleOnClick}
          title='Timing'
          value='mspan'
          name='purpose'
          activeButton={activeButton}
        >
          T
        </Circle>
      )}
      {showValue && (
        <Circle
          onClick={handleOnClick}
          title='Value'
          value='mvalue'
          name='purpose'
          activeButton={activeButton}
        >
          V
        </Circle>
      )}
    </ButtonGroup>
  );
}

PurposeButtonGroup.propTypes = {
  showSubject: PropTypes.bool,
  showQuality: PropTypes.bool,
  showComponent: PropTypes.bool,
  showTiming: PropTypes.bool,
  showValue: PropTypes.bool, // mvalue
  onClick: PropTypes.func.isRequired,
  value: PropTypes.string,
};

PurposeButtonGroup.defaultProps = {
  showSubject: false,
  showQuality: false,
  showComponent: false,
  showTiming: false,
  showValue: false,
  value: undefined,
};

export default PurposeButtonGroup;
