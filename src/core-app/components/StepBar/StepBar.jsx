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
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
// icons
import PreviousArrow from '@mui/icons-material/ArrowBackIos';
import NextArrow from '@mui/icons-material/ArrowForwardIos';
import DownloadIcon from '@mui/icons-material/Download';
import ResetIcon from '@mui/icons-material/Replay';
import EventIcon from '@mui/icons-material/InsertInvitation';

import SlidingPopupFeedback from '../../../widgets/SlidingPopperFeedback';

import { useWorkbenchButton } from '../Workbench/components/Main';

import { useFloatingFunctionsDataContext } from '../../../contexts/AppFloatingFunctionsContext';

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
import { isUiLoading, isAppDataCompleted } from '../../ducks/rootSelectors';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_STEP_BAR === 'true';
// -----------------------------------------------------------------------------
// Matrix data saving
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
  // tagMatrixState, tagWarehouseState,
  const bookmark = useSelector(getBookmark);
  const { isLoading } = useSelector(isUiLoading);
  const isProjectCompleted = useSelector(isAppDataCompleted);

  // current page (local state) is derived from Router url
  const { pathname } = location;

  // depends on static import of objects; immutable ref
  const currentPage = lookupPageWithPathname(pathname);

  // active step that depends on a completed cycle
  const activeStep = isProjectCompleted ? 5 : currentPage.stepNumber;

  // "next page" determined by prev or next event
  const nextPage = (event) =>
    Machine(dispatch, projectId).transition(
      isNextStepEnabled[currentPage.route],
      currentPage,
      event,
    );

  const handleNextStep = () => navigate(nextPage(tryNextEvent));
  const handlePrevStep = () => navigate(nextPage(tryPrevEvent));

  // floating functions
  const { showFeedback, showResetCanvas, showDownloadMatrix } =
    useFloatingFunctionsDataContext();

  // 💢 navigate to the bookmark
  useEffect(() => {
    navigate(bookmark);
  }, [bookmark, navigate]);

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

  return currentPage.hideStepper ? null : (
    /* Stepper */
    <div className='stepbar root stack nowrap nogap'>
      <div className='stepbar stepper-root frame'>
        <Stepper className={clsx('Luci-Stepper root')} activeStep={activeStep}>
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
              onClick={handlePrevStep}
            >
              Previous
            </Button>
            {/* Next */}
            <Button
              className={clsx('stepbar nav next', {
                disabled: !isNextStepEnabled[currentPage.route],
              })}
              disabled={!isNextStepEnabled[currentPage.route]}
              endIcon={<NextArrow fontSize='small' />}
              onClick={handleNextStep}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Floating functions */}
      <div
        className={clsx('floating-actions stack nowrap', {
          hidden: isLoading,
        })}
      >
        {showResetCanvas && <ResetCanvas />}

        {showDownloadMatrix && (
          <a href={mkSaveEndpoint(projectId)} download>
            <Fab color='secondary' className='matrix download round'>
              <DownloadIcon />
            </Fab>
          </a>
        )}

        {showFeedback && <SlidingPopupFeedback />}

        {showFeedback && (
          <a
            id='Setmore_button_iframe'
            href='https://booking.setmore.com/scheduleappointment/eb6d620f-63d9-42d4-aab0-da01cf7a1762'
          >
            <Fab color='secondary' className={clsx('fab', 'calendar', 'round')}>
              <EventIcon />
            </Fab>
          </a>
        )}
      </div>

      {/* logo container */}
      <div className='stepbar logo'>
        <img src={logo} height='50' width='37' alt='Lucivia' />
      </div>
    </div>
  );
};

function ResetCanvas() {
  const { isCanvasDirty, handleResetCanvas } = useWorkbenchButton();
  return (
    <Fab
      color='secondary'
      className='fab feedback'
      onClick={handleResetCanvas}
      disabled={!isCanvasDirty}
    >
      <ResetIcon />
    </Fab>
  );
}

StepBarComponent.propTypes = {};
StepBarComponent.defaultProps = {};

export default StepBarComponent;
