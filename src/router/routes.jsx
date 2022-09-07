import {
  Assignment,
  Layers,
  Dashboard,
  Chat,
  Person,
  BackupTable,
} from '@mui/icons-material';

import {
  UserProfilePage,
  ProjectsPage,
  LoginPage,
  NotFoundPage,
  RedirectPage,
} from '../pages';
import NewProjectPage from '../forms/ProjectForm';
import ProjectDetail from '../SubApp';
import Projects from '../Projects';

import {
  Overview,
  FileDialog,
  EtlFieldView,
  Workbench,
  Matrix,
} from '../core-app/pages';

/*
import Overview from '../components/Overview';
import FileDialog from '../components/FileDialog/container';
import EtlFieldView from '../components/EtlFieldView/index.container';
import Workbench from '../components/Workbench/index';
import HoldingArea from '../components/HoldingArea';
*/

export const routesConfig = [
  {
    path: '*', // nomatch -> 404
    element: <NotFoundPage />,
  },
  {
    path: '/', // index page
    element: <RedirectPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/user-profile',
    element: <UserProfilePage />,
  },
  {
    path: '/projects', // -> Outlet
    element: <Projects />,
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
            element: <Overview />,
          },
          {
            path: 'meta',
            element: <Overview />,
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
  /*
  {
    path: '/introduction',
    Component: Overview,
    showProjectsList: true,
  },
  {
    path: '/campaigns/:campaignId/files',
    Component: FileDialog,
    showProjectsList: true,
    showStepper: true,
  },
  {
    path: '/campaigns/:campaignId/fields',
    Component: EtlFieldView,
    showProjectsList: true,
    showStepper: true,
  },
  {
    path: '/campaigns/:campaignId/workbench',
    Component: Workbench,
    showProjectsList: true,
    showStepper: true,
  },
  {
    path: '/campaigns/:campaignId/pending',
    Component: HoldingArea,
    showProjectsList: true,
    showStepper: true,
  },
*/
];

export const mainListItems = [
  {
    icon: <Dashboard />,
    text: 'Introduction',
    path: '/introduction',
    type: 'link',
  },
  {
    icon: <Person />,
    text: 'User Profile',
    path: '/user-profile',
    type: 'link',
  },
  {
    icon: <BackupTable />,
    text: 'Projects',
    path: '/projects',
    type: 'link',
  },
  {
    icon: <Chat />,
    text: 'Chat',
    path: '/chat',
    type: 'link',
  },
  {
    icon: <Layers />,
    text: 'Documentation',
    path: '/docs',
    type: 'link',
  },
];
