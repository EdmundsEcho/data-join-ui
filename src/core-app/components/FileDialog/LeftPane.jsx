// src/components/FileDialog/LeftPane.jsx

/**
 *
 * ⬆ container
 * 📖 files, headerViewErrors, others...
 * ⬇ LeftPane (ListOfFiles) & RightPane (HeaderViews ~ list of selected files)
 *
 */
import React, {
  useRef,
  useMemo,
  useCallback,
  useEffect,
  useState,
} from 'react';
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
  peekParentRequestHistory,
  peekRequestHistory,
} from '../../ducks/rootSelectors';

// ☎️  Callbacks to update data
import {
  fetchDirectoryStart,
  pushFetchHistory,
  popFetchHistory,
  clearFetchHistory,
  setDirStatus,
  STATUS,
} from '../../ducks/actions/fileView.actions';

//------------------------------------------------------------------------------
const DRIVE_AUTH_URL = process.env.REACT_APP_DRIVE_AUTH_URL;
// e.g., http://localhost:3099/drive
const makeAuthUrl = (projectId, provider) =>
  `${DRIVE_AUTH_URL}/${provider}/${projectId}`;
//------------------------------------------------------------------------------

// ----------------------------------------------------------------------------
const DEBUG = true;
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
  const fetchStatus = useSelector(getFilesViewStatus);
  // latch to have useEffect operate once when rendered twice by react
  // OPEN -> CLOSED after the first render
  const latchState = useRef('OPEN');

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
  // called when not yet initialized; subsequent data requests are user-driven.
  //
  // initial state = [] -> post fetch state
  //
  useEffect(() => {
    if (latchState.current === 'OPEN') {
      latchState.current = 'CLOSED';

      if (fetchStatus === STATUS.idle) {
        // fetchDirectoryStart changes the fetchStatus
        switch (true) {
          case !hasHistory: {
            console.log(`HEADER_ fire with no history`);
            dispatch(fetchDirectoryStart(initialFetch));
            dispatch(pushFetchHistory(initialFetch));
            break;
          }
          case hasHistory:
            console.log(`HEADER_ fire using history`);
            dispatch(fetchDirectoryStart(previousRequest));
            break;
          default:
        }
      } // else: user-driven requests for data
    }
  }, []);

  // the deconstructed result used to render the state of the component
  const { path_query: pathQuery, display_name: displayName } = hasHistory
    ? previousRequest
    : initialFetch;

  // ---------------------------------------------------------------------------
  // User-driven fetch request
  // child directory
  const handleFetchDirectory = useCallback(
    (newRequest_) => {
      if (fetchStatus !== STATUS.pending) {
        setFileViewFilter(''); // reset the local view filter
        // build the new request in part using cached value
        const newRequest = {
          ...previousRequest,
          ...newRequest_,
        };
        dispatch(pushFetchHistory(newRequest));
        dispatch(fetchDirectoryStart(newRequest));
      }
    },
    [dispatch, previousRequest, fetchStatus],
  );
  // parent directory
  const handleFetchParentDirectory = useCallback(() => {
    if (fetchStatus !== STATUS.pending) {
      setFileViewFilter(''); // reset the local view filter
      dispatch(fetchDirectoryStart(parentRequest));
      dispatch(popFetchHistory());
    }
  }, [dispatch, parentRequest, fetchStatus]);

  // ---------------------------------------------------------------------------
  // local filtered view of files
  const displayFiles =
    fileViewFilter === ''
      ? cache
      : cache.filter((file) => file.display_name.includes(fileViewFilter));

  // ---------------------------------------------------------------------------
  // 🗄️ auth
  const handleDriveAuth = useCallback(
    (provider) => {
      console.debug(`__ handleDriveAuth: ${provider}`);
      dispatch(setDirStatus(STATUS.idle)); // re-run the initial fetch when done
      dispatch(clearFetchHistory()); // display root when user-agent returns
      latchState.current = 'OPEN';
      window.location.replace(makeAuthUrl(projectId, provider));
    },
    [dispatch, projectId],
  );
  // ---------------------------------------------------------------------------
  if (DEBUG) {
    console.debug(`%c📋 LeftPane state summary:`, 'color:cyan');
    console.dir({
      projectIdParam: projectId,
      latchState: latchState.current,
      fetchStatus,
      hasHistory,
      previousRequest,
      parentRequest,
    });
  }

  // must render even when initial state:  idle + no history
  return (
    <Card className='Luci-DirectoryView'>
      <div className='grow-max'>
        <CardActions className='Luci-DirectoryView'>
          {/* ✅ does *not* depend on presence of data */}
          <SearchBar
            className='Luci-DirectoryView'
            path={displayName || ''}
            files={displayFiles || []}
            onChange={setFileViewFilter}
            onCancel={() => setFileViewFilter('')}
            value={fileViewFilter}
          />
        </CardActions>
        {/* ✅ does *not* depend on presence of data */}
        {/* 🔖  ListOfFiles uses fetchStatus (also, file or drives) */}
        <CardContent className='Luci-DirectoryView'>
          <ListOfFiles
            className='list-of-files'
            files={displayFiles || []}
            path={pathQuery || ''}
            fetchDirectory={handleFetchDirectory}
            fetchParentPath={parentRequest ? handleFetchParentDirectory : null}
            toggleFile={toggleFile}
            viewStatus={fetchStatus}
          />
        </CardContent>
      </div>
      {/* Data drive providers */}
      {/* ✅ does *not* depend on presence of data */}
      <CardActions className={clsx('Luci-DirectoryView', 'drive-providers')}>
        <StorageProviderList
          className='Drive-Providers'
          authFn={handleDriveAuth}
        />
      </CardActions>
    </Card>
  );
}
// SplitPane.LeftPane.displayName = 'FileDialog.SplitPane.LeftPane';
LeftPane.propTypes = {
  projectId: PropTypes.string.isRequired,
  toggleFile: PropTypes.func.isRequired,
};

export default LeftPane;
