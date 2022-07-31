/**
 * @description
 * General application layout used to wrap all components to
 * accomplish a uniform UX
 *
 * @module components/AppLayout
 */
import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import Container from '@mui/material/Container';

import StepBar from './StepBar/container';

function Layout({ children }) {
  return (
    <Container className={clsx('Luci-AppLayout', 'root')}>
      <div className='app-paging'>{children}</div>
      <StepBar className='app-page-controller' />
    </Container>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

/*
const AppLayout = (props) => {
  const { children } = props;

  return (
    <Container className={clsx('Luci-AppLayout', 'root')}>
      <AppBar className='appBar' color='primary'>
        <Toolbar variant='dense' />
      </AppBar>

      <Container className='main'>
        <div className='viewport'>{children}</div>
        <StepBar style={{ position: 'fixed' }} />
      </Container>
    </Container>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
*/

export default Layout;
