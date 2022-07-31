/**
 * @module utils/makeActionCreators
 *
 * @description
 * Utility function.
 */

/**
 * @function
 * @returns {Function}
 */
export const makeActionCreator = (type, ...argNames) => {
  return (...args) => {
    const action = {
      type,
    };
    argNames.forEach((_, index) => {
      action[argNames[index]] = args[index];
    });

    // console.log('new action', action);

    return action;
  };
};

export default makeActionCreator;
