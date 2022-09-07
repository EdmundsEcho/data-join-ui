import React, { useCallback, useMemo, createContext } from 'react';
import { PropTypes } from 'prop-types';

import {
  addNewProject as addNewApi,
  deleteProject as deleteApi,
  fetchAllProjects as fetchAllApi,
} from '../services/dashboard.api';
import { useFetchApi } from '../hooks/use-fetch-api';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Relevant when we want to "configure" the context externally.
 */
export const Context = createContext();
Context.displayName = 'Projects-Context';

const Provider = ({ children }) => {
  /**
   * fetch data
   * callback: set the initial value of the cache
   */
  const {
    fetch,
    status,
    STATUS,
    error,
    cache: data,
  } = useFetchApi({
    fetchFn: fetchAllApi,
    DEBUG,
  });

  /**
   * mutate the server
   * callback: e.g., navigate following the delete
   */
  const deleteById = useCallback(async (id, callback) => {
    try {
      await deleteApi(id);
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
  }, []);

  /**
   * mutate the server
   * callback: e.g., navigate following the delete
   */
  const add = useCallback(async (newData, callback) => {
    try {
      const { data: newProject } = await addNewApi(newData);
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
  }, []);

  // public interface
  const state = useMemo(
    () => ({ data, error, status, STATUS, add, deleteById, fetch }),
    [status, error, data, deleteById, add, STATUS, fetch],
  );

  if (DEBUG) {
    console.debug(
      `📥 Projects context is running: ${status || 'unknown status'} with ${
        data?.length ?? 'unknown number of'
      } items.`,
    );
  }
  return <Context.Provider value={state}>{children}</Context.Provider>;
};

Provider.displayName = 'ProjectContext-Provider';

Provider.propTypes = {
  children: PropTypes.node.isRequired,
};

Provider.defaultProps = {};

export default Provider;
