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
import React, { useEffect, useContext, useCallback } from 'react';
import { PropTypes } from 'prop-types';
import clsx from 'clsx';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

// 📖
import ProjectsListProvider, {
  Context as ProjectsContext,
} from './contexts/ProjectsContext';
import ErrorPage from './pages/ErrorPage';

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
 * 📖 ProjectListContext
 *
 * 📥 calls fetch to load the context
 *
 * 👉 renders states associated with fetching data
 * 👉 when ready, ShowProjects includes Outlet
 *
 * @component
 */
const Projects = () => {
  // const list = getSummaryList()
  const lookupBy = 'project_id';

  // Initialize the shared context for Projects
  // list of projects
  const {
    fetch: fetchProp,
    data: list = undefined,
    error,
    status,
    STATUS,
    deleteById: deleteItem,
  } = useContext(ProjectsContext);

  const fetch = useCallback(fetchProp, [fetchProp]);
  //
  // 💢 the side-effect:
  // update the context state with the fetched data
  //
  useEffect(() => {
    fetch();
  }, []);

  switch (true) {
    case status === STATUS.IDLE || status === STATUS.PENDING:
      return <p>...loading</p>;

    case status === STATUS.RESOLVED:
      return (
        <ShowProjects list={list} lookupBy={lookupBy} deleteItem={deleteItem} />
      );

    case status === STATUS.REJECTED:
      return (
        // 🚧 WIP parsing through error: first look at keys
        <ErrorPage
          message={error?.message ?? JSON.stringify(Object.keys(error || {}))}
        />
      );

    default:
      throw new Error('Unreachable SubApp fetch state');
  }
};

/**
 * Render a list of summary views for each project in the list.
 * <SummaryView>
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
function ShowProjects({ list, lookupBy, deleteItem }) {
  const navigate = useNavigate();
  const location = useLocation();
  const linkTo = (itemId) => `${itemId}/files`; // project_id

  Outlet.displayName = 'ProjectsOutlet';

  return (
    <div className='main-controller-root nostack'>
      <div className='main-controller'>
        <div className='main-controller inner stack box'>
          <div className='box'>
            <h3>Project list controller</h3>
            <p>Controls which project to show; defaults to new project form</p>
            <p>Eventually will have 4 states</p>
          </div>

          {/* New project link */}
          <NavLink to='/projects' key='summaryLink|new-project-key'>
            <SummaryView addNewPlaceholder />
          </NavLink>

          {/* ⬜ use a custom summary component from props (should accept isActive) */}
          {list.map(({ [lookupBy]: itemId, ...restSummaryProps }) => (
            <div key={`fragment|projectSummaryView|${itemId}`}>
              <NavLink to={linkTo(itemId)} key={`summaryLink|${itemId}`}>
                {({ isActive }) => (
                  <SummaryView
                    isActive={isActive}
                    itemId={itemId}
                    {...restSummaryProps}
                  />
                )}
              </NavLink>

              <div className='box no-border' key={`project-delete|${itemId}`}>
                <button
                  className='delete-project right-align'
                  type='button'
                  onClick={() => {
                    deleteItem(itemId, navigate(`/projects${location.search}`));
                  }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
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

ShowProjects.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape({})),
  lookupBy: PropTypes.string.isRequired,
  deleteItem: PropTypes.func,
};
ShowProjects.defaultProps = {
  list: [],
  deleteItem: undefined,
};

/**
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
  const shortId = itemId.slice(itemId.length - 4);
  return (
    <div
      className={clsx({
        active: isActive,
        'project-mini-card box nostack': true,
      })}>
      {addNewPlaceholder ? (
        /* use a callback with axios to history.push or
           navigate to the new project */
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
  itemId: PropTypes.string,
  name: PropTypes.string,
  permission: PropTypes.string,
  addNewPlaceholder: PropTypes.bool,
};
SummaryView.defaultProps = {
  isActive: false,
  itemId: '00000',
  name: undefined,
  permission: undefined,
  addNewPlaceholder: false,
};

const WithProvider = (props) => (
  <ProjectsListProvider>
    <Projects {...props} />
  </ProjectsListProvider>
);
export default WithProvider;
