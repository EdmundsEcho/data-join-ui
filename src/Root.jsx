import React, { useMemo, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { Css } from '@mui/icons-material';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { SnackbarProvider } from 'notistack';

import luciviaTheme from './core-app/lucivia-theme';

import Dashboard from './App.V2.jsx';
import ModalRoot from './core-app/components/ModalRoot';

import { useThemeMode } from './hooks/use-theme-mode';
import { ThemeContext } from './contexts/ThemeContext';

import { storeWithoutState /* persistor */ } from './core-app/redux-store';

//-----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_THEME === 'true';
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
    console.debug('Theme');
    console.dir(theme);
  }

  return (
    <Provider store={store}>
      <ThemeContext.Provider value={contextValue}>
        <ThemeProvider theme={theme}>
          <StyledEngineProvider injectFirst>
            <BrowserRouter>
              <SnackbarProvider maxSnack={3}>
                <CssBaseline />
                <Dashboard />
                <ModalRoot />
              </SnackbarProvider>
            </BrowserRouter>
          </StyledEngineProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </Provider>
  );
};
export default Root;
