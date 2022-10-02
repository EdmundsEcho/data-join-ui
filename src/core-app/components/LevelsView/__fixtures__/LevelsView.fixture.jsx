import React, { useRef, useState, useEffect } from 'react';

import { ErrorBoundary } from 'react-error-boundary';
// import { FixedSizeList as List } from 'react-window';

import ConsoleLog from '../../shared/ConsoleLog';

// import LevelsView from '../index.container';
// import { PURPOSE_TYPES } from '../../../lib/sum-types';
import { getFileLevels as getLevels } from '../../../services/api';
import stateField from './state-field.json';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role='alert'>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
}

const rxField = {
  idx: 4,
  name: 'NRx Count',
  purpose: 'mcomp',
  levels: [],
  'map-symbols': {
    arrows: {},
  },
  format: null,
  'null-value-expansion': null,
  'map-files': null,
  sources: [
    {
      enabled: true,
      'source-type': 'RAW',
      'header-idx': 7,
      'default-name': 'NRx Count',
      'field-alias': 'NRx Count',
      purpose: 'mcomp',
      'null-value': null,
      format: null,
      'map-symbols': {
        arrows: {},
      },
      levels: [],
      nlevels: 31,
      nrows: 2998,
      filename: '/Users/edmund/Desktop/data/productA_Units.csv',
      'null-value-count': 0,
      'map-weights': {
        arrows: {},
      },
    },
  ],
  'map-weights': {
    arrows: {},
  },
};

/* eslint-disable no-console */
function buildSources(field) {
  return (
    field?.sources.map((source) => ({
      filename: source.filename,
      headerIndex: source['header-idx'],
    })) ?? []
  );
}

// const Row = ({ value }) => <div>Row {JSON.stringify(value)}</div>;

const Components = () => {
  const cacheRef = useRef([]);

  const field = stateField;
  const [page, setPage] = useState(() => 0);
  const [cacheSize, setCacheSize] = useState(() => cacheRef.current.length);
  const MAX_LEVELS = 44;
  const MAX_PAGES = Math.ceil(44 / 15);

  console.log(`Max pages: ${MAX_PAGES}`);
  const sources = buildSources(field);

  useEffect(() => {
    const atCapacity =
      cacheRef.current.length >= MAX_LEVELS || page === MAX_PAGES;
    if (!atCapacity) {
      getLevels({
        sources,
        purpose: field.purpose,
        arrows: {},
        page: page + 1,
        limit: 15,
      }).then(({ data }) => {
        cacheRef.current = [
          ...(cacheRef.current || []),
          ...(data?.results ?? []).map((level) => [level.value, level.count]),
        ];
        setCacheSize(cacheRef.current.length);
      });
      setPage(page + 1);
    }
  }, [MAX_LEVELS, MAX_PAGES, field.purpose, page, sources]);

  // <LevelsView field={field} />

  return (
    <div style={{ width: '300px', margin: '20px' }}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ConsoleLog
          value={cacheRef.current}
          cacheSize={cacheSize}
          advancedView
        />
      </ErrorBoundary>
    </div>
  );
};
const fixtures = <Components />;

export default fixtures;
