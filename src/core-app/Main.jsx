import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Outlet } from 'react-router-dom';
import clsx from 'clsx';

import Container from '@mui/material/Container';
import { LicenseInfo } from '@mui/x-data-grid-pro';

// core-app related
import SubApp from '../SubApp'; // with Provider
import ErrorBoundary from './components/shared/ErrorBoundary';
import ModalRoot from './components/ModalRoot';

import Overview from './components/Overview';
import FileDialog from './components/FileDialog/container';
import EtlFieldView from './components/EtlFieldView/index.container';
import Workbench from './components/Workbench/index';
import HoldingArea from './components/HoldingArea';
import StepBar from './components/StepBar/container';

import { useStatus as useReduxCacheStatus } from '../hooks/use-status-provider';
import { isCacheStale as isReduxCacheStale } from './ducks/rootSelectors';

LicenseInfo.setLicenseKey(
  'fa029d42fde6eb619eeabfea6cfb9c30T1JERVI6MjQ4NTgsRVhQSVJZPTE2NTI2NTE0NDIwMDAsS0VZVkVSU0lPTj0x',
);

//------------------------------------------------------------------------------
// const DEBUG = false && process.env.REACT_APP_ENV === 'development';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

// --------------------------------------------------------------------------
/**
 * Core App View
 *
 * 👉 ErrorBoundary to isolate core-app errors
 * 👉 SubApp provides isolated access to ReduxStore
 *
 */
function Main() {
  //
  // dispatch save -> update redux state && set cache to stale
  // using this effect -> update SubApp context: stale
  //
  /*
  const staleCache = useSelector(isReduxCacheStale);
  const { setToStale } = useReduxCacheStatus();
  useEffect(() => {
    if (staleCache) {
      setToStale();
    }
  }, [staleCache, setToStale]);
*/

  return (
    <ErrorBoundary>
      <div className='box stack project-view'>
        <SubApp>
          <Container className={clsx('Luci-CoreAppLayout', 'root')}>
            <div className='app-paging-view'>
              <Outlet />
              <Routes>
                <Route path='introduction' element={<Overview />} />
                <Route path='files' element={<FileDialog />} />
                <Route path='fields' element={<EtlFieldView />} />
                <Route path='workbench' element={<Workbench />} />
                <Route path='pending' element={<HoldingArea />} />
              </Routes>
            </div>
            <StepBar className='app-paging-controller' />
          </Container>
          <ModalRoot />
        </SubApp>
      </div>
    </ErrorBoundary>
  );
}

export default Main;
