/**
 * Provide access to the theme, redux and dnd context
 * Fixtures inside the directory get wrapped accordingly.
 */
import React, { useMemo, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // fixes some html
import { DragDropContext } from '@hello-pangea/dnd';
import { SnackbarProvider } from 'notistack';

import { useThemeMode } from './hooks/use-theme-mode';
import luciviaTheme from './core-app/lucivia-theme.v2';
import { ThemeContext } from './contexts/ThemeContext';

// configured and ready to go
import ReduxMock from './cosmos.mock-store';

// css that works in addition to mui-theme
import './assets/index.css';
import './assets/fonts.css';
import './assets/dashboard.css';
import './assets/core-app-sizing.css';

/* eslint-disable react/prop-types, react/display-name, import/no-anonymous-default-export */

export default ({ children }) => {
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
    <div className={`${themeMode}-theme-context`}>
      <ReduxMock>
        <ThemeContext.Provider value={contextValue}>
          <ThemeProvider theme={theme}>
            <StyledEngineProvider injectFirst>
              <BrowserRouter>
                <SnackbarProvider maxSnack={3}>
                  <DragDropContext>
                    <CssBaseline />
                    {children}
                  </DragDropContext>
                </SnackbarProvider>
              </BrowserRouter>
            </StyledEngineProvider>
          </ThemeProvider>
        </ThemeContext.Provider>
      </ReduxMock>
    </div>
  );
};
