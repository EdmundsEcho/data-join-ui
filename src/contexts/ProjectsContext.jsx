import React, { createContext } from 'react';

import { useNavigate } from 'react-router-dom';
import { withSnackbar } from 'notistack';

import {
  addNewProject,
  deleteProject,
  fetchAllProjects as fetchFn,
} from '../services/dashboard.api';
import { useFetchApi } from '../hooks/use-fetch-api';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * This is only relevant when we want to "configure" the
 * context externally.
 */
export const Context = createContext({
  // state
  isFetching: false,
  data: [],
  // api access
  add: (data) => {
    console.warn('Not configured - new project');
    console.dir(data);
  },
  deleteById: (id) => {
    console.warn('Not configured - delete');
    console.dir(id);
  },
  fetch: () => {
    console.warn('Not configured - fetch projects');
  },
  callback: () => {
    console.warn('Not configured - fetch projects');
  },
});

/**
 * Context provider that shares the user-driven state changes
 */
const Provider = (props) => {
  //
  const { enqueueSnackbar, children } = props;
  let navigate = useNavigate();
  /**
   * fetch data
   * callback: set the initial value of the cache
   */
  const {
    fetch: fetchApi,
    status,
    STATUS,
    error,
    cache: data,
  } = useFetchApi({
    fetchFn,
    enqueueSnackbar,
    DEBUG,
  });

  // ProjectsContext will navigate to login on error
  // 💢 -> sets useFetchApi cache
  const fetch = () => {
    try {
      fetchApi();
    } catch (e) {
      if (e.status === 401) {
        console.dir(e);
        navigate('/login');
      } else {
        console.error(`🦀 what is this error; how treat? (display on page)`);
        navigate('/login');
        throw e;
      }
    } finally {
    }
  };
  /**
   * mutate the server
   * callback: e.g., navigate following the delete
   */
  const deleteById = async (id, callback) => {
    try {
      await deleteProject(id);
      // call fetch to trigger an update of the local cache
      // (and re-render children in the context)
      await fetch();
      // callback once the fetch has completed
      // (the whole point of the callback is getting the timing right)
      if (typeof callback === 'function') {
        callback();
      }
    } catch (e) {
      console.log('error', e);
    }
  };

  /**
   * mutate the server
   * callback: e.g., navigate following the delete
   */
  const add = async (data, callback) => {
    try {
      const { data: newProject } = await addNewProject(data);
      // call fetch to trigger an update of the cache
      // (and re-render children in the context)
      await fetch();
      // callback once the fetch has completed
      // (the purpose of the callback is getting the timing right)
      // e.g., navigate to the url with the new project_id
      if (typeof callback === 'function') {
        callback(newProject);
      }
    } catch (e) {
      // ⬜ handle error
      console.log('error', e);
    }
  };

  // exposed interface
  const state = {
    data,
    error,
    status,
    STATUS,
    add,
    deleteById,
    fetch,
  };

  if (DEBUG) {
    console.debug(
      `📥 Projects context is running: ${status || 'unknown status'} with ${
        data?.length ?? 'unknown number of'
      } items.`,
    );
  }
  return <Context.Provider value={state}>{children}</Context.Provider>;
};

export default withSnackbar(Provider);
