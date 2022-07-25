import { saveStore as saveStoreApi } from '../services/dashboard.api'
import { getProjectId } from '../core-app/projectMetaSlice'

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true'
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 *
 * @middleware
 *
 */

// prefixes that capture the actions::document
const SAVE_PREFIXES = [
  /*
  'ADD',
  'DELETE',
  'REMOVE',
  'RESET',
  'SET',
  'UPDATE',
  'SAVE_PROJECT',
  'TAG_WAREHOUSE_STATE',
*/
  'counter',
]
const BLACK_LIST = ['projectMeta/setProjectId']

const saveNow = (actionType) => {
  // str.includes(substr)
  if (typeof actionType === 'undefined') {
    return false
  }
  const guard =
    SAVE_PREFIXES.some((prefix) => actionType.includes(prefix)) &&
    BLACK_LIST.every((prefix) => !actionType.includes(prefix))
  const color = guard
    ? 'color: green; font-weight: bold'
    : 'color: red; font-weight: bold'
  console.log(`%c 🎉 about to save: ${actionType} -> save: ${guard}`, color)
  return guard
}

// eslint-disable
const middleware =
  ({ getState, dispatch }) =>
  (next) =>
  (action) => {
    console.debug(
      `🧮  middleware action: ${action?.type ?? 'action type: undefined'}`,
    )
    // dispatch the action in action.type with the closure
    // about to be returned.
    next(action)

    if (DEBUG) {
      console.info('loaded save.middleware')
      console.info(`%c🏁 END of middleware cycle`, 'color.orange')
    }

    //
    // Tasks
    // ✅ Predicate actions that mutate the reducer (action::document)
    // ✅ Send redux-store to backend (saveProject)
    // ⬜ Update projectMeta to reflect the "saving" state
    //
    if (saveNow(action.type)) {
      try {
        const state = getState()
        const projectId = getProjectId(state)
        if (typeof projectId === 'undefined') {
          throw new Error(`Missing projectId: ${projectId}`)
        }
        saveStoreApi({ projectId, store: state })
        // send out actions to update projectMeta state
      } catch (e) {
        throw e
      } finally {
      }
    }
  }

// prettier-ignore
export default middleware;
