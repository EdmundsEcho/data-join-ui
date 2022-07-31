/**
 * Converts an Promise action, to a resolved action.
 */
const promiseMiddleware = ({ dispatch }) => (next) => (action) => {
  if (isPromise(action.payload)) {
    action.payload.then(
      (res) => {
        action.payload = res;
        dispatch(action);
      },
      (error) => {
        action.error = true;
        action.payload = error;
        dispatch(action);
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
