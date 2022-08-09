/**
 * @module src/services/api
 *
 * @description
 * Unified access to the tnc-api and obs/mms services.
 *
 */
import axios from 'axios';

import { stdApiResponse } from './helpers';
import { ApiCallError, GqlError, InvalidStateError } from '../lib/LuciErrors';
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
    : `http://${window.location.hostname}:5005/v1`;

const GQL_BASE_URL =
  process.env.REACT_APP_ENV === 'production'
    ? `${window.location.origin}/graphiql/v1`
    : `http://${window.location.hostname}:5003/graphiql/v1`;
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
  withCredentials: true,
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
      response?.data?.results.includes('object is not subscriptable')
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
//------------------------------------------------------------------------------
// Configure api response::result -> required format
// Utilized by feature.middleware
//------------------------------------------------------------------------------
export const ServiceConfigs = {
  INSPECTION: {
    type: 'INSPECTION',
    endpoint: 'inspection',
    feature: HEADER_VIEW,
    resultType: 'HeaderView',
    middleware: 'headerView',
    response: {
      isValid: (response) => {
        return response?.data?.data?.results;
      },
      getData: (response) => response?.data?.data?.results,
      setData: (value) => ({
        response: { data: { data: { results: value } } },
      }),
    },
  },
  EXTRACTION: {
    type: 'EXTRACTION',
    endpoint: 'extraction',
    feature: WORKBENCH,
    resultType: 'EtlObject',
    middleware: 'workbench',
    response: {
      isValid: (response) => response?.data?.data?.data?.getObsEtl,
      getData: (response) => response?.data?.data?.data?.getObsEtl,
      setData: (value) => ({
        response: { data: { data: { data: { getObsEtl: value } } } },
      }),
    },
  },
  MATRIX: {
    type: 'MATRIX',
    endpoint: 'matrix',
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
 * Polling for the status of a queued task.
 *
 * ✅ Utilized by the machine
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
  const { jobId } = eventInterface.request;
  const { feature } = eventInterface.meta;

  const response = await apiInstance.get(
    `/${ServiceConfigs[getServiceType(feature)].endpoint}/${jobId}`,
  );

  return {
    ...response,
    request: { jobId },
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
  const { jobId } = eventInterface.request;
  const { feature } = eventInterface.meta;
  const serviceType = getServiceType(feature);

  let response = {};

  switch (serviceType) {
    case INSPECTION:
      response = await apiInstance.get(
        `/${ServiceConfigs[serviceType].endpoint}/${jobId}/results`,
      );
      break;

    case EXTRACTION:
      response = await gqlInstance({
        url: '/',
        data: GQL.viewObsEtl(),
      });
      break;

    case MATRIX:
      response = await fetchRenderedMatrix();
      break;

    default:
      throw new ApiCallError(
        `services.api: Unsupported serviceType: ${
          serviceType || 'no service type'
        }`,
      );
  }

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
  const { jobId, processId } = eventInterface.request;
  const serviceType = getServiceType(eventInterface.meta.feature);
  const response = await apiInstance.delete(
    `/${ServiceConfigs[serviceType].endpoint}/${jobId}?pid=${processId}`,
  );

  if (response.status > 200) {
    throw new ApiCallError(
      `cancelApiRequest ${serviceType} ${jobId} failed; see network.`,
    );
  }

  return {
    ...response,
    responseType: ResponseTypes.CANCELLED,
  };
};

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
export const getLevels = ({
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
  return apiInstance.post(`/levels`, body);
};

//------------------------------------------------------------------------------
// export the queue functions
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
  validateEventInterface(eventInterface, false /* jobId */);
  switch (eventInterface.meta.feature) {
    case HEADER_VIEW:
      return queueFileInspectionRequest(eventInterface);
    case WORKBENCH:
      return queueEtlExtraction(eventInterface);
    case MATRIX_FEATURE:
      return queueMatrixRequest(eventInterface);
    default:
      throw new InvalidStateError('Unreachable');
  }
};
// File Inspection
async function queueFileInspectionRequest(eventInterface) {
  // Aug 2022: partial validation
  validateEventRequest(eventInterface, 'path');
  const axiosOptions = {
    method: 'POST',
    url: `/${ServiceConfigs[INSPECTION].endpoint}`,
    data: {
      force: false,
      ...eventInterface.request,
    },
  };
  return jobIdInterface(apiInstance(axiosOptions));
}
// Extraction
async function queueEtlExtraction(eventInterface) {
  validateEventRequest(eventInterface, 'etlObject');
  const axiosOptions = {
    method: 'POST',
    data: eventInterface.request.etlObject,
    url: `/extraction`,
  };

  return jobIdInterface(apiInstance(axiosOptions));
}
// Matrix
async function queueMatrixRequest(eventInterface) {
  validateEventRequest(eventInterface, 'spec');
  const axiosOptions = {
    method: 'POST',
    data: eventInterface.request.spec,
    url: `/matrix`,
  };
  return jobIdInterface(apiInstance(axiosOptions));
}
//------------------------------------------------------------------------------

/**
 * Page through the matrix data.
 * Utilized both locally and by the ui
 *
 * @function
 * @param {Object} input
 * @param {number} input.page
 * @param {number} input.limit
 * @return {Promise} matrix records
 */
export async function fetchRenderedMatrix({ page = 1, limit = 100 } = {}) {
  const axiosOptions = {
    url: '/matrix/view',
    method: 'POST',
    data: { page, limit },
  };
  if (DEBUG) {
    console.debug(`%cpulling matrix page: ${page}`, 'color:orange');
  }
  return apiInstance(axiosOptions);
}

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
export const fetchMatrixSpec = async (request) => {
  const config = {
    url: '/',
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
export const fetchRequestFieldNames = async (request) => {
  const requestConfig = GQL.requestFieldNames(request);
  const config = {
    url: '/',
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
export const fetchLevels = async (request) => {
  const config = {
    url: '/',
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
// api response -> { jobId, processId }
//
async function jobIdInterface(request) {
  const response = await request;
  if (DEBUG) {
    console.debug(
      '%c** api response does it look as expected **',
      colors.purple,
    );
    console.dir(response);
  }

  if (response.status > 200) {
    throw new ApiCallError(
      `Retrieving the jobId failed.\n${response.data.message}`,
    );
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
