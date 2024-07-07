/**
 * @module constants/variables
 * @description
 * Used to store variables used throught the application
 */
import { useEffect, useRef } from 'react';

/* eslint-disable no-console */

// formats
export const DATE_FORMAT = 'MM/DD/YY';
export const TIME_FORMAT = 'h:mma';
export const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

// Jobs
export const DEFAULT_JOB_STATUS_CHECK_INTERVAL = 3000; // ms

// Workbench
export const PALETTE_ID = 3;
export const PALETTE_GROUP_ID = 4;

export const timeIntervalUnitOptions = {
  D: 'Day',
  W: 'Week',
  M: 'Month',
  // Q: 'Quarter', // Not supported yet
  Y: 'Year',
};

const purple = 'color: #9600cd';
const lightPurple = 'color: #d5a6e6';
const orange = 'color: #ff9966';

export const colors = {
  red: 'color: #dc143c',
  yellow: 'color: #f0db4f',
  green: 'color: #339966',
  blue: 'color: #007fff',
  orange: 'color: #ffa500',
  brown: 'color: #af7c35',
  purple,
  grey: 'color: #808080',
  pink: 'color: #ffc0cb',
  light: {
    blue: 'color: #add8e6',
    purple: lightPurple,
    red: 'color: #b04632',
    orange,
    yellow: 'color: #fce883',
  },
  dark: {
    red: 'color: #b04632',
  },
  purpleGrey: `${purple};background-color:#ededed`,
  purpleDarkGrey: `${lightPurple};background-color:#555555`,
  orangeGrey: `${orange};background-color:#ededed`,
  orangeDarkGrey: `${orange};background-color:#555555`,
  lightPurple: 'color: #d5a6e6',
};

// deprecate in favor of colors
export const debug = {
  color: colors,
};

/**
 * @function
 * Utility called when a non-configured prop is being referenced.
 * @todo Likely relocate
 * @param {string} componentName
 * @return void
 *
 */
export const notConfigured = (componentNamePlusProp) => () =>
  console.log(`%c${componentNamePlusProp}: not configured`, debug.color.yellow);

/**
 * A React.Hook used to track prop=changes between user interactions.
 *
 * Usage
 *
 * function MyComponent(props) {
 *      useTraceUpdate(props);
 *      return <div>{props.children}</div>;
 * }
 *
 * @function
 * @param {Object} props
 * @return {Object} diff
 */
export const useTraceUpdate = (
  props,
  { override = false, tag = '' } = { override: false, tag: '' },
) => {
  const prev = useRef(props);

  useEffect(() => {
    if (
      override ||
      process.env.REACT_APP_DEBUG_RENDER === 'true' ||
      process.env.REACT_APP_DEBUG_WHY_DID_YOU_RENDER === 'true'
    ) {
      console.debug(`%c${tag} Changed props?`, debug.color.yellow);

      const changedProps = diffObjects(prev.current, props);

      if (Object.keys(changedProps).length > 0) {
        console.debug('%cChanged props:', debug.color.red);
        console.dir(changedProps);
      } else {
        console.debug('%cNo changed props!', debug.color.green);
      }
      prev.current = props;
    }
  });
};
/**
 * Returns the *shallow* difference between two objects.
 *
 * ⚠️  This is a forgiving function with no error reporting.
 *
 * @function
 * @param {Object} first
 * @param {Object} second
 * @return {Object} min return {}
 */
export function diffObjects(first = {}, second = {}) {
  return Object.entries(second).reduce((diff, [k, v]) => {
    if (first[k] !== v) {
      /* eslint-disable-next-line */
      diff[k] = [first[k], v];
    }
    return diff;
  }, {});
}

/**
 * Predicate
 * Returns true when key/value pairs match.
 *
 * Shallow comparison of two objects. Returns false when the second
 * object is undefined.
 *
 * @function
 * @param {Object}
 * @param {Object}
 * @return {bool}
 */
export function areSimilarObjects(first = {}, second = undefined) {
  const noBuenoTypes = ['undefined', 'function', 'string', 'number', 'boolean'];
  const notAnObject = (value) =>
    [
      // any of these true -> true
      (v) => v === null,
      (v) => Array.isArray(v),
      (v) => noBuenoTypes.includes(v),
    ].reduce((acc, pred) => acc || pred(value), false);

  if (notAnObject(first) || notAnObject(second)) {
    return false;
  }
  return Object.keys(diffObjects(first, second)).length === 0;
}

/**
 * Predicate
 * Deep comparison
 *
 * @function
 * @param {Any}
 * @param {Any}
 * @return {bool}
 */
export function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.slice(0).reduce((_, value, i, arr) => {
        if (!equal(a[i], b[i])) {
          arr.splice(1);
          return false;
        }
        return true;
      }, true);
    }
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      return a
        .entries()
        .slice(0)
        .reduce((_, entry, i_, arr) => {
          if (!b.has(entry[0]) || !equal(entry[1], b.get(entry[0]))) {
            arr.splice(1);
            return false;
          }
          return true;
        }, true);
    }
    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      return a
        .keys()
        .slice(0)
        .reduce((_, key, i_, arr) => {
          if (!b.has(key)) {
            arr.splice(1);
            return false;
          }
          return true;
        }, true);
    }
    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;

    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();

    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    if (Object.keys(a).length !== Object.keys(b).length) return false;
    return Object.entries(a)
      .slice(0)
      .reduce((_, entry, i_, arr) => {
        if (!(entry[0] in b) || !equal(entry[1], b[entry[0]])) {
          arr.splice(1);
          return false;
        }
        return true;
      }, true);
  }

  // true if both NaN, false otherwise
  /* eslint-disable no-self-compare */
  return a !== a && b !== b;
  /* eslint-enable no-self-compare */
}
