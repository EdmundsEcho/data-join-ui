// src/components/StepBar/component.jsx

/**
 *
 * The component renders
 * 1. stepper
 * 2. navigation for the stepper
 *
 *
 * 🔑 The state of the stepbar is driven by the location from useLocation.
 *
 * Utilizes the stepper-machine to compute the state values.
 *
 *   👉 hosts an entry for each tnc page
 *   👉 enable/disable next and previous steps
 *   👉 useful splash-screen (with progress updates)
 *   👉 dispatches required actions
 *
 * @module /components/StepBar
 *
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

// part of the transition away from container for this component
import { useDispatch, useSelector } from 'react-redux';

import clsx from 'clsx';

// import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Container from '@mui/material/Container';
import PreviousArrow from '@mui/icons-material/ArrowBackIos';
import NextArrow from '@mui/icons-material/ArrowForwardIos';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

import logo from '../../assets/l@3x.png';

import Machine, {
  getBookmark,
  forwardGuards,
  backwardGuards,
  pages,
  lookupPageWithPathname,
  tryNextEvent,
  tryPrevEvent,
} from './stepper-machine';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_STEP_BAR === 'true';
const SAVE_MATRIX_ENDPOINT = process.env.REACT_APP_SAVE_MATRIX_ENDPOINT;
const mkSaveEndpoint = (projectId) =>
  SAVE_MATRIX_ENDPOINT.replace('{projectId}', projectId);
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const StepBarComponent = () => {
  //
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const dispatch = useDispatch();
  // const reduxState = useSelector((state) => state);

  const isNextStepEnabled = {
    meta: useSelector(forwardGuards.meta),
    files: useSelector(forwardGuards.files),
    fields: useSelector(forwardGuards.fields),
    workbench: useSelector(forwardGuards.workbench),
    matrix: useSelector(forwardGuards.matrix),
  };
  const isPreviousStepEnabled = {
    meta: useSelector(backwardGuards.meta),
    files: useSelector(backwardGuards.files),
    fields: useSelector(backwardGuards.fields),
    workbench: useSelector(backwardGuards.workbench),
    matrix: useSelector(backwardGuards.matrix),
  };
  const bookmark = useSelector(getBookmark);

  // current page (local state) is derived from Router url
  const { pathname } = location;
  // depends on static import of objects
  const currentPage = lookupPageWithPathname(pathname);
  // immutable reference recorded in local state

  const nextPage = (event) =>
    Machine(dispatch, projectId).transition(
      isNextStepEnabled[currentPage.route],
      currentPage,
      event,
    );

  if (DEBUG) {
    console.debug('%c----------------------------------------', 'color:orange');
    console.debug(`%c📋 StepBar loaded state summary:`, 'color:orange', {
      '🔗 pathname': pathname,
      '✅ display text': currentPage.stepDisplay,
      route: currentPage.route,
      showDownload: currentPage.route === 'matrix',
      currentPage,
    });
  }

  const handleNextStep = () => navigate(nextPage(tryNextEvent));
  const handlePrevStep = () => navigate(nextPage(tryPrevEvent));

  // 💢 navigate to the bookmark
  useEffect(() => {
    navigate(bookmark);
  }, [bookmark, navigate]);

  return currentPage.hideStepper ? null : (
    /* Stepper */
    <Container
      className={clsx('Luci-Stepper wrapper')}
      maxWidth='xl'
      sx={{ gridColumn: '1/3' }}>
      <Stepper
        className={clsx('Luci-Stepper root')}
        activeStep={currentPage.stepNumber}>
        {pages.map(({ stepDisplay: label }) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Navigation */}
      <div className='stepbar nav-root nostack nowrap'>
        <div className='nostack nowrap flex-1'>
          <div className='nostack nowrap flex-1'>
            <div className='nostack nowrap button-group flex-1'>
              {/* Previous */}
              <Button
                className={clsx({
                  'stepbar nav disabled':
                    !isPreviousStepEnabled[currentPage.route],
                })}
                startIcon={<PreviousArrow fontSize='small' />}
                onClick={handlePrevStep}>
                Previous
              </Button>
              {/* Next */}
              <Button
                className={clsx('stepbar nav', {
                  disabled: !isNextStepEnabled[currentPage.route],
                })}
                disabled={!isNextStepEnabled[currentPage.route]}
                endIcon={<NextArrow fontSize='small' />}
                onClick={handleNextStep}>
                Next
              </Button>
            </div>
            <div className='nostack nowrap button-group flex-1'>
              <Button
                className={clsx('matrix', 'download', 'round', {
                  disabled: currentPage.route !== 'matrix',
                })}
                disabled={currentPage.route !== 'matrix'}
                href={mkSaveEndpoint(projectId)}
                endIcon={<DownloadIcon />}>
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* logo container */}
        <div className='logo stepbar'>
          <img src={logo} height='50' width='37' alt='Lucivia' />
        </div>
      </div>
    </Container>
  );
};

StepBarComponent.propTypes = {};
StepBarComponent.defaultProps = {};

export default StepBarComponent;
