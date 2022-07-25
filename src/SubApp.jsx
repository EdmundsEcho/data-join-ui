/**
 * Isolate the core-app with this component.
 *
 * Features: The component will initialize and isolate the app that uses redux.
 *
 * ✅ provide the child the Provider context (redux store)
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
import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'

import { useFetchApi } from './hooks/use-fetch-api'
import { fetchStore as fetchFn } from './services/dashboard.api'

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

/**
 * Core-app context
 *
 * Reads the project_id from the React Router url.  Fetches the store,
 * and renders the child component.
 */
const SubApp = (props) => {
  //
  let { projectId = undefined } = useParams()
  const { enqueueSnackbar, children: child } = props
  //
  // 🚧 tmp until figure out other non 401 errors
  //
  const navigate = useNavigate()
  //
  // SubApp cache for Provider
  // local state to host the return value of createStore
  const [store, setStore] = useState(undefined)
  //
  // get the project_id from the path that includes param
  console.debug(`2️⃣  SubApp: ${projectId} from params`)
  //
  // 📖 data using the fetchApi
  //
  const { fetch, isFetching } = useFetchApi({
    fetchFn,
    // response also includes meta:
    // help validate store and/or determine which normalizing function
    // to use (help with managing store versions)
    normalizer: ({ store }) => store,
    // null is the signal => creating a new project
    callback: (store) =>
      store === null ? setStore(undefined) : setStore(store),
    enqueueSnackbar,
    DEBUG,
  })

  //
  // 💢 Side-effect
  //
  //    Sets local state using callback
  //
  useEffect(() => {
    try {
      if (typeof projectId !== 'undefined') {
        // sets local state by way of callback
        fetch(projectId)
      } else {
        console.warn(
          `⚠️  Calling fetch without a project_id; should not happen`,
        )
      }
    } catch (e) {
      console.error(`🦀 what is this error; how treat? (display on page)`)
      console.dir(e)
      navigate('login')
    } finally {
    }

    // ⬜ return something to close out the effect
    // return () => setIsMounted(false)
    //
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  // <Provider store={data}>{child}</Provider>
  return isFetching ? (
    <p>...loading</p>
  ) : (
    <Provider store={loadStore(store)}>{child}</Provider>
  )
}

export default SubApp
