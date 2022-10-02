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
import { useNavigate, useLocation, useParams } from 'react-router-dom';

// part of the transition away from container for this component
import { useDispatch, useSelector } from 'react-redux';

import clsx from 'clsx';

// import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
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
const DEBUG = process.env.REACT_APP_DEBUG_STEP_BAR === 'true';
// -----------------------------------------------------------------------------
// Matrix data saving
const SAVE_MATRIX_ENDPOINT = process.env.REACT_APP_SAVE_MATRIX_ENDPOINT;
const mkSaveEndpoint = (projectId) =>
  SAVE_MATRIX_ENDPOINT.replace('{projectId}', projectId);

const handleSaveMatrix = (projectId) => {
  fetch(mkSaveEndpoint(projectId), { responseType: 'blob' }).then(
    (response) => {
      response.blob();
    },
  );
};
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

  // "next page" determined by prev or next event
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
    <div className='stepbar root stack nowrap nogap'>
      <div className='stepbar stepper-root frame'>
        <Stepper
          className={clsx('Luci-Stepper root')}
          activeStep={currentPage.stepNumber}>
          {pages.map(({ stepDisplay: label }) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
      {/* Navigation */}
      <div className='stepbar nav-root nostack nowrap'>
        <div className='nostack nowrap flex-1'>
          <div className='nostack nowrap button-group flex-1'>
            {/* Previous */}
            <Button
              className={clsx('stepbar nav previous', {
                disabled: !isPreviousStepEnabled[currentPage.route],
              })}
              startIcon={<PreviousArrow fontSize='small' />}
              onClick={handlePrevStep}>
              Previous
            </Button>
            {/* Next */}
            <Button
              className={clsx('stepbar nav next', {
                disabled: !isNextStepEnabled[currentPage.route],
              })}
              disabled={!isNextStepEnabled[currentPage.route]}
              endIcon={<NextArrow fontSize='small' />}
              onClick={handleNextStep}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* download button */}
      <form action={mkSaveEndpoint(projectId)} method='post'>
        <Button
          type='submit'
          className={clsx('matrix', 'download', 'round', {
            disabled: currentPage.route !== 'matrix',
          })}
          disabled={currentPage.route !== 'matrix'}
          endIcon={<DownloadIcon />}>
          Download
        </Button>
      </form>
      {/* logo container */}
      <div className='stepbar logo'>
        <img src={logo} height='50' width='37' alt='Lucivia' />
      </div>
    </div>
  );
};

StepBarComponent.propTypes = {};
StepBarComponent.defaultProps = {};

export default StepBarComponent;
