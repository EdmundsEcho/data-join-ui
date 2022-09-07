import React, { useMemo, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { SnackbarProvider } from 'notistack';

import luciviaTheme from './core-app/lucivia-theme';

import Dashboard from './App.V2.jsx';
import ModalRoot from './core-app/components/ModalRoot';

import { useThemeMode } from './hooks/use-theme-mode';
import { ThemeContext } from './contexts/ThemeContext';

//------------------------------------------------------------------------------
/* eslint-disable no-console */
//------------------------------------------------------------------------------

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

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ThemeContext.Provider value={contextValue}>
          <ThemeProvider theme={theme}>
            <StyledEngineProvider injectFirst>
              <SnackbarProvider maxSnack={3}>
                <CssBaseline />
                <Dashboard />
              </SnackbarProvider>
            </StyledEngineProvider>
          </ThemeProvider>
        </ThemeContext.Provider>
      </BrowserRouter>
    </React.StrictMode>
  );
};
export default Root;
