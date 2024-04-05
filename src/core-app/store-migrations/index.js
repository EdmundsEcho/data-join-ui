// src/store/migrations/index.js

import migrateFrom036To0311 from './0.3.6_to_0.3.11';

/* eslint-disable no-console */

// accessed in the module scope
const migrationPaths = [
  {
    from: '0.3.6',
    to: '0.3.11',
    migrate: migrateFrom036To0311,
  },
  // Add more migration paths as needed
];

// depends on migrationPaths being in scope
function findMigrationPath(currentVersion) {
  return migrationPaths.find((path) => path.from === currentVersion);
}

function applyMigration(store) {
  const currentVersion = store.$_projectMeta.version;
  const path = findMigrationPath(currentVersion);
  const timestamp = new Date().toISOString();

  if (path) {
    console.info(`👉 Applying migration from ${path.from} to ${path.to}`);
    const updatedStore = path.migrate(store);

    // Add record to update history
    const updateRecord = {
      from: path.from,
      to: path.to,
      timestamp,
      description: `Migration applied from ${path.from} to ${path.to}`, // Optional description
    };

    updatedStore.$_projectMeta.version = path.to; // Update version in the store
    updatedStore.$_projectMeta.updateHistory.push(updateRecord); // Add to update history

    return applyMigration(updatedStore); // Recursively apply next migration, if any
  }

  return store; // If no migration path found, return the store as is
}

export function applySequentialMigrations(store) {
  return applyMigration(store);
}
