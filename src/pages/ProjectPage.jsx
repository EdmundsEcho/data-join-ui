// import TextareaAutosize from '@mui/base/TextareaAutosize';
import { Box, Divider, Typography } from '@mui/material';

import ProjectForm from '../forms/ProjectForm';

/**
 * Displays the project form
 */
export const ProjectPage = () => {
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

export default ProjectPage;
