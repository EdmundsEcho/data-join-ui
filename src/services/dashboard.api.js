/**
 *
 * Tnc-py calls for the dashboard
 *
 * @module src/services/dashboard.api
 *
 */
import axios from 'axios'

//------------------------------------------------------------------------------
// Read the .env
//------------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_API === 'true'
const DEBUG = true

console.debug(
  `🦀 dashboard api sending to: http://${window.location.hostname}:5005/v1`,
)
//------------------------------------------------------------------------------
/* eslint-disable camelcase, no-console */

//------------------------------------------------------------------------------
// Set the endpoint base url based on env setting
// Read the .env
//------------------------------------------------------------------------------
const API_BASE_URL =
  process.env.REACT_APP_ENV === 'production'
    ? `${window.location.origin}/v1`
    : `http://${window.location.hostname}:5005/v1`

//------------------------------------------------------------------------------
// Configure axios endpoints
//------------------------------------------------------------------------------
export const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
})

/**
 * @KM: test endpoints
 * test endpoint
 *
 * @function
 * @return {Promise} response
 */
export async function fetchAllProjects() {
  const axiosOptions = {
    url: '/projects',
    method: 'GET',
  }
  if (DEBUG) {
    console.debug(`%c testing "v1/projects" endpoint`, 'color:orange')
  }
  return apiInstance(axiosOptions)
}

export async function getStorageProviderFiles(projectId, sorageProvider) {
  const axiosOptions = {
    url: `/filesystem/readdir?project_id=${projectId}&storage_rpovider=${sorageProvider}`,
    method: 'GET',
  }
  if (DEBUG) {
    console.debug(
      `%c testing "/v1/filesystem/readdir" endpoint`,
      'color:orange',
    )
  }
  return apiInstance(axiosOptions)
}

/**
 * @KM: test endpoints
 * test endpoint
 *
 * @function
 * @return {Promise} response
 */
export async function postNewProject(data) {
  const axiosOptions = {
    url: '/projects',
    method: 'POST',
    data: {
      project: {},
      ...data,
    },
  }
  if (DEBUG) {
    console.debug(`%c testing POST @ "v1/projects" endpoint`, 'color:orange')
  }
  return apiInstance(axiosOptions)
}

/**
 * @KM: test endpoints
 * test endpoint
 *
 * @function
 * @return {Promise} response
 */
export async function deleteProject(projectId) {
  const axiosOptions = {
    url: `/projects/${projectId}`,
    method: 'DELETE',
  }
  if (DEBUG) {
    console.debug(`%c testing DELETE @ "v1/projects" endpoint`, 'color:orange')
  }
  return apiInstance(axiosOptions)
}

/**
 * Gets all of user's connected drives
 *
 * @function
 * @return {Promise} response
 */
export async function fetchUserDrives(projectId) {
  const axiosOptions = {
    url: `/project-drives/${projectId}`,
    method: 'GET',
  }
  if (DEBUG) {
    console.debug(`%c testing "users/profile" endpoint`, 'color:orange')
  }
  return apiInstance(axiosOptions)
}

/**
 * @KM: test endpoints
 * test endpoint
 *
 * @function
 * @return {Promise} response
 */
export async function fetchUserProfile() {
  const axiosOptions = {
    url: '/users/profile',
    method: 'GET',
  }
  if (DEBUG) {
    console.debug(`%c testing "users/profile" endpoint`, 'color:orange')
  }
  return apiInstance(axiosOptions)
}

/**
 * @KM: test endpoints
 * test endpoint
 *
 * @function
 * @return {Promise} response
 */
export async function editUserProfile(data) {
  const axiosOptions = {
    url: '/users/profile',
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  }
  if (DEBUG) {
    console.debug(`%c testing "users/profile" endpoint`, 'color:orange')
  }
  return apiInstance(axiosOptions)
}
