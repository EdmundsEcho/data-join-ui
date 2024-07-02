import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import { clearErrors } from '../ducks/actions/ui.actions';

const AppSnackbar = () => {
  const dispatch = useDispatch();
  const errors = useSelector((state) => state.ui.errors);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (errors && errors.length > 0) {
      errors.forEach((error) => {
        enqueueSnackbar(error?.message ?? 'Error with missing message.', {
          variant: 'warning',
        });
      });
      dispatch(clearErrors());
    }
  }, [errors, enqueueSnackbar, dispatch]);

  return null;
};

export default AppSnackbar;

// END
