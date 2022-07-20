import React from 'react'

import { Routes, Route, Link, Outlet, useParams } from 'react-router-dom'
// import axios from 'axios'

import LoginPage from './pages/LoginPage'
import RedirectPage from './pages/RedirectPage'
// summary view of projects and component when a project is not selected
import Projects from './Projects'
import NewProjectForm from './forms/ProjectForm'
import ProjectsListProvider from './contexts/ProjectsContext'

import './index.css'

const Loading = () => {
  return <p>Loading...</p>
}
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
        <TopBar />
        <div className="main wrapper nostack">
          {/* Main menu - controls what is displayed in main-viewport */}
          <div className="main box nostack">
            <div className="main-menu box">
              <div className="main-menu inner stack">
                <div className="box">
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
              <div className="box next-steps">
                <ul title="Next steps">
                  <li className="done">
                    Browser URL triggers fetchProject(id)
                  </li>
                  <li className="done">Update url to show project id</li>
                  <li className="done">
                    Context for data cache and ability ot update the cache
                  </li>
                  <li>Render the core app</li>
                  <li>Add User-Profile page</li>
                  <li>Core app read projectId prop</li>
                </ul>
              </div>
            </div>

            {/* Main viewport */}
            {/* //prettier-ignore */}
            <div className="main-view box">
              <Routes>
                <Route index element={<RedirectPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="home" element={<Home />} />
                <Route path="user-profile" element={<UserProfile />} />
                <Route path="users" element={<Users />} />
                <Route path="shared-drives" element={<SharedDrives />} />
                <Route
                  path="projects"
                  element={
                    <ProjectsListProvider>
                      <Projects />
                    </ProjectsListProvider>
                  }
                >
                  {/* this element renders after Projects in Projects Outlet */}
                  {/* it should be a substitute for main project view when no project is selected  */}
                  {/* ⬜ Figure out a way to update the meta (show the form) */}
                  <Route index element={<NewProjectForm />} />
                  <Route path=":projectId" element={<ProjectView />} />
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
/*
 *

                <Route path="projects" element={ <WithViewControllerV2 lookupBy="project_id"><Projects /></WithViewControllerV2> } >
                  <Route index element={ <WithCoreAppMain> <SummaryView /> </WithCoreAppMain> } /><Route path="summary-view" element={ <WithCoreAppMain> <SummaryView /> </WithCoreAppMain> } />
                  <Route path="header-view" element={ <WithCoreAppMain> <HeaderView /> </WithCoreAppMain> } />
                  <Route path="etl-view" element={ <WithCoreAppMain> <EtlView /> </WithCoreAppMain> } />
                  <Route path="workbench" element={ <WithCoreAppMain> <Workbench /> </WithCoreAppMain> } />
                  <Route path="data-preview" element={ <WithCoreAppMain> <Matrix /> </WithCoreAppMain> } />
                  <Route path="*" element={<NoMatch />} />
                  */
function TopBar() {
  return <div className="topbar">topbar</div>
}

// --------------------------------------------------------------------------
/**
 * Core App View
 *
 * ⬜ Add some sort of wrapper to
 *    👉 isolate Outlet (although, core-app itself should use Outlet)
 *    👉 indirection for setting the itemId
 *
 * 🚧 Interface between dashboard and core-app
 *    * core-app needs to get the link to prefix (e.g., projects)
 *    * core-app needs to get the project_id
 *    * core-app needs to know how to load and save a store
 *
 * 📖 The app needs to know how to save and load; maybe wrapper to deal with
 *    loading state.
 *
 */
function ProjectView(props) {
  let { projectId = undefined } = useParams()
  // fetch the project

  return projectId ? (
    <>
      <div className="box stack project-view">
        <p>{projectId}</p>
        <Outlet />
        <div className="bottom-navigation positioning-frame">
          <h2>Project View</h2>
          <nav className="nostack">
            {/* to with nested url is required to point to nested
                location of where to render the project */}
            <Link to="/projects/summary-view">SummaryView</Link>
            <Link to="/projects/header-view">HeaderView</Link>
            <Link to="/projects/etl-view">EtlView</Link>
            <Link to="/projects/workbench">Workbench</Link>
            <Link to="/projects/data-preview">Matrix</Link>
          </nav>
        </div>
      </div>
    </>
  ) : (
    <Loading />
  )
}
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
        The navigation took us somewhere where a component has not been mapped.
      </p>
    </>
  )
}

export default App
