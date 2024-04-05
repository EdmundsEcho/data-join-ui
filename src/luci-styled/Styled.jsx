/**
 * use these in combination with the lucivia theme to
 * customize the display using classname.
 */

import { styled } from '@mui/material/styles';

export const Div = styled('div', {
  name: 'LuciDiv',
  slot: 'root',
})({});

export const Span = styled('span', {
  name: 'LuciSpan',
  slot: 'root',
})({});
