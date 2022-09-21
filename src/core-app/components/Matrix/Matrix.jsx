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
import { useParams } from 'react-router-dom';

import { Card, CardContent, CardHeader } from '@mui/material';

import MatrixGrid from './MatrixGrid';
import LoadingSplash from '../shared/LoadingSplash';

// 📖 data
import {
  isUiLoading,
  getMatrix,
  isHostedWarehouseStale as getIsWarehouseStale,
  isHostedMatrixStale as getIsMatrixStale,
} from '../../ducks/rootSelectors';
// cancel action
import { bookmark } from '../../ducks/actions/stepper.actions';
import useAbortController from '../../../hooks/use-abort-controller';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_WORKBENCH === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const withDataPred = (matrix) =>
  matrix !== null && Object.keys(matrix).length > 0;

const Matrix = () => {
  // initial state => without data
  const { isLoading, message: messageWhileLoading } = useSelector(isUiLoading);
  const matrix = useSelector(getMatrix); // a page of data
  const [withData, setWithData] = useState(() => withDataPred(matrix));
  const isWarehouseStale = useSelector(getIsWarehouseStale);
  const isMatrixStale = useSelector(getIsMatrixStale);
  const showMatrix = !(
    isLoading ||
    !withData ||
    isWarehouseStale ||
    isMatrixStale
  );
  // cancel-related hooks
  const dispatch = useDispatch();
  const abortController = useAbortController();

  // 💢 coordinate component with data using status
  // Note: The stepbar machine makes the api call. This component becomes aware
  // of the data status by way of redux isLoading and getMatrix. Paging therein
  // is handled by the DataGrid.
  useEffect(() => {
    if (!withData || isWarehouseStale || isMatrixStale) {
      setWithData(withDataPred(matrix));
    }
  }, [withData, isWarehouseStale, isMatrixStale, matrix]);

  const handleCancel = useCallback(() => {
    abortController.abort();
    dispatch(bookmark('workbench'));
  }, [dispatch, abortController]);

  if (DEBUG) {
    console.debug('%c----------------------------------------', 'color:orange');
    console.debug(`%c📋 Matrix loaded state summary:`, 'color:orange', {
      withData,
      isLoading,
      isWarehouseStale,
      isMatrixStale,
      'should render': showMatrix,
    });
  }
  if (!showMatrix) {
    return (
      <LoadingSplash
        title='Processing'
        message={messageWhileLoading || 'Pulling the requested data'}
        cancel={handleCancel}
      />
    );
  }

  return (
    <Card className='Luci-matrix'>
      <CardHeader>Matrix</CardHeader>
      <CardContent className='Luci-matrix'>
        <MatrixGrid matrix={matrix} />
      </CardContent>
    </Card>
  );
};

Matrix.propTypes = {};
Matrix.defaultProps = {};

export default Matrix;
