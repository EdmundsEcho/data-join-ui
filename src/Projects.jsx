/**
 * Provides the functionality for a list of projects.  The component
 * that is rendered for each project (item::summary view of project)
 * can be customized.
 *
 * 📖 data from ProjectContext
 *
 * 💫 loads when this comonent calls fetch (side-effect)
 *
 * 🪟 Projects is parent to project | new project form.
 *   The <Outlet /> component determines where to render the childrend.
 *   (rendered in ShowProjects)
 *
 * @component
 */
import React from 'react';
import { PropTypes } from 'prop-types';
import clsx from 'clsx';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Spinner } from './components/shared';

// 📖
import { useProjectsApiContext } from './contexts/ProjectsDataContext';
import { useProjectsDataContext } from './contexts/ProjectsDataContext';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable react/jsx-props-no-spreading */

/*
[{
        "project_id": "1a2e9d71-0fbf-4540-96e1-7a99d14e42cb",
        "name": "project-share",
        "description": "Will share this project with another user",
        "project_meta": null,
        "permission": "owner"
}]
*/

/**
 *
 * @component
 */
const Projects = () => {
  //

  return (
    <Layout>
      {/* New project link */}
      <NavLink to='new-project' key='summaryLink|new-project-key'>
        <SummaryView addNewPlaceholder />
      </NavLink>

      {/* User projects */}
      <ListOfProjects />

      {/* ⬜ use a custom summary component from props (should accept isActive) */}
    </Layout>
  );
};

const linkTo = (itemId) => `${itemId}/meta`; // project_id
/**
 * Render a list of summary views for each project in the list.
 *
 * 🪟 Outlet
 *
 *   👉 renders a link to pid/files
 *   👉 includes <Outlet /> for children (to the right)
 *   👉 renders a static "new project" link (summary view addNewPaceholder)
 *   👉 includes a delete project button; redirects to index
 *
 * ⬆ 📖 data as prop
 *
 * ⬇ Depends on route Match:
 *   * new project form or
 *   * project view
 *
 */
function Layout({ children }) {
  //
  Outlet.displayName = 'Projects-Outlet';
  //
  return (
    <div className='main-controller-root nostack'>
      <div className='main-controller'>
        <div className='main-controller inner stack box'>
          <div className='box'>
            <h3>Project list controller</h3>
            <p>Controls which project to show; defaults to new project form</p>
            <p>Eventually will have 4 states</p>
          </div>
          {children}
        </div>
      </div>
      <div className='main-view inner'>
        <div className='main-view sizing-frame stack'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
Layout.defaultProps = {};

/**
 * Renders a list (map)
 * 🔖 only use spinner when there is no data (not when updating)
 */
function ListOfProjects() {
  const { data: projects, isReady } = useProjectsDataContext();

  const lookupBy = 'project_id';
  if (!isReady && projects.length === 0) {
    return <Spinner />;
  }
  return projects.map(({ [lookupBy]: projectId, ...restSummaryProps }) => (
    /* ------------------ Summary list item --------------------------- */
    <div key={`fragment|projectSummaryView|${projectId}`}>
      <NavLink to={linkTo(projectId)} key={`summaryLink|${projectId}`}>
        {({ isActive }) => (
          <SummaryView
            isActive={isActive}
            projectId={projectId}
            {...restSummaryProps}
          />
        )}
      </NavLink>
      <DeleteButton projectId={projectId} />
    </div>
    /* ---------------------------------------------------------------- */
  ));
}
ListOfProjects.propTypes = {};
ListOfProjects.defaultProps = {};

/**
 *
 * Component to display fields provided in a summary view of a project
 * This may change and get more sophisticated over time.
 *
 */
function SummaryView({
  isActive,
  projectId = '0000',
  name,
  permission,
  addNewPlaceholder,
}) {
  const shortId = projectId.slice(projectId.length - 4);
  return (
    <div
      className={clsx({
        active: isActive,
        'project-mini-card box nostack': true,
      })}>
      {addNewPlaceholder ? (
        <div>New project</div>
      ) : (
        <>
          <div>{`${name} -- ${shortId}`}</div>
          <div className='right-align'>{permission}</div>
        </>
      )}
    </div>
  );
}
SummaryView.propTypes = {
  isActive: PropTypes.bool,
  projectId: PropTypes.string,
  name: PropTypes.string,
  permission: PropTypes.string,
  addNewPlaceholder: PropTypes.bool,
};
SummaryView.defaultProps = {
  isActive: false,
  projectId: '00000',
  name: undefined,
  permission: undefined,
  addNewPlaceholder: false,
};

function DeleteButton({ projectId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { remove: deleteProject } = useProjectsApiContext();

  return (
    <div className='box no-border' key={`project-delete|${projectId}`}>
      <button
        className='delete-project right-align'
        type='button'
        onClick={() => {
          deleteProject(projectId, () =>
            navigate(`/projects${location.search}`),
          );
        }}>
        Delete
      </button>
    </div>
  );
}
DeleteButton.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default Projects;
