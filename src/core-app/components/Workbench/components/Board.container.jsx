// src/components/Workbench/components/Board.container.jsx

/**
 * @module components/Board
 *
 * @description
 * This is the primary container for the Workbench component. It handles the
 * top-level user buttons for reseting and building the matrix and is what
 * displays the matrix to the user once a matrix has been generated.
 *
 * The component manages the timing of the state-readiness by rendering a
 * splash-screen.
 *
 * The DragDropContext context starts here.
 *
 * 🚧 WIP
 *
 * 👉 This kicks-off the Board.presentation; making sure the board nodes are ready
 * 👉 For now the matrix is displayed from here using a modal
 *
 *
 */
import React, { useCallback, useState, useEffect } from 'react';

// 📬 📖
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import Board from './Board.presentation';
import MatrixDialog from './MatrixDialog';
import LoadingSplash from '../../LoadingSplash';

import {
  getMatrix,
  isLoading as isLoadingSelector,
  isWorkbenchInitialized as getIsWorkbenchInitialized,
} from '../../../ducks/rootSelectors';

import { initWorkbench } from '../../../ducks/actions/workbench.actions';
import { setMatrix } from '../../../ducks/actions/matrix.actions';

/**
 * @Component
 *
 */
const BoardContainer = () => {
  const [showMatrix, setShowMatrix] = useState(() => false);
  const dispatch = useDispatch();

  // 📖 data
  const isWorkbenchInitialized = useSelector(
    getIsWorkbenchInitialized,
    shallowEqual,
  );
  const matrix = useSelector(getMatrix, shallowEqual);
  const { isLoading, message: messageWhileLoading } = useSelector(
    isLoadingSelector,
  );

  useEffect(() => {
    if (!isWorkbenchInitialized) {
      dispatch(initWorkbench());
    }
  }, [dispatch, isWorkbenchInitialized]);

  useEffect(() => {
    setShowMatrix(matrix !== null && Object.keys(matrix).length > 0);
  }, [matrix]);

  // 🚧 scrappy: clear the matrix state without confirming or otherwise
  // enabling a capacity to retrieve the already computed value.
  const handleCloseMatrix = useCallback(() => {
    setShowMatrix(false);
    dispatch(setMatrix(null));
  }, [dispatch]);

  // Display options:
  // 1. Workbench
  // 2. Matrix modal
  // 3. Loading splash screen
  return (
    <>
      {showMatrix && matrix !== null && (
        <MatrixDialog
          matrix={matrix}
          open={showMatrix}
          handleClose={handleCloseMatrix}
        />
      )}

      {isLoading && (
        <LoadingSplash
          title='Processing'
          message={messageWhileLoading || 'Pulling the requested data'}
        />
      )}

      <Board />
    </>
  );
};

export default BoardContainer;
