/**
 *
 * Likely DEPRECATE
 *
 */
import React, { useMemo, createContext } from 'react';

import { withSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import { readDirectory as fetchFn } from '../../services/api';
import { useFetchApi } from '../../../hooks/use-fetch-api';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Relevant when we want to "configure" the context externally.
 */
export const Context = createContext({
  isFetching: false,
  filesList: [],
  fetchFiles: () => {},
});
Context.displayName = 'FilesList-Context';

const Provider = (props) => {
  const navigate = useNavigate();
  //
  const { enqueueSnackbar, children } = props;

  /**
   * fetch data
   * callback: set the initial value of the cache
   */
  const {
    fetch: fetchApi,
    status,
    STATUS,
    error,
    cache: data,
  } = useFetchApi({
    fetchFn,
    enqueueSnackbar,
    DEBUG,
  });

  // 💢 -> sets useFetchApi cache
  const fetch = () => {
    try {
      fetchApi();
    } catch (e) {
      if (e.status === 401) {
        console.dir(e);
        navigate('/login');
      } else {
        console.error(`🦀 what is this error; how treat? (display on page)`);
        navigate('/login');
        throw e;
      }
    }
    // finally { }
  };

  // exposed interface
  const state = useMemo(
    () => ({
      data,
      error,
      status,
      STATUS,
      fetch,
    }),
    [status, error, data], // eslint-disable-line
  );

  if (DEBUG) {
    console.debug(
      `📥 FilesList context is running: ${status || 'unknown status'} with ${
        data?.length ?? 'unknown number of'
      } items.`,
    );
  }
  return <Context.Provider value={state}>{children}</Context.Provider>;
};

Provider.displayName = 'FilesList-Provider';

Provider.propTypes = {
  enqueueSnackbar: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

Provider.defaultProps = {};

export default withSnackbar(Provider);
