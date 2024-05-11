// src/components/Matrix/MatrixGrid.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import LevelsContextProvider, { CONTEXTS } from '../../contexts/LevelsDataContext';
import ValueGridCore, { SERVICES } from '../shared/ValueGridCore';
import {
  fetchRenderedMatrixWithProjectId as fetchLevels,
  matrixPaginationNormalizer as normalizer,
} from '../../services/api';

//----------------------------------------------------------------------------
// Static utilized by MatrixGrid
//----------------------------------------------------------------------------
const PAGE_SIZE = 1000;

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
    minWidth: 70,
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
const lineHeight = 18;
const numberOfLines = 4;
const padding = 11;

const gridOptions = {
  columnHeaderHeight: lineHeight * numberOfLines + padding,
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
      className={clsx('Luci-DataGrid-matrix')}
      columns={columns}
      identifier='matrix'
      purpose='matrix' // todo: avoid using purpose for this reason
      fetchFn={fetchLevels({
        projectId,
        signal: abortController.signal,
        limit: PAGE_SIZE,
      })}
      abortController={abortController}
      normalizer={normalizer(rowsFn)}
      edgeToGridRowFn={identityFn}
      edgeToIdFn={({ subject }) => subject}
      filter={{}}
      limitGridHeight={gridHeight}
      service={SERVICES.GRAPHQL}
      pageSize={PAGE_SIZE}
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

export default function MatrixGridWithContext(props) {
  return (
    <LevelsContextProvider purpose='matrix' context={CONTEXTS.MATRIX}>
      <MatrixGrid {...props} />
    </LevelsContextProvider>
  );
}
