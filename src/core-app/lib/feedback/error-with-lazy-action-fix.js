// src/lib/feedback/error-with-lazy-action-fix.js

/**
 * @module feedback/error-with-lazy-action-fix
 *
 * @description
 * Interface for generating errors objects with a action that provides
 * an option to fix the error.
 *
 * Exports action type for the action made here.
 *
 */
import { selectPropsInObj } from '../filesToEtlUnits/headerview-helpers';
import { colors } from '../../constants/variables';

//------------------------------------------------------------------------------
export const ACTION_TYPE = '[FIX]';
//------------------------------------------------------------------------------
const COLOR = colors.dark.red;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 *
 * MaybeAction creator
 *
 * Provide the UI an action that fixes the error.
 *
 *     error -> errow with maybeAction
 *
 *
 * Features:
 * 👉 action depends on the reported errors (the context)
 * 👉 guards ensure safe application of the fix
 * 👉 the ui dispatches the action to effect the change
 * 👉 ?applies the state to `description` and `lazyAction`
 *    (provides option dynamically set feedback to the user)
 * 👉 lazyAction can be a string value that references a lazyFixes
 *    configuration (see headerview.middleware);
 *
 * Usage: The ui receives an error object with an  `action` key.
 *
 *     ```
 *     {
 *        action: {
 *           description,
 *           lazyAction
 *       }
 *     }
 *     ```
 *
 *
 * Input unit: hv
 * 🦀 unit should be relevant hvs in hvs.
 *    The subject is relevant for all hvs, all the time.
 * 🔑 Be sure to only send the subset of the error context that matters.
 *    For instance, only the headerViews that are part of the same
 *    etlUnit. The error context is set accordingly.
 *
 * @function
 * @param {Object} errorContext hvsFixes[SOURCE_TYPES.RAW]
 * @param {Object} state
 * @return {Object} with maybeAction
 *
 */
export const errorWithMaybeLazyFix = (
  errorContext,
  stateFragment,
  DEBUG = false,
) => {
  // closure
  // ⚠️  re-apply if have not an array (remove filename keys)
  if (!Array.isArray(errorContext)) {
    return errorWithMaybeLazyFix(
      Object.values(errorContext),
      stateFragment,
      DEBUG,
    );
  }
  if (DEBUG) {
    console.groupCollapsed(
      '%c🧮 lazyFix headerView\nAre there automated fixes for the user?',
      COLOR,
    );
    console.log(`%cerrorContext`, COLOR);
    console.dir(errorContext);
    console.log(`%cstateFragment`, COLOR);
    console.dir(stateFragment);
  }

  // The analysis produces the same result for a given error.
  // Each hv has a collection of errors. Each error only needs to be tested once
  // 🔖 The error -> lazy action, is also the context for assessing
  //    the viability of other error -> lazy action;
  const contextErrorMap = errorContext.reduce((acc, errors) => {
    errors.forEach((error) => {
      acc[error.key] = error;
    });
    return acc;
  }, {});

  //----------------------------------------------------------------------
  // 👍 Return early with id function when the error context is empty
  //----------------------------------------------------------------------
  if (Object.keys(contextErrorMap).length === 0) {
    if (DEBUG) {
      console.log(`%cNo errors to process.`, COLOR);
    }
    return (x) => x;
  }
  if (DEBUG) {
    console.log(`%c...the map keyed by error/fix`, COLOR);
    console.dir(contextErrorMap);
  }
  //----------------------------------------------------------------------
  // guards : [errors that cannot exist in order to proceed]
  //----------------------------------------------------------------------
  // subroutines
  //
  // guardDown = ok to make the action
  const guardDown = (guard) => !(guard in contextErrorMap);

  // all guards down = ok to make the action
  const guardsDown = (error) => error.action.guards.every(guardDown);

  const hasLazyFix = (error) => error?.action?.lazyFix ?? false;

  //----------------------------------------------------------------------
  // Action maker
  const applyStateToProps = ['description', 'lazyFix'];
  //----------------------------------------------------------------------
  const mkLazyAction = ({ action }) => {
    /* eslint-disable no-shadow, no-param-reassign */
    const lazyAction = applyStateToProps.reduce((lazyAction, key) => {
      lazyAction[key] =
        typeof action[key] === 'function'
          ? action[key](stateFragment)
          : action[key];
      return lazyAction;
    }, {});
    lazyAction.type = `${ACTION_TYPE} ${action.type}`;
    return lazyAction;
    /* eslint-enable no-shadow, no-param-reassign */
  };

  function transformation(fixErrorObj) {
    //--------------------------------------------------------------------
    // always, basic action
    const errorWithContext = selectPropsInObj(
      ['key', 'message', 'fix'],
      fixErrorObj,
    );

    // augmented action with lazy fix
    if (hasLazyFix(fixErrorObj) && guardsDown(fixErrorObj))
      errorWithContext.action = mkLazyAction(fixErrorObj);

    if (DEBUG) {
      console.log(
        `%cThe memoized application of the error context for fixObject: ${fixErrorObj.key}`,
        COLOR,
      );
      console.dir(errorWithContext);
    }

    return errorWithContext;
  }

  // generate the answers
  /* eslint-disable no-shadow, no-param-reassign */
  const memo = Object.keys(contextErrorMap).reduce((memo, errorKey) => {
    memo[errorKey] = transformation(contextErrorMap[errorKey]);
    return memo;
  }, {});
  /* eslint-enable no-shadow, no-param-reassign */

  if (DEBUG) {
    console.log(`%cThe completed memo used for the hvs iteration.`, COLOR);
    console.dir(memo);
    console.groupEnd();
  }
  //----------------------------------------------------------------------
  // The initialized function => error object for user display
  //----------------------------------------------------------------------
  return (fixErrorObj) => {
    return memo[fixErrorObj.key];
  };
};

export default errorWithMaybeLazyFix;
