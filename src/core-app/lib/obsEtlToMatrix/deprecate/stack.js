/**
 * @module lib/stack
 * @description
 *
 * Used to support making a copy of a tree.
 * @todo delete and use the import `lib/stack` once not using nodeJS.
 */
export const createStack = () => {
  const stack = [];

  return {
    push(x) {
      stack.push(x);
    },
    pop() {
      if (stack.length === 0) {
        return undefined;
      }
      return stack.pop();
    },
    peek() {
      if (stack.length === 0) {
        return undefined;
      }
      return stack[stack.length - 1];
    },
    get length() {
      return stack.length;
    },
    isEmpty() {
      return stack.length === 0;
    },
  };
};
