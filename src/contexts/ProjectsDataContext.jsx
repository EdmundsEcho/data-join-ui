// src/contexts/ProjectsApiContext.jsx

import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  createContext,
} from 'react';
import PropTypes from 'prop-types';

import {
  fetchProjects as fetchAllProjectsApi,
  addNewProject as addNewApi,
  deleteProject as deleteApi,
} from '../services/dashboard.api';

import useAbortController from '../hooks/use-abort-controller';
import { useErrorHandling } from '../hooks/use-error-handling';
import { useFetchApi, STATUS } from '../hooks/use-fetch-api';

import { colors } from '../core-app/constants/variables';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

export const ProjectsDataContext = createContext({});
ProjectsDataContext.displayName = 'Context - ProjectsData';
export const ProjectsApiContext = createContext({});
ProjectsApiContext.displayName = 'Context - ProjectsApi';

/**
 * ProjectsApi - delete and add projects
 */
const Provider = ({ children }) => {
  // ---------------------------------------------------------------------------
  //
  if (DEBUG) {
    console.debug(`%cprojects api context loading`, colors.orange);
  }

  const abortController = useAbortController();
  // ---------------------------------------------------------------------------
  // 💢 fetch projects
  // 🔖 summary views only (detail view is part of the core-app)
  // ---------------------------------------------------------------------------
  const {
    status,
    cache: data,
    execute: fetch,
  } = useFetchApi({
    asyncFn: fetchAllProjectsApi,
    initialValue: [],
    useSignal: true,
    immediate: false, // only call when local latch is open
    abortController,
    caller: 'ProjectsDataContext',
    equalityFnName: 'length',
    DEBUG,
  });

  // ---------------------------------------------------------------------------
  // 🟢 Gateway to pulling new data
  // ---------------------------------------------------------------------------
  const [latch, setLatch] = useState(() => ({ value: 'OPEN' }));
  if (DEBUG) {
    console.debug(
      `Project context latch: ${latch.value} api status: ${status}`,
    );
  }
  useEffect(() => {
    if (latch.value === 'OPEN') {
      fetch();
    }
    setLatch(() => ({ value: 'CLOSED' }));
  }, [latch.value, fetch]);
  // ---------------------------------------------------------------------------

  // Public interface - Data
  const isReady = [STATUS.RESOLVED, STATUS.REJECTED].includes(status);
  const state = useMemo(
    () => ({
      data,
      isReady,
    }),
    [data, isReady],
  );

  const { run: errorProcessing } = useErrorHandling({
    caller: 'ProjectApiContext',
    DEBUG,
  });

  // ---------------------------------------------------------------------------
  // 👉 Add a project
  // ---------------------------------------------------------------------------
  const addNew = useCallback(
    async (newData, callback) => {
      const response = await addNewApi(newData, abortController.signal);
      errorProcessing(response);
      setLatch(() => ({ value: 'OPEN' }));
      // fetch(); // retrieve the new list
      if (typeof callback === 'function') {
        callback(response.data);
      }
    },
    [errorProcessing, abortController.signal],
  );
  // ---------------------------------------------------------------------------
  // 👉 Remove a project
  // ---------------------------------------------------------------------------
  const remove = useCallback(
    async (projectId, callback) => {
      const response = await deleteApi(projectId, abortController.signal);
      errorProcessing(response);
      setLatch(() => ({ value: 'OPEN' }));
      // fetch(); // retrieve the new list
      if (typeof callback === 'function') {
        callback(response.data);
      }
    },
    [errorProcessing, abortController.signal],
  );

  // Public interface - Api
  const api = useMemo(
    () => ({
      fetch,
      addNew,
      remove,
    }),
    [addNew, fetch, remove],
  );
  return (
    <ProjectsApiContext.Provider value={api}>
      <ProjectsDataContext.Provider value={state}>
        {children}
      </ProjectsDataContext.Provider>
    </ProjectsApiContext.Provider>
  );
};
Provider.displayName = 'Provider-ProjectsContext';
Provider.propTypes = { children: PropTypes.node.isRequired };
//
export const useProjectsDataContext = () => useContext(ProjectsDataContext);
export const useProjectsApiContext = () => useContext(ProjectsApiContext);
export default Provider;
