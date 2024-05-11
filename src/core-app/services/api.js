/**
 * @module src/services/api
 *
 * @description
 * Unified access to the tnc-api and obs/mms services.
 *
 */
import axios from 'axios';

import { stdApiResponse, gqlApiResponse } from './helpers';
import { ApiCallError, InvalidStateError } from '../lib/LuciErrors';
import { HEADER_VIEW } from '../ducks/actions/headerView.actions';
import { WORKBENCH } from '../ducks/actions/workbench.actions';
import { MATRIX as MATRIX_FEATURE } from '../ducks/actions/matrix.actions';
import { validateEventInterface } from '../ducks/actions/api.actions';

import * as GQL from './graphql.api';
import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
// Read the .env
//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_API === 'true';

//------------------------------------------------------------------------------
/* eslint-disable camelcase, no-console */

//------------------------------------------------------------------------------
// Set the endpoint base url based on env setting
// Read the .env
//------------------------------------------------------------------------------
const API_BASE_URL =
  process.env.REACT_APP_ENV === 'production'
    ? `${window.location.origin}/v1`
    : process.env.REACT_APP_API_BASE_URL;

const GQL_BASE_URL = API_BASE_URL;

console.info('API base url:', API_BASE_URL);
//------------------------------------------------------------------------------

if (DEBUG) {
  console.info('loading services/api');
}

//------------------------------------------------------------------------------
// Configure axios endpoints
//------------------------------------------------------------------------------
export const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});
apiInstance.interceptors.response.use(stdApiResponse, stdApiResponse);

export const gqlInstance = axios.create({
  baseURL: GQL_BASE_URL,
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: process.env.REACT_APP_ENV === 'production',
});
gqlInstance.interceptors.response.use(gqlApiResponse, gqlApiResponse);

//------------------------------------------------------------------------------
/**
 * fetch the redux store
 * (core-app state)
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * TnC-py (GET)
 * @projects_blueprint.route("/v1/project-store/<project_id>",
 *   methods=['GET', 'POST'])
 */
