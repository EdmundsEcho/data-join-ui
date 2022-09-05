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
// See the theme overrides for other formatting options
const gridOptions = {
  headerHeight: 85,
  rowHeight: 35,
  disableColumnMenu: true,
};
//----------------------------------------------------------------------------
/**
 * @component
 */
function MatrixGrid({ matrix /* first 100 used to seed */ }) {
  /* eslint-disable react/jsx-props-no-spreading */

  // read the first sample of the data to configure
  // the grid columns.
  const { columns } = fromMatrixApi(matrix);
  const { projectId } = useParams();

  return (
    <ValueGridCore
      className={clsx('Luci-ValueGrid-matrix')}
      columns={columns}
      identifier='matrix'
      purpose='matrix'
      fetchFn={fetchLevels(projectId)}
      normalizer={normalizer(rowsFn)}
      edgeToGridRowFn={identityFn}
      edgeToIdFn={({ subject }) => subject}
      baseSelectAll={{}}
      feature='LIMIT'
      limitRowCount={17}
      pageSize={100}
      DEBUG={false}
      {...gridOptions}
    />
  );
}

MatrixGrid.propTypes = {
  matrix: PropTypes.shape({}).isRequired,
};

MatrixGrid.defaultProps = {};

export default MatrixGrid;
