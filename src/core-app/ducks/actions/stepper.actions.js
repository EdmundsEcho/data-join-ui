import { makeActionCreator } from '../../utils/makeActionCreator';

export const TYPES = {
  ADD_JOB: 'stepper/ADD_JOB',
  ENABLE_NEXT_STEP: 'stepper/ENABLE_NEXT_STEP',
  DISABLE_NEXT_STEP: 'stepper/DISABLE_NEXT_STEP',
  ENABLE_PREV_STEP: 'stepper/ENABLE_PREV_STEP',
  DISABLE_PREV_STEP: 'stepper/DISABLE_PREV_STEP',
  HIDE: 'stepper/HIDE',
  SHOW: 'stepper/SHOW',
  REGISTER_NEXT_STEP: 'stepper/REGISTER_NEXT_STEP',
};

export const addJob = makeActionCreator(TYPES.ADD_JOB, 'job');
export const enableNextStep = makeActionCreator(TYPES.ENABLE_NEXT_STEP);
export const disableNextStep = makeActionCreator(TYPES.DISABLE_NEXT_STEP);
export const enablePrevStep = makeActionCreator(TYPES.ENABLE_PREV_STEP);
export const disablePrevStep = makeActionCreator(TYPES.DISABLE_PREV_STEP);
export const hideStepper = makeActionCreator(TYPES.HIDE);
export const showStepper = makeActionCreator(TYPES.SHOW);
export const registerNextStep = makeActionCreator(
  TYPES.REGISTER_NEXT_STEP,
  'nextStep',
);
