import React, { useMemo } from 'react';

import { useSelector } from 'react-redux';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { useSelect } from 'react-cosmos/client';

import TableCellTrash from '../TableCellTrash';
import EtlUnitParameter from '../EtlUnitParameter';

import ConsoleLog from '../ConsoleLog';

import { getFieldsKeyedOnPurpose } from '../../../ducks/rootSelectors';

/* eslint-disable no-console */

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

  // cosmos
  const [selectedFieldName] = useSelect('select field', {
    options: meaRelatedEtlFields.map((fld) => fld.name),
  });
  const [detailViewField] = useSelect('is in the detail view (not shown)', {
    options: meaRelatedEtlFields.map((fld) => fld.name),
  });
  /* eslint-disable no-shadow, no-param-reassign */
  const data = meaRelatedEtlFields.reduce((data, fld, rowId) => {
    data[fld.name] = { field: { name: fld.name }, rowId };
    return data;
  }, {});

  const trash = (fieldName, purpose) => (
    <TableCellTrash
      fieldName={fieldName}
      purpose={purpose}
      handleDelete={() => {
        console.log(`Delete field: ${fieldName}`);
      }}
    />
  );
  return (
    <>
      <Table>
        <TableBody>
          <EtlUnitParameter
            data={data[selectedFieldName]}
            selectedFieldName={detailViewField}
            handleClick={() => {
              console.log(`Update parent's active field: ${selectedFieldName}`);
            }}
            tableCellTrash={trash}
          />
        </TableBody>
      </Table>
      <p />
      <ConsoleLog value={data} advancedView />
    </>
  );
};

/* eslint-disable */
export default <CompWithStyles />;
