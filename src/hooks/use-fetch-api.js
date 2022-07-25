// src/hooks/use-fetch-api.js
/**
 * @module hooks/use-fetch-api
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApiResponseError } from '../errors'

/* eslint-disable no-console */

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true'
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 *
 *
 * @function
 * @return {React.hook}
 *
 */
const useFetchApi = ({
  fetchFn, // how retrieve the raw data
  callback = (x) => x, // optional post-processing
  normalizer = (x) => x, // optional post-processing
  enqueueSnackbar = (m) => {
    console.log(`🔖 enqueueSnackbar is not configured: ${m}`)
  }, // optional
  emptyValue = undefined, // optional
  DEBUG: debugProp = false,
}) => {
  //
  // initialize the local state
  //
  const [isFetching, setIsFetching] = useState(false)
  //
  // generic redirect to login when 401
  let navigate = useNavigate()

  // returns valid data || throws error
  const fetch = async (...args) => {
    try {
      setIsFetching(true)
      const response = await fetchFn(...args)

      console.assert(
        response?.status ?? false,
        `Unexpected response: Missing status\n${Object.keys(response)}`,
      )
      if (response.status === 200) {
        return callback(normalizer(response.data))
      } else {
        // throw a generic error; when caught will get more refined
        throw new ApiResponseError(response)
      }
    } catch (e) {
      console.assert(
        e?.response?.status ?? false,
        `Unexpected Error response: Missing response.status\n${JSON.stringify(
          e,
        )}`,
      )

      // grow the switch statement if/when deal with other status
      // default: let the user of the fetch-api figure out what to do.
      switch (e.response.status) {
        case 401:
          enqueueSnackbar(`Unauthorized: Session expired`, {
            variant: 'error',
          })
          console.debug(`✅ expired session 👉 login`)
          navigate('/login')
          break

        default:
          enqueueSnackbar(`Error: Api response error`, {
            variant: 'error',
          })
          throw new ApiResponseError(e)
      }
    } finally {
      setIsFetching(false)
    }
  }

  return {
    fetch,
    isFetching,
  }
}

export { useFetchApi }
