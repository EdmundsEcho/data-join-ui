import { useContext } from 'react';
// import TextareaAutosize from '@mui/base/TextareaAutosize';
import { Box, Button, Divider, Typography } from '@mui/material';

// Formik-related
import { useFormik } from 'formik';

import { LuciInput, WithLabel } from '../components/shared';

import Form from '../forms/user-profile.config.js';

import ProjectsContext from '../contexts/ProjectsContext';

const ProjectForm = () => {
  const { createNewProject } = useContext(ProjectsContext);

  const formik = useFormik({
    initialValues: Form.initialValues,
    // validationSchema: F.validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const validValues = {};
      Object.keys(values).forEach((key) => {
        const value = values[key];
        if (value) validValues[key] = value;
      });

      try {
        const data = {
          project: {},
          ...validValues,
        };
        // alert(JSON.stringify(data, null, 2));
        await createNewProject(data);
      } catch (e) {
        console.log('error', e);
      }

      // await new Promise((r) => setTimeout(r, 500));
      setSubmitting(false);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <WithLabel
        label='Project Name'
        Component={LuciInput}
        componentProps={{
          placeholder: 'eg. Lucivia',
          onChange: formik.handleChange,
          value: formik.values.name || '',
          type: 'text',
          name: 'name',
          id: 'name',
        }}
      />

      <WithLabel
        label='Project Description'
        Component={LuciInput}
        componentProps={{
          placeholder: 'eg. Best project ever',
          onChange: formik.handleChange,
          value: formik.values.description || '',
          type: 'text',
          name: 'description',
          id: 'description',
        }}
      />

      <Button
        sx={{ pl: 6, pr: 6, mb: 1, height: '36px', mt: '10px' }}
        variant='contained'
        size='small'
        color='primary'
        type='submit'>
        Create new project
      </Button>
    </form>
  );
};

export const ProjectsPage = () => {
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
