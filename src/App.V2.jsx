import React, { useState } from 'react';
import { useRoutes } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import SideNav2 from './layouts/SideNav2';
import HorizontalLayout from './layouts/HorizontalLayout';

import { routesConfig as routes } from './router';
import ProjectsDataProvider from './contexts/ProjectsDataContext';
import usePageWidth from './hooks/use-page-width';

//-----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
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

  const pageWidth = usePageWidth();
  const isMobile = pageWidth < 770;

  const [openDrawer, setOpenDrawer] = useState(!isMobile);

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    <ProjectsDataProvider>
      <div className='nostack nowrap nogap noradius'>
        <SideNav2 open={openDrawer} toggleDrawer={toggleDrawer} />
        {/* Main menu - controls what is displayed in main-viewport */}
        <HorizontalLayout toggleDrawer={toggleDrawer} open={openDrawer}>
          {/* Main viewport - visual frame */}
          <div className='main-view sizing frame off'>{routesElement}</div>
        </HorizontalLayout>
      </div>
      {/* layout markers */}
      <div className='marker top' />
      <div className='marker bottom' />
      <div className='marker top computed' />
    </ProjectsDataProvider>
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
