/**
 * @description
 * Custom hook
 * Recieves a configuration object
 * Usage
 * <Machine config={ config }>
 *  ({state, send}) => (
 *     <div>
 *       ...
 *     </div>
 *  )
 *  </Machine>
 *
 *  ---
 *  set-up Machine
 *
 *  return props.children({
 *    state, send
 *  })
 */

import { useMachine, useActor } from '@xstate/react';
import formMachine, { initialContext } from '../machines/form-machines/form-machine';

const formCallbacks = (send) => ({
  send,
  save: () => {
    send('SAVE');
  },
  reset: () => {
    send('CANCEL');
  },
});

/**
 * Child machine
 */
export const useFieldMachine = (fieldRef) => {
  const [machineState, send] = useActor(fieldRef);

  const getValue = (name) => machineState.context.changes[name];
  const isExcluded = () => !getValue('enabled');

  /**
   * @function
   * @param {object} machineState
   */
  const onChange = (e) => {
    send({
      type: 'ADD_CHANGE',
      payload: {
        key: e.target.name,
        value: e.target.value,
      },
    });
  };
  /**
   * simultaneously add and saves a change.
   * @function
   */
  const saveChange = (e) => {
    send({
      type: 'SAVE_CHANGE',
      payload: {
        key: e.target.name,
        value: e.target.value,
      },
    });
  };
  /**
   * commits the non-null/empty input
   * @function
   */
  const onBlur = () => {
    send('COMMIT');
  };
  /**
   * @function
   * Enter key: commits the non-null/empty input
   */
  const commit = (e) => {
    if (e.key === 'Enter') {
      send('COMMIT');
    }
  };
  /**
   * resets the content of the field input.
   * @function
   */
  const clear = (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      send('CLEAR');
    }
  };
  /**
   * Disable/enable field prop: Sets the value of the message type.
   * @function
   * @param {object} machineState
   */
  const toggleExclude = () => {
    const actionType = machineState.matches('included') ? 'EXCLUDE' : 'INCLUDE';
    send(actionType);
  };

  /* The machine interface: */
  return {
    isExcluded,
    getValue,
    toggleExclude,
    onChange,
    saveChange,
    onBlur,
    clear,
    commit,
    state: machineState.value,
  };
};

/**
 * Parent, form machine
 */
export const useFormMachine = ({ update, reset, data, dataId, fieldId, debug }) => {
  console.assert(
    typeof update === 'function',
    `useFormMachine did not recieve a valid update function: ${typeof update}`,
  );

  /* eslint-disable no-shadow */
  const config = formMachine.withConfig(
    {
      actions: {
        // fn:: (context, event) => { ... }
        addUpdate: ({ id: formId }, { payload: { id: fieldId, key, value } }) =>
          update(formId, fieldId, key, value),
        includeField: ({ id: formId }, { payload: { id: fieldId } }) =>
          update(formId, fieldId, 'enabled', true),
        excludeField: ({ id: formId }, { payload: { id: fieldId } }) =>
          update(formId, fieldId, 'enabled', false),
        reset: ({ id: formId, fields }) => reset(formId, fields),
      },
    },

    // initial context with a slice from redux
    initialContext({
      id: dataId,
      fieldMachines: data.fields.map((field) => ({
        id: field[fieldId],
        view: field,
      })),
      debug,
    }),
  );

  const [state, send] = useMachine(
    config,
    debug ? console.log : () => {}, // logger
  );

  // formState: { state, errorState, saveState },
  // formCallbacks: { send, reset, save },

  return {
    formState: {
      state,
      errorState: () => state.matches('error'),
      saveState: () => state.matches('ready.changed.clean'),
    },
    formCallbacks: {
      ...formCallbacks(send),
    },
    fieldMachines: state.context.fieldMachines,
  };
};
