import { makeActionCreator } from '../../utils/makeActionCreator';

export const TYPES = {
  FETCH_LEVELS_START: 'levels/FETCH_LEVELS_START',
  FETCH_LEVELS_SUCCESS: 'levels/FETCH_LEVELS_SUCCESS',
  FETCH_LEVELS_FAIL: 'levels/FETCH_LEVELS_FAIL',
};

export const fetchLevels = makeActionCreator(
  TYPES.FETCH_LEVELS_START,
  'filenames',
  'fieldIdx',
  'arrows',
);
export const fetchLevelsSuccess = makeActionCreator(
  TYPES.FETCH_LEVELS_SUCCESS,
  'levels',
);
export const fetchLevelsFail = makeActionCreator(
  TYPES.FETCH_LEVELS_FAIL,
  'error',
);
