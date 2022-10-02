import {
  // Assignment,
  Layers,
  Dashboard,
  Chat,
  Person,
  People,
  Folder,
  Event,
  BackupTable,
} from '@mui/icons-material';

import {
  AuthRedirect,
  ComingSoon,
  Documentation,
  ErrorPage,
  SinglePageWithMarkdown,
  LoginPage,
  NotFoundPage,
  RedirectPage,
  UserProfilePage,
} from '../pages';
import { ProjectMeta } from '../pages/ProjectPage';
import NewProjectPage from '../forms/ProjectForm';
import ProjectDetail from '../SubApp';
import Projects from '../Projects';

import { FileDialog, EtlFieldView, Workbench, Matrix } from '../core-app/pages';

import usersMarkdown from '../assets/markdown/users.md';
import gettingStarted from '../assets/markdown/getting-started.md';
import onlineSupport from '../assets/markdown/schedule-online-support.md';

/* eslint-disable no-console */

const DEBUG = false;

export const routesConfig = [
  {
    path: '*',
    element: <NotFoundPage />,
    mainMenu: false,
    displayType: 'SINGLE_PAGE',
  }, // 404
  {
    path: '/',
    element: <RedirectPage />,
    mainMenu: false,
    displayType: 'NONE',
  }, // index
  {
    path: '/login',
    element: <LoginPage />,
    mainMenu: false,
    displayType: 'SINGLE_PAGE',
  },
  {
    path: '/error',
    element: <ErrorPage />,
    mainMenu: false,
    displayType: 'SINGLE_PAGE',
  },
  {
    path: '/authorize',
    element: <AuthRedirect />,
    mainMenu: false,
    displayType: 'NONE',
  },
  {
    path: '/getting-started',
    element: (
      <SinglePageWithMarkdown
        className='getting-started'
        markdownFile={gettingStarted}
      />
    ),
    mainMenu: true,
    displayType: 'DEFAULT',
  },
  {
    path: '/documentation',
    element: <Documentation />,
    mainMenu: true,
    displayType: 'DEFAULT',
  },
  {
    path: '/user-profile',
    element: <UserProfilePage />,
    mainMenu: true,
    displayType: 'DEFAULT',
  },
  {
    path: '/projects', // -> Outlet
    element: <Projects />,
    mainMenu: true,
    displayType: 'DEFAULT',
    children: [
      {
        path: '',
        element: <NewProjectPage />,
      },
      {
        path: 'new-project',
        element: <NewProjectPage />,
      },
      {
        path: ':projectId',
        element: <ProjectDetail />,
        children: [
          {
            path: '',
            element: <ProjectMeta />,
          },
          {
            path: 'meta',
            element: <ProjectMeta />,
          },
          {
            path: 'files',
            element: <FileDialog />,
          },
          {
            path: 'fields',
            element: <EtlFieldView />,
          },
          {
            path: 'workbench',
            element: <Workbench />,
          },
          {
            path: 'matrix',
            element: <Matrix />,
          },
        ],
      },
    ],
  },
  {
    path: '/users',
    element: (
      <SinglePageWithMarkdown className='users' markdownFile={usersMarkdown} />
    ),
    mainMenu: true,
    displayType: 'DEFAULT',
  },
  {
    path: '/online-support',
    element: (
      <SinglePageWithMarkdown
        className='online-support'
        markdownFile={onlineSupport}
      />
    ),
    mainMenu: true,
    displayType: 'DEFAULT',
  },
  {
    path: '/coming-soon',
    element: <ComingSoon />,
    mainMenu: true,
    displayType: 'DEFAULT',
  },
  {
    path: '/chat',
    element: <ComingSoon />,
    mainMenu: true,
    displayType: 'DEFAULT',
  },
  {
    path: '/docs',
    element: <ComingSoon />,
    mainMenu: true,
    displayType: 'DEFAULT',
  },
];

const displayTypeCfg = {
  SINGLE_PAGE: {
    showAppBar: false,
    showSideNav: false,
  },
  DEFAULT: {
    showAppBar: true,
    showSideNav: true,
  },
  NONE: undefined,
};

/**
 * @function
 * @param {string} pathname from location obj
 * @return {Object} display cfg showAppBar showSideNav
 */
export const lookupDisplayTypeCfg = (pathname) => {
  const { displayType } = routesConfig.find(({ path }) => path === pathname);
  if (DEBUG) {
    console.debug('config output', {
      pathname,
      displayType,
      cfg: displayTypeCfg[displayType],
    });
  }
  return displayTypeCfg[displayType];
};
export const mainListItems = [
  {
    icon: <Dashboard />,
    text: 'Getting Started',
    path: '/getting-started',
    type: 'link',
    get disable() {
      return routesConfig.findIndex((entry) => entry.path === this.path) === -1;
    },
  },
  {
    icon: <Person />,
    text: 'User Profile',
    path: '/user-profile',
    type: 'link',
    get disable() {
      return routesConfig.findIndex((entry) => entry.path === this.path) === -1;
    },
  },
  {
    icon: <BackupTable />,
    text: 'Projects',
    path: '/projects',
    type: 'link',
    get disable() {
      return routesConfig.findIndex((entry) => entry.path === this.path) === -1;
    },
  },
  {
    icon: <People />,
    text: 'Collaborators',
    path: '/users',
    type: 'link',
    get disable() {
      return routesConfig.findIndex((entry) => entry.path === this.path) === -1;
    },
  },
  {
    icon: <Chat />,
    text: 'Chat',
    path: '/chat',
    type: 'link',
    get disable() {
      return routesConfig.findIndex((entry) => entry.path === this.path) === -1;
    },
  },
  {
    icon: <Event />,
    text: 'Online support',
    path: '/online-support',
    type: 'link',
    get disable() {
      return routesConfig.findIndex((entry) => entry.path === this.path) === -1;
    },
  },
  {
    icon: <Layers />,
    text: 'Documentation',
    path: '/docs',
    type: 'link',
    get disable() {
      return routesConfig.findIndex((entry) => entry.path === this.path) === -1;
    },
  },
];