export function fetchStore(projectId, signal) {
  //
  if (DEBUG) {
    console.debug(`Loading project store: ${projectId}`);
  }
  if (typeof projectId === 'undefined') {
    throw new ApiCallError('Missing projectId');
  }
  const axiosOptions = {
    url: `/project-store/${projectId}`,
    method: 'GET',
    signal,
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
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
/**
 * usage ResultTypePredicates.RESOLVED(response)
 * @function
 * @return {boolean}
 */
export const ResponseTypePredicates = {
  RESOLVED: (response) => {
    return (
      response?.data?.results === 'stopped' ||
      response?.data?.results.includes('object is not subscriptable') ||
      false
    );
  },
  CANCELLED: (response) => response?.data?.results === 'killed',
  ERROR: (response) => response?.data?.results?.error ?? false,
};
export const ResponseTypes = {
  STATUS: 'status',
  RESULT: 'result',
  JOB_ID: 'jobId',
  CANCELLED: 'cancelled',
};

// tnc-py init, status, kill and results
// does not include gql endpoints
const statusEndpointMaker = (SERVICE) => {
  return (projectId, jid, resultsOrCancel, pid) => {
    let suffix = '';
    if (typeof jid !== 'undefined') {
      suffix = `/${jid}`;
    }
    if (resultsOrCancel === 'RESULTS') {
      suffix = `${suffix}/results`;
    }
    if (resultsOrCancel === 'CANCEL') {
      suffix = `${suffix}?pid=${pid}`;
    }
    return `/${SERVICE}/${projectId}${suffix}`;
  };
};
//------------------------------------------------------------------------------
// Configure api response::result -> required format
// Utilized by feature.middleware
//
//------------------------------------------------------------------------------
export const ServiceConfigs = {
  // @inspection_blueprint.route("/v1/inspection/<project_id>", methods=['POST'])
  INSPECTION: {
    type: 'INSPECTION',
    endpoint: statusEndpointMaker('inspection'), // init and job status
    feature: HEADER_VIEW,
    resultType: 'HeaderView',
    middleware: 'headerView',
    response: {
      isValid: (response) => {
        return response?.data?.data?.results;
      },
      isError: (response) => {
        const results = response?.data?.data?.results;
        return results?.status === 'Error';
      },
      getError: (response) => response.data.data.results,
      getData: (response) => response.data.data.results,
      getApiError: (event) => event.request.data?.cause,
      setData: (value) => ({
        response: { data: { data: { results: value } } },
      }),
    },
  },
  EXTRACTION: {
    type: 'EXTRACTION',
    endpoint: statusEndpointMaker('extraction'), // init and job status
    graphql: statusEndpointMaker('warehouse'),
    feature: WORKBENCH,
    resultType: 'EtlObject',
    middleware: 'workbench',
    response: {
      isValidError: ({ error }) => error,
      getError: ({ errorMessage }) => errorMessage,
      isValid: (response) => response?.data?.data.data.getObsEtl,
      getData: (response) => response.data.data.data.getObsEtl,
      setData: (value) => ({
        response: { data: { data: { data: { getObsEtl: value } } } },
      }),
    },
  },
  MATRIX: {
    type: 'MATRIX',
    endpoint: statusEndpointMaker('matrix'), // init and job status
    feature: MATRIX_FEATURE,
    resultType: 'Matrix',
    middleware: 'matrix',
    response: {
      isValidError: ({ error }) => error,
      getError: (request) => request?.data ?? 'Undefined error: Matrix',
      isValid: (response) => response?.data?.data?.payload?.data,
      getData: (response) => response?.data?.data?.payload?.data,
      setData: (value) => ({
        response: { data: { data: { payload: { data: value } } } },
      }),
    },
  },
};
/*
  const dummyResponse = ServiceConfigs[INSPECTION].response.setData('test');
  const dummyData = ServiceConfigs[INSPECTION].response.getData(dummyResponse);

  console.assert(
    dummyData === 'test',
    `Failed assertion: ${dummyResponse} ${dummyData}`,
  );
*/

/**
 * aka requestType
 */
export const ServiceTypes = Object.entries(ServiceConfigs).reduce(
  /* eslint-disable no-param-reassign */
  (serviceTypes, [key, value]) => {
    serviceTypes[key] = value.type;
    return serviceTypes;
  },
  {},
  /* eslint-enable no-param-reassign */
);

//------------------------------------------------------------------------------
/**
 * map feature -> api service type
 * @function
 * @param {Feature} feature
 * @return {string} type
 */
export const getServiceType = (feature) => {
  /* eslint-disable no-param-reassign */
  if (typeof feature !== 'undefined') {
    return Object.values(ServiceConfigs).reduce((mapToFeature, service) => {
      mapToFeature[service.feature] = service.type;
      return mapToFeature;
    }, {})[feature];
  }
  /* eslint-enable no-param-reassign */
  return undefined;
};
const { INSPECTION, EXTRACTION, MATRIX } = ServiceTypes;

//------------------------------------------------------------------------------
// Endpoints/api services
//------------------------------------------------------------------------------
/**
 * tnc-py
 * Queuing requests
 *
 * ✅ Utilized by the polling machine in polling-api.js
 *
 * Consumes the fetchAction event generated  by the machine.
 *
 * @return {Object} jobId processId
 *
 */
export const initApiService = async (eventInterface) => {
  //
  // local routine
  // input required to complete the feature request
  // 'path' | 'spec' | 'etlObject'
  //
  const sendQueueRequest = async (featureInput) => {
    validateEventRequest(eventInterface, featureInput);
    const { project_id: projectId, signal = undefined } = eventInterface.request;
    const serviceType = getServiceType(eventInterface.meta.feature);
    const axiosOptions = {
      method: 'POST',
      url: ServiceConfigs[serviceType].endpoint(projectId),
      data: eventInterface.request,
      signal,
    };
    const response = await apiInstance(axiosOptions);

    return jobIdInterface(response);
  };

  validateEventInterface(eventInterface, false /* jobId */);

  let featureInput = '';

  switch (eventInterface.meta.feature) {
    case HEADER_VIEW:
      featureInput = 'path';
      break;
    case WORKBENCH:
      featureInput = 'etlObject';
      break;
    case MATRIX_FEATURE:
      featureInput = 'spec';
      break;
    default:
      throw new InvalidStateError('Unreachable');
  }

  return sendQueueRequest(featureInput);
};
//------------------------------------------------------------------------------
/**
 * Polling for the status of a queued task.
 *
 * ✅ Utilized by the polling-machine
 *
 *    👉 Ready when 'stopped'
 *    👉 Pending when 'started'
 *    👉 Error when 'status: "Successful", results: "error"'
 *
 * ✅ utilizes the isResolved function as a guard/predicate
 *
 * 🔖 event ~ command from the machine
 *
 */
export const statusApiService = async (eventInterface) => {
  validateEventInterface(eventInterface, true /* jobId */);
  const { jobId, project_id: projectId } = eventInterface.request;
  const { feature } = eventInterface.meta;
  const serviceType = getServiceType(feature);

  const response = await apiInstance.get(
    ServiceConfigs[serviceType].endpoint(projectId, jobId),
  );

  return {
    ...response,
    request: eventInterface.request,
    responseType: ResponseTypes.STATUS,
  };
};

//------------------------------------------------------------------------------
/**
 * Retrieve the completed task placed in the queue.
 * (call when the polling function return a ready signal).
 *
 * ✅ Utilized by polling-machine
 *
 */
export const resultApiService = async (eventInterface) => {
  validateEventInterface(eventInterface, true /* jobId */);
  const { jobId, project_id: projectId } = eventInterface.request;
  const { feature } = eventInterface.meta;
  const serviceType = getServiceType(feature);

  let response;

  switch (serviceType) {
    case INSPECTION:
      response = await apiInstance.get(
        ServiceConfigs[serviceType].endpoint(projectId, jobId, 'RESULTS'),
      );

      break;

    case EXTRACTION:
      // hit the graphql endpoint
      response = await gqlInstance({
        url: ServiceConfigs[serviceType].graphql(projectId),
        data: GQL.viewObsEtl(), // hydrates workbench
      });
      break;

    case MATRIX:
      // pull data from the warehouse
      response = await fetchRenderedMatrix(projectId); // used both by machine and directly when paging
      break;

    default:
      throw new ApiCallError(
        `services.api: Unsupported serviceType: ${serviceType || 'no service type'}`,
      );
  }

  //
  // 🚧 WIP - update errors
  //
  if (response.status > 200) {
    throw new ApiCallError(
      `resultApiService ${serviceType} ${jobId} failed\n${JSON.stringify(response)}`,
    );
  }

  return {
    ...response,
    responseType: ResponseTypes.RESULT,
  };
};

//------------------------------------------------------------------------------
//
// ✅ Utilized by the polling-machine
//
export const cancelApiService = async (eventInterface) => {
  validateEventInterface(eventInterface, true /* jobId */);
  const { project_id: projectId, jobId, processId } = eventInterface.request;
  const { feature } = eventInterface.meta;
  const serviceType = getServiceType(feature);

  const response = await apiInstance.delete(
    ServiceConfigs[serviceType].endpoint(projectId, jobId, 'CANCEL', processId),
  );

  return {
    ...response,
    responseType: ResponseTypes.CANCELLED,
  };
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
/**
 * tnc-py
 * Retrieve levels from the  file inspection results
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * ⬜ Implement pagination support using 'Connection' pattern
 *    (see also fetchLevels for graphql version)
 *
 * @function
 * @param {Object} input
 * @param {Array<Object>} input.sources
 * @param {string} input.purpose one of quality, component, mvalue, mspan
 * @param {Object} input.arrows map-symbol
 * @return {Object}
 *
 */
export const fetchFileLevels = ({
  projectId,
  signal,
  page = 1,
  limit = 30,
  purpose,
  ...levelsRequest
}) => {
  const data = {
    limit: purpose === 'mspan' ? 9999999999 : limit,
    page,
    request: {
      purpose,
      ...levelsRequest,
    },
  };
  return apiInstance({
    url: `/levels/${projectId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    data,
  });
};

//------------------------------------------------------------------------------
/**
 * Page through the matrix data.
 * Utilized both by the machine and ui
 *
 * @matrix_blueprint.route("/v1/matrix/<project_id>", methods=['POST'])
 *
 * @function
 * @param {Object} input
 * @param {number} input.page
 * @param {number} input.limit
 * @return {Promise} matrix records
 */
export async function fetchRenderedMatrix(
  projectId,
  { page = 1, limit = 100 } = {},
  signal = undefined,
) {
  const axiosOptions = {
    url: `/matrix/${projectId}/results`,
    method: 'POST',
    data: { page, limit },
    signal,
  };
  if (DEBUG) {
    console.debug(`%cpulling matrix page: ${page}`, 'color:orange');
  }
  return apiInstance(axiosOptions);
}
/**
 * Utilized by MatrixGrid
 * @function
 * @return {Object}
 */
export const fetchRenderedMatrixWithProjectId =
  ({ projectId, signal, limit }) =>
  async ({ page = 1 } = {}) =>
    fetchRenderedMatrix(projectId, { page, limit }, signal);
export const matrixPaginationNormalizer = (edgesFn) => (raw) => {
  return {
    pageInfo: raw.payload.pageInfo,
    edges: edgesFn(JSON.parse(raw.payload.data)),
    totalCount: raw.payload.totalCount,
  };
};
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
/**
 * graphql
 *
 * Gql request for field names.
 *
 * ✅ Utilized by workbench.sagas
 *
 * @function
 * @param {Object}
 * @return {Promise}
 */
export const fetchMatrixSpec = async ({ projectId, request, signal }) => {
  if (DEBUG) {
    console.debug(`fetchMatrixSpec api params`, projectId, request, signal);
  }
  const axiosOptions = {
    // single endpoint for all of the graphql requests
    url: `/warehouse/${projectId}`,
    data: GQL.requestMatrix(request),
    signal,
  };

  return gqlInstance(axiosOptions).then((response) => ({
    ...GQL.extractGql(response),
    meta: {},
  }));
};

//------------------------------------------------------------------------------
/**
 * Gql request for field names.
 *
 * ✅ Utilized by workbench.sagas
 *
 * @function
 * @param {Object} request
 * @return {Promise}
 */
export const fetchRequestFieldNames = async ({ projectId, request, signal }) => {
  const requestConfig = GQL.requestFieldNames(request);
  const axiosOptions = {
    url: `/warehouse/${projectId}`,
    data: requestConfig.gql,
    signal,
  };
  return gqlInstance(axiosOptions).then((response) => {
    return {
      ...GQL.extractGql(response),
      meta: {
        normalizer: requestConfig.normalizer,
      },
    };
  });
};

//------------------------------------------------------------------------------
/**
 * graphql
 *
 * Relay compliant graphql request for levels
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * ✅ Pulled directly to the ui (not hosted in Redux)
 *
 * see also fetchFileLevels
 *
 * @function
 * @param {Object} request
 * @return {Object}
 */
export const fetchLevels = async ({ projectId, signal, request }) => {
  const axiosOptions = {
    // single endpoint for all of the graphql requests
    url: `/warehouse/${projectId}`,
    data: GQL.requestLevels(request),
    signal,
  };

  return gqlInstance(axiosOptions);
};
/*-----------------------------------------------------------------------------*/
// Local utilities
/*-----------------------------------------------------------------------------*/
// extract jobId and processId from the job ticket
// api response -> { jobId, processId }
//
function jobIdInterface(response) {
  if (DEBUG) {
    console.debug('%c** api response does it look as expected? **', colors.purple);
    console.dir(response);
  }
  /*
    if (response.status === 401) {
      throw new ExpiredSessionError();
    }
    if (response.status === 403) {
      throw new ApiCallError(
        response?.data ?? {
          message: `403 Unauthorized when retrieving job ticket`,
        },
      );
    }
    */
  if (response.status > 200) {
    throw new ApiCallError({
      message: `Request failed: no job ticket returned.`,
      ...response.data,
    });
  }
  // used to run the polling task
  return {
    jobId: response.data.results.job_id,
    processId: response.data.results.process_id,
  };
}
function validateEventRequest(event, requestKey) {
  if (!event?.request || !event.request?.[requestKey]) {
    console.dir(event);
    throw new ApiCallError(
      `The api request requires a valid ${requestKey}: requires valid event.request.path`,
    );
  }
}

//------------------------------------------------------------------------------
// non-asynch request
//
/**
 * Get the project drives
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 * @function
 * @return {Promise} response
 */
export async function fetchProjectDrives(projectId, signal) {
  const axiosOptions = {
    url: `/project-drives/${projectId}`,
    method: 'GET',
    signal,
  };
  if (DEBUG) {
    console.debug(`%c testing "/project-drives/<pid>" endpoint`, 'color:orange');
  }
  return apiInstance(axiosOptions);
}
/**
 * List files | drives
 *
 * 🪟 uses signal to abort; good for useEffect
 *
 *  request = {
 *      project_id, # required
 *      token_id,
 *      path_query,
 *      path_is_directory, # default: true
 *      parent_path_query  # required when parent :: path_query
 *  }
 *
 *  response: {
 *      status
 *      count
 *      results: {
 *          parent_path_query: null | 'root' | path_query
 *          files: [ File ]
 *      }
 *  }
 *
 * @function
 * @return {Promise} response
 */
export const readDirectory = (request, signal) => {
  const axiosOptions = {
    url: `/filesystem/readdir`,
    method: 'POST',
    data: request,
    signal,
  };
  if (DEBUG) {
    console.debug(`%c testing POST @ "v1/filesystem/readdir" endpoint`, 'color:orange');
    console.debug('readDirectory api axios options:', axiosOptions);
  }

  return apiInstance(axiosOptions);
};

/**
 * Experimental
 * @inspection_blueprint.route("/v1/refetch-levels/<project_id>", methods=["POST"])
 */
export const startInspectionTask = async (projectId, params, signal) => {
  try {
    const response = await apiInstance.post(`/refetch-levels/${projectId}`, params, {
      signal,
    });
    return response.data;
  } catch (error) {
    console.error('Error starting inspection task:', error);
    throw error;
  }
};
