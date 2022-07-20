import {
  initialValues,
  propsFromField,
  validationSchema,
} from './formik-helpers'

/**
 * User form
 * Exports the props required to configure Formik
 *
 */

const propList = ['id', 'name', 'label', 'placeholder']

//
// ⚙️  user-profile-related fields
//
// 🔖 the fields key = name
//
// 🚧 Low priority: have the postgres generate this
//    configuration.
//
//
export const formConfig = {
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
}

// Formik props
const defaultExport = {
  initialValues: initialValues(formConfig.fields),
  validationSchema: validationSchema(formConfig.fields),
  propsFromField: propsFromField(propList, formConfig.fields),
}

export default defaultExport
