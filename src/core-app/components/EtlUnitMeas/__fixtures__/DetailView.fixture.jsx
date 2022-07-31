import React, { useMemo } from 'react';
import { useSelect } from 'react-cosmos/fixture';
import { useSelector, shallowEqual } from 'react-redux';

// 📖 data
import {
  getFieldsKeyedOnPurpose,
  getMeaEtlUnits,
  getEtlFields,
} from '../../../ducks/rootSelectors';
import { PURPOSE_TYPES } from '../../../lib/sum-types';

import DetailView from '../DetailView';
import TableCellTrash from '../../shared/TableCellTrash';
import ConsoleLog from '../../shared/ConsoleLog';

/* eslint-disable no-console */

const Component = () => {
  // 📖 ... at some point, render each independently.
  const fieldsKeyedOnPurpose = useSelector(
    (state) => getFieldsKeyedOnPurpose(state, true), // useLean sources
  );

  const meaRelatedEtlFields = useMemo(
    () => [
      ...fieldsKeyedOnPurpose.mvalue,
      ...fieldsKeyedOnPurpose.mcomp,
      ...fieldsKeyedOnPurpose.mspan,
    ],
    [
      fieldsKeyedOnPurpose.mvalue,
      fieldsKeyedOnPurpose.mcomp,
      fieldsKeyedOnPurpose.mspan,
    ],
  );

  const meaEtlUnits = useSelector(getMeaEtlUnits, shallowEqual);
  const etlFields = useSelector(getEtlFields, shallowEqual);
  // const etlUnits = useSelector(getEtlUnits, shallowEqual);

  // measurements
  const meaEtlFields = Object.values(etlFields).filter(
    (fld) => fld.purpose === PURPOSE_TYPES.MVALUE,
  );

  // components and mspan values for a given measurement
  const etlUnitFieldsData = (mvalueName) => {
    return [
      meaEtlUnits[mvalueName].mspan,
      ...meaEtlUnits[mvalueName].mcomps,
    ].map((meaRelatedFieldName) =>
      meaRelatedEtlFields.find((field) => field.name === meaRelatedFieldName),
    );
  };
  const handleClick = (fieldName) => {
    console.log(`Display the detail view on the right for field: ${fieldName}`);
  };

  // cosmos
  const [measurement] = useSelect('measurement', {
    options: meaEtlFields.map((fld) => fld.name),
  });
  const [selectedField] = useSelect('selected field', {
    options: meaRelatedEtlFields.map((fld) => fld.name),
  });
  return (
    <>
      <DetailView
        meaRelatedFields={etlUnitFieldsData(measurement)}
        handleClick={handleClick}
        selectedFieldName={selectedField}
        tableCellTrash={(fieldName, purpose) => (
          <TableCellTrash
            fieldName={fieldName}
            purpose={purpose}
            handleDelete={() => {
              console.log(`Delete field: ${fieldName}`);
            }}
          />
        )}
      />
      <p />
      <ConsoleLog value={meaEtlFields} advancedView />
    </>
  );
};

const fixtures = <Component />;

export default fixtures;
