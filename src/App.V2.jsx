import React, { useEffect, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { useDispatch } from 'react-redux';

import SideNav from './layouts/SideNav';
import SideNav2 from './layouts/SideNav2';
import HorizontalLayout from './layouts/HorizontalLayout';

import { routesConfig as routes } from './router';
import { reset as clearProjectStore } from './core-app/ducks/actions/project-meta.actions';
import ProjectsDataProvider from './contexts/ProjectsDataContext';
import usePageWidth from './hooks/use-page-width';

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
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(clearProjectStore('App Component'));
  }, [dispatch]);

  const pageWidth = usePageWidth();
  const isMobile = pageWidth < 770;

  const [openDrawer, setOpenDrawer] = useState(!isMobile);
  const [openProjectList, setOpenProjectList] = useState(!isMobile);

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const toggleProjectsList = () => {
    setOpenProjectList(!openProjectList);
  };

  return (
    <div className='stack'>
      <SideNav open={openDrawer} toggleDrawer={toggleDrawer} />
      <ProjectsDataProvider>
        <div className='root box stack'>
          <div className='root inner'>
            <TopBar className='Luci-topbar' />
            <div className='main wrapper nostack'>
              {/* Main menu - controls what is displayed in main-viewport */}
              <div className='main box nostack'>
                <div className='main-menu box'>
                  <div className='main-menu inner stack'>
                    <div className='box'>
                      <SideNav2 />
                    </div>
                  </div>
                </div>
                {/* Main viewport */}
                <div className='main-view box'>{routesElement}</div>
              </div>
            </div>
          </div>
          {/* layout markers */}
          <div className='marker top' />
          <div className='marker bottom' />
          <div className='marker top computed' />
        </div>
      </ProjectsDataProvider>
    </div>
  );
};

function TopBar() {
  return <div className='topbar'>topbar</div>;
}

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
