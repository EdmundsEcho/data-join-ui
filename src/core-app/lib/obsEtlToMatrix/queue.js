// src/lib/obsEtlToMatrix/queue.js

/**
 * @module lib/queue
 *
 * @description
 * Used to support Breadth First search of the tree
 *
 */
export const createQueue = () => {
  // closure
  const queue = [];

  // public
  return {
    enqueue(item) {
      queue.unshift(item);
    },
    dequeue() {
      return queue.pop();
    },
    peek() {
      return queue[queue.length - 1];
    },
    get length() {
      return queue.length;
    },
    isEmpty() {
      return queue.length === 0;
    },
  };
};

export default createQueue;
