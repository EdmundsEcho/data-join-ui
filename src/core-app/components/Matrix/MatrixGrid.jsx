// src/components/Matrix/MatrixGrid.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import ValueGridCore from '../shared/ValueGridCore';
import {
  fetchRenderedMatrixWithProjectId as fetchLevels,
  matrixPaginationNormalizer as normalizer,
} from '../../services/api';

//----------------------------------------------------------------------------
// Static utilized by MatrixGrid
//----------------------------------------------------------------------------
const identityFn = (x) => x;
function rowsFn(data) {
  return Object.entries(data).reduce((rows, [subject, values]) => {
    rows.push({
      id: subject,
      subject,
      ...values,
    });
    return rows;
  }, []);
}

function fromMatrixApi(matrix) {
  /* eslint-disable no-shadow */
  const columns = Object.keys(Object.values(matrix)[0]).map((columnName) => ({
    field: columnName,
    flex: 1,
    headerClassName: 'fieldname',
  }));
  return {
    columns: [
      { field: 'subject', headerClassName: clsx('fieldname', 'subject') },
      ...columns,
    ],
  };
  /* eslint-enable no-shadow */
}

//----------------------------------------------------------------------------
// Data grid options
//
const gridOptions = {
  headerHeight: 85,
  rowHeight: 35,
  disableColumnMenu: true,
  disableSelectionOnClick: true,
};
//----------------------------------------------------------------------------
/**
 * @component
 */
function MatrixGrid({ matrixPage, gridHeight, abortController }) {
  /* eslint-disable react/jsx-props-no-spreading */

  // read the first sample of the data to configure
  // the grid columns.
  const { columns } = fromMatrixApi(matrixPage);
  const { projectId } = useParams();

  return (
    <ValueGridCore
      className={clsx('Luci-ValueGrid-matrix')}
      columns={columns}
      identifier='matrix'
      purpose='matrix'
      fetchFn={fetchLevels(projectId, abortController.signal)}
      abortController={abortController}
      normalizer={normalizer(rowsFn)}
      edgeToGridRowFn={identityFn}
      edgeToIdFn={({ subject }) => subject}
      baseSelectAll={{}}
      limitGridHeight={gridHeight}
      feature='LIMIT'
      pageSize={100}
      DEBUG={false}
      {...gridOptions}
    />
  );
}

MatrixGrid.propTypes = {
  matrixPage: PropTypes.shape({}).isRequired,
  gridHeight: PropTypes.number.isRequired,
  abortController: PropTypes.shape({
    signal: PropTypes.shape({}),
  }).isRequired,
};

MatrixGrid.defaultProps = {};

export default MatrixGrid;
