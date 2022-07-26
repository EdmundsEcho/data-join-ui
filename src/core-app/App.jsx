/**
 *
 * Placeholder for the core-app
 *
 * Must use the useStatus context to let the data provider
 * know when the cache has gone stale.
 *
 */
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

import logo from './logo.svg'
import { Counter } from './Counter'
import './App.css'
import { useStatus as useStatusProvider } from '../hooks/use-status-provider'
import { getCacheStatus } from './projectMetaSlice'

function App({ projectId }) {
  // only triggers update when changes
  const cacheStatusRedux = useSelector(getCacheStatus)
  const { setStatus: setCacheStatus, status: cacheStatusContext } =
    useStatusProvider()

  console.log(`📦 Core-app: ${cacheStatusRedux} ${projectId}`)

  // only updates the context when status changes
  // When do we want to force a new store?????
  /*
  useEffect(() => {
    if (cacheStatusContext !== cacheStatusRedux) {
      setCacheStatus(cacheStatusRedux)
    }
  }, [cacheStatusRedux]) // eslint-disable-line react-hooks/exhaustive-deps
*/

  return (
    <div className="App">
      <p>{projectId}</p>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Counter />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <span>
          <span>Learn </span>
          <a
            className="App-link"
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux-toolkit.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux Toolkit
          </a>
          ,<span> and </span>
          <a
            className="App-link"
            href="https://react-redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Redux
          </a>
        </span>
      </header>
    </div>
  )
}

export default App
