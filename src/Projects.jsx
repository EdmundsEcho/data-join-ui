/**
 * Provides the functionality for a list of projects.  The component
 * that is rendered for each project (item::summary view of project)
 * can be customized.
 *
 * 📖 data from ProjectContext
 * 💫 loads when call fetch (side-effect)
 *
 * 🔑 The projects is parent to project; has the Outlet component;
 *    sets where detailed view of the project (core app) is rendered.
 *    What component is the detail view?
 *    👉 see the element for projects/<projectId>
 *
 * Models the invoices in React-Router tutorial
 *
 * @component
 */
import React, { useEffect, useContext } from 'react'
import clsx from 'clsx'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

// 📖
import { Context as ProjectsContext } from './contexts/ProjectsContext'
//
import ErrorPage from './pages/ErrorPage'

/*
[{
        "project_id": "1a2e9d71-0fbf-4540-96e1-7a99d14e42cb",
        "name": "project-share",
        "description": "Will share this project with another user",
        "project_meta": null,
        "permission": "owner"
}]
*/
const Projects = () => {
  // const list = getSummaryList()
  const lookupBy = 'project_id'

  const {
    fetch,
    data: list = undefined,
    error,
    status,
    STATUS,
    deleteById: deleteItem,
  } = useContext(ProjectsContext)

  // 💢 the side-effect: update the context state with the fetched data
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    fetch()
  }, [])
  /* eslint-enable react-hooks/exhaustive-deps */
  /*
      <h2>Projects</h2>
      <p>Show a list of projects with + at the end of the list</p>
      <p>How the list is rendered depends on the width of the view</p>
      <p>Show the new project form</p>
*/

  switch (true) {
    case status === STATUS.IDLE || status === STATUS.PENDING:
      return <p>...loading</p>
    case status === STATUS.RESOLVED:
      return (
        <SuccessComp list={list} lookupBy={lookupBy} deleteItem={deleteItem} />
      )
    case status === STATUS.REJECTED:
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

function SuccessComp({ list, lookupBy, deleteItem }) {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="main-controller-root nostack">
      <div className="main-controller">
        <div className="main-controller inner stack box">
          <div className="box">
            <h3>Project list controller</h3>
            <p>Controls which project to show; defaults to new project form</p>
            <p>Eventually will have 4 states</p>
          </div>

          {/* New project link */}
          <NavLink to={`/projects`} key={`summaryLink|new-project-key`}>
            <SummaryView addNewPlaceholder />
          </NavLink>

          {/* ⬜ use a custom summary component from props (should accept isActive) */}
          {list.map(({ [lookupBy]: itemId, ...restSummaryProps }) => (
            <div key={`fragment|projectSummaryView|${itemId}`}>
              <NavLink to={`/projects/${itemId}`} key={`summaryLink|${itemId}`}>
                {({ isActive }) => (
                  <SummaryView isActive itemId={itemId} {...restSummaryProps} />
                )}
              </NavLink>

              <div className="box no-border" key={`project-delete|${itemId}`}>
                <button
                  className="delete-project right-align"
                  onClick={() => {
                    deleteItem(itemId, navigate('/projects' + location.search))
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="main-view inner">
        <div className="main-view sizing-frame stack">
          {/* Layout magic here - where the detail view is rendered */}
          <Outlet />
        </div>
      </div>
    </div>
  )
}
/**
 * Contoller
 *
 * Component to display fields provided in a summary view of a project
 * This may change and get more sophisticated over time.
 *
 */
function SummaryView({
  isActive,
  itemId = '0000',
  name,
  permission,
  addNewPlaceholder,
}) {
  const shortId = itemId.slice(itemId.length - 4)
  return (
    <div
      className={clsx({
        active: isActive,
        'project-mini-card box nostack': true,
      })}
    >
      {addNewPlaceholder ? (
        /* use a callback with axios to history.push or
           navigate to the new project */
        <div>New project</div>
      ) : (
        <>
          <div>{`${name} ${shortId}`}</div>
          <div className="right-align">{permission}</div>
        </>
      )}
    </div>
  )
}
// Placeholder for now
// append the search term to the URL
// creates a permalink of sorts with the filter
// eslint-disable-next-line
function QueryNavLink({ to, ...props }) {
  let location = useLocation()
  return <NavLink to={to + location.search} {...props} />
}
export default Projects
