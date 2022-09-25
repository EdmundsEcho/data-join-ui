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
import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import clsx from 'clsx';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
// icons
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { ConfirmModal, Spinner } from './components/shared';

// 📖 (each hook used in different components)
import {
  useProjectsApiContext,
  useProjectsDataContext,
} from './contexts/ProjectsDataContext';

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

const Projects = () => {
  return (
    <Layout>
      <ListOfProjects />
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
      {children}
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
  const [openProjectList, setOpenProjectList] = useState(() => true);
  const { projectId: selectedProject = null } = useParams();
  const theme = useTheme();

  const haveSelectedProject = selectedProject !== null;

  const toggleProjectsList = () => setOpenProjectList((open) => !open);

  const lookupBy = 'project_id';
  if (!isReady && projects.length === 0) {
    return <Spinner />;
  }
  const renderOverlay = () => (
    <Box
      sx={{
        position: 'absolute',
        background: 'linear-gradient(to right, transparent 60%, white 90%)',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );

  return (
    <Box
      className='main-controller'
      sx={{
        p: '30px 0',
        borderRight: '1px solid rgba(0,0,0,0.2)',
        overflow: 'hidden',
        position: 'relative',
      }}>
      {!openProjectList && renderOverlay()}
      <Box
        sx={{
          m: theme.spacingFn(4),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          whiteSpace: 'nowrap',
        }}>
        {openProjectList && <h6 className='list heading'>Select a project</h6>}
        {toggleProjectsList && (
          <IconButton
            color='inherit'
            onClick={(event) => {
              event.stopPropagation();
              toggleProjectsList();
            }}>
            {openProjectList ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Box>
      <List className='list projects' component='nav'>
        {projects.map(({ [lookupBy]: projectId, ...restSummaryProps }) => (
          /* ------------------ Summary list item --------------------------- */
          <ListItem
            className={clsx('item', { enable: !haveSelectedProject })}
            key={`fragment|projectSummaryView|${projectId}`}
            disablePadding
            selected={projectId === selectedProject}>
            <SummaryView projectId={projectId} {...restSummaryProps} />
          </ListItem>
          /* ---------------------------------------------------------------- */
        ))}
      </List>

      {selectedProject && <NewProjectButton />}
    </Box>
  );
}
ListOfProjects.propTypes = {
  openProjectList: PropTypes.bool,
  toggleProjectsList: PropTypes.func.isRequired,
};
ListOfProjects.defaultProps = {
  openProjectList: false,
};

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
      className={clsx(
        'project-mini-card',
        'nostack',
        'links',
        'space-between align-items-center',
        {
          active: isActive,
        },
      )}>
      {addNewPlaceholder ? (
        <div>New project</div>
      ) : (
        <>
          <NavLink to={linkTo(projectId)} key={`summaryLink|${projectId}`}>
            <div className='name'>{`${name}`}</div>
          </NavLink>
          <div className='short-id'>{`short-id: ${shortId}`}</div>
          <div className='permission'>{permission}</div>
          <div className='right-align'>
            <DeleteButton projectId={projectId} />
          </div>
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
  const { remove: deleteProject } = useProjectsApiContext();

  const [openedModal, setOpenedModal] = useState(false);

  const handleDeleteProject = () => {
    deleteProject(projectId, () => navigate('/projects'));
  };

  return (
    <>
      <IconButton
        color='inherit'
        onClick={(event) => {
          event.stopPropagation();
          setOpenedModal(projectId);
        }}>
        <DeleteIcon />
      </IconButton>

      <ConfirmModal
        message={`Are you sure you want to delete ${
          openedModal.name ? `"${openedModal.name}"` : 'this'
        } project?`}
        onCancel={() => setOpenedModal(false)}
        onConfirm={(event) => {
          handleDeleteProject(event, openedModal);
          setOpenedModal(false);
        }}
        open={!!openedModal}
      />
    </>
  );
  /*
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
  ); */
}
DeleteButton.propTypes = {
  projectId: PropTypes.string.isRequired,
};

function NewProjectButton({ openProjectList }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ ml: '30px' }}>
      <Button
        sx={{ mt: 3, mb: 1, p: 2, pl: 5, pr: 5 }}
        variant='contained'
        size='small'
        color='primary'
        onClick={() => {
          navigate('/projects');
        }}>
        {openProjectList ? 'New project' : '+'}
      </Button>
    </Box>
  );
}
NewProjectButton.propTypes = {
  openProjectList: PropTypes.bool,
};
NewProjectButton.defaultProps = {
  openProjectList: true,
};
export default Projects;
