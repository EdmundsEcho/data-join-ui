import React, { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';
import ConsoleLog from '../ConsoleLog';
// api
import { fetchLevels } from '../../../services/api';

import data from '../../../datasets/store-headerviews_v2.json';

/* eslint-disable no-console, no-shadow */

const field = Object.values(data.headerView.headerViews)[0].fields.find(
  (fld) => fld.enabled && fld.purpose === 'mvalue',
);

const Component = () => {
  //
  // local state
  //
  const [data, setData] = useState(() => undefined);

  useEffect(() => {
    let isMounted = true;
    fetchLevels({
      filter: {
        componentName: 'payer',
        measurementType: 'm_rxcount',
        filterTxt: 'A',
        // qualityName: 'q_specialty',
      },
      first: 5,
    })
      .then((response) => {
        if (!isMounted) {
          return;
        }
        const { data } = response;
        setData(data);
      })
      .catch((error) => {
        setData(error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ width: '300px', margin: '30px' }}>
      <Typography>Field data</Typography>
      <ConsoleLog value={field} advancedView />
      <p />
      <Typography>Levels for a specific qual or comp</Typography>
      <ConsoleLog value={data} advancedView />
    </div>
  );
};

export default <Component testProp />;
