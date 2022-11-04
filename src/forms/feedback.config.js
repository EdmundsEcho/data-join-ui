import {
  onSubmit,
  initialValues,
  propsFromField,
  validationSchema,
} from './formik-helpers';

/**
 * Feedback form
 * Exports the props required to configure Formik
 *
 * Not utilized for now (using manual single field validation)
 *
 */

const propList = ['id', 'name', 'label', 'placeholder', 'type'];

//
// ⚙️  feedback
//
const config = {
  formId: 'feedback-form',
  fields: {
    name: {
      id: 'feedback',
      name: 'feedback',
      label: 'name',
      type: 'textarea',
      min: '10',
      max: '550',
      placeholder: 'Tell us your thoughts',
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
