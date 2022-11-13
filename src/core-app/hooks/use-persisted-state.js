// src/hooks/use-persisted-state.js
/**
 * @module hooks/use-persisted-state
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  createStore,
  clear as idbClear,
  set,
  get,
  promisifyRequest,
} from 'idb-keyval';
import { ReadWriteError } from '../lib/LuciErrors';

// -----------------------------------------------------------------------------
/* eslint-disable no-console */
// -----------------------------------------------------------------------------
// Will create a db using projectId when possible, otherwise
//
const PREFIX = 'db-';
const DEFAULT_DB = `${PREFIX}tnc-ui`;
const TBL = 'stateId-val';
// -----------------------------------------------------------------------------
/**
 * Persistent useState hook.
 *
 * Utilizes idb-keyval that stores data in the ui-db in
 * the browser storage.
 *
 * returns [value ?? defaultValue, setPersistedValue];
 *
 *  There are three slots for recording a value:
 *  1. default value in the hook's second parameter
 *  2. local state
 *  3. disk
 *
 *  The limiting factor is reading from disk (the ui does not wait for recording
 *  events). The very first time, I don't know if anything is on the disk when
 *  calling useHook, the same time I need to know if anything is on the disk.
 *
 *  💰 Reading from disk should only happen once.  After that,
 *     we read from the cache.
 *
 * User experience:
 *
 *    When the pages loads for the first time, cache is set to undefined (only
 *    once event).
 *
 *    Scenario one: nothing previously recorded
 *
 *     ⏳ useEffect tries to find a value (cache === undefined)
 *         👉 Not-found: user gets the default value returned
 *
 *     ✨ setValueCallback is invoked
 *         👉 sets the cache value to a defined value
 *         ⌛ writes the value to disk (not a limiting step)
 *
 *    Scenario two: something on the disk
 *
 *     ⏳ useEffect tries to find a value (cache === undefined)
 *         👉 Found: sets the cache to a defined value
 *             👍 closed latch: no read access until the cache
 *
 *
 * @function
 * @param {String} keyToPersistWith
 * @param {any?} defaultState
 * @return {Array}
 *
 */
const usePersistedState = (
  keyToPersistWith, // string,
  defaultValue, // any
  db = undefined,
) => {
  // new Store will first try to find previous db with matching name.
  // db name using projectId, else default
  const params = useParams();
  const DB =
    db || 'projectId' in params
      ? dbNameFromProjectId(params.projectId)
      : DEFAULT_DB;

  const idbStore = createStore(DB, TBL);

  const [cache, setCache] = useState(() => undefined);

  useEffect(() => {
    if (typeof cache === 'undefined') {
      get(keyToPersistWith, idbStore).then((retrievedValue) =>
        // If a value is retrieved then use it,
        setCache(retrievedValue),
      );
    }
    // otherwise, leave cache set to undefined.
  }, [keyToPersistWith, setCache, defaultValue, idbStore, cache]);

  // interface
  const setPersistedValue = useCallback(
    (value) => {
      setCache(value);
      try {
        set(keyToPersistWith, value, idbStore).catch((err) => {
          throw new ReadWriteError(
            `The use-persisted-state hook failed to write: ${keyToPersistWith}\nvalue: ${value} `,
            err,
          );
        });
      } catch (e) {
        if (e instanceof ReadWriteError) {
          console.error(e);
        } else {
          console.error('Unexpected Error');
          console.error(e);
        }
      }
    },
    [idbStore, keyToPersistWith],
  );

  return [cache ?? defaultValue, setPersistedValue];
};

/**
 * clear the ui-state
 * @function
 */
const clearValues = (maybeDbOrProjectId) => {
  const db = resolveDbName(maybeDbOrProjectId);
  const idbStore = createStore(db, TBL);

  return idbClear(idbStore).catch((err) => {
    throw new ReadWriteError(`Failed to clear the indexedDb: ${db}`, err);
  });
};

/**
 * Delete the custom db
 * @function
 */
const deleteDb = (maybeDbOrProjectId) => {
  // extend the idb interface to include delete db
  const idbDelete = (db_) => {
    const request = indexedDB.deleteDatabase(db_);
    return promisifyRequest(request);
  };

  const db = resolveDbName(maybeDbOrProjectId);

  return idbDelete(db).catch((err) => {
    throw new ReadWriteError(`Failed to delete the indexedDb: ${db}`, err);
  });
};

/**
 * Use this to create and reference a db for a given project.
 *
 * @function
 * @param {string} projectId
 * @return {string} db name
 */
function dbNameFromProjectId(projectId) {
  try {
    return `db-${projectId.slice(-6)}`;
  } catch (e) {
    return DEFAULT_DB;
  }
}

function resolveDbName(maybeDbOrProjectId) {
  const DB = maybeDbOrProjectId || DEFAULT_DB;
  return DB.slice(0, PREFIX.length) === PREFIX
    ? DB
    : dbNameFromProjectId(maybeDbOrProjectId);
}

export { dbNameFromProjectId, deleteDb, clearValues, usePersistedState };

export default usePersistedState;
