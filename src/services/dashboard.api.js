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
const DEBUG = process.env.REACT_APP_DEBUG_API === 'true';
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
 * Logout TnC-py
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * @projects_blueprint.route("/v1/logout", methods=['GET'])
 */
export async function logout(signal) {
  const axiosOptions = {
    url: '/logout',
    method: 'GET',
    signal,
  };
  if (DEBUG) {
    console.debug(`%c testing POST @ "v1/logout" endpoint`, 'color:orange');
  }

  return apiInstance(axiosOptions);
}

/**
 * Save the store TnC-py
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * @projects_blueprint.route("/v1/project-store/<project_id>",
 *   methods=['GET', 'POST'])  # noqa: E501
 */
export async function saveStore({ projectId, store, signal }) {
  //
  console.debug(`Save project store: ${projectId}`);
  //
  if (typeof projectId === 'undefined') {
    throw new ApiCallError('Missing projectId');
  }
  const axiosOptions = {
    url: `/project-store/${projectId}`,
    method: 'POST',
    signal,
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
 * @KM: test endpoints
 * test endpoint
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * @function
 * @return {Promise} response
 */
export async function fetchProjects(signal) {
  if (DEBUG) {
    console.debug(`fetchProjects API signal:`, signal);
  }
  const axiosOptions = {
    url: '/projects',
    method: 'GET',
    signal,
  };
  if (DEBUG) {
    console.debug(`%c testing "v1/projects" endpoint`, 'color:orange');
  }
  return apiInstance(axiosOptions);
}

/**
 * @KM: test endpoints
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * @function
 * @return {Promise} response
 */
export async function addNewProject(data, signal) {
  const axiosOptions = {
    url: '/projects',
    method: 'POST',
    signal,
    data,
  };
  if (DEBUG) {
    console.debug(`%c testing POST @ "v1/projects" endpoint`, 'color:orange');
  }
  return apiInstance(axiosOptions);
}
/**
 *
 * Update the project meta (not the store)
 *
 * 🪟 uses signal to abort; good for useEffect
 * @projects_blueprint.route("/v1/projects/<project_id>"
 *
 * @function
 * @return {Promise} response
 */
export async function updateProject(projectId, data, signal) {
  const axiosOptions = {
    url: `/projects/${projectId}`,
    method: 'PATCH',
    signal,
    data,
  };
  if (DEBUG) {
    console.debug(
      `%c testing PATCH @ "v1/projects/<project_id>" endpoint`,
      'color:orange',
    );
  }
  return apiInstance(axiosOptions);
}

/**
 *
 * Delete a project (meta and store)
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * @function
 * @return {Promise} response
 */
export async function deleteProject(projectId, signal) {
  const axiosOptions = {
    url: `/projects/${projectId}`,
    method: 'DELETE',
    signal,
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
 * 🪟 uses signal to abort; good for useEffect
 *
 *  url="http://restapi:3000/user_drive_tokens",
 *
 * ⚠️  See dashboard.api for project-centric drives
 *
 *
 * @function
 * @return {Promise} response
 */
export async function fetchUserDrives(signal) {
  const axiosOptions = {
    url: `/user-drives`,
    method: 'GET',
    signal,
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
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * @function
 * @return {Promise} response
 */
export async function fetchUserProfile(signal) {
  const axiosOptions = {
    url: '/users/profile',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.pgrst.object+json',
    },
    signal,
  };
  if (DEBUG) {
    console.debug(`%c testing "users/profile GET" endpoint`, 'color:orange');
  }
  return apiInstance(axiosOptions);
}

/**
 * @KM: test endpoints
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * @function
 * @return {Promise} response
 */
export async function editUserProfile(data, signal = undefined) {
  const axiosOptions = {
    url: '/users/profile',
    method: 'PATCH',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  };
  if (DEBUG) {
    console.debug(`%c testing "users/profile PATCH" endpoint`, 'color:orange');
  }
  return apiInstance(axiosOptions);
}

/**
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * description:
 *
 * User feedback; all input optional
 * context   string($character varying) from where sent in the app
 * feedback  string($character varying)
 * scope     string($character varying) feedback, bug, feature etc...
 * score     integer($smallint)         normalize to 10, higher is better
 *
 * @function
 * @param {Object} feedback
 * @param {Function} signal
 * @return {Promise} response
 */
export async function sendFeedback(feedback, signal) {
  const axiosOptions = {
    url: '/feedback',
    method: 'POST',
    signal,
    data: feedback,
  };
  if (DEBUG) {
    console.debug(`%c testing POST @ "v1/feedback" endpoint`, 'color:orange');
  }

  return apiInstance(axiosOptions);
}
