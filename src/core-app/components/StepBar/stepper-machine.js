// 📖 Data pulls
import { saveProject } from '../../ducks/actions/project-meta.actions';
import { runFixReport } from '../../ducks/actions/headerView.actions';
import { computeEtlView } from '../../ducks/actions/etlView.actions';
import { fetchWarehouse } from '../../ducks/actions/workbench.actions';
import { fetchMatrix } from '../../ducks/actions/matrix.actions';
import { bookmark } from '../../ducks/actions/stepper.actions';
import {
  getBookmark as maybeBookmark,
  getHasHeaderViewsFixes,
  getHasSelectedFiles,
  getHasEtlViewErrors,
  getHasPendingRequests,
  runRequestSpecValidations as passRequestSpecValidations,
  isAppDataCompleted,
} from '../../ducks/rootSelectors';

// utility location.pathname -> route
import { getRouteFromPath as routeFromPathname } from '../../utils/common';
import { colors } from '../../constants/variables';

// -----------------------------------------------------------------------------
const DEBUG = false || process.env.REACT_APP_DEBUG_STEP_BAR === 'true';
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
// TODO: consider guards for when to fetch data; i.e., skip
//       when relevant state is 'STALE'
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
    entry: {
      actions: [bookmark('meta'), 'saveProject'],
    },
    exit: {
      actions: [],
    },
    on: {
      PREV: { target: 'workbench' },
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
      actions: [bookmark('files'), 'saveProject', runFixReport(), 'saveProject'], // refresh the report
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
      actions: ['computeEtlView', bookmark('fields'), 'saveProject'],
    },
    exit: {
      actions: ['saveProject'],
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
      actions: ['fetchWarehouse', bookmark('workbench'), 'saveProject'],
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
      actions: ['fetchMatrix', bookmark('matrix'), 'saveProject'],
    },
    on: {
      NEXT: { target: 'meta', cond: 'forwardGuard' },
      PREV: { target: 'workbench' },
    },
  },
};

// -----------------------------------------------------------------------------
/**
 * configure the forward guards
 *
 * Read-only state
 * Selectors
 * StepBar: useSelector to create local state
 * const forwardFiles = useSelector(forwardGuards.files)
 * const forwardFields = useSelector(forwardGuards.fields)
 * const forwardWorkbench = useSelector(forwardGuards.workbench)
 * const forwardMatrix = useSelector(forwardGuards.matrix)
 */
export const forwardGuards = {
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
  matrix: () => true,
};
/**
 * configure the forward guards
 */
const defaultBackwardGuard = () => true;
const customBackwardGuards = {
  meta: (reduxState) => isAppDataCompleted(reduxState),
};
export const backwardGuards = Object.keys(pagesMachine).reduce((acc, key) => {
  if (key in acc) {
    return acc;
  }
  acc[key] = defaultBackwardGuard;
  return acc;
}, customBackwardGuards);
// -----------------------------------------------------------------------------
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
export default ((machine) => (dispatch, projectId) => {
  /**
   * non-serializable
   * functions keyed by name
   */
  const fns = {
    computeEtlView: () => computeEtlView(new Date()),
    fetchWarehouse: () => fetchWarehouse(new Date()),
    fetchMatrix: () => fetchMatrix(projectId),
    saveProject: () => saveProject(),
  };
  // depends on dispatch in context
  const emit = (action) => {
    if (DEBUG) {
      console.debug(`%cemitting action of type: ${typeof action}`, colors.yellow);
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

  //-------------
  let nextRoute;
  //-------------
  const goNewPage = (route, event) => {
    // 1️⃣  compute next page
    nextRoute = machine[route].on?.[event.type].target ?? route;
    // 2️⃣  run the actions
    if (nextRoute !== route) {
      (machine[route]?.exit?.actions ?? []).forEach(emit /* (action) */);
      (machine[nextRoute]?.entry?.actions ?? []).forEach(emit /* (action) */);
    }
  };

  // interface for the component
  return {
    // process the event types; used by onClick handler
    transition: (predFromRedux, { route }, event) => {
      switch (event.type) {
        // thus far, a mirror image of PREV
        // abstraction = change state protocol
        case 'NEXT': {
          if (predFromRedux) {
            goNewPage(route, event);
          }
          break;
        }
        // thus far, a mirror image of NEXT
        // abstraction = change state protocol
        case 'PREV': {
          goNewPage(route, event);
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

const getBookmark = (state) => maybeBookmark(state) ?? pages[0].route;
/**
 * Required export
 * The caller is responsible for deriving the current state
 * using the useLocation hook.  This function
 * location -> route
 */
const lookupPageWithPathname = (path) => pagesMachine[routeFromPathname(path)];
const tryNextEvent = { type: 'NEXT' };
const tryPrevEvent = { type: 'PREV' };
// -----------------------------------------------------------------------------
export {
  getBookmark,
  pages,
  lookupPageWithPathname,
  routeFromPathname,
  tryNextEvent,
  tryPrevEvent,
};
