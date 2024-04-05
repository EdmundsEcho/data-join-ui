import { PropTypes } from 'prop-types';
import Close from '@mui/icons-material/Close';
import clsx from 'clsx';

export const ModalContainer = ({
  className,
  title,
  show,
  showHeader,
  onClose,
  children,
}) => {
  return (
    <div className={`modal-root ${className}`}>
      {show && (
        <>
          <div
            className={clsx('header nostack nowrap space-between', {
              hidden: !showHeader,
            })}
          >
            {title && <h5 className='heading'>{title}</h5>}
            <button type='button' className='close-button' onClick={onClose}>
              <Close size='small' />
            </button>
          </div>
          <div className='main-content'>{children}</div>
        </>
      )}
    </div>
  );
};

ModalContainer.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  className: PropTypes.string.isRequired,
  show: PropTypes.bool,
  showHeader: PropTypes.bool,
};
ModalContainer.defaultProps = {
  title: undefined,
  show: false,
  showHeader: false,
};

export default ModalContainer;
