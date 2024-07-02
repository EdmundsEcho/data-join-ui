// src/core-app/components/Matrix.jsx

/**
 *
 * Core-App page
 *
 * @module components/Matrix
 *
 */
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MatrixGrid from './MatrixGrid';
import LoadingSplash from '../shared/LoadingSplash';
import { Div } from '../../../luci-styled/Styled';

// 📖 data
import {
  isUiLoading,
  getMatrix,
  isHostedWarehouseStale as getIsWarehouseStale,
  isHostedMatrixStale as getIsMatrixStale,
} from '../../ducks/rootSelectors';
// cancel action
import { bookmark } from '../../ducks/actions/stepper.actions';
import { cancelMatrix } from '../../ducks/actions/matrix.actions';
import useAbortController from '../../../hooks/use-abort-controller';
// app size
import { useAppSizeDataContext } from '../../../contexts/CoreAppSizeContext';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_WORKBENCH === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
const GRID_HEIGHT_ADJ = 0; // Download button position

const withDataAndSizePred = (matrixPage, height) =>
  typeof height !== 'undefined' &&
  matrixPage !== null &&
  Object.keys(matrixPage).length > 0;

const Matrix = () => {
  // initial state => without data
  const {
    isLoading,
    inErrorState,
    message: messageWhileLoading,
  } = useSelector(isUiLoading);
  const matrixPage = useSelector(getMatrix); // a page of data
  const isWarehouseStale = useSelector(getIsWarehouseStale);
  const isMatrixStale = useSelector(getIsMatrixStale);
  // input to set the grid height
  const { height: coreAppHeight } = useAppSizeDataContext();
  const [withDataAndSize, setWithDataAndSize] = useState(() =>
    withDataAndSizePred(matrixPage, coreAppHeight),
  );
  const showMatrix = !(
    (
      isLoading || // update with useSelector
      inErrorState || // update with useSelector
      !withDataAndSize || // update with useEffect
      isWarehouseStale || // update with useSelector
      isMatrixStale
    ) // update with useSelector
  );
  // cancel-related hooks
  const dispatch = useDispatch();
  const abortController = useAbortController();

  // 💢 coordinate component with data using status
  // Note: The stepbar machine makes the api call. This component becomes aware
  // of the data status by way of redux isLoading and getMatrix. Paging therein
  // is handled by the DataGrid.
  useEffect(() => {
    if (!withDataAndSize) {
      setWithDataAndSize(withDataAndSizePred(matrixPage, coreAppHeight));
    }
  }, [withDataAndSize, coreAppHeight, matrixPage]);

  const handleCancel = useCallback(() => {
    abortController.abort();
    dispatch(bookmark('workbench'));
    dispatch(cancelMatrix());
  }, [dispatch, abortController]);

  if (DEBUG) {
    console.debug('%c----------------------------------------', 'color:orange');
    console.debug(`%c📋 Matrix loaded state summary:`, 'color:orange', {
      withDataAndSize,
      isLoading,
      isWarehouseStale,
      isMatrixStale,
      coreAppHeight,
      'should render': showMatrix,
    });
  }
  if (!showMatrix) {
    return (
      <LoadingSplash
        title='Processing'
        message={messageWhileLoading || 'Pulling the requested data'}
        cancel={handleCancel}
        turnOffMessaging
      />
    );
  }

  return (
    <Div className='Luci-matrix'>
      <div className='outer-container'>
        <div className='inner-make-scrollable-container'>
          <MatrixGrid
            matrixPage={matrixPage}
            abortController={abortController}
            gridHeight={coreAppHeight + GRID_HEIGHT_ADJ}
          />
        </div>
      </div>
    </Div>
  );
};

Matrix.propTypes = {};
Matrix.defaultProps = {};

export default Matrix;
