// src/core-app/Main.jsx

import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import clsx from 'clsx';

import Container from '@mui/material/Container';
import { LicenseInfo } from '@mui/x-data-grid-pro';

// core-app related
import AppInitializer from './AppInitializer';
import { ErrorBoundary, Fallback } from './components/shared/ErrorBoundary';
import ModalRoot from './components/ModalRoot';

import StepBar from './components/StepBar/StepBar';

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

  Outlet.displayName = 'CoreApp-Outlet';

  return (
    <AppInitializer>
      <ErrorBoundary FallbackComponent={Fallback}>
        <div className='box stack project-view'>
          <Container className={clsx('Luci-CoreAppLayout', 'root')}>
            <div className='app-paging-view'>
              <Outlet />
            </div>
            <StepBar className='app-paging-controller'></StepBar>
          </Container>
          <ModalRoot />
        </div>
      </ErrorBoundary>
    </AppInitializer>
  );
}

export default Main;
