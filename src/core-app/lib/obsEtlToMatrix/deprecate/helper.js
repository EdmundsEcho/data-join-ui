/**
 * @module lib/helper
 * @description
 * Module to host a range of helper functions (i.e., not for any particular
 * module).
 */

/**
 * Debugging code
 */
export const type = (value) => {
  var regex = /^\[object (\S+?)\]$/;
  var matches = Object.prototype.toString.call(value).match(regex) || [];

  return (matches[1] || 'undefined').toLowerCase();
};
// console.log(type(result[0](false)));
// console.log(result[0](false)); //broken
// console.log(result[1]);
