/**
 * @module src/services/api
 *
 * @description
 * Unified access to the tnc-api and obs/mms services.
 *
 */
import axios from 'axios';

import { stdApiResponse } from './helpers';
import {
  ApiCallError,
  // ExpiredSessionError,
  GqlError,
  InvalidStateError,
} from '../lib/LuciErrors';
import { HEADER_VIEW } from '../ducks/actions/headerView.actions';
import { WORKBENCH } from '../ducks/actions/workbench.actions';
import { MATRIX as MATRIX_FEATURE } from '../ducks/actions/matrix.actions';
import { validateEventInterface } from '../ducks/actions/api.actions';

import * as GQL from './graphql.api';
import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
// Read the .env
//------------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_API === 'true';
//------------------------------------------------------------------------------
/* eslint-disable camelcase, no-console */

//------------------------------------------------------------------------------
// Set the endpoint base url based on env setting
// Read the .env
//------------------------------------------------------------------------------
const API_BASE_URL =
  process.env.REACT_APP_ENV === 'production'
    ? `${window.location.origin}/v1`
    : `http://${window.location.hostname}:5005/v1`;

const GQL_BASE_URL =
  process.env.REACT_APP_ENV === 'production'
    ? `${window.location.origin}/v1`
    : `http://${window.location.hostname}:5003/v1`;
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
    const { project_id: projectId } = eventInterface.request;
    const serviceType = getServiceType(eventInterface.meta.feature);
    const axiosOptions = {
      method: 'POST',
      url: ServiceConfigs[serviceType].endpoint(projectId),
      data: eventInterface.request,
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
        `services.api: Unsupported serviceType: ${
          serviceType || 'no service type'
        }`,
      );
  }

  //
  // 🚧 WIP - update errors
  //
  if (response.status > 200) {
    throw new ApiCallError(
      `resultApiService ${serviceType} ${jobId} failed\n${JSON.stringify(
        response,
      )}`,
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
 * ⬜ Implement pagination support using 'Connection' pattern
 *
 * @function
 * @param {Object} input
 * @param {Array<Object>} input.sources
 * @param {string} input.purpose one of quality, component, mvalue, mspan
 * @param {Object} input.arrows map-symbol
 * @return {Object}
 *
 */
export const getFileLevels = ({
  projectId,
  sources,
  purpose,
  arrows = {},
  page = 1,
  limit = 10,
}) => {
  const body = {
    arrows,
    page,
    purpose,
    // If we're dealing with an mspan purpose we request all so we can display chips
    limit: purpose === 'mspan' ? 99999999999 : limit,
    sources,
  };
  return apiInstance.post(`/levels/${projectId}`, body);
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
) {
  const axiosOptions = {
    url: `/matrix/${projectId}/results`,
    method: 'POST',
    data: { page, limit },
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
  (projectId) =>
  async (...args) =>
    fetchRenderedMatrix(projectId, ...args);
export const matrixPaginationNormalizer = (edgesFn) => (raw) => {
  const result = {
    pageInfo: raw.data.payload.pageInfo,
    edges: edgesFn(JSON.parse(raw.data.payload.data)),
    totalCount: raw.data.payload.totalCount,
  };
  return result;
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
 * @param {Object} request
 * @return {Promise}
 */
export const fetchMatrixSpec = async (projectId, request) => {
  const config = {
    url: `/warehouse/${projectId}`,
    data: GQL.requestMatrix(request),
  };

  return gqlInstance(config).then((response) => {
    return {
      ...GQL.extractGql(response),
      meta: {},
    };
  });
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
export const fetchRequestFieldNames = async ({ projectId, ...request }) => {
  const requestConfig = GQL.requestFieldNames(request);
  const config = {
    url: `/warehouse/${projectId}`,
    data: requestConfig.gql,
  };
  return gqlInstance(config).then((response) => {
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
 * ✅ Pulled directly to the ui (not hosted in Redux)
 *
 * @function
 * @param {Object} request
 * @return {Object}
 */
export const fetchLevels = async ({ projectId, ...request }) => {
  console.log(GQL.requestLevels(request));
  const config = {
    url: `/warehouse/${projectId}`,
    data: GQL.requestLevels(request),
  };

  return gqlInstance(config).then(({ data }) => {
    if (typeof data?.errors !== 'undefined') {
      throw new GqlError(`The graphql request failed`);
      // throw new GqlError(JSON.stringify(data.errors));
    }
    return data;
  });
};
/*-----------------------------------------------------------------------------*/
// Local utilities
/*-----------------------------------------------------------------------------*/
// extract jobId and processId from the job ticket
// api response -> { jobId, processId }
//
function jobIdInterface(response) {
  if (DEBUG) {
    console.debug(
      '%c** api response does it look as expected? **',
      colors.purple,
    );
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
 * @function
 * @return {Promise} response
 */
export async function fetchProjectDrives(projectId) {
  const axiosOptions = {
    url: `/project-drives/${projectId}`,
    method: 'GET',
  };
  if (DEBUG) {
    console.debug(
      `%c testing "/project-drives/<pid>" endpoint`,
      'color:orange',
    );
  }
  return apiInstance(axiosOptions);
}
/**
 * List files | drives
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
export const readDirectory = (request) => {
  const axiosOptions = {
    url: `/filesystem/readdir`,
    method: 'POST',
    data: request,
  };
  if (DEBUG) {
    console.debug(
      `%c testing POST @ "v1/filesystem/readdir" endpoint`,
      'color:orange',
    );
  }

  return apiInstance(axiosOptions);
};
