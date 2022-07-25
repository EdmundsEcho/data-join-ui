// --
function ApiCallError(message) {
  const error = new Error(message)
  return error
}
ApiCallError.prototype = Object.create(Error.prototype)

// --
function ApiResponseError(message) {
  const error = new Error(message)
  return error
}
ApiResponseError.prototype = Object.create(Error.prototype)

// --
function ExpiredSessionError(message) {
  const error = new Error(message)
  return error
}
ExpiredSessionError.prototype = Object.create(Error.prototype)

// --
export { ApiCallError, ApiResponseError, ExpiredSessionError }
