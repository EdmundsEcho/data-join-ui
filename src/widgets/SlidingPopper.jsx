import React, { useMemo, useCallback } from 'react';
import { PropTypes } from 'prop-types';
import clsx from 'clsx';

import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';

import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';

import { useThemeMode } from '../hooks/use-theme-mode';

//-----------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_DIALOGS === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const SlidingPopper = ({
  className: sharedClassName,
  handle,
  placement,
  slots,
  slotProps,
}) => {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [themeMode] = useThemeMode();

  // used by the child component with an onClick prop
  const handleClick = useCallback(
    (event) => {
      setAnchorEl(anchorEl ? null : event.currentTarget);
      setOpen((prevOpen) => !prevOpen);
    },
    [anchorEl, setOpen],
  );

  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? 'transition-popper' : undefined;

  // Trigger Component
  const triggerComponent = useMemo(() => {
    const TriggerComponent = slots.trigger;
    const triggerProps = slotProps?.trigger || {};
    return (
      <TriggerComponent
        {...triggerProps}
        className={clsx(sharedClassName, triggerProps?.className)}
        onClick={handleClick}
        aria-describedby={id}
      />
    );
  }, [id, sharedClassName, slots.trigger, slotProps?.trigger, handleClick]);

  // Main Content Component
  const contentComponent = useMemo(() => {
    const ContentComponent = slots.content;
    const contentProps = slotProps?.content || {};
    return (
      <ContentComponent
        {...contentProps}
        className={clsx(sharedClassName, contentProps?.className)}
        onDone={handleClick}
      />
    );
  }, [sharedClassName, slots.content, slotProps?.content, handleClick]);

  return (
    <div className='Luci-SlidingPopper'>
      {triggerComponent}

      <Popper
        className={`${themeMode}-theme-context`}
        id={id}
        open={open}
        anchorEl={anchorEl}
        transition
        placement={placement}
      >
        {({ TransitionProps }) => (
          <Draggable handle={handle}>
            <Resizable>
              <Fade {...TransitionProps} timeout={350}>
                <div>{contentComponent}</div>
              </Fade>
            </Resizable>
          </Draggable>
        )}
      </Popper>
    </div>
  );
};

SlidingPopper.propTypes = {
  slots: PropTypes.shape({
    trigger: PropTypes.elementType.isRequired,
    content: PropTypes.elementType.isRequired,
  }).isRequired,
  slotProps: PropTypes.shape({
    trigger: PropTypes.shape({
      color: PropTypes.string,
      className: PropTypes.string,
    }),
    content: PropTypes.shape({}),
  }),
  className: PropTypes.string.isRequired,
  handle: PropTypes.string.isRequired, // the class name of the handle
  placement: PropTypes.oneOf([
    'top-start',
    'top-end',
    'left-start',
    'left-end',
    'bottom-start',
    'bottom-end',
    'right-end',
    'right-start',
    'top',
    'bottom',
    'right',
    'left',
  ]).isRequired,
};
// write the defaultProps value
SlidingPopper.defaultProps = {
  slotProps: {},
};

export default SlidingPopper;
