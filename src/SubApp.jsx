/**
 *
 * 🎉 Gateway to the core-app.
 *
 * ✅ uses URL to retrieve project_id (not props)
 *
 * See init.middleware.js
 *
 */
import React, { useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { DesignError } from './core-app/lib/LuciErrors';

import CoreApp from './core-app/Main';
import { Spinner } from './components/shared';

import { loadProject } from './core-app/ducks/actions/project-meta.actions';
import { useFetchApi, STATUS } from './hooks/use-fetch-api';

import { fetchStore as fetchServerStore } from './core-app/services/api';
import { loadStore as loadNewOrSavedStore } from './core-app/ducks/project-meta.reducer';
import { getProjectId } from './core-app/ducks/rootSelectors';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/*
 * loading a new project
 */

const SubApp = () => {
  //
  const { projectId: requestedProject } = useParams();
  const projectInReduxIsNull = useSelector(
    (state) => getProjectId(state) === null,
  );
  const previousProjectRef = useRef(undefined);
  const dispatch = useDispatch(); // redux load the fetched store

  validateState(requestedProject);
  // const refetchProjectStore = requestedProject && projectInReduxIsNull;

  // ---------------------------------------------------------------------------
  // 💢 Side-effect
  //    consumeDataFn: dispatch action required to load the redux store
  //    Note: memoization required b/c used in effect
  const consumeDataFn = useMemo(
    () => (respData) => {
      const loadThisStore = loadNewOrSavedStore(respData);
      dispatch(loadProject(loadThisStore));
    },
    [dispatch],
  );
  // ---------------------------------------------------------------------------
  const {
    execute: fetch,
    status: fetchStatus,
    // reset,
  } = useFetchApi({
    asyncFn: fetchServerStore,
    blockAsyncWithEmptyParams: true,
    consumeDataFn,
    useSignal: true,
    immediate: false,
    caller: `SubApp-${requestedProject.slice(-4)}`,
    DEBUG,
  });

  // ---------------------------------------------------------------------------
  // 💢 async api call
  // 🟢 Pull new data when project id changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetch(requestedProject);
  }, [fetch, requestedProject]);

  // ---------------------------------------------------------------------------
  // report on state of the component
  // 🔖 devtool search: /(useSharedFetchApi action|SubApp loaded|SubApp latch)/
  // ---------------------------------------------------------------------------
  if (DEBUG) {
    //
    const sameProject =
      (previousProjectRef.current &&
        previousProjectRef.current === requestedProject) ||
      false;
    const statusResolved =
      [STATUS.RESOLVED, STATUS.REJECTED].includes(fetchStatus) || false;
    const stepOneV1 =
      fetchStatus === STATUS.UNINITIALIZED &&
      typeof previousProjectRef.current === 'undefined';
    const stepOneV2 =
      statusResolved && typeof previousProjectRef.current !== 'undefined';
    const done =
      [STATUS.RESOLVED, STATUS.REJECTED].includes(fetchStatus) && sameProject;
    const switchFromNone =
      STATUS.UNINITIALIZED && typeof previousProjectRef.current === 'undefined';
    const switchFromOther =
      statusResolved && typeof previousProjectRef.current !== 'undefined';
    // extra render at the end
    const steps = [
      (switchFromOther || switchFromNone) && (stepOneV1 || stepOneV2) && !done,
      fetchStatus === STATUS.PENDING && projectInReduxIsNull,
      fetchStatus === STATUS.PENDING && !projectInReduxIsNull,
      !sameProject && statusResolved && !(stepOneV1 || stepOneV2),
      sameProject && statusResolved,
    ];
    const currentStep = `${steps.findIndex((v) => v === true) + 1} of ${
      steps.length
    }`;
    console.debug('%c----------------------------------------', 'color:orange');
    console.debug(`%c📋 SubApp loaded state summary:`, 'color:orange', {
      requestedProject: requestedProject?.slice(-4),
      previousProjectCurrent: previousProjectRef.current?.slice(-4),
      switchedProject: !sameProject,
      fetchStatus,
      statusResolved,
      projectInReduxIsNull,
      done,
      steps,
      currentStep,
      stepOne: stepOneV1 || stepOneV2,
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
      previousProjectRef.current = requestedProject; // debugging
      return <CoreApp />;

    default:
      console.error(fetchStatus);
      throw new DesignError(`Unreachable SubApp fetch state: ${fetchStatus}`);
  }
};

SubApp.propTypes = {};
SubApp.defaultProps = {};

function validateState(projectId) {
  if (typeof projectId === 'undefined') {
    throw new DesignError(`SubApp is being loaded without a project id`);
  }
}
export default SubApp;
