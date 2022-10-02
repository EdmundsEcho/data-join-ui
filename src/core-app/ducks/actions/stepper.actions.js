import { makeActionCreator } from '../../utils/makeActionCreator';

export const STEPPER = '[Stepper]';
export const SET_CURRENT_PAGE = `${STEPPER} SET_CURRENT_PAGE`;
export const SET_BOOKMARK = `${STEPPER} SET_BOOKMARK`;

// document
export const setCurrentPage = (payload) => ({
  type: SET_CURRENT_PAGE,
  payload,
});

// document
export const bookmark = (payload) => ({
  type: SET_BOOKMARK,
  payload,
});
