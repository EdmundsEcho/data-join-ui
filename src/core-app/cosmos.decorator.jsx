/**
 * Provide access to the theme, redux and dnd context
 * Fixtures inside the directory get wrapped accordingly.
 */
import React from 'react';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // fixes some html

import { DragDropContext } from 'react-beautiful-dnd';
import luciviaTheme from './lucivia-theme';

// configured and ready to go
import ReduxMock from './cosmos.mock-store';

/* eslint-disable react/prop-types, react/display-name, import/no-anonymous-default-export */

export default ({ children }) => (
  <ThemeProvider theme={luciviaTheme}>
    <StyledEngineProvider injectFirst>
      <CssBaseline>
        <ReduxMock>
          <DragDropContext>{children}</DragDropContext>
        </ReduxMock>
      </CssBaseline>
    </StyledEngineProvider>
  </ThemeProvider>
);
