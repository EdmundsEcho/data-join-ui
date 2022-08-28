// src/components/HoldingArea.jsx

/**
 *
 * Gateway to the workbench
 *
 * @module src/components/HoldingArea
 *
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { isLoading, getEtlFieldCount } from '../ducks/rootSelectors';

// 📖 ☎️  initiate the etl process
import {
  // workbench data,
  fetchWarehouse,
} from '../ducks/actions/workbench.actions';

import LoadingSplash from './LoadingSplash';

const LoadingSplashWorkbench = (/* props */) => {
  const navigate = useNavigate();

  // 📖
  const { isLoading: uiLoading } = useSelector(isLoading);
  const etlFieldCount = useSelector(getEtlFieldCount);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchWarehouse());
  }, []);

  useEffect(() => {
    if (!uiLoading) {
      navigate('../workbench');
    }
  }, [navigate, uiLoading]);

  return (
    <LoadingSplash
      title='Building the data warehouse'
      message={`Processing ${etlFieldCount} Fields`}
    />
  );
};

LoadingSplashWorkbench.propTypes = {};

export default LoadingSplashWorkbench;
