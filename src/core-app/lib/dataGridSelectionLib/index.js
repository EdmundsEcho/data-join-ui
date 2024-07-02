/**
 * Lib to enable a more user-centric data selection process using
 * the MUI data-grid.
 */

import { useMachine as useMachineInner } from '@xstate/react';
import { noopMachine, createSelectionModelMachine } from './xstate-machine';

export {
  COMPUTATION_TYPES,
  EVENT_TYPES,
  REQUEST_TYPES,
  eqSelectionModels,
  includeCompInSelectFields,
  isSingleValue,
  mkGridSelectionModelFilter,
  mkQualOrCompRequest,
  newSelectionModel,
} from './selectionModel';

export { PURPOSE_TYPES } from '../sum-types';

/**
 * Hook to create a new selection model machine.
 * Set the initial context here or using the init and resume event types.
 * @param {function} handleSetSelectionModel - The function to call when the selection model changes.
 * @param {Object} initialContext - The initial context for the machine.
 * @returns {Array} An array containing the send function and the machine object.
 */
export const useMachine = ({
  handleSetSelectionModel,
  turnOn = true,
  initialSelectionModel = {},
}) => {
  const [, send, machine] = useMachineInner(
    turnOn
      ? () =>
          createSelectionModelMachine(handleSetSelectionModel, initialSelectionModel)
      : noopMachine,
  );

  return [send, machine];
};
