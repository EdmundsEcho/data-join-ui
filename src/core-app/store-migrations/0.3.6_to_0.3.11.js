// src/store/migrations/0.3.6_to_0.3.11.js

export function migrateFrom036To0311(store) {
  /* eslint-disable no-param-reassign */

  if (!store.$_projectMeta.updateHistory) {
    store.$_projectMeta.updateHistory = [];
  }
  const { headerViews } = store.headerView;
  Object.keys(headerViews).forEach((filename) => {
    const { fields } = headerViews[filename];
    fields.forEach((field) => {
      if (field['default-name']) {
        field['header-name'] = field['default-name'];
        delete field['default-name'];
      }
    });
  });

  return store;
}

export default migrateFrom036To0311;
