// src/core-app/Main.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { LicenseInfo } from '@mui/x-data-grid-pro';

// core-app related
import AppInitializer from './AppInitializer';
import { ErrorBoundary, Fallback } from './components/shared/ErrorBoundary';
// import ModalRoot from './components/ModalRoot';

import StepBar from './components/StepBar/StepBar';
import AppSizeProvider from '../contexts/CoreAppSizeContext';

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
  const [height, setHeight] = useState(() => undefined);
  const [width, setWidth] = useState(() => undefined);

  const calcHeight = (node) => {
    if (node && !height) {
      setHeight(() => node.offsetHeight);
    }
    if (node && !width) {
      setWidth(() => node.offsetWidth);
    }
  };
  /*
  useEffect(() => {
    console.debug(`Outlet height: ${height}`);
  }, [height]);
  useEffect(() => {
    console.debug(`Outlet width: ${width}`);
  }, [width]);
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    '--unit',
  );
*/

  Outlet.displayName = 'CoreApp-Outlet';

  return (
    <AppInitializer>
      <div className='project-view root stack nowrap'>
        <div className='app-paging-view'>
          <ErrorBoundary FallbackComponent={Fallback}>
            <div ref={(node) => calcHeight(node)}>
              <AppSizeProvider height={height} width={width}>
                <Outlet />
                <div className='size'>size:</div>
              </AppSizeProvider>
            </div>
          </ErrorBoundary>
        </div>
        <StepBar className='controller step-bar'></StepBar>
      </div>
    </AppInitializer>
  );
}

export default Main;

/*
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        </Provider>
*/
