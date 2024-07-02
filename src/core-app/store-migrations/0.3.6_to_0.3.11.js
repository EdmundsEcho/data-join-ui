// src/store/migrations/0.3.6_to_0.3.11.js

/**
 * Update the name of the field prop from "default-name" to "header-name".
 */
export function migrateFrom036To0311(store) {
  /* eslint-disable no-param-reassign */
  if (!store.$_projectMeta.updateHistory) {
    store.$_projectMeta.updateHistory = [];
  }

  const { headerViews } = store.headerView;

  const updatedHeaderViews = Object.keys(headerViews).reduce((acc, filename) => {
    const currentView = headerViews[filename];
    const updatedFields = currentView.fields.map((field) => {
      if (Object.hasOwn(field, 'default-name')) {
        const { 'default-name': _, ...restOfField } = field;
        return {
          ...restOfField,
          'header-name': field['default-name'], // Add header-name
        };
      }
      return field;
    });

    acc[filename] = {
      ...currentView,
      fields: updatedFields,
    };
    return acc;
  }, {});

  return {
    ...store,
    headerView: {
      ...store.headerView,
      headerViews: updatedHeaderViews,
    },
  };
}
export default migrateFrom036To0311;
