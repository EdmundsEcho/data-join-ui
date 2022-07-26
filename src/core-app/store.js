import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'
import projectMetaReducer from './projectMetaSlice'
import saveStoreMiddleware from '../core-app/save-store.middleware'

/**
 * 📌 Exports function loadStore(previousStore)
 *
 * ⬜ Plug this in to the core-app configureStore.js
 *
 * Part of the "load existing" core-app machinery.
 *
 * This wraps the configureStore fn with the option to
 * configure the store with a saved value.
 *
 * If the saved value is undefined, it will create the default values.
 *
 */
const loadStore = (preloadedState = undefined) =>
  configureStore({
    reducer: {
      counter: counterReducer,
      projectMeta: projectMetaReducer,
    },
    middleware: () => [saveStoreMiddleware],
    preloadedState,
  })

export default loadStore
