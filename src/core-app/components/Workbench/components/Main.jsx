//
// src/components/Workbench/Board.presentation.jsx

/**
 * @module components/Workbench/Board
 * @description
 *
 * This is one of the last components using the original design.
 * The design needs to be reconsidered to maximize the benefit of the
 * tree data structure and the latest beautiful dnd features.
 *
 * 🚧 In progress (March, 2021)
 * Rendering is dependent on canvasNodeCount, the presence of a valid
 * state.tree.
 *
 * The state.tree specifies the component based on the node height in the tree.
 * The first branch has id:1 and data: { id: "palette" }.  This branch encodes
 * the available the etlUnits (from the warehouse; the ObsEtl).
 *
 * The state.tree has at least one other branch to where the user is to design
 * the "request" using drag-and-drop.
 *
 * Additional branches at height = 1 can also be used to specify the request.
 *
 *         Request = where node id > 1, Tree nodes @height = 1
 *
 * ⬜ Likely use the SplitPane component
 *
 * Dnd DropContext has three callbacks
 *
 * * onDragEnd ⚠️  required
 * * onDragStart
 * * onDragUpdate
 *
 */
import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import clsx from 'clsx';

import { DragDropContext } from '@hello-pangea/dnd';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';

import Palette from './Palette.presentation';
import Canvas from './Canvas.presentation';

// ☎️  event-driven updates
import {
  onDndDragStart,
  onDndDragEnd,
  resetCanvas,
} from '../../../ducks/actions/workbench.actions';
import { fetchMatrix } from '../../../ducks/actions/matrix.actions';

// 📖 data
import { isCanvasDirty as getIsCanvasDirty } from '../../../ducks/rootSelectors';

/*
//-----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
const COLOR = colors.blue;
//-----------------------------------------------------------------------------
*/
/* eslint-disable no-console */

const Main = () => {
  //
  const dispatch = useDispatch();

  // manage the Board state in response to user-driven dnd events
  const handleOnDragEnd = useCallback(
    (result) => {
      if (!result.destination && !result.combine) {
        return;
      }
      dispatch(onDndDragEnd(result));
    },
    [dispatch],
  );

  const handleOnBeforeCapture = useCallback(
    (event) => {
      // droppable nodeId isDropDisabled = true
      dispatch(onDndDragStart(event));
    },
    [dispatch],
  );
  // ~ SplitView: LHS = Palette  RHS = Canvas
  return (
    <DragDropContext
      onDragEnd={handleOnDragEnd}
      onBeforeCapture={handleOnBeforeCapture}>
      <Container className={clsx('Luci-Workbench-board')}>
        <WorkbenchButtons />
        <Palette rootNode={1} />
        <Divider className='workbench-split' orientation='vertical' flexItem />
        <Canvas rootNode={2} />
      </Container>
    </DragDropContext>
  );
};

// ⬜ move to step bar; include a save icon
function WorkbenchButtons() {
  // 📬
  const dispatch = useDispatch();
  const { projectId } = useParams();

  // 📖 Only requires the Canvas Node count to set reset/matrix toggles
  const isCanvasDirty = useSelector(getIsCanvasDirty, shallowEqual);

  // ⬜ use the modal app capacity to provide a confirmation dialog
  const handleResetCanvas = useCallback(() => {
    dispatch(resetCanvas());
  }, [dispatch]);

  const handleBuildMatrix = useCallback(() => {
    dispatch(fetchMatrix(projectId));
  }, [dispatch, projectId]);

  return (
    <Container className={clsx('Luci-Float', 'workbench')}>
      <Button disabled={!isCanvasDirty} onClick={handleResetCanvas}>
        Reset Canvas
      </Button>
      <Button disabled={!isCanvasDirty} onClick={handleBuildMatrix}>
        View Matrix
      </Button>
    </Container>
  );
}

export default Main;
