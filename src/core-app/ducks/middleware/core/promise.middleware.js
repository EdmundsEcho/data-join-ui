/**
 * Converts an Promise action, to a resolved action.
 *
 * 🚧 Not sure if this is utilized
 */
const promiseMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (isPromise(action.payload)) {
      action.payload.then(
        (res) => {
          dispatch({ ...action, payload: res });
        },
        (error) => {
          dispatch({ ...action, error: true, payload: error });
        },
      );
      return;
    }
    next(action);
  };

function isPromise(v) {
  return v && typeof v.then === 'function';
}

export default promiseMiddleware;
