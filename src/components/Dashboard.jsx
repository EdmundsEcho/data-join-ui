import React from 'react';
import { useRoutes } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import HorizontalLayoutWithSideBar from '../layouts/HorizontalLayout';

import { routesConfig as routes } from '../router';
import ProjectsDataProvider from '../contexts/ProjectsDataContext';
import AppFloatingFunctionContext from '../contexts/AppFloatingFunctionsContext';

//-----------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
//-----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * @component
 *
 * 1. Render the React-Router routes
 * 2. Reset the redux store
 *
 */
const App = () => {
  const routesElement = useRoutes(routes);
  return (
    <AppFloatingFunctionContext>
      <ProjectsDataProvider>
        <HorizontalLayoutWithSideBar>
          {/* Main viewport */}
          {routesElement}
        </HorizontalLayoutWithSideBar>
        {/* layout markers */}
        <div className='marker top hidden-n' />
        <div className='marker bottom hidden-n' />
        <div className='marker top computed hidden-n' />
      </ProjectsDataProvider>
    </AppFloatingFunctionContext>
  );
};

function NoMatch({ message }) {
  return (
    <>
      <h2>{message}</h2>
      <p className='message'>
        The navigation took us somewhere where a component has not been mapped.
      </p>
    </>
  );
}
NoMatch.propTypes = {
  message: PropTypes.string,
};
NoMatch.defaultProps = {
  message: undefined,
};

export default App;
