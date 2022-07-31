/**
 * @module ducks/createReducer
 * @function
 * @description
 * Helper function that returns a reducer. It will create reducers that map
 * action types to handlers using object literals,
 * i.e., will take the following form:
 *
 *      export const todos = createReducer(initialState, {
 *        [Action.NAME]: (state, action) => {
 *          const BRANCH_NAME = action.payload
 *          return [...state, BRANCH_NAME]
 *        }
 *      })
 *
 *      // createReducer :: initialState -> handlers -> reducer (action, state)
 *
 * [see reference](https://redux.js.org/recipes/reducing-boilerplate#generating-reducers)
 */
export default function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (action.type in handlers) {
      return handlers[action.type](state, action); // the value (in key, value) is a function
    }
    return state;
  };
}
