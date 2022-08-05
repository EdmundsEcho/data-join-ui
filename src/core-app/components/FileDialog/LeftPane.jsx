// src/components/FileDialog/LeftPane.jsx

/**
 *
 * ⬆ container
 * 📖 files, headerViewErrors, others...
 * ⬇ LeftPane (ListOfFiles) & RightPane (SelectedListOfFiles)
 *
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import SearchBar from './components/SearchBar';
import ListOfFiles from './components/ListOfFiles';
import StorageProviderList from './components/StorageProviderList';

// layout support
// import useDimensions from '../../hooks/use-react-dimensions';

// 📖 data
import {
  getFiles,
  getFilesRequest,
  getFilesViewStatus,
} from '../../ducks/rootSelectors';

// ☎️  Callbacks to update data
import {
  fetchDirectoryStart,
  resetFetchRequest,
} from '../../ducks/actions/fileView.actions';

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
function LeftPane({ selectedFiles, toggleFile }) {
  // 📖 left side data
  // ⚠️  can return null
  const { projectId } = useParams();

  // 📬
  const dispatch = useDispatch();

  // local state to update the view of the files
  // set the filter value for which files to view
  const [fileViewFilter, setFileViewFilter] = useState(() => '');

  // retrieve state from redux; files and request for those files
  const cache = useSelector((state) => getFiles(state), shallowEqual);
  const cachedRequest = useSelector(getFilesRequest);
  const viewStatus = useSelector(getFilesViewStatus);

  // initial state: pull root data
  // pull whatever drives are shared with the project
  useEffect(() => {
    if (typeof cachedRequest === 'undefined') {
      dispatch(
        // request gets stored in redux (later changed incrementally)
        fetchDirectoryStart({
          project_id: projectId,
          token_id: null,
          path_query: null,
          display_name: undefined,
        }),
      );
    }
    // return () => dispatch(resetFetchRequest());
  }, [dispatch, projectId, cachedRequest]);

  const {
    path_query: pathQuery,
    token_id: tokenId,
    display_name: displayName,
  } = cachedRequest || {
    token_id: undefined,
    path_query: undefined,
    display_name: undefined,
  };

  // local filter
  const displayFiles =
    fileViewFilter === ''
      ? cache
      : cache.filter((file) => file.display_name.includes(fileViewFilter));

  // update local state
  const handleNewFileView = (filterText) => {
    setFileViewFilter(filterText);
  };

  // incremental params: 1. none 2. token_id 3. path_query (file_id)
  const handleFetchDirectory = useCallback(
    (newRequest) => {
      setFileViewFilter(''); // reset the local view filter
      dispatch(
        fetchDirectoryStart({
          ...cachedRequest,
          ...newRequest,
        }),
      );
    },
    [dispatch, cachedRequest],
  );

  return typeof pathQuery === 'undefined' ? null : (
    <Card key={`files|leftPane|${pathQuery}`} className='Luci-DirectoryView'>
      <div className='grow-max'>
        <CardActions className='Luci-DirectoryView'>
          <SearchBar
            className='Luci-DirectoryView'
            path={displayName || ''}
            files={displayFiles}
            onChange={handleNewFileView}
            onCancel={() => setFileViewFilter('')}
            value={fileViewFilter}
          />
        </CardActions>
        {/* Current directory */}
        {/* List of files */}
        <CardContent className='Luci-DirectoryView'>
          <ListOfFiles
            className='list-of-files'
            files={displayFiles}
            selected={selectedFiles}
            path={pathQuery || ''}
            fetchDirectory={handleFetchDirectory}
            toggleFile={toggleFile}
            viewStatus={viewStatus}
          />
        </CardContent>
      </div>
      <CardActions className={clsx('Luci-DirectoryView', 'drive-providers')}>
        <StorageProviderList
          className='Drive-Providers'
          projectId={projectId}
        />
      </CardActions>
    </Card>
  );
}
// SplitPane.LeftPane.displayName = 'FileDialog.SplitPane.LeftPane';
LeftPane.propTypes = {
  selectedFiles: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleFile: PropTypes.func.isRequired,
};

export default LeftPane;
