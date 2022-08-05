// -DEPRECATE - use LuciErrors in lib
// -
function ApiCallError(message) {
  const error = new Error(message);
  return error;
}
ApiCallError.prototype = Object.create(Error.prototype);

// --
function ExpiredSessionError(message) {
  const error = new Error(message);
  return error;
}
ExpiredSessionError.prototype = Object.create(Error.prototype);

// --
export { ApiCallError, ExpiredSessionError };
