// src/services/local-storage.js

/**
 * A fast, simple means to record state for redux-persist.
 *
 * @module services/local-storage
 */

import { createStore, clear as clear_, del, keys, set, get } from 'idb-keyval';
import { ReadWriteError } from '../lib/LuciErrors';

const DB = 'redux-store-db';
const TBL = 'store_v2';

const idbStore = createStore(DB, TBL);

/**
 * @function
 * @throws ReadWriteError
 */
function setItem(key, value) {
  try {
    try {
      return set(key, value, idbStore);
    } catch (err) {
      throw new ReadWriteError(`Could not save ${key || 'unknown key'}.`);
    }
  } catch (x) {
    return undefined;
  }
}
/**
 * @function
 * @throws ReadWriteError
 */
function getItem(key) {
  try {
    try {
      // will first try and find previous db before creating new
      return get(key, idbStore);
    } catch (err) {
      throw new ReadWriteError(`Could not load the value for key: ${key}.`);
    }
  } catch (x) {
    return undefined;
  }
}
function removeItem(key) {
  return del(key, idbStore);
}
function getAllKeys() {
  return keys(idbStore);
}
function clear() {
  return clear_(idbStore);
}

// the Async api required by redux-persist
/* eslint-disable import/no-anonymous-default-export */
export default {
  setItem,
  getItem,
  removeItem,
  clear,
  getAllKeys,
};
