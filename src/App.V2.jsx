import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { useDispatch } from 'react-redux';

import SideNav from './layouts/SideNav';
import { routesConfig as routes } from './router';
import { reset as clearProjectStore } from './core-app/ducks/actions/project-meta.actions';
import ProjectsDataProvider from './contexts/ProjectsDataContext';

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
  return (
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
                    <SideNav />
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
