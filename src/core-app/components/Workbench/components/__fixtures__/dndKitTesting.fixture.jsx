import React, { useState } from 'react';

import makeStyles from '@mui/styles/makeStyles';
import { DndContext, useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Checkbox from '@mui/material/Checkbox';
import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';

import Palette from '../Palette.presentation';
import EtlUnit from '../EtlUnit/EtlUnit';

import ReduxMock from '../../../../cosmos.mock-store';

const useStyles = makeStyles((theme) => {
  console.log(JSON.stringify(Object.keys(theme.props)));
});

const Component = () => {
  // const classes = useStyles();
  // const [isDropped, setIsDropped] = useState(() => false);
  const draggableMarkup = (
    <Draggable id='draggable'>
      <EtlUnit context='canvas' nodeId={24} />
    </Draggable>
  );

  function handleDragEnd(event) {
    const { over } = event;

    // If the item is dropped over a container, set it as the parent
    // otherwise reset the parent to `null`
    setParent(over ? over.id : null);
  }
  const containers = ['A', 'B', 'C'];
  const [parent, setParent] = useState(null);

  return (
    <ReduxMock>
      <DndContext onDragEnd={handleDragEnd}>
        {parent === null ? draggableMarkup : null}

        {containers.map((id) => (
          // We updated the Droppable component so it would accept an `id`
          // prop and pass it to `useDroppable`
          <Droppable key={id} id={id}>
            {parent === id ? draggableMarkup : 'Drop here'}
          </Droppable>
        ))}
      </DndContext>
    </ReduxMock>
  );
};

function Droppable({ children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable',
  });
  const style = {
    color: isOver ? 'green' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}

function Draggable({ children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        // transform: CSS.translate.toString(transform),
      }
    : undefined;

  return (
    <button
      type='button'
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </button>
  );
}
export default <Component />;
