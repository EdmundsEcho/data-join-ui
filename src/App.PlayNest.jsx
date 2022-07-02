import React, {useState, useEffect} from 'react'
import {Routes, Route, Link, Outlet} from 'react-router-dom'
import axios from 'axios'

import listProjects from './data/projects.json'

import './index.css'

/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-no-undef */

//
// ⬜ Create a json file that maps the 3-4 layers of data requests for each
//    component.
//
const App = () => {
  return (
    <div className="root box stack">
      <div className="root inner">
        <TopBar>t</TopBar>
        <div className="main wrapper nostack">
          {/* Main menu - controls what is displayed in main-viewport */}
          <div className="main box nostack">
            <div className="main-menu box">
              <div className="main-menu inner stack">
                <h1>React Router</h1>
                <nav className="stack">
                  {/* to must map to first-level of Routes */}
                  <Link to="/home">Home</Link>
                  <Link to="/user-profile">User Profile</Link>
                  <Link to="/users">Users</Link>
                  <Link to="/shared-drives">Shared Drives</Link>
                  <Link to="/projects">Project View</Link>
                </nav>
              </div>
            </div>

            {/* Main viewport */}
            <div className="main-view box">
              <Routes>
                <Route index element={<Home />} />
                <Route path="home" element={<Home />} />
                <Route
                  path="user-profile"
                  element={<UserProfile />}
                />
                <Route path="users" element={<Users />} />
                <Route
                  path="shared-drives"
                  element={<SharedDrives />}
                />
                <Route
                  path="projects"
                  element={
                    <WithViewController>
                      <ProjectView />
                    </WithViewController>
                  }
                >
                  <Route
                    index
                    element={
                      <WithCoreAppMain>
                        <SummaryView />
                      </WithCoreAppMain>
                    }
                  />
                  <Route
                    path="summary-view"
                    element={
                      <WithCoreAppMain>
                        <SummaryView />
                      </WithCoreAppMain>
                    }
                  />
                  <Route
                    path="header-view"
                    element={
                      <WithCoreAppMain>
                        <HeaderView />
                      </WithCoreAppMain>
                    }
                  />
                  <Route
                    path="etl-view"
                    element={
                      <WithCoreAppMain>
                        <EtlView />
                      </WithCoreAppMain>
                    }
                  />
                  <Route
                    path="workbench"
                    element={
                      <WithCoreAppMain>
                        <Workbench />
                      </WithCoreAppMain>
                    }
                  />
                  <Route
                    path="data-preview"
                    element={
                      <WithCoreAppMain>
                        <Matrix />
                      </WithCoreAppMain>
                    }
                  />
                  <Route path="*" element={<NoMatch />} />
                </Route>
                <Route path="*" element={<NoMatch />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
      {/* layout markers */}
      <div className="marker top" />
      <div className="marker bottom" />
      <div className="marker top computed" />
    </div>
  )
}

function TopBar() {
  return <div className="topbar">topbar</div>
}

/**
 * WIP 🚧 4 states
 *
 * 1. floating button
 * 2. list of mini-cards
 * 3. larger-cards
 * 4. largest-card + list
 *
 * May wish to generalize the messaging
 * -> N choices in controller : 1 main view
 * -> Customizable components for each state
 *
 */
function WithViewController({children}) {
  const [list, setList] = useState([])
  const data = listProjects
  useEffect(() => {
    setList(data)
  }, [])

  return (
    <div className="main-controller-root nostack">
      <div className="main-controller">
        <div className="main-controller inner stack box">
          {list.map(({name, project_id: projectId}) => (
            <div
              key={`card-${projectId}`}
              className="project-mini-card box"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
      <div className="main-view inner">
        <div className="main-view sizing-frame stack">{children}</div>
      </div>
    </div>
  )
}
// --------------------------------------------------------------------------
/**
 * Core App View
 */
function ProjectView() {
  return (
    <>
      <div className="box stack project-view">
        <Outlet />
        <div className="bottom-navigation positioning-frame">
          <h2>Project View</h2>
          <nav className="nostack">
            <Link to="/projects/summary-view">SummaryView</Link>
            <Link to="/projects/header-view">HeaderView</Link>
            <Link to="/projects/etl-view">EtlView</Link>
            <Link to="/projects/workbench">Workbench</Link>
            <Link to="/projects/data-preview">Matrix</Link>
          </nav>
        </div>
      </div>
    </>
  )
}
/**
 * Core-app children
 */
function WithCoreAppMain({children}) {
  return <div className="Core-app-main">{children}</div>
}
function SummaryView() {
  return (
    <>
      <h2>SummaryView</h2>
      <p className="message">Snapshot of progress</p>
    </>
  )
}
function HeaderView() {
  return (
    <>
      <h2>HeaderView</h2>
      <p className="message">
        Select data sources; map fields to purpose
      </p>
    </>
  )
}
function EtlView() {
  return (
    <>
      <h2>EtlView</h2>
      <p className="message">Find and stack related data</p>
    </>
  )
}
function Workbench() {
  return (
    <>
      <h2>Workbench</h2>
      <p className="message">Select data & more</p>
    </>
  )
}
function Matrix() {
  return (
    <>
      <h2>Matrix</h2>
      <p className="message">Data requested from data warehouse</p>
    </>
  )
}
// END Core app

// --------------------------------------------------------------------------
function Home() {
  return (
    <>
      <h2>Home</h2>
      <p className="message">This is home base</p>
    </>
  )
}
function Users() {
  return (
    <>
      <h2>Users</h2>
      <p className="message">List of users (postgrest: users)</p>
    </>
  )
}
function UserProfile() {
  return (
    <>
      <h2>User Profile</h2>
      <p className="message">First Name: Edmund</p>
      <p className="message">Last Name: Cape</p>
    </>
  )
}
function SharedDrives() {
  return (
    <>
      <h2>User Profile</h2>
      <p className="message">First Name: Edmund</p>
      <p className="message">Last Name: Cape</p>
    </>
  )
}

function NoMatch() {
  return (
    <>
      <h2>NoMatch</h2>
      <p className="message">
        The navigation took us somewhere where a component has not
        been mapped.
      </p>
    </>
  )
}

export default App
