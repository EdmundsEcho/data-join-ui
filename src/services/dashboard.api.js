/**
 *
 * Tnc-py calls for the dashboard
 *
 * @module src/services/dashboard.api
 *
 */
import { apiInstance } from '../core-app/services/api';

import { ApiCallError } from '../errors';

//------------------------------------------------------------------------------
// Read the .env
//------------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_API === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

if (DEBUG) {
  console.debug(
    `✅ dashboard api sending to: http://${window.location.hostname}:5005/v1`,
  );
}
//------------------------------------------------------------------------------
/* eslint-disable camelcase, no-console */

/**
 * Logout
 * TnC-py
 * @projects_blueprint.route("/v1/logout", methods=['GET'])
 */
export async function logout() {
  const axiosOptions = {
    url: '/logout',
    method: 'GET',
  };
  if (DEBUG) {
    console.debug(`%c testing POST @ "v1/logout" endpoint`, 'color:orange');
  }

  return apiInstance(axiosOptions);
}

/**
 * Save the store
 * TnC-py
 * @projects_blueprint.route("/v1/project-store/<project_id>",
 *   methods=['GET', 'POST'])  # noqa: E501
 */
export async function saveStore({ projectId, store }) {
  //
  console.debug(`Save project store: ${projectId}`);
  //
  if (typeof projectId === 'undefined') {
    throw new ApiCallError('Missing projectId');
  }
  const axiosOptions = {
    url: `/project-store/${projectId}`,
    method: 'POST',
    data: {
      project_id: projectId,
      new_store: store,
    },
  };
  if (DEBUG) {
    console.debug(
      `%c testing POST @ "v1/project-store/<project_id>" endpoint`,
      'color:orange',
    );
  }

  return apiInstance(axiosOptions);
}

/**
 * fetch the redux store
 * (core-app state)
 *
 * TnC-py (GET)
 * @projects_blueprint.route("/v1/project-store/<project_id>",
 *   methods=['GET', 'POST'])
 */
export function fetchStore(projectId, normalizer) {
  //
  console.debug(`Load project store: ${projectId}`);
  //
  if (typeof projectId === 'undefined') {
    throw new ApiCallError('Missing projectId');
  }
  const axiosOptions = {
    url: `/project-store/${projectId}`,
    method: 'GET',
    transformResponse: normalizer,
  };
  //
  if (DEBUG) {
    console.debug(
      `%c testing POST @ "v1/project-store/<project_id>" endpoint`,
      'color:orange',
    );
  }
  return apiInstance(axiosOptions);
}
export const fetchStoreCurry = (normalizer) => (projectId) =>
  fetchStore(projectId, normalizer);

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
  };
  if (DEBUG) {
    console.debug(`%c testing "v1/projects" endpoint`, 'color:orange');
  }
  return apiInstance(axiosOptions);
}

/**
 * @KM: test endpoints
 * test endpoint
 *
 * @function
 * @return {Promise} response
 */
export async function addNewProject(data) {
  const axiosOptions = {
    url: '/projects',
    method: 'POST',
    data: {
      ...data,
    },
  };
  if (DEBUG) {
    console.debug(`%c testing POST @ "v1/projects" endpoint`, 'color:orange');
  }
  return apiInstance(axiosOptions);
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
  };
  if (DEBUG) {
    console.debug(`%c testing DELETE @ "v1/projects" endpoint`, 'color:orange');
  }
  return apiInstance(axiosOptions);
}

/**
 *
 * User perspective - drives
 *
 *  url="http://restapi:3000/user_drive_tokens",
 *
 * ⚠️  See dashboard.api for project-centric drives
 *
 *
 * @function
 * @return {Promise} response
 */
export async function fetchUserDrives() {
  const axiosOptions = {
    url: `/user-drives`,
    method: 'GET',
  };
  if (DEBUG) {
    console.debug(
      `%c testing "users/user_drives_tokens" endpoint`,
      'color:orange',
    );
  }
  return apiInstance(axiosOptions);
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
  };
  if (DEBUG) {
    console.debug(`%c testing "users/profile" endpoint`, 'color:orange');
  }
  return apiInstance(axiosOptions);
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
  };
  if (DEBUG) {
    console.debug(`%c testing "users/profile" endpoint`, 'color:orange');
  }
  return apiInstance(axiosOptions);
}
