import React from 'react';
import { useRoutes } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import Projects from './Projects';
import NewProjectForm from './forms/ProjectForm';

import SideNav from './layouts/SideNav';
import ProjectView from './core-app/Main';
import { routesConfig as routes } from './router';

/* eslint-disable no-console */

const App = () => {
  const routesElement = useRoutes(routes);
  return (
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
  );
};

function TopBar() {
  return <div className='topbar'>topbar</div>;
}

// --------------------------------------------------------------------------
function Home() {
  return (
    <>
      <h2>Home</h2>
      <p className='message'>This is home base</p>
    </>
  );
}
function Users() {
  return (
    <>
      <h2>Users</h2>
      <p className='message'>List of users (postgrest: users)</p>
    </>
  );
}
function SharedDrives() {
  return (
    <>
      <h2>User Profile</h2>
      <p className='message'>First Name: Edmund</p>
      <p className='message'>Last Name: Cape</p>
    </>
  );
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
