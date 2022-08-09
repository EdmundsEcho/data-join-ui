import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Formik-related
import { useFormik } from 'formik';
import { Button } from '@mui/material';

import LuciInput from '../components/shared/LuciInput';
import WithLabel from '../components/shared/WithLabel';

// 📖 new project
import { Context as ProjectsContext } from '../contexts/ProjectsContext';
import { ApiCallError } from '../core-app/lib/LuciErrors';

//
// @KM: @TODO: make new config later
// import F, {formConfig} from '../forms/user-profile.config.js'
//
import F from './user-profile.config.js';

//
// ✅ requires ProjectContext
//
// ⬜ Programatic navigation: Once add new, navigate to the new project
//    ... this requires that we wait for the backend to provide us a new
//    project_id.
//
const ProjectForm = () => {
  const { add: addNewProject } = useContext(ProjectsContext);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: F.initialValues,
    // validationSchema: F.validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const validValues = {};
      Object.keys(values).forEach((key) => {
        const value = values[key];
        if (value) validValues[key] = value;
      });

      try {
        const data = {
          ...validValues,
        };
        //
        // add and redirect
        //
        await addNewProject(data, ({ project_id: pid }) =>
          navigate(`/projects/${pid}/files`),
        );
      } catch (e) {
        alert(JSON.stringify(e, null, 2));
        console.error('error', e);
        throw new ApiCallError(e);
      }

      // await new Promise((r) => setTimeout(r, 500));
      setSubmitting(false);
    },
  });

  return (
    <div className='box'>
      <form onSubmit={formik.handleSubmit}>
        <WithLabel label='Project Name'>
          <LuciInput
            placeholder='e.g., Analyse this'
            onChange={formik.handleChange}
            value={formik.values.name || ''}
            type='text'
            name='name'
            id='name'
          />
        </WithLabel>

        <WithLabel
          label='Project Description'
          // description='This is how others will learn about the project, so make it good!'
        >
          <LuciInput
            placeholder='e.g., Best project ever!'
            onChange={formik.handleChange}
            value={formik.values.description || ''}
            type='text'
            name='description'
            id='description'
          />
        </WithLabel>

        <Button
          sx={{ pl: 6, pr: 6, mb: 1, height: '36px', mt: '10px' }}
          variant='contained'
          size='small'
          color='primary'
          type='submit'>
          Create new project
        </Button>
      </form>
    </div>
  );
};

export default ProjectForm;
