import { useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { useFormik } from 'formik';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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
    <div className='user-profile form-card root'>
      <Typography variant='h5' component='h2'>
        About me
      </Typography>
      <UserProfileForm data={data} update={update} />
    </div>
  );
};

function UserProfileForm({ data: dataFromProp, update }) {
  const formik = useFormik({
    initialValues: Form.initialValues,
    // validationSchema: Form.validationSchema, 🦀 broken
    onSubmit: Form.onSubmit(update),
  });
  /**
   * 💢 initialize formik with prop data
   */
  useEffect(() => {
    if (dataFromProp) {
      Object.keys(dataFromProp).forEach((field) => {
        formik.setFieldValue(field, dataFromProp[field]);
      });
    }
  }, [dataFromProp]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className='input-row-group'>
        <LuciInput
          {...Form.propsFromField('first_name')}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
          onChange={formik.handleChange}
          value={formik.values.first_name || ''}
        />
        <LuciInput
          {...Form.propsFromField('last_name')}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
          onChange={formik.handleChange}
          value={formik.values.last_name || ''}
        />
      </div>
      <div className='input-row-group'>
        <LuciInput
          {...Form.propsFromField('email')}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          onChange={formik.handleChange}
          value={formik.values.email || ''}
        />
        <LuciInput
          {...Form.propsFromField('username')}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
          onChange={formik.handleChange}
          value={formik.values.username || ''}
        />
      </div>
      <div className='input-row-group'>
        <LuciInput
          {...Form.propsFromField('company')}
          error={formik.touched.company && Boolean(formik.errors.company)}
          helperText={formik.touched.company && formik.errors.company}
          onChange={formik.handleChange}
          value={formik.values.company || ''}
        />
      </div>
      <Button
        className='update-profile button'
        sx={{ width: '75px', mb: 1, height: '36px', mt: '10px' }}
        variant='contained'
        size='small'
        color='primary'
        type={formik.isSubmitting ? 'button' : 'submit'}
      >
        {formik.isSubmitting ? <span className='spinner' /> : 'Save'}
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
