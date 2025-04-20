import {
  onSubmit,
  initialValues,
  propsFromField,
  validationSchema,
} from './formik-helpers';

/**
 * New project form
 * Exports the props required to configure Formik
 *
 */

const propList = ['id', 'name', 'label', 'placeholder', 'type'];

/*
          error={formik.touched.company && Boolean(formik.errors.company)}
          helperText={formik.touched.company && formik.errors.company}
          type='text'
          id='company'
          name='company'
          onChange={formik.handleChange}
          value={formik.values.company || ''}
*/
//
// ⚙️  user-profile-related fields keyed by name
//
const config = {
  formId: 'new-project-form',
  fields: {
    name: {
      id: 'name',
      name: 'name',
      label: 'name',
      type: 'text',
      min: '2',
      max: '20',
      placeholder: '',
      required: true,
    },
    description: {
      id: 'description',
      name: 'description',
      label: 'project description',
      type: 'text',
      max: '200',
      placeholder: '',
      required: false,
    },
    withTestData: {
      id: 'withTestData',
      name: 'withTestData',
      label: 'include test data',
      type: 'checkbox',
      placeholder: false,
      required: false,
    },
  },
};

// Formik props
const configApi = {
  config,
  initialValues: initialValues(config.fields),
  validationSchema: validationSchema(config.fields),
  propsFromField: propsFromField(propList, config.fields),
  onSubmit,
};

export default configApi;
