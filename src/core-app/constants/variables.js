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

export const colors = {
  red: 'color: #dc143c',
  yellow: 'color: #f0db4f',
  green: 'color: #339966',
  blue: 'color: #007fff',
  orange: 'color: #ffa500',
  purple: 'color: #9600cd',
  grey: 'color: #808080',
  pink: 'color: #ffc0cb',
  light: {
    blue: 'color: #add8e6',
    purple: 'color: #d5a6e6',
    red: 'color: #b04632',
    orange: 'color: #ff9966',
    yellow: 'color: #fce883',
  },
  dark: {
    red: 'color: #b04632',
  },
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
/* Usage
function MyComponent(props) {
  useTraceUpdate(props);
  return <div>{props.children}</div>;
} */
