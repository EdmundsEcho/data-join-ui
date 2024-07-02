// src/store/migrations/0.5.0_to_0.5.1.js

/**
 * Update the etlField etl-unit value to a list for fields that are not
 * type subject.
 *
 * 💢 Mutate in place
 *
 */
export function migrateFrom050To051(store) {
  /* eslint-disable no-param-reassign */
  if (!store.$_projectMeta.updateHistory) {
    store.$_projectMeta.updateHistory = [];
  }
  const {
    etlObject: { etlFields },
  } = store.etlView;

  // for each etlField in etlFields, set etl-unit = [etl-unit]
  Object.keys(etlFields).forEach((name) => {
    etlFields[name]['etl-unit'] = [etlFields[name]['etl-unit']];
  });

  return store;
}

export default migrateFrom050To051;
