// src/store/migrations/0.4.0_to_0.5.0.js
import { MVALUE_MODE } from '../lib/sum-types';

/**
 * Add a headerView prop MVALUE_MODE = WIDE | MULTIPLE.
 * This is to accomodate the ability to import several etlUnit::measurement
 * that share the same components (and thus are simultaneous observations).
 */
export function migrateFrom040To050(store) {
  /* eslint-disable no-param-reassign */
  if (!store.$_projectMeta.updateHistory) {
    store.$_projectMeta.updateHistory = [];
  }
  const { headerViews } = store.headerView;

  const updatedHeaderViews = { ...headerViews };
  Object.keys(updatedHeaderViews).forEach((filename) => {
    updatedHeaderViews[filename] = {
      ...updatedHeaderViews[filename],
      mvalueMode: Object.hasOwn(updatedHeaderViews[filename], 'mvalueMode')
        ? updatedHeaderViews[filename].mvalueMode
        : MVALUE_MODE.WIDE,
    };
  });

  return {
    ...store,
    headerView: {
      ...store.headerView,
      headerViews: updatedHeaderViews,
    },
  };
}

export default migrateFrom040To050;
