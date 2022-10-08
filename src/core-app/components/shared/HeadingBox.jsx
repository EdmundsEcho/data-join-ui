// src/components/HeadingBox.jsx

/**
 * @module components/HeadingBox
 *
 * @description
 * A styled-component
 *
 * ⬜ Refactor to use a more traditional Material-UI approach.
 *
 * 🦀 The div role button continues to have a tabindex despite setting
 *    its value to zero.
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import DownArrow from '@mui/icons-material/ArrowDropDown';

import usePersistedState from '../../hooks/use-persisted-state';

/**
 * A custom box that features
 * * an outline and heading/title
 * * a show/hide contents toggle
 *
 * @component
 *
 */
const HeadingBox = ({
  heading,
  children,
  width = '100%',
  marginTop = '20px',
  marginBottom = '0px',
  canCollapse,
  expanded,
  stateId = 'temp-undefined', // 🚧 make sure all users provide this prop
}) => {
  const [isOpen, setOpen] = usePersistedState(stateId, expanded);

  // fix JSX {{ ?
  const style = { marginTop, marginBottom };

  // onKeyDown={() => {}} // here to fix jsx click-events-have-key-events

  return (
    <Container style={style} className={clsx('Luci-FileField-HeadingBox')}>
      <div width={width} className='box-card'>
        {canCollapse && (
          <div role='button' tabIndex={-1} onClick={() => setOpen(!isOpen)}>
            <MinimizeButton isOpen={isOpen} />
          </div>
        )}
        {heading && (
          <div className={clsx('border-heading', { open: isOpen })}>
            <Typography variant='body2'>{heading}</Typography>
          </div>
        )}
        <div className={clsx('children', { open: isOpen })}>{children}</div>
      </div>
    </Container>
  );
};

HeadingBox.propTypes = {
  stateId: PropTypes.string.isRequired,
  heading: PropTypes.string,
  children: PropTypes.node,
  canCollapse: PropTypes.bool,
  expanded: PropTypes.bool,
  marginTop: PropTypes.string,
  marginBottom: PropTypes.string,
  width: PropTypes.string,
};

HeadingBox.defaultProps = {
  canCollapse: false,
  expanded: true,
  heading: '',
  children: null,
  width: '100%',
  marginTop: '20px', // ⚠️  unusual place to set this type of default
  marginBottom: '0px',
};

function MinimizeButton({ isOpen }) {
  return (
    <div className={clsx('minimize-button', { open: isOpen })}>
      <DownArrow />
    </div>
  );
}
MinimizeButton.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default HeadingBox;
