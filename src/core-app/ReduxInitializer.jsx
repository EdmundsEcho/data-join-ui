// src/core-app/ReduxInitializer.jsx

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { clearRedirect } from './ducks/actions/ui.actions';

//------------------------------------------------------------------------------
// const DEBUG = false && process.env.REACT_APP_ENV === 'development';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * @component
 *
 * The first component with access to the redux context.
 * WIP - maybe use to run initializing actions?
 * WIP - help with redirects
 *
 */
const ReduxInitializer = ({ persistor, children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const redirect = useSelector((state) => state.ui?.redirect);

  useEffect(() => {
    if (typeof redirect !== 'undefined') {
      navigate(redirect);
      dispatch(clearRedirect);
    }
  }, [dispatch, redirect, navigate]);

  return children;
};

export default ReduxInitializer;
