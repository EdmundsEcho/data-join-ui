import Feedback, { FeedbackFab } from './feedback/Feedback';
import SlidingPopper from './SlidingPopper';

const SlidingPopperFeedback = () => {
  return (
    <SlidingPopper
      className='Luci-Feedback-dialog feedback'
      placement='left-end'
      handle='.feedback.modal-root'
      slots={{
        trigger: FeedbackFab,
        content: Feedback,
      }}
      slotProps={{
        trigger: { color: 'secondary', className: 'fab' },
        content: { withModal: true, title: 'Your feedback will help!' },
      }}
    />
  );
};

export default SlidingPopperFeedback;
