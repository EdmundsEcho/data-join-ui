import React from 'react';

export const Spinner = () => {
  return (
    <div
      sx={{
        mt: '55px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margins: '10px auto',
      }}>
      <i className='spinner spinner-lucivia spinner-lg' />
    </div>
  );
};

export default Spinner;
