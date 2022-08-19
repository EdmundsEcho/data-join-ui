import './wdyr'; // why did you render debug utility

import React, { version as reactVersion } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import * as serviceWorker from './serviceWorker';

// css that works in addition to mui-theme
import luciviaTheme from './core-app/lucivia-theme';
import './assets/index.css';
import './assets/dashboard.css';
import './assets/fonts.css';

import Dashboard from './App.PlayNest.jsx';

/* eslint-disable-next-line */
console.info(`App using react version: ${reactVersion}`);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider maxSnack={3}>
        <ThemeProvider theme={luciviaTheme}>
          <StyledEngineProvider injectFirst>
            <CssBaseline />
            <Dashboard />
          </StyledEngineProvider>
        </ThemeProvider>
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// use-query-params adapter for React Router 6
// const RouteAdapter = ({ children }) => {
//   const navigate = useNavigate()
//   const location = useLocation()
//
//   const adaptedHistory = React.useMemo(
//     () => ({
//       replace(location) {
//         navigate(location, { replace: true, state: location.state })
//       },
//       push(location) {
//         navigate(location, { replace: false, state: location.state })
//       },
//     }),
//     [navigate],
//   )
//   return children({ history: adaptedHistory, location })
// }

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
