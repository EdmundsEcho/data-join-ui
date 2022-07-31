/**
 * @module
 * Hosts the callbacks for the UI that utilizes the form-child-machine.
 */

/**
 * @callback
 * Save - cleans up the resources.
 * @param {function} send
 * @return {function}
 */
export const save = (send) => () => {
  send('SAVE');
};
/**
 * @callback
 * Caches the input
 * @param {object} machineState
 * @return {function}
 */
export const onChange = (send) => (e) => {
  send({
    type: 'ADD_CHANGE',
    payload: {
      key: e.target.name,
      value: e.target.value,
    },
  });
};
/**
 * @callback
 * onBlur: commits the non-null/empty input
 * @param {object} machineState
 * @return {function}
 */
export const onBlur = (send) => () => {
  send('COMMIT');
};
/**
 * @callback
 * Enter key: commits the non-null/empty input
 * @param {object} machineState
 * @return {function}
 */
export const commit = (send) => (e) => {
  if (e.key === 'Enter') {
    send('COMMIT');
  }
};
/**
 * @callback
 * resets the content of the field input.
 * @param {function} send
 * @param {object} machineState
 * @return {function}
 */
export const clear = (send) => (e) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    send('CLEAR');
  }
};
/**
 * @callback
 * Returns true if in a save ready state.
 * @param {object} machineState
 * @return {boolean}
 */
export const isReadyToSave = (machineState) => {
  return !machineState.matches('ready.changed.clean');
};
/**
 * @callback
 * Disable/enable field prop: Sets the value of the message type.
 * @param {function} send
 * @param {object} machineState
 * @return {function}
 */
export const toggleExclude = (send, machineState) => () => {
  const actionType = machineState.matches('included') ? 'EXCLUDE' : 'INCLUDE';
  send(actionType);
};
