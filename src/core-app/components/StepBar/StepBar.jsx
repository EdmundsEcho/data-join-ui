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
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

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
  pages,
  lookupPageWithPathname,
  tryNextEvent,
  tryPrevEvent,
} from './stepper-machine';
import { setCurrentPage } from '../../ducks/actions/stepper.actions';

// -----------------------------------------------------------------------------
const DEBUG = false && process.env.REACT_APP_DEBUG_STEP_BAR === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const StepBarComponent = ({ classes }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const reduxState = useSelector((state) => state);

  // current page (local state) is derived from Router url
  const { pathname } = location;
  // depends on static import of objects
  const currentPage = lookupPageWithPathname(pathname);
  // immutable reference recorded in local state
  const [machine] = useState(() => Machine(projectId, dispatch));
  const nextPage = useCallback(
    (event) => `${machine.transition(reduxState, currentPage, event)}`,
    [machine, reduxState, currentPage],
  );
  const isNextStepEnabled = machine.isNextStepEnabled(reduxState, currentPage);

  if (DEBUG) {
    console.debug(`🔗 pathname (route): ${pathname}`);
    console.debug('✅ currentPage: ', currentPage.stepDisplay);
    console.dir(currentPage);
  }

  const handleNextStep = useCallback(() => {
    console.debug(`👉 ${nextPage(tryNextEvent)}`);
    navigate(nextPage(tryNextEvent));
  }, [navigate, nextPage]);

  const handlePrevStep = useCallback(() => {
    console.debug(`👉 ${nextPage(tryPrevEvent)}`);
    navigate(nextPage(tryPrevEvent));
  }, [navigate, nextPage]);

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
                  [classes.disabled]: !isNextStepEnabled,
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
