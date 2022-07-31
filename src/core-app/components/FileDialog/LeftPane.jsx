// src/components/FileDialog/LeftPane.jsx

/**
 *
 * ⬆ FileDialog/container
 * 📖 files (redux)
 * ⬇ ListOfFiles
 *
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withSnackbar } from 'notistack';

// import clsx from 'clsx';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import SearchBar from './components/SearchBar';
import ListOfFiles from './components/ListOfFiles';
import StorageProviderList from './components/StorageProviderList';

// import FilesListContext from './FilesListContext';

// 📖 data
import {
  getPath,
  getFiles,
  getParent,
  getIsLoadingFiles,
  getReaddirErrors,
} from '../../ducks/rootSelectors';

// ☎️  Callbacks to update data
import { fetchDirectoryStart } from '../../ducks/actions/fileView.actions';
import { fetchProjectDrives } from '../../services/api';
// import { getStorageProviderFiles } from '../../services/api';

/**
 * Directory view: 📖 files
 *
 * 🦀 Toggle inclusion of a file forces a re-render of the full LHS.
 *    ... a product of pulling all of the file names in a single
 *    useSelection call alongside the selected state.
 *
 * @component
 *
 */
function LeftPane({ enqueueSnackbar, selectedFiles, toggleFile }) {
  const [provider, setProvider] = useState(null);
  const [providers, setProviders] = useState(null);

  // 📖 left side data
  // ⚠️  can return null
  const path = useSelector(getPath) || 'root';

  // ⬜ Get project_id from URL
  const { pathname } = useLocation();
  const regexResult = pathname.slice(1).match(/\/(.*?)\//);
  const projectId = regexResult ? regexResult[1] : null;

  // 📬
  const dispatch = useDispatch();

  // local state to update the view of the files
  // set the filter value for which files to view
  const [fileViewFilter, setFileViewFilter] = useState(() => '');

  const errors = useSelector((state) => getReaddirErrors(state));
  const isLoading = useSelector((state) => getIsLoadingFiles(state));
  const cache = useSelector((state) => getFiles(state), shallowEqual);

  const handleFetchProjectDrives = useCallback(
    async (requestedPath) => {
      setFileViewFilter('');
      const { data } = await fetchProjectDrives(projectId);
      const projectDrives = Array.isArray(data)
        ? data.filter((drive) => drive.project_id === projectId)
        : [];
      setProviders(projectDrives);
    },
    [projectId],
  );

  useEffect(() => {
    handleFetchProjectDrives();
    setProvider(null);
  }, [projectId]);

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((error) =>
        enqueueSnackbar(`Error from ${provider}: ${error}`, {
          variant: 'error',
        }),
      );
    } else if (provider && !isLoading) {
      enqueueSnackbar(`Files loaded succesfully from: ${provider}`, {
        variant: 'success',
      });
    }
  }, [errors, isLoading, provider]);

  const displayFiles =
    fileViewFilter === ''
      ? cache
      : cache.filter((file) => file.display_name.includes(fileViewFilter));

  const parent = useSelector(getParent) || undefined;

  // update local state
  const handleNewFileView = (filterText) => {
    setFileViewFilter(filterText);
  };

  const handleFetchDirectory = useCallback(
    async (requestedPath, providerName = provider) => {
      setFileViewFilter('');
      dispatch(fetchDirectoryStart(requestedPath, providerName, projectId));
    },
    [dispatch, provider, projectId],
  );

  const handleSelectProvider = (providerName) => {
    setProvider(providerName);
    setProviders(null);
    handleFetchDirectory('root', providerName);
  };

  return typeof path === 'undefined' ? null : (
    <Card key={`files|leftPane|${path}`} className='Luci-DirectoryView'>
      <CardActions className='Luci-DirectoryView'>
        <SearchBar
          className='Luci-DirectoryView'
          path={path}
          files={providers || displayFiles}
          onChange={handleNewFileView}
          onCancel={() => setFileViewFilter('')}
          value={fileViewFilter}
        />
      </CardActions>
      {/* Current directory */}
      {/* List of files */}
      <CardContent className='Luci-DirectoryView'>
        <ListOfFiles
          parent={parent}
          className='Luci-DirectoryView'
          files={providers || displayFiles}
          selected={selectedFiles}
          path={path}
          fetchDirectory={handleFetchDirectory}
          fetchProjectDrives={handleFetchProjectDrives}
          selectProvider={handleSelectProvider}
          isFilesView={!providers}
          isLoading={isLoading}
          toggleFile={toggleFile}
          show
        />
      </CardContent>
      <CardActions className='Luci-DirectoryView'>
        <StorageProviderList
          className='Luci-DirectoryView'
          project_id={projectId}
        />
      </CardActions>
    </Card>
  );
}
// SplitPane.LeftPane.displayName = 'FileDialog.SplitPane.LeftPane';
LeftPane.propTypes = {
  selectedFiles: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleFile: PropTypes.func.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired,
};

export default withSnackbar(LeftPane);
