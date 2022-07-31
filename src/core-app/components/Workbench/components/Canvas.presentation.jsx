// src/components/Workbench/Canvas.presentation.jsx
//
/**
 *
 * The RHS of the Workbench
 *
 * The user designs the subset request of the ObsEtl (aka etlUnits) from the
 * Palette on the LHS.
 */

import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import { Droppable, Draggable } from 'react-beautiful-dnd';

import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';

// 📖 data: the canvas superGroups/columns
import { useSelector } from 'react-redux';
import { getCanvasLists } from '../../../ducks/rootSelectors';

import Node from './Node';

import { NODE_TYPES } from '../../../lib/sum-types';

//------------------------------------------------------------------------------
const DEBUG = false;
//------------------------------------------------------------------------------
/* eslint-disable no-console, no-shadow, react/jsx-props-no-spreading */

/**
 * @component
 */
const Canvas = ({ rootNode }) => {
  // node 2 children
  const canvasLists = useSelector(getCanvasLists);

  if (DEBUG) {
    console.debug(`📋 Lists (SuperGroups)`);
    console.dir(canvasLists);
  }

  // 📖 ...not so fast, wait for the data honey :))
  if (typeof canvasLists === 'undefined') return null;

  return (
    <Droppable
      droppableId={`${rootNode}`}
      direction='horizontal'
      isDropDisabled={false}
      type='column'
    >
      {(provided) => (
        <Container
          key='Canvas-Container'
          className={clsx('canvas-root')}
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {canvasLists.map((superGroupId, index) => (
            <Draggable
              key={`draggable-superGroup-${superGroupId}`}
              draggableId={`${superGroupId}`}
              index={index}
            >
              {/* map of superGroup-roots (vs singleton for Palette) */}
              {(provided) => (
                <Container
                  className={clsx('Node-root', 'superGroup', 'canvas')}
                  key={`superGroup-${superGroupId}`}
                  {...provided.draggableProps}
                  ref={provided.innerRef}
                >
                  {/* WIP - Improve the handle for columns */}
                  <Divider
                    className={clsx('top-bar')}
                    orientation='horizontal'
                    variant='middle'
                    {...provided.dragHandleProps}
                  />
                  <Node
                    key={`node-canvas-${superGroupId}`}
                    id={superGroupId}
                    type={NODE_TYPES.CANVAS}
                    index={index}
                    parentIndex={rootNode}
                  />
                </Container>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </Container>
      )}
    </Droppable>
  );
};

Canvas.propTypes = {
  rootNode: PropTypes.number.isRequired,
};

export default Canvas;
