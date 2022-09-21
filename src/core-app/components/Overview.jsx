import React, { useEffect, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useDispatch, useStore } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import clsx from 'clsx';

import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import CheckIcon from '@mui/icons-material/Check';
import Button from '@mui/material/Button';

import { deleteDb as clearUiState } from '../hooks/use-persisted-state';

// public resources
import logo from '../assets/images/Logo.png';
// import logoL from '../assets/images/LogoL.png';
//
const SHOW_DEBUG_PANEL = false;

/* eslint-disable no-console, react/jsx-props-no-spreading */

/**
 * @component
 */
const Overview = (props) => {
  const dispatch = useDispatch();
  const { projectId } = useParams();

  const clearReduxState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

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
