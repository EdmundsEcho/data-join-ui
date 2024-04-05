import React, { useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import {
  DataGridPro as DataGrid,
  getGridStringOperators,
} from '@mui/x-data-grid-pro';

import Typography from '@mui/material/Typography';

// cosmos
import { useSelect } from 'react-cosmos/client';
import { getTreeValuesOptions } from '../../../cosmos/tree-data-utils';

import ErrorBoundary from '../ErrorBoundary';
import ConsoleLog from '../ConsoleLog';
// api
import { fetchLevels } from '../../../services/api';
import { usePagination } from '../../../hooks/use-pagination';

/* eslint-disable no-console, no-shadow, react/prop-types */

const rowsFromData = (levels) => {
  if (levels) {
    return (
      levels?.edges?.map(({ node, cursor }) => ({
        id: cursor,
        level: node.level,
      })) ?? []
    );
  }
  return [];
};

// 3 filter operators for levels
const filterOperators = getGridStringOperators().filter(({ value }) =>
  ['contains', 'endsWith', 'startsWith'].includes(value),
);
const columns = [
  { field: 'level', headerName: 'Level', flex: 1, filterOperators },
];

const parseResponse = (response) => response.data.levels;

// -----------------------------------------------------------------------------
//
const Component = ({ measurementType, identifier }) => {
  //
  const ROWS_PER_PAGE = 7;

  const filter = useMemo(() => {
    return typeof measurementType === 'undefined'
      ? { qualityName: identifier }
      : { componentName: identifier, measurementType };
  }, [identifier, measurementType]);

  const { setPageSize, setFilter, data } = usePagination({
    feature: 'SCROLL',
    fetchFn: fetchLevels,
    normalizer: parseResponse,
    pageSize: ROWS_PER_PAGE,
    filter,
  });

  // DataGrid filter model
  const handleFilterModelChange = useCallback(
    ({ filterModel }) => {
      const mkFilter = ({ operatorValue, value }) => ({
        fieldName: operatorValue,
        value,
      });
      const newFilter =
        filterModel.items
          .filter(({ value }) => typeof value !== 'undefined')
          .map(mkFilter) ?? 'empty';

      setFilter(
        newFilter.reduce(
          (acc, item) => {
            acc[item.fieldName] = item.value;
            return acc;
          },
          { ...filter },
        ),
      );
    },
    [filter, setFilter],
  );

  const [selectionModel, setSelectionModel] = useState(() => []);

  const handleSelection = ({ selectionModel }) => {
    setSelectionModel(selectionModel);
  };

  return (
    <ErrorBoundary>
      <div style={{ width: '300px', margin: '30px' }}>
        <Typography variant='body2'>
          First version of value grid. See also ValueGridFileLevels.
          <ul>
            <li> Useful showcase of the pagination output</li>
            <li>
              Note: Requires the graphql server be initialized with the
              requested data
            </li>
          </ul>
        </Typography>
        <p />
        <DataGrid
          className={clsx('EtlUnit-ValueGrid')}
          density='compact'
          autoHeight
          autoSize={false}
          rowHeight={40}
          loading={data.status === 'pending' ?? true}
          // pagination
          pagination
          paginationMode='server'
          rowCount={data?.cache?.totalCount ?? 0}
          rows={rowsFromData(data.cache)}
          columns={columns}
          page={data?.cache?.page - 1}
          pageSize={ROWS_PER_PAGE}
          // onPageChange={({ page }) => setPageNumber(page)}
          onPageSizeChange={({ pageSize }) => setPageSize(pageSize)}
          // filtering
          filterRowMode='server'
          onFilterModelChange={handleFilterModelChange}
          // user input
          checkboxSelection
          selectionModel={selectionModel}
          onSelectionModelChange={handleSelection}
        />
        <p />
        <Typography>Cache</Typography>
        <ConsoleLog value={data?.cache ?? {}} expanded advancedView />
      </div>
    </ErrorBoundary>
  );
};

/**
 * Wrapper that augments the component with a data selector
 */
const Fixture = () => {
  // Pull from the cosmos mock store
  const tree = useSelector((state) => state.workbench.tree);
  const options = getTreeValuesOptions(tree);
  const [selectedFilter] = useSelect('Select values', {
    options: Object.keys(options),
  });
  return (
    <Component
      measurementType={options?.[selectedFilter]?.measurementType}
      identifier={options?.[selectedFilter]?.identifier}
    />
  );
};

export default <Fixture />;
