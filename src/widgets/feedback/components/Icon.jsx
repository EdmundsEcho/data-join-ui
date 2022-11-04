import * as React from 'react';

export const Icon = (props) => (
  <svg
    width={16}
    height={17}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}>
    <path
      d='m12.5 3.625-9 9M12.5 12.625l-9-9'
      stroke='#fff'
      strokeOpacity={0.4}
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
