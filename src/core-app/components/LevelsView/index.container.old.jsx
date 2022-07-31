/**
 * @module components/LevelsView/container
 *
 * @description
 * View of levels
 *
 * 🚫 DEPRECATED
 *
 */
import React, { useEffect, useState, useCallback } from 'react';
// import PropTypes from 'prop-types';

import InfiniteLoader from 'react-window-infinite-loader';
import { FixedSizeList as List } from 'react-window';

// import LevelsViewComponent from './component';
// import { fetchLevels } from '../../ducks/actions/levels.actions';
import { getLevels } from '../../services/api';
import { trySpanEnabledField } from '../../lib/filesToEtlUnits/transforms/span/span-levels';
import LevelSpans from './LevelSpans';

/**
 *
 * Returns an array of filenames for a given field
 * @param {object} field
 */
const buildFilenames = (field) => {
  if (field.filename) return [field.filename];
  return field.sources.map((source) => source.filename);
};

/**
 *
 * @param {object} field
 *
 */
const buildIndexes = (field) => {
  if (field.filename) return [field['header-idx']];
  return field.sources.map((source) => source['header-idx']);
};

const getArrows = (source) => {
  if (source['map-symbols'] && source['map-symbols'].arrows) {
    return source['map-symbols'].arrows;
  }
  return {};
};

/**
 * Returns:: { 'map-symbols' }
 */
const buildArrows = (field) => {
  if (!field.sources) return getArrows(field);
  if (field.sources.length === 0) return {};

  // 1. retrieve the { map-symbols } prop from each of the sources :: []
  // 2. combine all of the map-symbols, reducing to single key value
  // TODO: this could overwrite a value in the event the user specified
  // different values for the same key... done in separate files (sources).
  return field.sources.map(getArrows).reduce((allArrows, arrows) => {
    return {
      ...allArrows,
      ...arrows,
    };
  });
};

// TODO: EtlForm is re-mounting this component unnecessarily.
const LevelsView = ({ field }) => {
  // We attempt to use the nlevels property in the field or use a huge number for infinite scrolling
  const NUMBER_OF_RESULTS = field.nlevels || 99999999;
  const RESULTS_PER_PAGE = 100;
  const [localLevels, setMyLevels] = useState([]);
  // eslint-disable-next-line
  const [isFetching, setIsFetching] = useState(false);
  const [itemCount, setItemCount] = useState(NUMBER_OF_RESULTS);
  // const listRef = useRef ();

  const filenames = buildFilenames(field);
  const fieldIndexes = buildIndexes(field);
  const arrows = buildArrows(field);

  const getMoreLevels = useCallback(
    async (append = false, page = 1, limit = 100) => {
      console.log('loading', page, limit);
      console.log('here');

      setIsFetching(true);

      const { data } = await getLevels(
        filenames,
        fieldIndexes,
        field.purpose,
        arrows,
        page,
        limit,
      );

      setIsFetching(false);

      const { results = [] } = data; // setting to [] seems redundant with useState([])

      if (results.length === 0) return;

      if (results.length < NUMBER_OF_RESULTS) {
        setItemCount(localLevels.length + results.length);
      } else {
        setItemCount(localLevels.length + results.length + NUMBER_OF_RESULTS);
      }

      const levels = results.map((level) => [level.value, level.count]);
      const newLevels = append ? [...localLevels, ...levels] : levels;

      setMyLevels(newLevels);
    },
    [
      NUMBER_OF_RESULTS,
      arrows,
      field.purpose,
      fieldIndexes,
      filenames,
      localLevels,
    ],
  ); // eslint-ignore-line

  // Initial function to be run when level component is rendered. We watch the field prop because
  // in some cases, such as the EtlFieldView, we reuse the same rendered component with a different
  // field including this different field's levels.
  useEffect(() => {
    setMyLevels([]);
    // getMoreLevels(false, 1, 100).then();

    // Cleanup function
    // When we unmount we set isFetching = false to prevent a memory leak
    return () => {
      setIsFetching(false);
    };
  }, [field, getMoreLevels]); // eslint-ignore-line

  const isItemLoaded = (index) => {
    return Boolean(localLevels[index]);
  };

  // Render an item or a loading indicator.
  const Item = ({ index, style }) => {
    let content;
    if (!isItemLoaded(index)) {
      content = '';
    } else {
      content = (
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #EEE',
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1, paddingLeft: 20 }}>
            {localLevels[index][0]}
          </div>
          <div style={{ flex: 0, textAlign: 'right', paddingRight: 20 }}>
            {localLevels[index][1]}
          </div>
        </div>
      );
    }

    return <div style={style}>{content}</div>;
  };

  /**
   *
   * @param {number} startIndex
   * @param {number} stopIndex
   * @description
   * Callback invoked when more rows must be loaded. It should return a Promise that is
   * resolved once all data has finished loading.
   */
  const loadMoreItems = (startIndex, stopIndex) => {
    if (localLevels.length > 0 && stopIndex >= localLevels.length) {
      const page = itemCount === 0 ? 1 : itemCount / RESULTS_PER_PAGE + 1;

      return getMoreLevels(true, page, 100);
    }
    return Promise.resolve();
  };

  const fieldWithSpans = trySpanEnabledField({
    ...field,
    levels: field.levels,
  });

  if (fieldWithSpans?.['levels-mspan']) {
    return (
      <LevelSpans
        time={fieldWithSpans.time}
        format={fieldWithSpans.format}
        spans={fieldWithSpans['levels-mspan']}
      />
    );
  }

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={NUMBER_OF_RESULTS}
      loadMoreItems={loadMoreItems}
      // ref={ listRef }
      threshold={15}
    >
      {({ onItemsRendered, ref }) => (
        <List
          itemCount={NUMBER_OF_RESULTS}
          height={140}
          itemSize={30}
          onItemsRendered={onItemsRendered}
          ref={ref}
        >
          {Item}
        </List>
      )}
    </InfiniteLoader>
  );
};

/*
LevelsViewComponent.propTypes = {
  field: PropTypes.shape({
    levels: PropTypes.array,
  }),
  arrows: PropTypes.object,
}; */

export default LevelsView;
