import React from 'react';
import clsx from 'clsx';

import { useSelector } from 'react-redux';
import { useGridApiRef } from '@mui/x-data-grid-pro';

// 📖
import { selectHeaderView } from '../../../ducks/rootSelectors';

import ValueGridInner, {
  filterOperators,
  gridHeightFn,
  ROW_HEIGHT,
} from '../ValueGridInner';
import { toGrid } from '../ValueGridCore';
import {
  columns,
  edgeToGridRowFn,
  edgeToIdFn,
  parseRespData,
} from '../ValueGridFileLevels';
import initialState from '../../../datasets/store_s3_v7.json';
import cache from '../../../datasets/levels_specialty.json';
import ConsoleLog from '../ConsoleLog';

/* eslint-disable no-console, no-shadow, react/prop-types */

// required to update the SymbolMapMaker
const filename =
  '/shared/datafiles/24c4bb67-2357-4cc0-a9ce-6280d8359999/dropbox/4bdff8/lE0WdposqDkAAAAAABppzw/productA_Units.csv';
const headerIdx = 1;

const projectId = '24c4bb67-2357-4cc0-a9ce-6280d8359999';
const className = 'Luci-ValueGrid-fileLevels';

const MAX_ROWS = 32;
const data = {
  cache: parseRespData(cache),
  status: 'fulfilled',
};
const limitGridHeight = 9 * ROW_HEIGHT;
const HEADER_HEIGHT = 33;
const FOOTER_HEIGHT = 24;
const ADJUST_HEIGHT = 0;

const toGridFn = toGrid(edgeToIdFn, edgeToGridRowFn);
const { rows } = toGridFn(data.cache, {
  totalCount: MAX_ROWS,
  selectionModel: [],
  type: 'levels',
});

// -----------------------------------------------------------------------------
const Component = ({ hideConsole }) => {
  const apiRef = useGridApiRef();

  const qualityField = selectHeaderView(initialState, filename).fields[headerIdx];

  /*
      <ValueGridFileLevels
        getValue={(prop) => qualityField[prop]}
        fieldType={FIELD_TYPES.FILE}
      />
      */
  return (
    <div style={{ margin: '30px' }}>
      <ConsoleLog value={qualityField} advancedView collapsed={hideConsole} />

      <ValueGridInner
        apiRef={apiRef}
        className={className}
        rowClassName={clsx(className, 'row')}
        columnClassName={clsx(className, 'column')}
        columns={columns}
        rows={rows}
        MAX_ROWS={MAX_ROWS}
        gridHeightProp={gridHeightFn(
          MAX_ROWS,
          limitGridHeight,
          ROW_HEIGHT,
          HEADER_HEIGHT,
          ADJUST_HEIGHT,
        )}
        rowHeight={ROW_HEIGHT}
        headerHeight={HEADER_HEIGHT}
        error={null}
        onRowsScrollEnd={() => {}}
        rowBuffer={15}
        loading={data.status === 'pending' ?? true}
        // user input
        checkboxSelection={false}
        onRowClick={() => {}}
        onToggleAll={() => {}}
        tabindex='-1'
        // filtering
        onFilterModelChange={() => {}}
        handleClearFilter={() => {}}
        inFilterState={false}
        resetFn={() => {}}
      />
    </div>
  );
};

const fixtures = <Component />;
export default fixtures;
