// src/contexts/ProjectsDataContext.jsx

import React, { useMemo, createContext } from 'react';
import PropTypes from 'prop-types';

import { fetchProjects as fetchAllProjectsApi } from '../services/dashboard.api';
import { useFetchApi, STATUS } from '../hooks/use-fetch-api';

import { colors } from '../core-app/constants/variables';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

export const ProjectsDataContext = createContext({});

/**
 * Provides the dashboard access to the list of projects (summary view).
 *
 */
const Provider = (props) => {
  // ---------------------------------------------------------------------------
  const { children } = props;
  //
  if (DEBUG) {
    console.debug(`%cprojects context loading`, colors.orange);
  }

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
    immediate: true,
    caller: 'ProjectsDataContext',
    equalityFnName: 'length',
    DEBUG,
  });
  const isReady = status === STATUS.RESOLVED;

  // public interface
  const state = useMemo(
    () => ({
      data,
      isReady,
      fetch,
    }),
    [data, fetch, isReady],
  );
  return (
    <ProjectsDataContext.Provider value={state}>
      {children}
    </ProjectsDataContext.Provider>
  );
};
//
const useProjectsDataContext = () => React.useContext(ProjectsDataContext);

Provider.propTypes = { children: PropTypes.node.isRequired };
Provider.defaultProps = {};
export default Provider;
export { useProjectsDataContext };

/*
  const fetchProjects = async () => {
    try {
      setIsFetching(true);
      const response = await fetchAllProjects();
      const { error, status } = response.data;
      if (!error && status !== 'Error' && response?.status === 200) {
        setProjectsList(response.data);
      } else {
        navigate('/login');
        enqueueSnackbar(`Error: ${error || response?.data?.message}`, {
          variant: 'error',
        });
      }
      console.log('fetchProjects', { response });
    } catch (e) {
      console.log('error fetchProjects', e);
    }
    setIsFetching(false);
  };

  const deleteProjectById = async (id) => {
    try {
      await deleteProject(id);
      await fetchProjects();
    } catch (e) {
      console.log('error', e);
    }
  };

  const createNewProject = async (data) => {
    try {
      await postNewProject(data);
      await fetchProjects();
    } catch (e) {
      console.log('error', e);
    }
  };

  const state = {
    isFetching,
    projectsList,
    createNewProject,
    deleteProjectById,
    fetchProjects,
  };
*/
