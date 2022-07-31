// src/components/Workbench/components/MatrixGrid.jsx

import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import ValueGridCore from '../../shared/ValueGridCore';
import { fetchRenderedMatrix } from '../../../services/api';

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
  const rows = rowsFn(matrix);
  const columns = Object.keys(Object.values(matrix)[0]).map((columnName) => ({
    field: columnName,
    flex: 1,
    headerClassName: 'fieldname',
  }));
  return {
    rows,
    columns: [
      { field: 'subject', headerClassName: clsx('fieldname', 'subject') },
      ...columns,
    ],
  };
  /* eslint-enable no-shadow */
}

/**
 *
 * @param {Object} matrix
 *
 * @component
 */
function MatrixGrid({ matrix }) {
  /* eslint-disable react/jsx-props-no-spreading */

  const { columns } = fromMatrixApi(matrix);
  //----------------------------------------------------------------------------
  // Data grid options
  // See the theme overrides for other formatting options
  const options = {
    headerHeight: 85,
    rowHeight: 35,
    disableColumnMenu: true,
  };

  /*
   * @return cache { totalCount, data: {edges} }
   */
  const normalizer = (raw) => {
    const result = {
      pageInfo: raw.data.payload.pageInfo,
      edges: rowsFn(JSON.parse(raw.data.payload.data)),
      totalCount: raw.data.payload.totalCount,
    };
    return result;
  };

  return (
    <ValueGridCore
      className={clsx('Luci-ValueGrid-matrix')}
      columns={columns}
      identifier='matrix'
      purpose='matrix'
      fetchFn={fetchRenderedMatrix}
      normalizer={normalizer}
      edgeToGridRowFn={(x) => x}
      edgeToIdFn={({ subject }) => subject}
      baseSelectAll={{}}
      feature='LIMIT'
      limitRowCount={17}
      pageSize={30}
      DEBUG={false}
      {...options}
    />
  );
}

MatrixGrid.propTypes = {
  matrix: PropTypes.shape({}).isRequired,
};

MatrixGrid.defaultProps = {};

export default MatrixGrid;
