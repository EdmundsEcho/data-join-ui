// src/core-app/Main.jsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Routes, Route, Outlet, Link } from 'react-router-dom';
import clsx from 'clsx';

import Container from '@mui/material/Container';
import { LicenseInfo } from '@mui/x-data-grid-pro';

// core-app related
import SubApp from '../SubApp'; // with Provider
import ReduxInitializer from './ReduxInitializer';
import ErrorBoundary from './components/shared/ErrorBoundary';
import ModalRoot from './components/ModalRoot';

import Overview from './components/Overview';
import FileDialog from './components/FileDialog';
import EtlFieldView from './components/EtlFieldView';
import Workbench from './components/Workbench';
import WorkSplash from './components/LoadingSplashWorkbench';
import StepBar from './components/StepBar';

LicenseInfo.setLicenseKey(
  'bfebe42cb36c320e53926d5c773b27e9Tz00OTgzOSxFPTE2OTMyMzE0NTQ3MDksUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=',
);
// 'fa029d42fde6eb619eeabfea6cfb9c30T1JERVI6MjQ4NTgsRVhQSVJZPTE2NTI2NTE0NDIwMDAsS0VZVkVSU0lPTj0x',

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
  /*
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        </Provider>
*/

  return (
    <SubApp>
      <ReduxInitializer>
        <ErrorBoundary>
          <div className='box stack project-view'>
            <Container className={clsx('Luci-CoreAppLayout', 'root')}>
              <div className='app-paging-view'>
                <Outlet />
                <Routes>
                  <Route path='introduction' element={<Overview />} />
                  <Route path='files' element={<FileDialog />} />
                  <Route path='fields' element={<EtlFieldView />} />
                  <Route path='pending' element={<WorkSplash />} />
                  <Route path='workbench' element={<Workbench />} />
                </Routes>
              </div>
              <StepBar className='app-paging-controller'>
                <Link to='/files'>Project View</Link>
                <Link to='/fields'>Project View</Link>
                <Link to='/workbench'>Project View</Link>
                <Link to='/pending'>Project View</Link>
              </StepBar>
            </Container>
            <ModalRoot />
          </div>
        </ErrorBoundary>
      </ReduxInitializer>
    </SubApp>
  );
}

export default Main;
