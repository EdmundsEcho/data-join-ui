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
import { useNavigate, useLocation } from 'react-router-dom';

// part of the transition away from container for this component
import { useDispatch, useSelector } from 'react-redux';

import withStyles from '@mui/styles/withStyles';
import clsx from 'clsx';

// import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import PreviousArrow from '@mui/icons-material/ArrowBackIos';
import NextArrow from '@mui/icons-material/ArrowForwardIos';
import Button from '@mui/material/Button';

import logo from '../../assets/l@3x.png';
import { styles } from './styles';

import Machine, {
  getBookmark,
  forwardGuards,
  pages,
  lookupPageWithPathname,
  tryNextEvent,
  tryPrevEvent,
} from './stepper-machine';
import { setCurrentPage } from '../../ducks/actions/stepper.actions';

// -----------------------------------------------------------------------------
const DEBUG = true && process.env.REACT_APP_DEBUG_STEP_BAR === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const StepBarComponent = ({ classes }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  // const reduxState = useSelector((state) => state);

  const isNextStepEnabled = {
    meta: useSelector(forwardGuards.meta),
    files: useSelector(forwardGuards.files),
    fields: useSelector(forwardGuards.fields),
    workbench: useSelector(forwardGuards.workbench),
    matrix: useSelector(forwardGuards.matrix),
  };
  const bookmark = useSelector(getBookmark);

  // current page (local state) is derived from Router url
  const { pathname } = location;
  // depends on static import of objects
  const currentPage = lookupPageWithPathname(pathname);
  // immutable reference recorded in local state

  const nextPage = (event) =>
    Machine(dispatch).transition(
      isNextStepEnabled[currentPage.route],
      currentPage,
      event,
    );

  if (DEBUG) {
    console.debug(`🔗 pathname (route): ${pathname}`);
    console.debug('✅ currentPage: ', currentPage.stepDisplay);
    console.dir(currentPage);
  }

  const handleNextStep = () => navigate(nextPage(tryNextEvent));
  const handlePrevStep = () => navigate(nextPage(tryPrevEvent));

  useEffect(() => {
    // navigate to the bookmark
    navigate(bookmark);
  }, []);

  /*
  useEffect(() => {
    // record the current page to redux to reload the app from where
    // the user left-off
    dispatch(setCurrentPage(currentPage));
  }, [dispatch, currentPage]);
  // 🚨 currentPage is an object
*/

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
      <Container className={classes.footContainer}>
        <Container className={classes.navigationContainer}>
          <Card className={classes.navigationCard}>
            <CardActions className={classes.cardActions}>
              {/* Previous */}
              <Button
                startIcon={<PreviousArrow fontSize='small' />}
                onClick={handlePrevStep}>
                Previous
              </Button>
              {/* Next */}
              <Button
                className={clsx({
                  [classes.disabled]: !isNextStepEnabled[currentPage.route],
                })}
                endIcon={<NextArrow fontSize='small' />}
                onClick={handleNextStep}>
                Next
              </Button>
            </CardActions>
          </Card>
        </Container>

        {/* logo container */}
        <Container className={classes.logoContainer}>
          <img src={logo} height='50' width='37' alt='Lucivia' />
        </Container>
      </Container>
    </Container>
  );
};

StepBarComponent.propTypes = {
  classes: PropTypes.shape({
    cardActions: PropTypes.string,
    footContainer: PropTypes.string,
    logoContainer: PropTypes.string,
    navigationCard: PropTypes.string,
    navigationContainer: PropTypes.string,
    root: PropTypes.string,
    stepper: PropTypes.string,
    disabled: PropTypes.string,
  }).isRequired,
};
StepBarComponent.defaultProps = {};

export default withStyles(styles)(StepBarComponent);
