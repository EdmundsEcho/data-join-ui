// src/components/Dragger.jsx

/**
 * @module
 * @description
 * A Draggable wrapper used by dnd components for components one expects to
 * drag.
 *
 * See 'Dropzone' component; a wrapper for where these components can be
 * dropped.
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { Draggable } from '@hello-pangea/dnd';
import Container from '@mui/material/Container';

/* eslint-disable react/jsx-props-no-spreading */
/*
const getItemStyle = (draggableStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle,
});
*/

/**
 *
 * Draggable component.
 *
 * The component uses the "render-props" pattern; a pattern that is mostly
 * redundant with the subsequent advent of React hooks.
 *
 * There are two parts to this component:
 *
 *    👉 what gets moved
 *    👉 the "handle" used to drag the object
 *
 *
 * 🏷️  index encodes the sequence
 *    must be sequential; starting at zero is optional
 *
 * @category Component
 *
 */
const Dragger = (props) => {
  const { config, children, moveOrCopy, className } = props;
  // style={getItemStyle(provided.draggableProps.style)}
  // ⚠️  Top and bottom margins of draggble must be equal
  //    see: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/draggable.md#unsupported-margin-setups
  //
  return (
    <Draggable
      key={`dnd-draggable-${config.id}`}
      draggableId={config.id}
      index={config.index}
      isDragDisabled={config?.isDragDisabled ?? false}>
      {(provided, snapshot) => {
        return (
          <>
            <Container
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={clsx(
                className,
                'dragger',
                config.type,
                config.context,
                {
                  dragging: snapshot.isDragging,
                },
              )}>
              {/* children = Node */}
              {children}
            </Container>
            {moveOrCopy === 'COPY' && snapshot.isDragging && (
              <div className={clsx('dragging')}>{children}</div>
            )}
          </>
        );
      }}
    </Draggable>
  );
};

// {...provided.dragHandleProps}
// {/* provided.placeholder */}
// {!mutable && snapshot.isDragging && <>{children}</>}
Dragger.propTypes = {
  config: PropTypes.shape({
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    isDragDisabled: PropTypes.bool,
    height: PropTypes.number,
    context: PropTypes.oneOf(['palette', 'canvas']).isRequired,
    type: PropTypes.oneOf(['superGroup', 'group', 'leaf']).isRequired,
  }).isRequired,
  className: PropTypes.string,
  moveOrCopy: PropTypes.oneOf(['COPY', 'MOVE']).isRequired,
  children: PropTypes.node.isRequired,
};

Dragger.defaultProps = {
  className: undefined,
};

export default Dragger;
