// src/components/EtlFieldForm/components/SourcesBox.jsx

/**
 * @module components/EtlFieldForm/components/SourcesBox
 *
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { TableContainer } from '@mui/material';
import DraggableIcon from '../../../assets/DraggableIcon';
import HeadingBox from '../HeadingBox';

import { getFilenameFromPath } from '../../../lib/filesToEtlUnits/headerview-helpers';
import { moveItemInArray } from '../../../utils/common';
// import { SOURCE_TYPES } from '../../../lib/sum-types';

/* eslint-disable react/jsx-props-no-spreading */

const grid = 8;

const getItemStyle = (_, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  // background: isDragging ? 'lightgreen' : 'red',

  // styles we need to apply on draggables
  ...draggableStyle,
  width: 700,
});
/**
 * @component
 *
 * UI input:
 * 1. change the file read-in sequence
 * 2. backtrack to edit the individual file header view
 *
 * ⚠️  Parent to provide callback to render the HeaderViewDialog.
 */
function SourcesBox(props) {
  const {
    stateId,
    onViewSource, // ⚠️  callback to render HeaderViewDialog
    name,
    sources, // 📖
    mapFiles, // optional for derived etl field 📖
    canEditSources,
    canReorderSources: canReorderSourcesProp,
    onChange,
    children,
  } = props;

  const canReorderSources = canReorderSourcesProp && sources.length > 1;

  /* dnd changes to file sequence */
  const onDragEnd = useCallback(
    (result) => {
      // dropped outside the list
      if (!result.destination) return;
      // dropped in the same location as where started
      if (result.source.index === result.destination.index) return;

      // create a new array to reflect the change
      const updatedSources = moveItemInArray(
        sources,
        result.source.index,
        result.destination.index,
      );

      // (e) => handleSaveChange(field.name, e.target.name, e.target.value)
      const syntheticEvent = {
        target: { name, value: updatedSources },
      };
      onChange(syntheticEvent);
    },
    [name, onChange, sources],
  );

  // ⬜ Unify the use of styles with the rest of the app
  const filenameHandleStyle = (draggableSnapshot, draggableProvided) => ({
    ...getItemStyle(
      draggableSnapshot.isDragging,
      draggableProvided.draggableProps.style,
    ),
    height: 50,
    padding: 0,
  });

  const getDerivedValue = useCallback(
    (filename) => mapFiles?.arrows[filename] ?? '',
    [mapFiles],
  );

  return (
    <>
      {sources.length > 0 ? (
        <HeadingBox heading='Sources' stateId={`${stateId}|heading-box`}>
          <Box mb={5}>{children}</Box>
          <TableContainer>
            <table className={clsx('Luci-Table-Sources', 'sequence')}>
              <tbody>
                {sources.map((_, idx) => (
                  <tr key={idx}>
                    <td>
                      {canReorderSources && (
                        <Typography variant='body1'>{idx + 1}</Typography>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId='droppable'>
                {(droppableProvided /* droppableSnapshot */) => (
                  <table
                    className={clsx('Luci-Table-Sources', 'filenames')}
                    ref={droppableProvided.innerRef}
                  >
                    <tbody>
                      {sources.map((source, idx) => (
                        <Draggable
                          key={source.filename}
                          draggableId={source.filename}
                          index={idx}
                          isDragDisabled={!canReorderSources}
                        >
                          {(draggableProvided, draggableSnapshot) => (
                            <tr
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              {...draggableProvided.dragHandleProps}
                              style={filenameHandleStyle(
                                draggableSnapshot,
                                draggableProvided,
                              )}
                            >
                              <td style={{ width: 325 }}>
                                <Typography variant='body1' noWrap>
                                  {canReorderSources && (
                                    <DraggableIcon
                                      className={clsx(
                                        'Luci-Sources',
                                        'Luci-Icon',
                                        'sourceDragIcon',
                                      )}
                                    />
                                  )}
                                  <Box component='span' title={source.filename}>
                                    {getFilenameFromPath(source.filename)}
                                    {getDerivedValue(source.filename)
                                      ? ` (derived value: ${getDerivedValue(
                                          source.filename,
                                        )})`
                                      : ''}
                                  </Box>
                                </Typography>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                    </tbody>
                    {droppableProvided.placeholder}
                  </table>
                )}
              </Droppable>
            </DragDropContext>
            <table style={{ float: 'right' }}>
              <tbody>
                {sources.map((source, idx) => (
                  <tr key={idx}>
                    <td style={{ height: 50 }}>
                      {canEditSources &&
                        getDerivedValue(source.filename) === '' && (
                          <EditIcon
                            style={{ fontSize: 16 }}
                            onClick={() => onViewSource(source.filename)}
                          />
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ clear: 'both' }} />
          </TableContainer>
        </HeadingBox>
      ) : null}
    </>
  );
}

SourcesBox.propTypes = {
  stateId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      filename: PropTypes.string.isRequired,
    }),
  ).isRequired,
  mapFiles: PropTypes.shape({
    arrows: PropTypes.shape({}),
  }),
  width: PropTypes.string,
  canReorderSources: PropTypes.bool,
  canEditSources: PropTypes.bool,

  // callbacks
  onChange: PropTypes.func.isRequired,
  onViewSource: PropTypes.func.isRequired,

  // components
  children: PropTypes.node,
};

SourcesBox.defaultProps = {
  width: 'auto',
  canReorderSources: true,
  canEditSources: true,
  children: null,
  mapFiles: undefined,
};

export default SourcesBox;
