// src/components/StepBar/component.jsx

/**
 * @module /components/StepBar/component
 *
 * @description
 * This is a bit of a misnomer.  The component renders three things:
 * 1. stepper
 * 2. navigation for the stepper
 *
 * 🔖 Jan 2022
 *    Updated to the latest react-router-dom that deprecates the use of history.
 *
 *    ⬜ Update comments accordingly.
 *
 *  This is a mess and needs to be refactored. Issues:
 *
 *  ✅ use history to maintain state fileView -> etlView
 *
 *  ⬜ the state is reloading when etlView -> workbench
 *
 *  ⬜ create a unified data structure to represent the navigation
 *     needs of the app
 *
 *       👉 backtracking
 *       👉 enabling/disabling next steps
 *       👉 useful splash-screen (with progress updates)
 *       👉 unified experience for reporting state by derivation and retrieving
 *          results from the api
 *
 * ⬜ show the navbar in the workbench view
 *
 * ⬜ encapsulate the state validations required before enabling the next step
 *
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';

// part of the transition away from container for this component
import { useDispatch } from 'react-redux';

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

// ☎️  initiate the etl process
// import { setLoader } from '../../ducks/actions/ui.actions';
import {
  // WORKBENCH,
  fetchWarehouse,
} from '../../ducks/actions/workbench.actions';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_STEP_BAR === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

//
// ⬜ integrate into the lucivia_theme
//
const styles = {
  footContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '7px',
    paddingTop: 0,
  },

  navigationContainer: {
    display: 'flex',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  logoContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingRight: '35px',
    marginBottom: '7px',
  },

  previousButton: {},
  nextButton: {},

  navigationCard: {
    width: 240,
    margin: '7px',
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },

  cardActions: {
    padding: '3px',
    alignItems: 'center', // vertical alignment
    justifyContent: 'space-between', // horizontal alignment
  },

  disabled: {
    visibility: 'hidden',
  },
};

const replaceDummyIdWithRealId = (
  string,
  pathname = window.location.pathname,
) => {
  const regexResult = pathname.slice(1).match(/\/(.*?)\//);
  return regexResult ? string.replace('/1/', `/${regexResult[1]}/`) : string;
};

/**
 * Scrappy way to allow certain views to be skipped when backtracking. This
 * is useful in the current implementation of the ETL holding area component
 * because going back from Workbench should take the user back to the
 * EtlFieldView.
 * @function
 * @param steps
 * @param backIndex
 * @return route href
 */
const getBacktrackLink = (steps, backIndex) => {
  if (steps[backIndex] && steps[backIndex].canBacktrack == null) {
    return replaceDummyIdWithRealId(
      steps[backIndex].route,
      window.location.pathname,
    );
  }

  if (steps[backIndex - 1]) {
    return replaceDummyIdWithRealId(
      steps[backIndex - 1].route,
      window.location.pathname,
    );
  }

  return '';
};

/**
 * Needs to be integrated with the steps data structure.
 * A list of steps. Coordinates with getInstructions.
 */
const getStepTexts = () => {
  return [
    'Select project',
    'Take inventory',
    'Configure the stack',
    'Create the universe',
    'Run the analysis',
  ];
};

// ⚙️  When to display the StepBar
const showStepBar = {
  Overview: false,

  // header/file inspection
  'Select Files': true,

  // etl extraction
  'Configure Fields': true,

  'Building ETL': true,

  Workbench: true,
};

// local utility
// This is useless
const routeFromPathname = (pathname, defaultValue) => {
  const tokens = pathname.split('/');
  if (tokens.length !== 4) {
    console.warn(`Unexpected route; expected 4 nested levels`);
    return defaultValue;
  }
  return tokens[tokens.length - 1];
};

/**
 * @component
 */
