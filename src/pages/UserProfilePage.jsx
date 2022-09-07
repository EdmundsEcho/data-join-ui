import { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useSnackbar, withSnackbar } from 'notistack';
import { useFormik } from 'formik';
import { Box, Button, Typography } from '@mui/material';
import { LuciInput } from '../components/shared';
import { fetchUserProfile, editUserProfile } from '../services/dashboard.api';

// Formik-related
import Form from '../forms/user-profile.config.js';

const UserForm = ({ userData }) => {
  const formik = useFormik({
    initialValues: Form.initialValues,
    // validationSchema: Form.validationSchema, 🦀 broken
    onSubmit: async (values, { setSubmitting }) => {
      const validValues = {};
      Object.keys(values).forEach((key) => {
        const value = values[key];
        if (value) validValues[key] = value;
      });
      await editUserProfile(validValues);
      // await new Promise((r) => setTimeout(r, 500));
      setSubmitting(false);
    },
  });

  const setInitialValues = () => {
    const fields = Object.keys(userData);
    fields.forEach((field) => {
      formik.setFieldValue(field, userData[field]);
    });
  };

  useEffect(() => {
    if (userData) setInitialValues();
  }, [userData]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box className='input-row-group'>
        <LuciInput
          {...Form.propsFromField('first_name')}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
          type='text'
          id='first_name'
          name='first_name'
          onChange={formik.handleChange}
          value={formik.values.first_name || ''}
        />
        <LuciInput
          {...Form.propsFromField('last_name')}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
          type='text'
          id='last_name'
          name='last_name'
          onChange={formik.handleChange}
          value={formik.values.last_name || ''}
        />
      </Box>
      <Box className='input-row-group'>
        <LuciInput
          {...Form.propsFromField('email')}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          type='email'
          id='email'
          name='email'
          onChange={formik.handleChange}
          value={formik.values.email || ''}
        />
        <LuciInput
          {...Form.propsFromField('username')}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
          type='text'
          id='username'
          name='username'
          onChange={formik.handleChange}
          value={formik.values.username || ''}
        />
      </Box>
      <Box className='input-row-group'>
        <LuciInput
          {...Form.propsFromField('company')}
          error={formik.touched.company && Boolean(formik.errors.company)}
          helperText={formik.touched.company && formik.errors.company}
          type='text'
          id='company'
          name='company'
          onChange={formik.handleChange}
          value={formik.values.company || ''}
        />
      </Box>
      <Button
        variant='contained'
        size='small'
        color='primary'
        sx={{ width: '75px', mb: 1, height: '36px', mt: '10px' }}
        type={formik.isSubmitting ? 'button' : 'submit'}>
        {formik.isSubmitting ? <span className='spinner' /> : 'Save'}
      </Button>
    </form>
  );
};

UserForm.propTypes = {
  userData: PropTypes.shape({}).isRequired,
};

const UserProfile = () => {
  const [isPageReady, setIsPageReady] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fetchUser = async () => {
    try {
      const response = await fetchUserProfile();
      console.log('fetchUser', { response });
      const { error, status } = response?.data;

      if (!error && status !== 'Error' && response?.status === 200) {
        const { data } = response;
        setUserData(data[0]);
        setIsPageReady(true);
      } else {
        navigate('/login');
        enqueueSnackbar(`Error: ${error || response?.data?.message}`, {
          variant: 'error',
        });
      }
    } catch (e) {
      // false && error
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (!isPageReady) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
        }}>
        <span className='spinner spinner-lucivia spinner-lg' />
      </Box>
    );
  }

  return (
    <Box sx={{ m: '30px' }}>
      <Typography variant='h5' component='h2'>
        About me
      </Typography>
      Mandatory information
      <UserForm userData={userData} />
    </Box>
  );
};

export const UserProfilePage = withSnackbar(UserProfile);
