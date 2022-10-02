import React, { useMemo } from 'react';

import { useSelector, shallowEqual } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';

import EtlUnitMeas from '../EtlUnitMeas';
import TableCellTrash from '../shared/TableCellTrash';

import ConsoleLog from '../shared/ConsoleLog';

import {
  getEtlUnits,
  getEtlFields,
  getFieldsKeyedOnPurpose,
  getMeaEtlUnits,
} from '../../ducks/rootSelectors';
import { PURPOSE_TYPES } from '../../lib/sum-types';

/* eslint-disable no-console */

const trash = (fieldName, purpose) => (
  <TableCellTrash
    fieldName={fieldName}
    purpose={purpose}
    handleDelete={() => {
      console.log(`Delete field: ${fieldName}`);
    }}
  />
);

const CompWithStyles = () => {
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
  const etlFields = useSelector(getEtlFields, shallowEqual);
  const etlUnits = useSelector(getEtlUnits, shallowEqual);
  const meaEtlFields = Object.values(etlFields).filter(
    (fld) => fld.purpose === PURPOSE_TYPES.MVALUE,
  );
  const meaEtlUnits = useSelector(getMeaEtlUnits, shallowEqual);
  /*
function EtlUnits({
  classes,
  enableAddNewField, // func
  etlUnitFieldsData,
  handleOpenNewCompDialog,
  meaEtlFields,
  meaEtlUnits,
  meaRelatedEtlFields, // 📖
  mkTimeSpan,
  onRowSelect,
  selectedFieldName,
  tableCellTrash,
}) {
*/
  return (
    <div style={{ margin: '20px', width: '300px' }}>
      <EtlUnitMeas
        etlFields={etlFields}
        etlUnits={etlUnits}
        meaEtlFields={meaEtlFields}
        meaEtlUnits={meaEtlUnits}
        meaRelatedEtlFields={meaRelatedEtlFields}
        selectedFieldIdx={3}
        onRowSelect={() => {}}
        onOpenNewCompDialog={() => {}}
        enableAddNewField={() => {}}
        selectedFieldName='NPI'
        tableCellTrash={trash}
      />
      <p />
      <ConsoleLog value={meaRelatedEtlFields} advancedView />
    </div>
  );
};

export default <CompWithStyles />;
