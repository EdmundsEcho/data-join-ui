/**
 * @module /components/StepBar/container
 *
 * @description
 * This design is weak and needs consideration in order to function as
 * needed.
 *
 */

import React from 'react';
import { connect } from 'react-redux';

import StepBarComponent from './component';

import {
  getNumPendingJobs,
  getHasSelectedFiles,
  getHasHeaderViewsFixes,
  // getHasPendingInspections,
  getFeaturesWithPendingDataRequests,
  isStepperHidden,
} from '../../ducks/rootSelectors';

/* eslint-disable react/jsx-props-no-spreading */

const StepBarContainer = (props) => {
  return <StepBarComponent {...props} />;
};

const mapStateToProps = (state) => ({
  steps: state.stepper.steps,
  isHidden: isStepperHidden(state),
  numPendingJobs: getNumPendingJobs(state),
  // file inspection phase
  hasSelectedFiles: getHasSelectedFiles(state),
  hasHeaderViewsFixes: getHasHeaderViewsFixes(state),
  hasPendingInspections:
    getFeaturesWithPendingDataRequests(state)?.inspections?.length > 0 ?? false,
});

export default connect(mapStateToProps)(StepBarContainer);
