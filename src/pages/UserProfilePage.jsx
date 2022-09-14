import { useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { useFormik } from 'formik';
import { Box, Button, Typography } from '@mui/material';

import { LuciInput, Spinner } from '../components/shared';
// 📖
import { useFetchApi, STATUS } from '../hooks/use-fetch-api';
import { fetchUserProfile, editUserProfile } from '../services/dashboard.api';
// Formik-related
import Form from '../forms/user-profile.config.js';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------

export const UserProfilePage = () => {
  //

  // fetch
  const { cache: data, status } = useFetchApi({
    asyncFn: fetchUserProfile,
    caller: 'UserProfilePage: fetch',
    equalityFnName: 'similarObjects',
    immediate: true,
    useSignal: true,
    DEBUG,
  });

  const showData = status === STATUS.RESOLVED;

  // update
  const { execute: update } = useFetchApi({
    asyncFn: editUserProfile,
    caller: 'UserProfilePage: update',
    immediate: false,
    useSignal: false,
    DEBUG,
  });

  if (!showData && !data) {
    return <Spinner />;
  }

  return (
    <Box sx={{ m: '30px' }}>
      <Typography variant='h5' component='h2'>
        About me
      </Typography>
      Requested information
      <UserProfileForm data={data} update={update} />
    </Box>
  );
};

function UserProfileForm({ data, update }) {
  const formik = useFormik({
    initialValues: Form.initialValues,
    // validationSchema: Form.validationSchema, 🦀 broken
    onSubmit: async (values, { setSubmitting }) => {
      const validEntries = Object.entries(values).reduce(
        (acc, [key, entry]) => {
          if (entry) {
            acc[key] = entry;
          }
          return acc;
        },
        {},
      );
      await update(validEntries);
      setSubmitting(false);
    },
  });
  /**
   * 💢 initialize formik with prop data
   */
  useEffect(() => {
    Object.keys(data).forEach((field) => {
      formik.setFieldValue(field, data[field]);
    });
  }, []);

  const { touched, values, isSubmitting, errors, handleSubmit, handleChange } =
    formik;

  return (
    <form onSubmit={handleSubmit}>
      <Box className='input-row-group'>
        <LuciInput
          {...Form.propsFromField('first_name')}
          error={touched.lastName && Boolean(errors.lastName)}
          helperText={touched.lastName && errors.lastName}
          type='text'
          id='first_name'
          name='first_name'
          onChange={handleChange}
          value={values.first_name || ''}
        />
        <LuciInput
          {...Form.propsFromField('last_name')}
          error={touched.lastName && Boolean(errors.lastName)}
          helperText={touched.lastName && errors.lastName}
          type='text'
          id='last_name'
          name='last_name'
          onChange={handleChange}
          value={values.last_name || ''}
        />
      </Box>
      <Box className='input-row-group'>
        <LuciInput
          {...Form.propsFromField('email')}
          error={touched.email && Boolean(errors.email)}
          helperText={touched.email && errors.email}
          type='email'
          id='email'
          name='email'
          onChange={handleChange}
          value={values.email || ''}
        />
        <LuciInput
          {...Form.propsFromField('username')}
          error={touched.username && Boolean(errors.username)}
          helperText={touched.username && errors.username}
          type='text'
          id='username'
          name='username'
          onChange={handleChange}
          value={values.username || ''}
        />
      </Box>
      <Box className='input-row-group'>
        <LuciInput
          {...Form.propsFromField('company')}
          error={touched.company && Boolean(errors.company)}
          helperText={touched.company && errors.company}
          type='text'
          id='company'
          name='company'
          onChange={handleChange}
          value={values.company || ''}
        />
      </Box>
      <Button
        variant='contained'
        size='small'
        color='primary'
        sx={{ width: '75px', mb: 1, height: '36px', mt: '10px' }}
        type={isSubmitting ? 'button' : 'submit'}>
        {isSubmitting ? <span className='spinner' /> : 'Save'}
      </Button>
    </form>
  );
}

// use formik config
const fieldPropTypes = [
  'email',
  'first_name',
  'last_name',
  'username',
  'telephone',
  'company',
].reduce((acc, name) => {
  acc[name] = PropTypes.string;
  return acc;
}, {});

UserProfileForm.propTypes = {
  data: PropTypes.shape(fieldPropTypes).isRequired,
  update: PropTypes.func.isRequired,
};

export default UserProfilePage;
