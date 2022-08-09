import * as Yup from 'yup';

/**
 * Function that requires initialization (partial application)
 *
 * props -> field -> react props
 *
 * @function
 * @param {Object} fields
 * @return {Object}
 *
 */
const propsFromField = (props, fields) => (fieldName) => {
  if (!(fieldName in fields)) {
    throw new Error(
      `The requested field does not exist in the fromConfig: ${fieldName}`,
    );
  }
  return Object.entries(fields[fieldName]).reduce((acc, [key, value]) => {
    if (props.includes(key)) {
      acc[key] = value;
    }
    return acc;
  }, {});
};
/**
 * Generic form validation functions
 *
 * fields -> initialValues
 * fields -> validationSchema
 *
 * @function
 * @param {Object} fields
 * @return {Object}
 *
 */
const initialValues = (fields) => {
  return Object.entries(fields).reduce((acc, [name, field]) => {
    acc[name] = field?.placeholder ?? undefined;
    return acc;
  }, {});
};

//
// WIP - extend to include numbers when needed
// depends on field.type is required
//
const validationSchema = (fields) => {
  return Object.entries(fields)
    .filter(([, field]) => ['text', 'email'].includes(field.type))
    .reduce((acc, [name, field]) => {
      const cfg = Yup.string().max(
        field?.max ?? 40,
        `Must be ${field.max} characters or less`,
      );
      if (field?.required ?? false) {
        cfg.required(field.errorMsg);
      }
      if (field.type === 'email') {
        cfg.email(field.invalidMsg);
      }
      acc[name] = cfg;
      return acc;
    }, {});
};

export { validationSchema, initialValues, propsFromField };
