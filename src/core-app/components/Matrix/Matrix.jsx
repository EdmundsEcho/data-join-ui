// src/core-app/components/Matrix.jsx

/**
 * @module components/Matrix
 *
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { Card, CardContent, CardHeader, CardActions } from '@mui/material';
import Button from '@mui/material/Button';

import MatrixGrid from './MatrixGrid';
import LoadingSplash from '../shared/LoadingSplash';

// 📖 data
import {
  isUiLoading,
  getMatrix,
  isHostedWarehouseStale as getIsWarehouseStale,
  isHostedMatrixStale as getIsMatrixStale,
} from '../../ducks/rootSelectors';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_WORKBENCH === 'true';
const SAVE_MATRIX_ENDPOINT = process.env.REACT_APP_SAVE_MATRIX_ENDPOINT;
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const withData_ = (matrix) => matrix !== null && Object.keys(matrix).length > 0;

const Matrix = () => {
  // initializing state = without data
  // 📖 status of raw data -> tree
  const { isLoading, message: messageWhileLoading } = useSelector(isUiLoading);
  const matrix = useSelector(getMatrix);
  const [withData, setWithData] = useState(() => withData_(matrix));
  const isWarehouseStale = useSelector(getIsWarehouseStale);
  const isMatrixStale = useSelector(getIsMatrixStale);
  const showMatrix = !(
    isLoading ||
    !withData ||
    isWarehouseStale ||
    isMatrixStale
  );

  // coordinate component with data using status
  // re-render when stopped loading
  useEffect(() => {
    if (!withData || isWarehouseStale || isMatrixStale) {
      setWithData(withData_(matrix));
    }
  }, [withData, isWarehouseStale, isMatrixStale, matrix]);

  /* get data to feed to the workbench */

  if (DEBUG) {
    console.debug('%c----------------------------------------', 'color:orange');
    console.debug(`%c📋 Matrix loaded state summary:`, 'color:orange');
    console.dir({
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
      />
    );
  }

  return (
    <Card className='Luci-matrix'>
      <CardHeader>Matrix</CardHeader>

      <CardContent className='Luci-matrix'>
        <MatrixGrid matrix={matrix} />
      </CardContent>
      <CardActions>
        <Button href={SAVE_MATRIX_ENDPOINT}>Export File</Button>
      </CardActions>
    </Card>
  );
};

Matrix.propTypes = {};
Matrix.defaultProps = {};

export default Matrix;
