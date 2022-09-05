// 📖 Data pulls
import { setUiLoadingState } from '../../ducks/actions/ui.actions';
import { saveProject } from '../../ducks/actions/project-meta.actions';
import { runFixReport } from '../../ducks/actions/headerView.actions';
import {
  computeEtlView,
  feature as ETL_FEATURE,
} from '../../ducks/actions/etlView.actions';
import {
  feature as WORK_FEATURE,
  fetchWarehouse,
} from '../../ducks/actions/workbench.actions';
import {
  feature as MATRIX_FEATURE,
  fetchMatrix,
} from '../../ducks/actions/matrix.actions';
import { setCurrentPage } from '../../ducks/actions/stepper.actions';
import {
  getHasHeaderViewsFixes,
  getHasSelectedFiles,
  getHasEtlViewErrors,
  getHasPendingRequests,
  runRequestSpecValidations as passRequestSpecValidations,
} from '../../ducks/rootSelectors';

// utility location.pathname -> route
import { getRouteFromPath as routeFromPathname } from '../../utils/common';
import { colors } from '../../constants/variables';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_STEP_BAR === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

// -----------------------------------------------------------------------------
// Configuration
// State machine (collection of pages keyed using route)
//
// ✅ pure (no-state)
// ✅ string ref functions required to parse the reduxState
// ✅ ref action creators
//
// Map key: route
//
// NEXT: Set the component values; have it read by the router
//
const pagesMachine = {
  meta: {
    key: 'meta',
    route: 'meta',
    stepNumber: 0,
    hideStepper: false,
    stepDisplay: 'Select project',
    prevPage: undefined,
    nextPage: 'files',
    on: {
      NEXT: { target: 'files' },
    },
  },
  files: {
    key: 'files',
    route: 'files',
    stepNumber: 1,
    hideStepper: false,
    stepDisplay: 'Take inventory',
    prevPage: 'meta',
    nextPage: 'fields',
    entry: {
      actions: [runFixReport()], // refresh the report
    },
    exit: {
      actions: ['saveProject'],
    },
    on: {
      NEXT: {
        target: 'fields',
        cond: 'forwardGuard',
      },
      PREV: { target: 'meta' },
    },
  },
  fields: {
    key: 'fields',
    route: 'fields',
    stepNumber: 2,
    hideStepper: false,
    stepDisplay: 'Configure the stack',
    prevPage: 'files',
    nextPage: 'workbench',
    entry: {
      actions: [
        setUiLoadingState({
          toggle: true,
          feature: ETL_FEATURE,
          message: `Loading EtlView`,
        }),
        'computeEtlView',
      ],
    },
    exit: {
      actions: [],
    },
    on: {
      NEXT: {
        target: 'workbench',
        cond: 'forwardGuard',
      },
      PREV: { target: 'files' },
    },
  },
  workbench: {
    key: 'workbench',
    route: 'workbench',
    stepNumber: 3,
    hideStepper: false,
    stepDisplay: 'Create the universe',
    prevPage: 'fields',
    nextPage: 'matrix',
    entry: {
      actions: [
        setUiLoadingState({
          toggle: true,
          feature: WORK_FEATURE,
          message: `Loading Warehouse`,
        }),
        'fetchWarehouse',
      ],
    },
    exit: {
      actions: ['saveProject'],
    },
    on: {
      NEXT: { target: 'matrix', cond: 'forwardGuard' },
      PREV: { target: 'fields' },
    },
  },
  matrix: {
    key: 'matrix',
    route: 'matrix',
    stepNumber: 4,
    hideStepper: false,
    stepDisplay: 'Run the analysis',
    prevPage: 'workbench',
    nextPage: undefined,
    entry: {
      actions: [
        setUiLoadingState({
          toggle: true,
          feature: MATRIX_FEATURE,
          message: `Pulling the requested data`,
        }),
        'fetchMatrix',
      ],
    },
    on: {
      PREV: { target: 'workbench' },
    },
  },
};

