/**
 * Isolate the core-app with this component.
 *
 * Features: The component will initialize and isolate the app that uses redux.
 *
 * ✅ uses URL to retrieve project_id (not props)
 *
 * ✅ provide the child the Provider context (redux store)
 *
 * ✅ A new store is fetched whenever the project_id changes
 *
 * ✅ encapsulates logic to ensure access to a store
 *    👉 newStore when savedStore does not exist
 *
 * ✅ isolate the state of the core-app from the rest of the CRA
 *
 * ✅ set the core-app as child to SubApp
 *    👉 <SubApp>{child}</SubApp> where child is the "core-app"
 *
 */
import React, { useEffect, useState, useCallback } from 'react'
import { Provider } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import { useFetchApi } from './hooks/use-fetch-api'
import {
  useStatus as useCacheStatus,
  StatusProvider,
} from './hooks/use-status-provider'
import { fetchStore as fetchFn } from './services/dashboard.api'
import ErrorPage from './pages/ErrorPage'

// Subapp related
import loadStore from './core-app/store'
/*
 * where store = createStore(reducers...)
 * action fetchPosts = () => {
 *   return async dispatch =>  {
 *   try{
 *   get using axios
 *   }
 *   }
 * }
 *
 * store from ./redux/store
 * { fetchPosts } from ./redux/actions
 *
 * store.dispatch(fetchPosts())
 * <Provider store={ store }>
 */

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true'
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const SubApp = (props) => {
  // project_id is required
  // 💫 causes re-render when changed
  let { projectId } = useParams()

  const { enqueueSnackbar, children: child } = props
  //
  // 🚧 tmp until figure out other non 401 errors
  const navigate = useNavigate()

  const {
    status: cacheStatus,
    isStatusEmpty: isCacheStatusEmpty,
    isStatusStale: isCacheStatusStale,
    isStatusLoaded,
    setStatusLoaded,
  } = useCacheStatus()

  const [loadedProjectId, setLoadedProjectId] = useState(() => undefined)

  const reloadingProject = useCallback(
    () => loadedProjectId === projectId,
    [loadedProjectId, projectId],
  )

  //
  // 📖 data using the fetchApi
  // 💫 🛈
  //
  const {
    fetch,
    cache: store,
    error,
    status: fetchStatus,
    STATUS: FETCH_STATUS,
    reset: resetFetchApi,
  } = useFetchApi({
    fetchFn,
    // 🔖 response includes meta store data:
    // help validate store and/or determine which normalizing function
    // to use (help with managing store versions)
    normalizer: ({ store }) => store,
    callback: () => {
      console.debug(`****************Callback here`)
      setStatusLoaded()
      setLoadedProjectId(projectId)
    },
    enqueueSnackbar,
    DEBUG,
  })

  //
  // 💢 Side-effect: loads data into cache
  //    (the state of which determines what gets rendered here)
  //
  //    (1) Only fetch when existing project exists on the server
  //    Only learn about the status when changing project_id
  //    When project_id does not change, treat as (1)
  //
  //    Decides when to call fetch
  //    1. When uninitialized: cached status === empty
  //    2. When the project_id has changed (happens "for free" with this effect)
  //
  useEffect(() => {
    try {
      // guards include implied
      // && project_id !== previous project_id
      switch (true) {
        case !reloadingProject():
          resetFetchApi()
          fetch(projectId)
          console.log(`FETCHING from the server b/c switching projects`)
          break

        // ⬜ This scenario seems dubious; unsure of value
        case isCacheStatusEmpty():
          fetch(projectId)
          console.log(`FETCHING from the server b/c cache is empty`)
          break
        // when stale, nothing to fetch, nor update store
        // SO HOW "not render" at this point!! because Provider wants
        // something. THIS IS AL WRONg.
        case reloadingProject() && isCacheStatusStale():
          resetFetchApi()
          fetch(projectId)
          console.log(`FETCHING from the server b/c cache is stale`)
          break

        default: // callback sets the cache status to loaded
      }
    } catch (e) {
      console.error(`🦀 what is this error; how treat? (display on page)`)
      console.dir(e)
      navigate('login')
    } finally {
      // anything?
    }

    // ⬜ return something to close out the effect
    // return () => setIsMounted(false)
    //
  }, [projectId, isCacheStatusStale, isCacheStatusEmpty, reloadingProject]) // eslint-disable-line react-hooks/exhaustive-deps

  // 🔑 For new projects: minimum store value with project_id
  //
  const seedStore = useCallback((projectId) => {
    return {
      projectMeta: {
        meta: {
          projectId,
        },
      },
    }
  }, [])

  // rendering guard helper
  let showLoading =
    [FETCH_STATUS.IDLE, FETCH_STATUS.PENDING].includes(fetchStatus) ||
    projectId === 'undefined'

  if (DEBUG) {
    console.debug(`%c2️⃣  📋 SubApp state summary:`, 'color:orange')
    console.dir({
      projectInUrl: projectId,
      nowHostingProjectId: loadedProjectId,
      reloadingProject: reloadingProject(),
      cacheStatus,
      fetchStatus,
      storeNull: store === null || store === undefined,
      cachedStore: store,
      currentStore: 'hidden inside core-app',
    })
  }

  console.debug(
    `%cfetchStatus: ${FETCH_STATUS.RESOLVED}`,
    'color:red; font-weight: bold',
  )
  const color =
    fetchStatus === FETCH_STATUS.RESOLVED ? 'color:green' : 'color:red'

  switch (true) {
    case showLoading:
      return <p>...loading</p>

    case fetchStatus === FETCH_STATUS.RESOLVED:
      console.debug(
        `%cfetchStatus: ${fetchStatus === FETCH_STATUS.RESOLVED}`,
        color,
      )
      console.dir(store)
      //
      // 💰 <Provider store={data}>{child}</Provider>
      //
      return (
        <Provider
          store={loadStore(store === null ? seedStore(projectId) : store)}
        >
          {child}
        </Provider>
      )

    case fetchStatus === FETCH_STATUS.REJECTED:
      return (
        // 🚧 WIP parsing through error: first look at keys
        <ErrorPage
          message={error?.message ?? JSON.stringify(Object.keys(error || {}))}
        />
      )

    default:
      throw new Error('Unreachable SubApp fetch state')
  }
}

const WithCacheStatus = (props) => (
  <StatusProvider>
    <SubApp {...props} />
  </StatusProvider>
)
export default WithCacheStatus
