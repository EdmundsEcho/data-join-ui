import React, { useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { useNavigate } from 'react-router-dom';

// Formik-related
import { useFormik } from 'formik';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { LuciInput } from '../components/shared';

// 📖 new project
import { useProjectsApiContext } from '../contexts/ProjectsDataContext';

// Formik-related
import Form from './new-project.config.js';
import { colors } from '../core-app/constants/variables';

//-----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
const COLOR = colors.blue;
//-----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Update or add new project
 *
 * WIP Parent usage:
 *  option 1: formRef.current.submitForm()
 *  option 2: parentSubmit(formik.submitForm)
 *  option 3: useDispatch with action picked-up by middleware ?
 *
 */
const ProjectForm = ({ data: dataFromProp, parentSubmit, formRef }) => {
  const { addNew, update } = useProjectsApiContext();
  const navigate = useNavigate();
  const apiAction = dataFromProp ? 'UPDATE' : 'ADD_NEW';

  const formik = useFormik({
    initialValues: Form.initialValues,
    innerRef: formRef,
    // validationSchema: Form.validationSchema, 🦀 broken
    onSubmit: Form.onSubmit(async (validEntries) => {
      switch (apiAction) {
        case 'UPDATE':
          await update(dataFromProp.project_id, validEntries);
          break;
        case 'ADD_NEW':
          // add, retrieve project_id and redirect
          await addNew(validEntries, ({ project_id: pid }) =>
            navigate(`/projects/${pid}/files`),
          );
          break;
        default:
      }
    }),
  });

  /**
   * 💢 initialize formik with prop data
   */
  useEffect(() => {
    if (typeof dataFromProp !== 'undefined') {
      Object.keys(dataFromProp).forEach((field) => {
        formik.setFieldValue(field, dataFromProp[field]);
      });
    }
  }, [dataFromProp]);

  // -------------------------------------------
  // Optional WIP functionality
  // enable calling submit by the parent
  if (typeof parentSubmitForm === 'function') {
    parentSubmit(formik.submitForm);
  }

  if (DEBUG) {
    console.debug('%c----------------------------------------', COLOR);
    console.debug(`%c📋 ProjectForm loaded state summary:`, COLOR, {
      dataFromProp,
      apiAction,
    });
  }

  return (
    <div className='project-form root'>
      <form onSubmit={formik.handleSubmit}>
        <div className='input-row-group project-name'>
          <LuciInput
            {...Form.propsFromField('name')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            onChange={formik.handleChange}
            value={formik.values.name || ''}
          />
        </div>

        <div className='input-row-group description'>
          <LuciInput
            {...Form.propsFromField('description')}
            multiline
            rows={3}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={formik.touched.description && formik.errors.description}
            onChange={formik.handleChange}
            value={formik.values.description || ''}
          />
        </div>

        {apiAction === 'UPDATE' && (
          <div className='input-row-group description'>
            <Typography>Permissions: {formik.values.permission}</Typography>
          </div>
        )}

        {apiAction === 'ADD_NEW' && (
          <Button
            className='add-new-project button'
            sx={{ pl: 6, pr: 6, mb: 1, height: '36px', mt: '10px' }}
            variant='contained'
            size='small'
            color='primary'
            type={formik.isSubmitting ? 'button' : 'submit'}>
            {formik.isSubmitting ? (
              <span className='spinner' />
            ) : (
              'Create project'
            )}
          </Button>
        )}
        {apiAction === 'UPDATE' && (
          <Button
            className='add-new-project button'
            sx={{ pl: 6, pr: 6, mb: 1, height: '36px', mt: '10px' }}
            variant='contained'
            size='small'
            color='primary'
            type={formik.isSubmitting ? 'button' : 'submit'}>
            {formik.isSubmitting ? <span className='spinner' /> : 'Save'}
          </Button>
        )}
      </form>
    </div>
  );
};

ProjectForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    project_id: PropTypes.string,
    permission: PropTypes.string,
  }),
  parentSubmit: PropTypes.func,
  formRef: PropTypes.shape({
    current: PropTypes.oneOf([PropTypes.func, PropTypes.shape({})]),
  }),
};
ProjectForm.defaultProps = {
  data: undefined,
  parentSubmit: undefined,
  formRef: undefined,
};

export default ProjectForm;
