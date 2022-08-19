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
import formMachine, { initialContext } from './form-machine';

/* eslint-disable no-console */
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
   * @callback
   * Caches the input
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
   * @callback
   * saveChange: simultaneously add and saves a change.
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
   * @callback
   * onBlur: commits the non-null/empty input
   */
  const onBlur = () => {
    send('COMMIT');
  };
  /**
   * @callback
   * Enter key: commits the non-null/empty input
   */
  const commit = (e) => {
    if (e.key === 'Enter') {
      send('COMMIT');
    }
  };
  /**
   * @callback
   * resets the content of the field input.
   */
  const clear = (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      send('CLEAR');
    }
  };
  /**
   * @callback
   * Disable/enable field prop: Sets the value of the message type.
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
export const useFormMachine = ({
  update,
  reset,
  data,
  dataId,
  fieldId,
  debug,
}) => {
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
