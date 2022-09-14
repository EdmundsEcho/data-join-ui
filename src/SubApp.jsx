/**
 *
 * 🎉 Gateway to the core-app.
 *
 * ✅ uses URL to retrieve project_id (not props)
 *
 * See init.middleware.js
 *
 */
import React, { useEffect, useRef, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import ErrorPage from './pages/ErrorPage';
import { DesignError } from './core-app/lib/LuciErrors';

import CoreApp from './core-app/Main';
import { Spinner } from './components/shared';

import { loadProject } from './core-app/ducks/actions/project-meta.actions';
import { getProjectId } from './core-app/ducks/rootSelectors';
import { useFetchApi, STATUS } from './hooks/use-fetch-api';
import useMemoCompare from './hooks/use-memo-compare';

import { fetchStore as fetchServerStore } from './core-app/services/api';
import { loadStore as loadNewOrSavedStore } from './core-app/ducks/project-meta.reducer';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/*
 * loading a new project
 */

const SubApp = () => {
  //
  const previousProjectRef = useRef(undefined);
  const { projectId: requestedProject } = useParams();
  const dispatch = useDispatch(); // load the fetched store

  // ---------------------------------------------------------------------------
  //
  // 💢 Side-effect
  //    dispatch action required to load the redux store
  //
  // ---------------------------------------------------------------------------
  const {
    execute: fetch,
    status: fetchStatus,
    reset,
    error,
  } = useFetchApi({
    asyncFn: () => fetchServerStore(requestedProject),
    consumeDataFn: (respData) => {
      console.debug('SubApp respData:', respData);
      const loadThisStore = loadNewOrSavedStore(requestedProject, respData);
      dispatch(loadProject(loadThisStore));
    },
    useSignal: true,
    immediate: false,
    caller: 'SubApp - Loading core-app',
    DEBUG: true,
  });

  // ---------------------------------------------------------------------------
  // 🟢 Gateway to pulling new data
  // ---------------------------------------------------------------------------
  const [latch, setLatch] = useState(() => ({ value: 'OPEN' }));
  if (DEBUG) {
    console.debug(`SubApp latch: ${latch.value} api status: ${fetchStatus}`);
  }
  useEffect(() => {
    if (latch.value === 'OPEN') {
      fetch();
      previousProjectRef.current = requestedProject;
      setLatch(() => ({ value: 'CLOSED' }));
    }
  }, [requestedProject, latch.value, fetch]);

  // OPEN when projectId changes
  const switchedProject = previousProjectRef.current !== requestedProject;
  useEffect(() => {
    if (switchedProject) {
      reset();
      setLatch(() => ({ value: 'OPEN' }));
    }
  }, [switchedProject, reset]);

  Provider.displayName = 'TncReduxStore-Provider';

  if (typeof requestedProject === 'undefined') {
    throw new DesignError(`SubApp is being loaded without a project id`);
  }

  // ---------------------------------------------------------------------------
  // report on state of the component
  //
  if (DEBUG) {
    console.debug('%c----------------------------------------', 'color:orange');
    console.debug(`%c📋 SubApp loaded state summary:`, 'color:orange', {
      requestedProject,
      previousProjectCurrent: previousProjectRef.current,
      fetchStatus,
      latch: latch.value,
    });
  }

  // ---------------------------------------------------------------------------
  // Render based on redux cache state
  //
  switch (fetchStatus) {
    case STATUS.UNINITIALIZED:
    case STATUS.PENDING:
      return <Spinner />;

    case STATUS.RESOLVED:
      // use the initialStore function to return
      // serverStore | newProjectStore
      return <CoreApp />;

    case STATUS.REJECTED:
      return <ErrorPage message={JSON.stringify(error)} />;

    default:
      console.error(fetchStatus);
      throw new Error('Unreachable SubApp fetch state');
  }
};

SubApp.propTypes = {};
SubApp.defaultProps = {};

export default SubApp;
