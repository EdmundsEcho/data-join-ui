// src/components/DataWrapper.jsx

/**
 * @module components/DataWrapper
 *
 * @description
 * Interface for xstate and redux data sources.
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

// data and callbacks
import { useSourceInterface } from '../hooks/use-file-header-source';
import { useFieldMachine } from '../machines/form-machines/useFormMachine';

import ErrorBoundary from './shared/ErrorBoundary';

/**
 * Top-level export
 *
 * Interface for accessing data for the HeaderViews
 * sources: redux | machine
 *
 * @component
 *
 */
function DataWrapper(props) {
  //
  const {
    filename,
    fieldIdx,
    updateField,
    selector,
    fieldRef,
    children,
  } = props;

  return (
    <ErrorBoundary message='DataWrapper: Something went wrong'>
      {typeof fieldRef !== 'undefined' ? (
        /* Machine version */
        <FieldMachine
          filename={filename}
          fieldIdx={fieldIdx}
          fieldRef={fieldRef}
        >
          {children}
        </FieldMachine>
      ) : (
        /* Redux version */
        <FieldRedux
          filename={filename}
          fieldIdx={fieldIdx}
          updateField={updateField}
          selector={selector}
        >
          {children}
        </FieldRedux>
      )}
    </ErrorBoundary>
  );
}
DataWrapper.propTypes = {
  filename: PropTypes.string.isRequired,
  fieldIdx: PropTypes.number.isRequired,
  updateField: PropTypes.func,
  selector: PropTypes.func,
  fieldRef: PropTypes.shape({}),
  children: PropTypes.func.isRequired,
};
DataWrapper.defaultProps = {
  updateField: undefined,
  selector: undefined,
  fieldRef: undefined,
};

function FieldMachine({ fieldRef, children }) {
  console.assert(
    typeof fieldRef === 'object',
    `DataWrapper is trying to instantiate machine without fieldRef: ${typeof fieldRef}`,
  );
  const machineProps = useSourceInterface(useFieldMachine(fieldRef), undefined);

  // additional props (callbacks)
  const isDisabled = !machineProps.getValue('enabled');

  const excludeField = () => {
    machineProps.saveChange({
      target: {
        name: 'enabled',
        value: !machineProps.getValue('enabled'),
      },
    });
  };

  const saveAlias = (e) => {
    // do nothing if no change
    if (machineProps.getValue('field-alias') === e.target.value) return;

    // reset to default if blank
    if (e.target.value === '') {
      const proxyEvent = {
        target: {
          name: 'field-alias',
          value: machineProps.getValue('header-name'),
        },
      };
      machineProps.saveChange(proxyEvent);
      return;
    }

    // otherwise, update field-alias
    machineProps.saveChange(e);
  };

  return (
    <>{children({ ...machineProps, saveAlias, isDisabled, excludeField })}</>
  );
}

FieldMachine.propTypes = {
  fieldRef: PropTypes.shape({}).isRequired,
  children: PropTypes.func.isRequired,
};

function FieldRedux({ filename, fieldIdx, updateField, selector, children }) {
  // issue: textfields do not update.
  // cause: controlled fields need to get the value from state.
  // solution: I need a state buffer to host the field value prior to it being
  // submitted to the redux store.

  console.assert(
    typeof selector === 'function',
    `DataWrapper is trying to instantiate without selector: ${typeof selector}`,
  );

  const [buffer, setBuffer] = useState('');

  const reduxProps = useSourceInterface(undefined, {
    filename,
    fieldIdx,
    dispatch: useDispatch(),
    updateField,
    field: useSelector((state) => selector(state, filename, fieldIdx)),
    buffer,
    setBuffer,
  });

  console.assert(
    typeof children === 'function',
    `DataWrapper: Wrong children: ${typeof children}`,
  );

  // additional props
  const excludeField = () => {
    reduxProps.saveChange({
      target: {
        name: 'enabled',
        value: !reduxProps.getValue('enabled'),
      },
    });
  };
  // additional props
  const saveAlias = (e) => {
    //
    console.debug('ALIAS saveAlias', e.target.name, e.target.value);
    // do nothing if no change
    if (reduxProps.getValue('field-alias') === e.target.value) return;

    // reset to default if blank
    if (e.target.value === '') {
      const proxyEvent = {
        target: {
          name: 'field-alias',
          value: reduxProps.getValue('header-name'),
        },
      };
      reduxProps.saveChange(proxyEvent);
      return;
    }

    // otherwise, update field-alias
    reduxProps.saveChange(e);
  };

  // additional props
  const isDisabled = !reduxProps.getValue('enabled');

  return (
    <>{children({ ...reduxProps, saveAlias, isDisabled, excludeField })}</>
  );
}

FieldRedux.propTypes = {
  filename: PropTypes.string.isRequired,
  fieldIdx: PropTypes.number.isRequired,
  updateField: PropTypes.func.isRequired,
  selector: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
};

export default DataWrapper;
