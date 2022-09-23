import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Main from './components/Main';
import LoadingSplash from '../shared/LoadingSplash';

import {
  getEtlFieldCount,
  isUiLoading,
  isWorkbenchInitialized as getIsWorkbenchInitialized,
  isHostedWarehouseStale as getIsStale,
} from '../../ducks/rootSelectors';

// cancel action
import { bookmark } from '../../ducks/actions/stepper.actions';
// import { fetchWarehouse } from '../../ducks/actions/workbench.actions';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_WORKBENCH === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 *
 * Core-App page
 *
 * Workbench:
 * 👉 diplay splash until ready
 * 👉 initialize the raw data -> tree
 *
 *
 * Main:
 * 👉 configure dnd
 * 👉 provide ids required to instantiate tree
 *
 * Node:
 * 👉 render main view
 *
 */
const Workbench = () => {
  // initializing state = without data
  // 📖 status of raw data -> tree
  const withData = useSelector(getIsWorkbenchInitialized);
  const { isLoading } = useSelector(isUiLoading); // gql status
  const isStale = useSelector(getIsStale);
  const etlFieldCount = useSelector(getEtlFieldCount);
  const dispatch = useDispatch();

  const handleCancel = useCallback(() => {
    dispatch(bookmark('fields'));
  }, [dispatch]);

  // coordinate component with data using status
  // re-render when stopped loading
  /*
  useEffect(() => {
    if (!withData || isStale) {
      dispatch(fetchWarehouse()); // uses tree if CURRENT
    }
  }, [withData, isStale, dispatch]);
*/

  /* get data to feed to the workbench */

  if (DEBUG) {
    console.debug('%c----------------------------------------', 'color:orange');
    console.debug(`%c📋 Workbench loaded state summary:`, 'color:orange', {
      withData,
      isLoading,
      isStale,
      'should render': !(isLoading || !withData || isStale),
    });
  }
  if (isLoading || !withData || isStale) {
    return (
      <LoadingSplash
        title='Building the data warehouse'
        message={`Processing ${etlFieldCount} Fields`}
        cancel={handleCancel}
      />
    );
  }

  return <Main />;
};

export default Workbench;
