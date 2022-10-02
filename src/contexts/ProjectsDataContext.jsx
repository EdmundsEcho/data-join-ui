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
  updateProject as updateApi,
  deleteProject as deleteApi,
} from '../services/dashboard.api';

import useAbortController from '../hooks/use-abort-controller';
import { useResponseHandling } from '../hooks/use-response-handling';
import { useFetchApi } from '../hooks/use-fetch-api';
import { deleteDb as clearUiState } from '../core-app/hooks/use-persisted-state';

import { colors } from '../core-app/constants/variables';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

export const ProjectsDataContext = createContext({});
ProjectsDataContext.displayName = 'Context - ProjectsData';
export const ProjectsSelectorContext = createContext({});
ProjectsSelectorContext.displayName = 'Context - ProjectsSelector';
export const ProjectsApiContext = createContext({});
ProjectsApiContext.displayName = 'Context - ProjectsApi';

/**
 * ProjectsApi - delete and add projects
 */
const Provider = ({ children }) => {
  // ---------------------------------------------------------------------------
  //
  if (DEBUG) {
    console.debug(`%cprojects context loading`, colors.orange);
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
    isReady,
  } = useFetchApi({
    asyncFn: fetchAllProjectsApi,
    initialCacheValue: [],
    useSignal: true,
    immediate: true,
    abortController,
    caller: 'ProjectsDataContext',
    equalityFnName: 'equal',
    DEBUG,
  });
  // ---------------------------------------------------------------------------
  // 🟢 Gateway to pulling new data
  //    The latch controls otherwise tonic (always on) data fetching
  // ---------------------------------------------------------------------------
  const [latch, setLatch] = useState(() => ({ value: 'CLOSED' }));
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
  const state = useMemo(
    () => ({
      data,
      isReady,
    }),
    [data, isReady],
  );

  // ---------------------------------------------------------------------------
  // Public interface - Selector
  const select = useCallback(
    (projectId) => data.find((entry) => entry.project_id === projectId),
    [data],
  );
  const selector = useMemo(
    () => ({
      select,
    }),
    [select],
  );

  // ---------------------------------------------------------------------------
  // api shared function
  const { run: runMiddleware } = useResponseHandling({
    caller: 'ProjectApiContext',
    DEBUG,
  });

  // ---------------------------------------------------------------------------
  // 👉 Add a project
  // ---------------------------------------------------------------------------
  const addNew = useCallback(
    async (newData, callback) => {
      const response = await addNewApi(newData, abortController.signal);
      runMiddleware(response);
      // fetch(); // retrieve the new list
      setLatch(() => ({ value: 'OPEN' }));
      if (typeof callback === 'function') {
        callback(response.data);
      }
    },
    [runMiddleware, abortController.signal],
  );
  // ---------------------------------------------------------------------------
  // 👉 Update a project (meta only)
  // ---------------------------------------------------------------------------
  const update = useCallback(
    async (projectId, newData, callback) => {
      const response = await updateApi(
        projectId,
        newData,
        abortController.signal,
      );
      runMiddleware(response);
      // fetch(); // retrieve the new list
      setLatch(() => ({ value: 'OPEN' }));
      if (typeof callback === 'function') {
        callback(response.data);
      }
    },
    [fetch, runMiddleware, abortController.signal],
  );
  // ---------------------------------------------------------------------------
  // 👉 Remove a project
  // ---------------------------------------------------------------------------
  const remove = useCallback(
    async (projectId, callback) => {
      const response = await deleteApi(projectId, abortController.signal);
      runMiddleware(response);
      clearUiState(projectId);
      // fetch(); // retrieve the new list
      setLatch(() => ({ value: 'OPEN' }));
      if (typeof callback === 'function') {
        callback(response.data);
      }
    },
    [runMiddleware, abortController.signal],
  );

  // Public interface - Api
  const api = useMemo(
    () => ({
      fetch,
      addNew,
      update,
      remove,
    }),
    [addNew, fetch, update, remove],
  );
  return (
    <ProjectsApiContext.Provider value={api}>
      <ProjectsSelectorContext.Provider value={selector}>
        <ProjectsDataContext.Provider value={state}>
          {children}
        </ProjectsDataContext.Provider>
      </ProjectsSelectorContext.Provider>
    </ProjectsApiContext.Provider>
  );
};
Provider.displayName = 'Provider-ProjectsContext';
Provider.propTypes = { children: PropTypes.node.isRequired };
//
export const useProjectsDataContext = () => useContext(ProjectsDataContext);
export const useProjectsSelectorContext = () =>
  useContext(ProjectsSelectorContext);
export const useProjectsApiContext = () => useContext(ProjectsApiContext);
export default Provider;
