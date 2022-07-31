/**
 * @module lib/combinators
 * @description
 * functional combinator
 * tap :: (a -> *) -> a -> a
 * Applies the function, but returns the original a.
 * Generally used to perform side-effects.
 */
export const tap = (fn, a) => {
  fn(a);
  return a;
};
/**
 * functional combinator
 * Alternative
 */
export const alt = (fn1, fn2) => (val) => {
  return fn1(val) || fn2(val);
};
/**
 * functional combinator
 * Sequence
 */
export const seq = function (/*funcs*/) {
  const funcs = Array.prototype.slice.call(arguments);
  return function (val) {
    funcs.forEach(function (fn) {
      fn(val);
    });
  };
};
/**
 * functional combinator
 * Fork
 */
export const fork = function (join, func1, func2) {
  return function (val) {
    return join(func1(val), func2(val));
  };
};
