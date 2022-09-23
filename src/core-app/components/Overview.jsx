import React, { useEffect, useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import clsx from 'clsx';

import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { deleteDb as clearUiState } from '../hooks/use-persisted-state';
import { getProjectId } from '../ducks/rootSelectors';

// public resources
import logo from '../assets/images/Logo.png';
// import logoL from '../assets/images/LogoL.png';

/* eslint-disable no-console, react/jsx-props-no-spreading */

/**
 * @component
 */
const Overview = () => {
  const { projectId } = useParams();
  const projectInRedux = useSelector((state) => {
    if (state === null) {
      return null;
    }
    return getProjectId(state);
  });

  useEffect(() => {
    // when the projectId is Null, reload
    if (projectInRedux === null) {
      window.location.reload(true); // true = server
    }
  }, [projectInRedux]);

  const handleClear = async (...args) => {
    await clearUiState(...args);
  };
  return (
    <div style={{ margin: '30px' }}>
      <img src={logo} alt='Lucivia LLC' style={{ width: '140px' }} />
      <p>
        Thank you for taking the time to preview this exciting new product that
        promises to truly change the way data analysts spend their time.
      </p>
      <p />
      <Divider />
      <Button onClick={() => handleClear(projectId)}>Clear UI</Button>
      <p />

      <CopyRight />
    </div>
  );
};

Overview.propTypes = {};

function CopyRight() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        margin: '30px',
      }}>
      <Typography style={{ margin: 'auto' }} variant='subtitle1'>
        {`\u00A9 Copyright ${/\d{4}/.exec(Date())[0]} Lucivia LLC`}
      </Typography>
    </div>
  );
}
export default Overview;
