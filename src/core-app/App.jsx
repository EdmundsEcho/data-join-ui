import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import logo from './logo.svg'
import { Counter } from './Counter'
import { setProjectId } from './projectMetaSlice'
import './App.css'

function App({ projectId: projectIdProp }) {
  // on load, update the state to include the project Id
  const dispatch = useDispatch()
  const [loadedProject, setLoadedProject] = useState(projectIdProp)

  useEffect(() => {
    if (loadedProject !== projectIdProp) {
      dispatch(setProjectId(projectIdProp))
      setLoadedProject(projectIdProp)
      console.log(`💫 will fetch project: ${projectIdProp}`)
    } else {
      console.log(`✅ no need to fetch: ${projectIdProp}`)
    }
    return () => {}
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [projectIdProp, loadedProject])
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className="App">
      <p>{projectIdProp}</p>
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
