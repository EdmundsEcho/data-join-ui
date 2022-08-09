// src/components/FileDialog/LeftPane.jsx

/**
 *
 * ⬆ container
 * 📖 files, headerViewErrors, others...
 * ⬇ LeftPane (ListOfFiles) & RightPane (SelectedListOfFiles)
 *
 */
import React, { useMemo, useCallback, useEffect, useState } from 'react';
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
  getFilesViewStatus,
  hasRequestHistory,
  isActivated,
  peekParentRequestHistory,
  peekRequestHistory,
} from '../../ducks/rootSelectors';

// ☎️  Callbacks to update data
import {
  fetchDirectoryStart,
  pushFetchHistory,
  popFetchHistory,
  STATUS,
} from '../../ducks/actions/fileView.actions';

// ----------------------------------------------------------------------------
const DEBUG = false;
// ----------------------------------------------------------------------------
/* eslint-disable no-console */

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
function LeftPane({ projectId, toggleFile }) {
  //
  const dispatch = useDispatch(); // 📬

  // local state to update the view of the files
  // set the filter value for which files to view
  const [fileViewFilter, setFileViewFilter] = useState(() => '');

  // retrieve state from redux
  const cache = useSelector((state) => getFiles(state), shallowEqual);
  const hasHistory = useSelector(hasRequestHistory);
  const isInitialized = useSelector(isActivated);
  const fetchStatus = useSelector(getFilesViewStatus);

  //
  // 🟢 Initializing effect
  // 🗄️ Project drives = default fetch
  //
  const parentRequest = useSelector((state) =>
    peekParentRequestHistory(state, null),
  );

  // child or "next" fetch
  const previousRequest = useSelector((state) =>
    peekRequestHistory(state, {
      project_id: projectId,
      token_id: undefined,
      path_query: undefined,
      display_name: undefined,
    }),
  );
  const initialFetch = useMemo(
    () => ({
      ...previousRequest,
      token_id: null,
      path_query: null,
      display_name: 'Data sources',
    }),
    [previousRequest],
  );

  //
  // 💢 initializing effect
  //
  // called when not yet initialized; once initialized, the
  // subsequent calls to fetch are user-driven.
  useEffect(() => {
    if (!isInitialized)
      switch (true) {
        case !hasHistory: {
          dispatch(fetchDirectoryStart(initialFetch));
          dispatch(pushFetchHistory(initialFetch));
          break;
        }
        case hasHistory:
          dispatch(fetchDirectoryStart(previousRequest));
          break;
        default:
      }
  }, [
    previousRequest,
    dispatch,
    hasHistory,
    initialFetch,
    isInitialized,
    projectId,
  ]);

  // the decontructed result used to render the state of the component
  const { path_query: pathQuery, display_name: displayName } = hasHistory
    ? previousRequest
    : initialFetch;

  // ---------------------------------------------------------------------------
  // User-driven fetch request
  // child directory
  const handleFetchDirectory = useCallback(
    (newRequest_) => {
      setFileViewFilter(''); // reset the local view filter
      // build the new request in part using cached value
      const newRequest = {
        ...previousRequest,
        ...newRequest_,
      };
      dispatch(fetchDirectoryStart(newRequest));
      dispatch(pushFetchHistory(newRequest));
    },
    [dispatch, previousRequest],
  );
  // parent directory
  const handleFetchParentDirectory = useCallback(() => {
    setFileViewFilter(''); // reset the local view filter
    dispatch(fetchDirectoryStart(parentRequest));
    dispatch(popFetchHistory());
  }, [dispatch, parentRequest]);

  // ---------------------------------------------------------------------------
  // local filtered view of files
  const displayFiles =
    fileViewFilter === ''
      ? cache
      : cache.filter((file) => file.display_name.includes(fileViewFilter));

  // update local state
  const handleNewFileView = (filterText) => {
    setFileViewFilter(filterText);
  };
  // ---------------------------------------------------------------------------
  if (DEBUG) {
    console.debug(`%c📋 LeftPane state summary:`, 'color:cyan');
    console.dir({
      projectInUrl: projectId,
      fetchStatus,
      initialized: isInitialized,
      hasHistory,
      previousRequest,
      parentRequest,
    });

    const color = fetchStatus === STATUS.resolved ? 'color:green' : 'color:red';
    console.debug(
      `%cfetchStatus resolved?: ${fetchStatus === STATUS.resolved}`,
      color,
    );
  }

  // there is always something that will eventually be returned
  switch (fetchStatus) {
    case STATUS.inactive:
      return null;

    case STATUS.pending:
      return (
        <div
          sx={{
            mt: '40px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            margin: '0 auto',
          }}>
          <i className='spinner spinner-lucivia spinner-lg' />
        </div>
      );
    case STATUS.resolved:
      return (
        <Card
          key={`files|leftPane|${pathQuery}`}
          className='Luci-DirectoryView'>
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
            {/* List of files */}
            <CardContent className='Luci-DirectoryView'>
              <ListOfFiles
                className='list-of-files'
                files={displayFiles}
                path={pathQuery || ''}
                fetchDirectory={handleFetchDirectory}
                fetchParentPath={
                  parentRequest ? handleFetchParentDirectory : null
                }
                toggleFile={toggleFile}
                viewStatus={fetchStatus}
              />
            </CardContent>
          </div>
          {/* Data drive providers */}
          <CardActions
            className={clsx('Luci-DirectoryView', 'drive-providers')}>
            <StorageProviderList
              className='Drive-Providers'
              projectId={projectId}
            />
          </CardActions>
        </Card>
      );
    default:
      return <div>Unreachable</div>;
  }
}
// SplitPane.LeftPane.displayName = 'FileDialog.SplitPane.LeftPane';
LeftPane.propTypes = {
  projectId: PropTypes.string.isRequired,
  toggleFile: PropTypes.func.isRequired,
};

export default LeftPane;
