import clsx from 'clsx';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';

import FolderIcon from '@mui/icons-material/Folder';
// import DownloadIcon from '@mui/icons-material/Download';

import ProjectForm from '../forms/ProjectForm';
import { useProjectsSelectorContext } from '../contexts/ProjectsDataContext';

import {
  isHostedMatrixStale,
  isHostedWarehouseStale,
} from '../core-app/ducks/rootSelectors';

// -----------------------------------------------------------------------------
// Dowloading link-related
const META_ARTIFACT_ENDPOINT = process.env.REACT_APP_META_ARTIFACT_ENDPOINT;
const hitThis = (projectId, filename) =>
  META_ARTIFACT_ENDPOINT.replace('{projectId}', projectId).replace(
    '{filename}',
    filename,
  );
// -----------------------------------------------------------------------------

const NewProjectPage = () => {
  return (
    <Box sx={{ m: '30px' }}>
      <Typography variant='h5' component='h6'>
        New Project
      </Typography>
      Create new project form
      <Divider sx={{ m: 2, mt: 4, mb: 4 }} />
      <ProjectForm />
    </Box>
  );
};

// figure out when to display the files
// *.feather
// warehouse.sqlite
// matrix.csv
// matrix.feather
const mkArtifacts = (projectId) => [
  // {
  //   name: 'warehouse.sqlite',
  //   description: 'Project warehouse that hosts the full set of subjects, qualities and measurements',
  //   endpoint: hitThis(projectId, 'warehouse.sqlite'),
  //   isReady: (appStatus) => appStatus.isWarehouseReady,
  // },
  {
    name: 'matrix.csv',
    description:
      'Hosts the requested data and computed derived fields for a selected subject universe',
    endpoint: hitThis(projectId, 'matrix.csv'),
    isReady: (appStatus) => appStatus.isMatrixReady,
  },
  {
    name: 'matrix.feather',
    description:
      'Hosts the requested data and computed derived fields in the python dataframe format',
    endpoint: hitThis(projectId, 'matrix.feather'),
    isReady: (appStatus) => appStatus.isMatrixReady,
  },
];

const ProjectMeta = () => {
  const { projectId } = useParams();
  const { select } = useProjectsSelectorContext();
  const projectMeta = select(projectId);
  const isMatrixReady = !useSelector(isHostedMatrixStale);
  const isWarehouseReady = !useSelector(isHostedWarehouseStale);

  const appStatus = { isMatrixReady, isWarehouseReady };

  // figure out when to display the files
  const artifacts = mkArtifacts(projectId);
  return (
    <div className='project-page root'>
      <h5>Project Meta</h5>
      <Divider sx={{ m: 2, mt: 4, mb: 4 }} />
      <ProjectForm data={projectMeta} />
      <Divider sx={{ m: 2, mt: 4, mb: 8 }} />
      <h5>Artifacts</h5>
      <div>Downloadable files</div>
      <List className='project-artifacts root'>
        {artifacts.map(({ name, description, endpoint, isReady }) => {
          // console.debug(endpoint);
          return (
            <div
              key={name}
              className={clsx('project-artifact root', {
                disabled: !isReady(appStatus),
              })}
            >
              <a className='link' href={endpoint} download>
                <ListItem className='project-artifact item'>
                  <ListItemAvatar className='artifact avatar'>
                    <Avatar>
                      <FolderIcon className='icon' />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    className='artifact text'
                    primary={name}
                    secondary={description}
                  />
                </ListItem>
              </a>
            </div>
          );
        })}
      </List>
    </div>
  );
};

export { ProjectMeta, NewProjectPage };
export default NewProjectPage;
