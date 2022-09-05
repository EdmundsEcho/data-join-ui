import { makeActionCreator } from '../../utils/makeActionCreator';

export const STEPPER = '[Stepper]';
export const SET_CURRENT_PAGE = `${STEPPER} SET_CURRENT_PAGE`;

export const setCurrentPage = makeActionCreator(
  SET_CURRENT_PAGE,
  'currentPage',
);
