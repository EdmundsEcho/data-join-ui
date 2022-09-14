// src/contexts/use-projects.js

import { useCallback, useState, useEffect } from 'react';

import {
  addNewProject as addNewApi,
  deleteProject as deleteApi,
  fetchProjects as fetchAllProjectsApi,
} from '../services/dashboard.api';

import { colors } from '../core-app/constants/variables';

import { STATUS, useFetchApi } from '../hooks/use-fetch-api';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * use-projects hook
 *
 * Feature: encapsulate projects api calls
 *
 * ✅ cache the list of projects (summary view of each)
 *
 * ✅ provide a fetch, new, update, delete and cancel api
 *
 * ✅ Includes error handling: redirect to login, error
 *
 ----------------------------------------------------------------------------- */
const useProjects = (caller = 'anonymous') => {
  // ---------------------------------------------------------------------------
  //
  if (DEBUG) {
    console.debug(`%chook loading: ${caller}`, colors.orangeGrey);
  }

  // ---------------------------------------------------------------------------
  // 💢 fetchProjects
  // ---------------------------------------------------------------------------
  const {
    fetch,
    cancel,
    status,
    cache: data,
  } = useFetchApi({
    fetchFn: fetchAllProjectsApi,
    initialValue: [],
    caller: 'use-projects',
    DEBUG,
  });
  const isReady = status === STATUS.RESOLVED;

  /**
   * mutate the server
   * callback: e.g., navigate following the remove
   */
  const remove = useCallback(async (id, callback) => {
    try {
      await deleteApi(id);
      fetch();
      if (typeof callback === 'function') {
        callback();
      }
    } catch (e) {
      console.log('error', e);
    }
  }, []);

  /**
   * mutate the server
   * callback: e.g., navigate following the remove
   */
  const add = useCallback(async (newData, callback) => {
    try {
      const { data: newProject } = await addNewApi(newData);
      fetch();
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
  return {
    add,
    remove,
    fetch,
    cancel,
  };
};

export default useProjects;
