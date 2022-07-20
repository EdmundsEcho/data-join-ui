import React, { createContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { withSnackbar } from 'notistack'
import PropTypes from 'prop-types'
import {
  postNewProject,
  deleteProject,
  fetchAllProjects,
} from '../services/dashboard.api'

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
})

/**
 * Context provider that shares the user-driven state changes
 */
const Provider = (props) => {
  //
  // limit to redirect to login on error
  //
  const navigate = useNavigate()
  // cache that forces update of children
  const [data, setContextCache] = useState([])
  // convenience for children; be patient :))
  // - wait for cache before rendering
  const [isFetching, setIsFetching] = useState(false)

  const { enqueueSnackbar, children } = props

  // side-effect; called by child and following add/delete
  const fetch = async () => {
    try {
      setIsFetching(true)
      const response = await fetchAllProjects()
      const { error, status } = response?.data
      //
      // set the local cache here
      if (!error && status !== 'Error' && response?.status === 200) {
        setContextCache(response.data)
      } else {
        // on error redirect to login
        // ⬜ this should bubble up to a authentication context
        //    throw a specific InvalidSession error
        navigate('/login')
        enqueueSnackbar(`Error: ${error || response?.data?.message}`, {
          variant: 'error',
        })
      }
      // debug
      console.log('fetch', { response })
    } catch (e) {
      // ⬜ Throw and catch the error
      console.log('error fetch', e)
    }
    setIsFetching(false)
  }

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
    isFetching,
    data,
    add,
    deleteById,
    fetch,
  }

  console.debug(`📥 Context is running: ${isFetching}`)
  console.dir(state)
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
