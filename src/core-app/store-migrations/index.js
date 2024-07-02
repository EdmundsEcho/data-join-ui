// src/store/migrations/index.js

import migrateFrom036To0311 from './0.3.6_to_0.3.11';
import migrateFrom040To050 from './0.4.0_to_0.5.0';
import migrateFrom050To051 from './0.5.0_to_0.5.1';
import { StoreMigrationError } from '../lib/LuciErrors';

/* eslint-disable no-console */

// accessed in the module scope
const migrationPaths = [
  {
    from: '0.3.6',
    to: '0.3.11',
    migrate: migrateFrom036To0311,
  },
  { from: '0.3.11', to: '0.4.0', migrate: (store) => store },
  {
    from: '0.4.0',
    to: '0.5.0',
    migrate: migrateFrom040To050,
  },
  {
    from: '0.5.0',
    to: '0.5.1',
    migrate: migrateFrom050To051,
  },
  // Add more migration paths as needed
];

// depends on migrationPaths being in scope
function findMigrationPath(currentVersion) {
  return migrationPaths.find((path) => path.from === currentVersion);
}

function applyMigration(store) {
  let currentVersion = store.$_projectMeta.version || '0.0.0';
  const timestamp = new Date().toISOString();
  let path;

  /* eslint-disable no-cond-assign, no-param-reassign */
  while ((path = findMigrationPath(currentVersion))) {
    let description;
    try {
      description = `Migration from ${path.from} to ${path.to}`;
      console.info(`👉 Applying ${description}`);

      store = path.migrate(store);
      store.$_projectMeta.updateHistory.push({
        from: path.from,
        to: path.to,
        timestamp,
        description,
      });
      store.$_projectMeta.version = path.to;
    } catch (e) {
      throw new StoreMigrationError(`${description} failed: ${e.message}.`, {
        cause: e,
        details: {
          fromVersion: path.from,
          toVersion: path.to,
        },
      });
    }
    currentVersion = path.to;
  }

  return store;
}

export function applySequentialMigrations(store) {
  return applyMigration(store);
}
