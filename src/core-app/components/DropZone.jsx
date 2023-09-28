// src/components/DropZone.jsx

/**
 * A Droppable wrapper used by dnd components where one expects to drop
 * components.
 *
 * See 'Dragger' component; a wrapper for draggable components.
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import Container from '@mui/material/Container';
import clsx from 'clsx';

import { Droppable } from '@hello-pangea/dnd';

/* eslint-disable react/jsx-props-no-spreading */

/**
 *
 * The component uses the "render-props" pattern
 *
 * ⬜ Tweak the size of the provided.placeholder
 *
 * @category Component
 *
 */
const DropZone = (props) => {
  const { config, children, ...dropProps } = props;
  // ⚠️  Make sure to have min height for dropZone
  return (
    <Droppable key={`dnd-droppable-${config.id}`} {...dropProps}>
      {(provided, snapshot) => (
        <Container
          className={clsx('dropZone', config.context, config.type, {
            activeZone: snapshot.isDraggingOver,
          })}
          {...provided.droppableProps}
          ref={provided.innerRef}>
          {/* Draggable children */}
          {children}
          {provided.placeholder}
        </Container>
      )}
    </Droppable>
  );
};

DropZone.propTypes = {
  config: PropTypes.shape({
    id: PropTypes.string.isRequired,
    height: PropTypes.number.isRequired,
    type: PropTypes.string,
    context: PropTypes.oneOf(['palette', 'canvas']).isRequired,
  }).isRequired,
  isCombineEnabled: PropTypes.bool,
  isDropDisabled: PropTypes.bool.isRequired,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  children: PropTypes.node.isRequired,
};

DropZone.defaultProps = {
  isCombineEnabled: false,
  direction: 'vertical',
};

export default DropZone;
