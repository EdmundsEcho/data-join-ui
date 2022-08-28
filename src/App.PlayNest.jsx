import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import LoginPage from './pages/LoginPage';
import RedirectPage from './pages/RedirectPage';
import Projects from './Projects';
import NewProjectForm from './forms/ProjectForm';

import ProjectView from './core-app/Main';

/* eslint-disable no-console */

const App = () => {
  return (
    <div className='root box stack'>
      <div className='root inner'>
        <TopBar />
        <div className='main wrapper nostack'>
          {/* Main menu - controls what is displayed in main-viewport */}
          <div className='main box nostack'>
            <div className='main-menu box'>
              <div className='main-menu inner stack'>
                <div className='box'>
                  <h1>React Router</h1>
                  <nav className='stack'>
                    {/* to must map to first-level of Routes */}
                    <Link to='/home'>Home</Link>
                    <Link to='/user-profile'>User Profile</Link>
                    <Link to='/users'>Users</Link>
                    <Link to='/shared-drives'>Shared Drives</Link>
                    <Link to='/projects'>Project View</Link>
                  </nav>
                </div>
              </div>
              <div className='box next-steps'>
                <ul title='Next steps'>
                  <li className='done'>
                    Browser URL triggers fetchProject(id)
                  </li>
                  <li className='done'>Update url to show project id</li>
                  <li className='done'>
                    Context for data cache and ability ot update the cache
                  </li>
                  <li className='done'>Render the core app placeholder</li>
                  <li className='done'>Core app with projectId prop</li>
                  <li>Redirect to login when saving returns 401</li>
                  <li>Introduce the core app</li>
                  <li>Add User-Profile page</li>
                  <li>Optimize list rerender?</li>
                </ul>
              </div>
            </div>
            {/* Main viewport */}
            <div className='main-view box'>
              <Routes>
                <Route index element={<RedirectPage />} />
                <Route path='error' element={<RedirectPage />} />
                <Route path='login' element={<LoginPage />} />
                <Route path='logout' element={<LoginPage logout />} />
                <Route path='home' element={<Home />} />
                <Route path='user-profile' element={<UserProfile />} />
                <Route path='users' element={<Users />} />
                <Route path='shared-drives' element={<SharedDrives />} />
                <Route path='projects' element={<Projects />}>
                  {/* outlet-> */}
                  <Route index element={<NewProjectForm />} />
                  <Route path=':projectId/*' element={<ProjectView />} />
                  {/* Gateway to the core-app */}
                </Route>
                <Route
                  path='*'
                  element={<NoMatch message='Dashboard no-match' />}
                />
              </Routes>
            </div>
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
function UserProfile() {
  return (
    <>
      <h2>User Profile</h2>
      <p className='message'>First Name: WIP</p>
      <p className='message'>Last Name: WIP</p>
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
