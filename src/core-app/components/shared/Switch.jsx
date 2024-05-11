// src/components/Workbench/components/EtlUnit/EtlUnitCardHeader.jsx

/**
 * Node item - CardHeader
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { FormControlLabel } from '@mui/material';
import InnerSwitch from '@mui/material/Switch';

/**
 * Stand-alone that provided with a callback updates the parent
 * when the switch state changes.
 *
 */
function Switch({
  labelOne,
  labelTwo,
  labelPlacement,
  checked: checkedProp,
  onChange,
  disabled,
  fontSize,
  color,
  className,
}) {
  const [checked, setChecked] = useState(() => checkedProp);

  const handleChange = useCallback(() => {
    setChecked(!checked);
    onChange(!checked ? labelOne : labelTwo);
  }, [checked, labelOne, labelTwo, onChange]);

  return (
    <FormControlLabel
      className={clsx(
        'Luci-Switch',
        `${fontSize}Font`,
        `${labelPlacement}Placement`,
        className,
      )}
      control={
        <InnerSwitch
          color={color}
          disableRipple
          onChange={handleChange}
          checked={checked}
          disabled={disabled}
        />
      }
      label={checked ? labelOne : labelTwo}
      labelPlacement={labelPlacement}
    />
  );
}

Switch.propTypes = {
  className: PropTypes.string.isRequired,
  labelOne: PropTypes.string.isRequired,
  labelTwo: PropTypes.string.isRequired,
  labelPlacement: PropTypes.oneOf(['start', 'end', 'top', 'bottom']),
  onChange: PropTypes.func,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  fontSize: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
};
Switch.defaultProps = {
  /* eslint-disable no-console */
  onChange: () => console.log('not configured'),
  disabled: false,
  labelPlacement: 'top',
  fontSize: 'small',
  color: 'primary',
};

export default Switch;
