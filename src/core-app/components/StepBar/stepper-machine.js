// 📖 Data pulls
import { computeEtlView } from '../../ducks/actions/etlView.actions';
import { fetchWarehouse } from '../../ducks/actions/workbench.actions';
import {
  getHasHeaderViewsFixes,
  getHasSelectedFiles,
  getHasEtlViewErrors,
  getHasPendingRequests,
} from '../../ducks/rootSelectors';

// utility location.pathname -> route
import { getRouteFromPath as routeFromPathname } from '../../utils/common';

// -----------------------------------------------------------------------------
// Configuration
// State machine (collection of pages keyed using route)
//
// ✅ pure (no-state)
// ✅ ref functions required to parse the reduxState
// ✅ ref action creators
//
// Map key: route
//
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
    forwardGuard: () => true,
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
      actions: [],
    },
    on: {
      NEXT: {
        target: 'fields',
        cond: 'forwardGuard',
      },
      PREV: { target: 'meta' },
    },
    forwardGuard: (reduxState) => {
      return (
        !getHasHeaderViewsFixes(reduxState) &&
        !getHasPendingRequests(reduxState, 'INSPECTION') &&
        getHasSelectedFiles(reduxState)
      );
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
      actions: [() => computeEtlView(new Date())],
    },
    on: {
      NEXT: {
        target: 'workbench',
        cond: 'forwardGuard',
      },
      PREV: { target: 'files' },
    },
    forwardGuard: (reduxState) => {
      return (
        !getHasEtlViewErrors(reduxState) &&
        !getHasPendingRequests(reduxState, 'EXTRACTION')
      );
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
      actions: [fetchWarehouse()],
    },
    on: {
      NEXT: { target: 'matrix', cond: 'forwardGuard' },
      PREV: { target: 'fields' },
    },
    forwardGuard: (reduxState) => {
      // validate the canvas-side of the tree
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
    on: {
      PREV: { target: 'workbench' },
    },
    forwardGuard: () => false,
  },
};

function dispatchInit(dispatch) {
  return (action) => {
    let actionObj = action;
    if (typeof action === 'function') {
      actionObj = action();
    }
    console.debug(`dispatching: ${action.type}`);
    dispatch(actionObj);
  };
}
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
 */
export default ((machine) => (dispatch) => {
  let nextRoute;

  const closure = {
    isNextStepEnabled: (reduxState, { route }) => {
      return machine[route].forwardGuard(reduxState);
    },

    transition: (reduxState, { route }, event) => {
      switch (event.type) {
        case 'NEXT': {
          if (machine[route].forwardGuard(reduxState)) {
            nextRoute = machine[route].on?.NEXT.target ?? route;
            const dispatchInner = dispatchInit(dispatch);
            machine[nextRoute].entry.actions.forEach((action) => {
              dispatchInner(action);
            });
          }
          break;
        }
        case 'PREV': {
          nextRoute = machine[route].on?.PREV.target ?? route;
          break;
        }

        default:
      }
      return nextRoute;
    },
  };

  return closure;
})(pagesMachine);

// ⚠️  Relies on insertion order
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