/**
 *
 * Machine instance that returns functions required to inform
 * the tnc-app stepper component (wizzard)
 *
 * tasks:
 *
 * ✅ know what actions to dispatch when transitioning between pages
 * ✅ compute next page for each call to NEXT and PREV for a given state
 *
 * @function Machine
 */
export default ((machine) => (projectId, dispatch) => {
  /**
   * non-serializable
   * functions keyed by name
   */
  const fns = {
    computeEtlView: () => computeEtlView(new Date()),
    fetchWarehouse: () => fetchWarehouse(new Date()),
    fetchMatrix: () => fetchMatrix(projectId), // pid used to assert with saga
    saveProject: () => saveProject(),
  };
  /**
   * Read-only state
   */
  const forwardGuards = {
    meta: () => true,
    files: (reduxState) => {
      return (
        !getHasHeaderViewsFixes(reduxState) &&
        !getHasPendingRequests(reduxState, 'INSPECTION') &&
        getHasSelectedFiles(reduxState)
      );
    },
    fields: (reduxState) => {
      return (
        !getHasEtlViewErrors(reduxState) &&
        !getHasPendingRequests(reduxState, 'EXTRACTION')
      );
    },
    workbench: (reduxState) => {
      return passRequestSpecValidations(reduxState);
    },
    matrix: () => false,
  };

  const backwardGuards = {
    meta: () => false,
  };

  /**
   * utility fn
   * pure: does not depend on context
   * @function
   * @return {function}
   */
  const getPredFn = (name, lookup) => {
    if (name in lookup) {
      return lookup[name];
    }
    return () => true;
  };

  // depends on dispatch in context
  const emit = (action) => {
    if (DEBUG) {
      console.debug(
        `%cemitting action of type: ${typeof action}`,
        colors.yellow,
      );
      console.dir(action);
    }
    let actionObj = action;

    if (typeof action === 'string') {
      actionObj = fns[action]();
    } else if (typeof action === 'function') {
      actionObj = action();
    }
    dispatch(actionObj);
  };

  //-----------------------------------------------------
  let nextRoute;
  //-----------------------------------------------------
  const goNewPage = (route, event) => {
    // 1️⃣  compute next page
    nextRoute = machine[route].on?.[event.type].target ?? route;
    // 2️⃣  run the actions
    if (nextRoute !== route) {
      console.debug(`SET ${nextRoute}`);
      emit(setCurrentPage(nextRoute));
      (machine[route]?.exit?.actions ?? []).forEach(emit /* (action) */);
      (machine[nextRoute]?.entry?.actions ?? []).forEach(emit /* (action) */);
    }
  };

  // interface for the component
  return {
    isNextStepEnabled: (reduxState, page) => {
      const { route } = page;
      if (typeof route !== 'undefined') {
        return forwardGuards?.[route](reduxState) ?? true;
      }
      return false;
    },
    // process the event types; used by onClick handler
    transition: (reduxState, { route }, event) => {
      switch (event.type) {
        // thus far, a mirror image of PREV
        // abstraction = change state protocol
        case 'NEXT': {
          const fn = getPredFn(route, forwardGuards);
          if (fn(reduxState)) {
            goNewPage(route, event);
          }
          break;
        }
        // thus far, a mirror image of NEXT
        // abstraction = change state protocol
        case 'PREV': {
          const fn = getPredFn(route, backwardGuards);
          if (fn(reduxState)) {
            goNewPage(route, event);
          }
          break;
        }

        default:
        /* nothing */
      }
      return nextRoute;
    },
  };
})(pagesMachine);

// ⚠️  Relies on insertion order to maintain page order
const pages = Object.values(pagesMachine);

/**
 * Required export
 * The caller is reponsible for deriving the current state
 * using the useLocation hook.  This function
 * location -> route
 */
const lookupPageWithPathname = (path) => pagesMachine[routeFromPathname(path)];
const tryNextEvent = { type: 'NEXT' };
const tryPrevEvent = { type: 'PREV' };
// -----------------------------------------------------------------------------
export {
  pages,
  lookupPageWithPathname,
  routeFromPathname,
  tryNextEvent,
  tryPrevEvent,
};
