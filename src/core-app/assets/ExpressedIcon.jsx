import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

/* eslint-disable react/jsx-props-no-spreading */

const ExpressedIcon = (props) => (
  <SvgIcon
    width='60'
    height='60'
    viewBox='0 0 60 60'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}>
    <rect
      x='12.5'
      y='1.5'
      width='46'
      height='46'
      rx='4.5'
      fill='white'
      stroke='black'
      strokeWidth='3'
    />
    <rect
      x='1.5'
      y='12.5'
      width='46'
      height='46'
      rx='4.5'
      fill='white'
      stroke='black'
      strokeWidth='3'
    />
  </SvgIcon>
);

export default ExpressedIcon;
