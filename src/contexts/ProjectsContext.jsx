import React, { createContext, useState } from 'react'
import PropTypes from 'prop-types'

import { useNavigate } from 'react-router-dom'
import { withSnackbar } from 'notistack'

import {
  postNewProject,
  deleteProject,
  fetchAllProjects as fetchFn,
} from '../services/dashboard.api'
import { useFetchApi } from '../hooks/use-fetch-api'

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true'
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * This is only relevant when we want to "configure" the
 * context externally.
 */
export const Context = createContext({
  // state
  isFetching: false,
  data: [],
  // api access
  add: (data) => {
    console.warn('Not configured - new project')
    console.dir(data)
  },
  deleteById: (id) => {
    console.warn('Not configured - delete')
    console.dir(id)
  },
  fetch: () => {
    console.warn('Not configured - fetch projects')
  },
  callback: () => {
    console.warn('Not configured - fetch projects')
  },
})

/**
 * Context provider that shares the user-driven state changes
 */
const Provider = (props) => {
  //
  const { enqueueSnackbar, children } = props
  let navigate = useNavigate()
  //
  // cache that forces update of children
  const [data, setContextCache] = useState([])
  const [error, setError] = useState(undefined)

  /**
   * fetch data
   * callback: set the initial value of the cache
   */
  const { fetch: fetchInner, isFetching } = useFetchApi({
    fetchFn,
    normalizer: undefined,
    callback: setContextCache,
    enqueueSnackbar,
    DEBUG,
  })

  // extra service provided by the ProjectsContext
  const fetch = () => {
    try {
      fetchInner()
    } catch (e) {
      console.error(`🦀 what is this error; how treat? (display on page)`)
      console.dir(e)
      navigate('/login')
    } finally {
    }
  }
  /**
   * mutate the cache
   * callback: e.g., navigate following the delete
   */
  const deleteById = async (id, callback) => {
    try {
      await deleteProject(id)
      // call fetch to trigger an update of the local cache
      // (and re-render children in the context)
      await fetch()
      // callback once the fetch has completed
      // (the whole point of the callback is getting the timing right)
      if (typeof callback === 'function') {
        callback()
      }
    } catch (e) {
      console.log('error', e)
    }
  }

  /**
   * mutate the cache
   * callback: e.g., navigate following the delete
   */
  const add = async (data, callback) => {
    try {
      const { data: newProject } = await postNewProject(data)
      // call fetch to trigger an update of the local cache
      // (and re-render children in the context)
      await fetch()
      // callback once the fetch has completed
      // (the whole point of the callback is getting the timing right)
      if (typeof callback === 'function') {
        callback(newProject)
      }
    } catch (e) {
      console.log('error', e)
    }
  }

  const state = {
    data,
    error,
    isFetching,
    add,
    deleteById,
    fetch,
  }

  if (DEBUG) {
    console.debug(`📥 Context is running: ${isFetching}`)
    console.dir(state)
  }
  return <Context.Provider value={state}>{children}</Context.Provider>
}

Provider.propTypes = {
  isFetching: PropTypes.bool,
  data: PropTypes.array,
  add: PropTypes.func,
  deleteById: PropTypes.func,
  fetch: PropTypes.func,
}

// isRequired instead?
Provider.defaultProps = {
  isFetching: false,
  data: [],
  add: (data) => {},
  deleteById: (id) => {},
  fetch: () => {},
}
export default withSnackbar(Provider)
