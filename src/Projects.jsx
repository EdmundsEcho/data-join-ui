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
import React, { useCallback, useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import clsx from 'clsx';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { withSize } from 'react-sizeme';

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
import AddIcon from '@mui/icons-material/Add';

import { ConfirmModal, Spinner } from './components/shared';

// 📖 (each hook used in different components)
import {
  useProjectsApiContext,
  useProjectsDataContext,
} from './contexts/ProjectsDataContext';
import { DISPLAY_VERSIONS } from './core-app/lib/sum-types';
import { getDisplayVersion as initDisplayVersion } from './dashboard.lib';
import { useThemeMode } from './hooks/use-theme-mode';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console, react/jsx-props-no-spreading */

/*
[{
        "project_id": "1a2e9d71-0fbf-4540-96e1-7a99d14e42cb",
        "name": "project-share",
        "description": "Will share this project with another user",
        "project_meta": null,
        "permission": "owner"
}]
*/

const getDisplayVersion = initDisplayVersion([270, 200, 100]);

const ListOfProjectsWithSize = withSize({ monitorWidth: true })(ListOfProjects);

const Projects = () => {
  return (
    <Layout>
      <ListOfProjectsWithSize />
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
    <div className='controller root nostack'>
      {children}
      <div className='controller outlet flex-handle'>
        <div className='controller sizing-frame stack'>
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
function ListOfProjects({ size: sizeProp }) {
  const { data: projects, isReady } = useProjectsDataContext();
  const { projectId: selectedProject = null } = useParams();
  const [size, setSize] = useState(() => sizeProp);
  const displayVersionProp = getDisplayVersion(size.width);
  const theme = useTheme();

  const haveSelectedProject = selectedProject !== null;

  const [sizeEffectOn, setSizeEffectOn] = useState(() => true);
  const [displayVersion, setDisplayVersion] = useState(
    () => displayVersionProp,
  );
  const minimizeView = displayVersion === DISPLAY_VERSIONS.MINI;

  const toggleMiniView = useCallback(() => {
    // when mini => toggle to displayVersionProp (dynamic)
    // when !mini => toggle to mini
    setDisplayVersion((version) => {
      // use previous state to drive updates in local state
      const changeToMini = version !== DISPLAY_VERSIONS.MINI;
      setSizeEffectOn(() => !changeToMini);
      // update local state
      return changeToMini ? DISPLAY_VERSIONS.MINI : displayVersionProp;
    });
  }, [displayVersionProp]);

  /**
   * 💢 toggleMiniView when the prop that reports on width
   *    hits the threshold for mini display.
   */
  useEffect(() => {
    if (sizeEffectOn) {
      if (displayVersionProp === DISPLAY_VERSIONS.MINI) {
        toggleMiniView();
      } else {
        setDisplayVersion(() => displayVersionProp);
      }
    }
  }, [toggleMiniView, sizeEffectOn, displayVersionProp]);

  useEffect(() => {
    if (sizeEffectOn) {
      setSize(() => sizeProp);
    }
  }, [sizeEffectOn, sizeProp]);

  if (DEBUG) {
    //
    console.debug('%c----------------------------------------', 'color:orange');
    console.debug(`%c📋 Projects loaded state summary:`, 'color:orange', {
      width: size.width,
      displayVersion,
      displayVersionProp,
      sizeEffectOn,
    });
  }

  const lookupBy = 'project_id';
  if (!isReady && projects.length === 0) {
    return <Spinner />;
  }
  const renderOverlay = () => <div className='controller-mini-overlay' />;

  return (
    <Box
      className={clsx('controller main projects flex-handle', {
        [displayVersion.toLowerCase()]: true,
      })}
      sx={{
        p: '30px 0',
        overflow: 'hidden',
        position: 'relative',
      }}>
      {minimizeView && renderOverlay()}
      <Box
        className='header'
        sx={{
          m: theme.spacingFn(4),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          whiteSpace: 'nowrap',
        }}>
        {!minimizeView && <h6 className='list heading'>Select a project</h6>}
        {toggleMiniView && (
          <div className='list toggle'>
            <IconButton
              color='inherit'
              onClick={(event) => {
                event.stopPropagation();
                toggleMiniView();
              }}>
              {!minimizeView ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
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
            <SummaryView
              projectId={projectId}
              displayVersion={displayVersion}
              {...restSummaryProps}
            />
          </ListItem>
          /* ---------------------------------------------------------------- */
        ))}
      </List>

      {selectedProject && <NewProjectButton displayVersion={displayVersion} />}
    </Box>
  );
}
ListOfProjects.propTypes = {
  size: PropTypes.shape({ width: PropTypes.number.isRequired }).isRequired,
};
ListOfProjects.defaultProps = {};

/**
 *
 * Component to display fields provided in a summary view of a project
 * This may change and get more sophisticated over time.
 *
 */
function SummaryView({
  isActive,
  displayVersion,
  projectId = '000000',
  name,
  permission,
}) {
  const shortId = projectId.slice(projectId.length - 4);
  return (
    <div
      className={clsx(
        'project-summary-view',
        'nostack',
        'links',
        'space-between align-items-center',
        {
          [displayVersion.toLowerCase()]: true,
          active: isActive,
        },
      )}>
      <NavLink to={linkTo(projectId)} key={`summaryLink|${projectId}`}>
        <div className='name'>{`${name}`}</div>
        <div className='short-id'>
          <span className='label'>short-id:</span>
          {shortId}
        </div>
        <div className='permission'>{permission}</div>
      </NavLink>
      <div className='delete-button right-align'>
        <DeleteButton projectId={projectId} />
      </div>
    </div>
  );
}
SummaryView.propTypes = {
  isActive: PropTypes.bool,
  displayVersion: PropTypes.oneOf(Object.keys(DISPLAY_VERSIONS)).isRequired,
  projectId: PropTypes.string,
  name: PropTypes.string,
  permission: PropTypes.string,
};
SummaryView.defaultProps = {
  isActive: false,
  projectId: '000000',
  name: undefined,
  permission: undefined,
};

function DeleteButton({ projectId }) {
  const navigate = useNavigate();
  const [themeMode] = useThemeMode();
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
        className='Luci-Dialog delete-project'
        themeMode={themeMode}
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

function NewProjectButton({ displayVersion }) {
  const navigate = useNavigate();

  return (
    <div className='new-project center'>
      {displayVersion !== DISPLAY_VERSIONS.MINI && (
        <Button
          variant='contained'
          size='small'
          color='primary'
          onClick={() => {
            navigate('/projects');
          }}>
          New project
        </Button>
      )}
      {displayVersion === DISPLAY_VERSIONS.MINI && (
        <IconButton
          className='new-project button mini'
          variant='contained'
          size='small'
          onClick={() => {
            navigate('/projects');
          }}>
          <AddIcon />
        </IconButton>
      )}
    </div>
  );
}
NewProjectButton.propTypes = {
  displayVersion: PropTypes.oneOf(Object.keys(DISPLAY_VERSIONS)).isRequired,
};
NewProjectButton.defaultProps = {};
export default Projects;
