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

import styled from 'styled-components';

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import DownArrow from '@mui/icons-material/ArrowDropDown';

import usePersistedState from '../../hooks/use-persisted-state';

const Box = styled.div`
  background-color: #fff;
  border: 1px solid #d3d3d3;
  border-radius: 6px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  width: ${({ width }) => width && `${width}px`};

  div.children {
    display: none;
  }

  div.children.isOpen {
    display: block;
    transition: visibility 0s, opacity 0.5s linear;
  }
`;

const Heading = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 3px 3px;
  position: absolute;
  top: ${({ isOpen }) => (isOpen ? `-14px` : `9px`)};
  left: 18px;
`;

const MinimizeContainer = styled.div`
  background: #fff;
  color: #999;
  border-radius: 6px;
  padding-left: 6px;
  padding-right: 6px;
  position: absolute;
  top: ${({ isOpen }) => (isOpen ? `-11px` : `5px`)};
  right: 17px;
  transform: ${({ isOpen }) => `rotate(${isOpen ? 0 : 180}deg)`};

  &:hover {
    transform: ${({ isOpen }) => `rotate(${isOpen ? 0 : 180}deg)`};
    background-color: #eee;
    cursor: pointer;
    top: ${({ isOpen }) => (isOpen ? `-11px` : `5px`)};
  }
`;

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
      <Box width={width}>
        {canCollapse && (
          <div role='button' tabIndex={-1} onClick={() => setOpen(!isOpen)}>
            <MinimizeButton isOpen={isOpen} />
          </div>
        )}
        {heading && (
          <Heading isOpen={isOpen}>
            <Typography variant='body2'>{heading}</Typography>
          </Heading>
        )}
        <div className={`children ${isOpen ? 'isOpen' : ''}`}>{children}</div>
      </Box>
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
    <MinimizeContainer isOpen={isOpen}>
      <DownArrow />
    </MinimizeContainer>
  );
}
MinimizeButton.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default HeadingBox;
