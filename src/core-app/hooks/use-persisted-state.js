// src/hooks/use-persisted-state.js
/**
 * @module hooks/use-persisted-state
 */
import { useMemo, useState, useEffect, useCallback } from 'react';
import { createStore, clear as idbClear, set, get } from 'idb-keyval';
import { ReadWriteError } from '../lib/LuciErrors';

const DB = 'ui-state-db';
const TBL = 'stateId-val';
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
  keyToPersistWith, // : string,
  defaultValue, // : any
) => {
  // new Store will first try and find previous db
  // before creating new.  The useMemo is to prevent repeating the
  // instantiation with each render.
  const idbStore = useMemo(() => createStore(DB, TBL), []);

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
          /* eslint-disable-next-line */
          console.error(err);
          throw new ReadWriteError(
            `The use-persisted-state hook failed to write: ${keyToPersistWith}\nvalue: ${value} `,
          );
        });
      } catch (e) {
        if (e instanceof ReadWriteError) {
          /* eslint-disable-next-line */
          console.error(e);
        }
        throw e;
      }
    },
    [idbStore, keyToPersistWith],
  );

  return [cache ?? defaultValue, setPersistedValue];
};

/**
 * Hook to clear the ui-state
 * @function
 */
export const useClear = () => {
  const idbStore = useMemo(() => createStore(DB, TBL), []);
  return useCallback(() => idbClear(idbStore), [idbStore]);
};

export default usePersistedState;
