import { PropTypes } from 'prop-types';
import Close from '@mui/icons-material/Close';

export const ModalContainer = ({
  className,
  title,
  show,
  onClose,
  children,
}) => {
  return (
    show && (
      <div className={`feedback-modal root ${className}`}>
        <div className='header nostack nowrap space-between'>
          <h5 className='heading'>{title}</h5>
          <button type='button' className='close-button' onClick={onClose}>
            <Close size='small' />
          </button>
        </div>
        {children}
      </div>
    )
  );
};

ModalContainer.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  className: PropTypes.string.isRequired,
  show: PropTypes.bool,
};
ModalContainer.defaultProps = {
  title: 'What are your thoughts?',
  show: false,
};

export default ModalContainer;
