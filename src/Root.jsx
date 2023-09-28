import React, { useMemo, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';

import { SnackbarProvider } from 'notistack';

import luciviaTheme from './core-app/lucivia-theme.v2';

import Dashboard from './components/Dashboard.jsx';
import ModalRoot from './core-app/components/ModalRoot';

import { useThemeMode } from './hooks/use-theme-mode';
import { ThemeContext } from './contexts/ThemeContext';

import { storeWithoutState /* persistor */ } from './core-app/redux-store';

//-----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_THEME === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
const { store } = storeWithoutState();

const Root = () => {
  const [themeMode, setThemeMode] = useThemeMode();
  const theme = useMemo(() => luciviaTheme(themeMode), [themeMode]);
  const toggleThemeMode = useCallback(() => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, [setThemeMode]);

  const contextValue = useMemo(
    () => ({ themeMode, toggleThemeMode }),
    [themeMode, toggleThemeMode],
  );

  Provider.displayName = 'TncReduxStore-Provider';

  if (DEBUG) {
    console.debug('Theme', {
      themeModeSystemPref: window.matchMedia('(prefers-color-scheme: dark)'),
      theme,
    });
  }

  return (
    <div className={`${themeMode}-theme-context`}>
      <Provider store={store}>
        <ThemeContext.Provider value={contextValue}>
          <ThemeProvider theme={theme}>
            <BrowserRouter>
              <SnackbarProvider maxSnack={3} preventDuplicate>
                <Dashboard />
                <ModalRoot themeMode={themeMode} />
              </SnackbarProvider>
            </BrowserRouter>
          </ThemeProvider>
        </ThemeContext.Provider>
      </Provider>
    </div>
  );
};
export default Root;
