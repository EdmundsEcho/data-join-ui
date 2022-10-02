import React from 'react';
/**
 *
 * DEPRECATE - instead use: use-abort-signal
 *
 * Problem: How provide an effect access to the future state of a component.
 *
 *   👉  useEffect captures the state and prop values at the time it was invoked
 *       (rendered, clicked etc.).
 *
 *   👉  async calls can "get out of sync" with effect (when presumably awaiting
 *       a value)
 *
 *  Example use case: avoid setting state when the component that made the
 *  data request is no longer mounted on the DOM.
 *
 * @function
 */
function useMountedState() {
  const ref = React.useRef(false);
  const isMounted = React.useCallback(() => ref.current, []);

  React.useEffect(() => {
    // when first mounted set ref = true
    ref.current = true;

    // when unmounted set ref = false
    return () => {
      ref.current = false;
    };
  }, []); // run only once

  return isMounted;
}

export default useMountedState;
