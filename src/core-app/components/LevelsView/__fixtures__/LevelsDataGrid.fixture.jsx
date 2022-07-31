import React, { useEffect } from 'react';
import { DataGridPro as XGrid } from '@mui/x-data-grid-pro';

import { getLevels as innerGetLevels } from '../../../services/api';
import stateField from './state-field.json';

function buildSources(field) {
  return (
    field?.sources.map((source) => ({
      filename: source.filename,
      'header-index': source['header-idx'],
    })) ?? []
  );
}

const data = {
  columns: [
    { field: 'level', headerName: 'Value', flex: 1 },
    { field: 'count', headerName: 'Count', width: 50 },
  ],
  rowLength: 44,
  maxColumns: 3,
};

async function getLevels(field, page, limit = 15) {
  /* eslint-disable-next-line no-shadow */
  const { data } = await innerGetLevels({
    sources: buildSources(field),
    purpose: field.purpose,
    arrows: {},
    page,
    limit,
  });

  return (data?.results ?? []).map((level, id) => ({
    id,
    level: level.value,
    count: level.count,
  }));
}

const Component = () => {
  const PAGE_SIZE = 10;
  const MAX_ROWS = 44;
  const MAX_PAGES = Math.ceil(MAX_ROWS / PAGE_SIZE);
  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState([]);
  const [dataWindow, setDataWindow] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  /* eslint-disable-next-line no-shadow */
  const handlePageChange = ({ page }) => {
    // setPage(page);
    setDataWindow(rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const newRows = await getLevels(stateField, page + 1);
      setLoading(false);

      if (mounted && page === 0) {
        setDataWindow(newRows);
      }

      if (mounted && page < MAX_PAGES) {
        setRows([...rows, ...newRows]);
        setPage(page + 1);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [MAX_PAGES, page, rows]);

  return (
    <div style={{ height: 360, width: '100%' }}>
      <XGrid
        rows={dataWindow}
        rowHeight={24}
        columns={data.columns}
        pagination
        pageSize={PAGE_SIZE}
        rowCount={MAX_ROWS}
        paginationMode='server'
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
};

const fixtures = <Component />;

export default fixtures;
