import { useParams } from 'react-router-dom';
import { Box, Divider, Typography } from '@mui/material';

import ProjectForm from '../forms/ProjectForm';
import { useProjectsSelectorContext } from '../contexts/ProjectsDataContext';

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

const ProjectMeta = () => {
  const { projectId } = useParams();
  const { select } = useProjectsSelectorContext();
  const projectMeta = select(projectId);

  return (
    <Box sx={{ m: '30px' }}>
      <Typography variant='h5' component='h5'>
        Project Meta
      </Typography>
      <Divider sx={{ m: 2, mt: 4, mb: 4 }} />
      <ProjectForm data={projectMeta} />
    </Box>
  );
};

export { ProjectMeta, NewProjectPage };
export default NewProjectPage;
