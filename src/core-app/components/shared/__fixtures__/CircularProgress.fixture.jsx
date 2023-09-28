import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '../CircularProgress';

/* eslint-disable no-await-in-loop */

// const sleep = (m) =>
//   new Promise((r) => {
//     setTimeout(r, m);
//   });

// async function countUpTo(n, callback) {
// for (const value of [...Array(n).keys()]) {
//   await sleep(100);
//   callback(value);
// }
// }
const Component = () => {
  // const [progress, setProgress] = React.useState(() => 0);
  // countUpTo(100, setProgress);
  return (
    <Box
      style={{
        display: 'flex',
        width: '200px',
        margin: '20px',
        justifyContent: 'center',
      }}>
      <CircularProgress value={90} size={80} thickness={4} variant='h5' />
    </Box>
  );
};

export default Component;
