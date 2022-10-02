/**
 * Standard axios response handler. Gracefully returns standard object
 * regardless of the result of the request. You can depend on the object
 * returning in this format { status: xxx, statusText: '', data: ... }
 * Handles the following cases:
 * - Successful request (HTTP Status Code 2xx)
 * - Client or server-side errors response (HTTP Status Code 4xx or 5xx)
 * - No connection
 *
 * @example
 * const instance = axios.create ({ ... });
 * instance.interceptors.response.use (stdApiResponse, stdApiResponse);
 * return instance.get ('/fields'); // Instances automatically use stdApiResponse
 *
 * @param obj.response
 * @param obj.request
 * @param obj.data
 * @param status
 * @param statusText
 */

export const stdApiResponse = ({
  response,
  request,
  data,
  status,
  statusText,
}) => {
  // When we're unable to reach the API
  if (!response && request && parseInt(request.status, 10) === 0) {
    return {
      status: 503,
      statusText: 'Service Unavailable',
      data: {
        message: 'Unable to reach API',
        status: 'Error',
      },
    };
  }

  // If we have a response & a request it means
  // we have a problem with our response
  if (response && request) {
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    };
  }

  // Otherwise there aren't errors and we
  // return the data from the API
  return {
    status,
    statusText,
    data,
  };
};

export const gqlApiResponse = (response) => {
  return response;
};
export default stdApiResponse;
