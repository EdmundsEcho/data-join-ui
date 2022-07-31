// src/components/EtlFieldView/index.container.jsx

/**
 * @module components/EtlFieldView
 *
 * @description
 * Parent for the Etl View
 *
 * 📖 etlObject computed using pivot
 * 📖 ui input to etl data
 *
 */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import EtlFieldView from './component';
import LoadingSplash from '../LoadingSplash';

// 📖 data sources
import { isLoading as getIsLoading } from '../../ducks/rootSelectors';

// action to recompute etlObject
import { computeEtlView } from '../../ducks/actions/etlView.actions';
// import { colors } from '../../constants/variables';

// ⚠️  The saga will capture the triggerEtl. It then recomputes and updates
// the state with the buildEtlSuccess action dispatch.

/* eslint-disable react/prop-types */

/**
 * A react-redux container
 * It does not fetch, but rather derives/computes the next state.
 *
 * ⬜ convert this to a custom hook; provide the component with data and
 * callbacks
 *
 * 👍 Uses local state to manage loading state (no need for redux)
 *
 */
const PivotEtlData = () => {
  // FYI: layers of computation:
  // 1. from hvs
  // 2. from pivot(hvs)
  const { isLoading } = useSelector(getIsLoading);
  // const headerViews = useSelector(getHeaderViews);
  // const etlFieldChanges = useSelector(getEtlFieldChanges);

  const [isEtlProcessing, setEtlProcessing] = useState(() => true);

  const dispatch = useDispatch();

  // re-render when the hvs changes
  useEffect(() => {
    dispatch(computeEtlView(new Date()));
    // dispatch(computeEtlView(new Date()), headerViews, etlFieldChanges);
  }, [dispatch]);

  useEffect(() => {
    setEtlProcessing(isLoading);
  }, [isEtlProcessing, isLoading]);

  return (
    <>
      {!(!isLoading && !isEtlProcessing) ? <LoadingSplash /> : <EtlFieldView />}
    </>
  );
};

export default PivotEtlData;
