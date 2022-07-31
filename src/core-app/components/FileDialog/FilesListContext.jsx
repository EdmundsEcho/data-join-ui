import React, { useCallback, createContext, useState } from 'react';

import { withSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  getStorageProviderFiles,
} from '../../services/api';

export const FilesListContext = createContext({
  isFetching: false,
  filesList: [],
  fetchFiles: () => {},
});

/**
 * Context provider that shares the user-driven state changes in the tools
 */
const Provider = (props) => {
const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(false);
  const [filesList, setFilesList] = useState([]);
//
  const { enqueueSnackbar, children } = props;

  const fetchFiles = async () => {
    try {
      setIsFetching(true);
      const response = await getStorageProviderFiles();
      const { error, status } = response?.data;
      if (!error && status !== 'Error' && response?.status === 200 ) {
        setFilesList(response.data);
      } else {
        navigate('/login');
        enqueueSnackbar(`Error: ${error || response?.data?.message}`, {
          variant: 'error',
        });
      }
      console.log('fetchFiles', { response });
    } catch (e) {
      console.log('error fetchProjects', e);
    }
    setIsFetching(false);
  };

  const state = {
    isFetching,
    filesList,
    fetchFiles,
  };

  return (
    <FilesListContext.Provider value={state}>
      {children}
    </FilesListContext.Provider>
  );
};

Provider.propTypes = {
  isFetching: PropTypes.bool,
  filesList: PropTypes.array,
  fetchFiles: PropTypes.func,
};

// isRequired instead?
Provider.defaultProps = {
  isFetching: false,
  filesList: [],
  fetchFiles: () => {},
};
export default withSnackbar(Provider);
