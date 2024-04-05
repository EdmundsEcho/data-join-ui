/**
 * @Deprecated
 * Prefer SliddingPopper
 */
import React, { useMemo, useCallback } from 'react';
import { PropTypes } from 'prop-types';

import clsx from 'clsx';

import Modal from './feedback/components/ModalContainer';

const SlidingPopup = ({
  horizontal,
  vertical,
  className: sharedClassName,
  title,
  slots,
  slotProps,
}) => {
  const animationClass = `${horizontal}-${vertical}`;

  // idle, enter, exit
  const [transition, setTransition] = React.useState(() => 'idle');

  // handlers
  const resetState = () => {
    setTransition(() => 'idle');
  };

  // used by the child component with an onClick prop
  const handleOpen = useCallback(() => {
    setTransition(() => 'enter');
  }, []);

  // used in a useEffect hook
  const handleExit = React.useCallback(() => {
    setTransition(() => 'exit');
    const timeout = setTimeout(resetState, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleDone = React.useCallback(() => {
    handleExit();
  }, [handleExit]);

  // Trigger Component
  const triggerComponent = useMemo(() => {
    const TriggerComponent = slots.trigger;
    const triggerProps = slotProps?.trigger || {};
    return (
      <TriggerComponent
        {...triggerProps}
        className={clsx(sharedClassName, triggerProps?.className)}
        onClick={handleOpen}
      />
    );
  }, [sharedClassName, slots.trigger, slotProps?.trigger, handleOpen]);

  // Main Content Component
  const contentComponent = useMemo(() => {
    const ContentComponent = slots.content;
    const contentProps = slotProps?.content || {};
    return <ContentComponent {...contentProps} onDone={handleDone} />;
  }, [slots.content, slotProps?.content, handleDone]);

  return (
    <div className='Luci-SlidingPopup'>
      {triggerComponent}
      <div className={`stage-root ${sharedClassName} ${animationClass} ${transition}`}>
        <Modal
          className={`frame ${sharedClassName}`}
          onClose={handleExit}
          title={title}
          show
          showHeader
        >
          {contentComponent}
        </Modal>
      </div>
    </div>
  );
};

SlidingPopup.propTypes = {
  horizontal: PropTypes.oneOf(['left', 'right']).isRequired,
  vertical: PropTypes.oneOf(['up', 'down']).isRequired,
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
  title: PropTypes.string,
};
// write the defaultProps value
SlidingPopup.defaultProps = {
  slotProps: {},
  title: ' ',
};

export default SlidingPopup;
