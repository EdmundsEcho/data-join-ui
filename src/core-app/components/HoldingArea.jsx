// src/components/HoldingArea.jsx

/**
 *
 * @description
 * The HoldingArea component is a general-purpose component used as an
 * intermediary step while a long-running job is processing. This can be used
 * to display information to the user or just ensure they cannot make
 * additional changes to data that may cause inconsistencies in state.
 *
 * 🚧 This needs to be reviewed in context of the StepBar and generally
 *    navigating through the app.
 *
 * @module src/components/HoldingArea
 *
 */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  isLoading,
  getPendingRequests,
  getEtlFieldCount,
} from '../ducks/rootSelectors';

import LoadingSplash from './LoadingSplash';

/* eslint-disable no-shadow */
const HoldingArea = (/* props */) => {
  const [prevJobs, setPrevJobs] = useState();
  const navigate = useNavigate();

  // 📖
  const { isLoading: uiLoading } = useSelector(isLoading);
  const pendingJobs = useSelector(getPendingRequests);
  const etlFieldCount = useSelector(getEtlFieldCount);

  // 🚧 scrappy: works for workbench
  useEffect(() => {
    // if (prevJobs && prevJobs.length > pendingJobs.length) {
    if (!uiLoading) {
      navigate('/workbench');
    }

    setPrevJobs(pendingJobs);
  }, [navigate, pendingJobs, prevJobs, uiLoading]);

  return (
    <LoadingSplash
      title='Building Fields'
      message={`Processing ${etlFieldCount} Fields`}
    />
  );
};

HoldingArea.propTypes = {};

export default HoldingArea;
