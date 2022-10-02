import {
  onSubmit,
  initialValues,
  propsFromField,
  validationSchema,
} from './formik-helpers';

/**
 * User form
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
  formId: 'new-user-form',
  fields: {
    first_name: {
      id: 'first_name',
      name: 'first_name',
      label: 'first name',
      type: 'text',
      max: '20',
      placeholder: '',
      required: false,
    },
    last_name: {
      id: 'last_name',
      name: 'last_name',
      label: 'last name',
      type: 'text',
      max: '20',
      placeholder: '',
      required: false,
    },
    company: {
      id: 'company',
      name: 'company',
      label: 'company',
      type: 'text',
      max: '30',
      placeholder: '',
      required: false,
    },
    email: {
      id: 'email',
      name: 'email',
      label: 'email address',
      type: 'email',
      max: '100',
      placeholder: '',
      errorMsg: 'Email address is required.',
      invalidMsg: 'Your email address is invalid',
      required: true,
    },
    username: {
      id: 'username',
      name: 'username',
      label: 'username',
      type: 'text',
      max: '40',
      placeholder: '',
      errorMsg: 'Please select a username',
      required: true,
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