const StepBarComponent = ({
  classes,
  steps, // [{ route, displayName, canCallBack }]
  hasHeaderViewsFixes,
  hasPendingInspections,
  hasSelectedFiles,
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  // ⬜ Integrate into Routes logic
  // parse the location; if none, files
  const route = routeFromPathname(pathname, 'files' /* default */);

  const stepsText = getStepTexts();

  if (DEBUG) {
    console.debug(`🔗 pathname (route): ${pathname}`);
  }

  const indexedSteps = steps.map((step, idx) => ({
    ...step,
    idx,
  }));

  console.dir(indexedSteps);
  const currentStep = indexedSteps.find(
    ({ route: tryRoute }) => tryRoute === route,
  );

  if (DEBUG) {
    /* eslint-disable-next-line */
    console.log('✅ currentStep: ', currentStep);
    console.log('✅ route: ', route);
  }

  // ⬜ This all needs to be cleaned up (Stepper logic)
  //
  const nextHref = useCallback(() => {
    console.log('currentStep', currentStep);
    console.log('indexedSteps', indexedSteps);
    const aaa1 = replaceDummyIdWithRealId(
      indexedSteps[currentStep.idx].route,
      pathname,
    );
    const aaa2 = replaceDummyIdWithRealId(
      indexedSteps[currentStep.idx + 1].route || '',
      pathname,
    );
    console.log(aaa1, aaa2);
    if (currentStep.idx === 4) {
      return replaceDummyIdWithRealId(
        indexedSteps[currentStep.idx].route,
        pathname,
      );
    }
    // 2: etlView, move to 3: pending while building obsEtl
    if (currentStep.idx === 2) {
      if (DEBUG) {
        console.log(
          `👉 Splash before workbench currentStep: ${currentStep.idx}`,
        );
      }
      dispatch(fetchWarehouse());
      // path='/campaigns/:campaignId/pending'
    }
    // This move should happen automatically
    // if (currentStep.idx === 3) { }
    return replaceDummyIdWithRealId(
      indexedSteps[currentStep.idx + 1].route || '',
      pathname,
    );
  }, [currentStep, pathname, dispatch, indexedSteps]);

  const handleNextStep = useCallback(() => {
    // ⬜ Near-term: have it pull the matrix data when @workbench
    navigate(nextHref());
  }, [navigate, nextHref]);

  // ⚙️  When to enable the next step
  const isNextStepDisabled = useCallback(() => {
    // 👎 keyed using displayName
    // ⬜ add a key to each phase in the steps configuration
    const delegate = {
      // Launch page
      Overview: false,

      // header/file inspection
      'Select Files':
        hasHeaderViewsFixes || hasPendingInspections || !hasSelectedFiles,

      // etl extraction
      'Configure Fields': false,

      'Building ETL': false,

      Workbench: true,
    };

    return delegate[currentStep.displayName];
  }, [
    currentStep.displayName,
    hasHeaderViewsFixes,
    hasPendingInspections,
    hasSelectedFiles,
  ]);

  return !showStepBar[currentStep.displayName] ? null : (
    <Container
      className={clsx('Luci-Stepper wrapper')}
      maxWidth='xl'
      sx={{ gridColumn: '1/3' }}
    >
      <Stepper
        className={clsx('Luci-Stepper root')}
        activeStep={currentStep.idx}
      >
        {stepsText.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Container className={classes.footContainer}>
        {/* Navigation */}
        <Container className={classes.navigationContainer}>
          <Card className={classes.navigationCard}>
            <CardActions className={classes.cardActions}>
              {/* Previous */}
              <Button
                className={classes.previousButton}
                // href={getBacktrackLink(indexedSteps, currentStep.idx - 1)}
                startIcon={<PreviousArrow fontSize='small' />}
                onClick={() =>
                  navigate(getBacktrackLink(indexedSteps, currentStep.idx - 1))
                }
              >
                Previous
              </Button>

              {/* Next */}
              <Button
                className={clsx(classes.nextButton, {
                  [classes.disabled]: isNextStepDisabled(currentStep),
                })}
                // href={nextHref()}
                endIcon={<NextArrow fontSize='small' />}
                onClick={() => handleNextStep()}
              >
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
    nextButton: PropTypes.string,
    previousButton: PropTypes.string,
    root: PropTypes.string,
    stepper: PropTypes.string,
    disabled: PropTypes.string,
  }).isRequired,
  steps: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  hasHeaderViewsFixes: PropTypes.bool.isRequired,
  hasPendingInspections: PropTypes.bool.isRequired,
  hasSelectedFiles: PropTypes.bool.isRequired,
};
StepBarComponent.defaultProps = {};

export default withStyles(styles)(StepBarComponent);
