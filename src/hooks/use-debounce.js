import React from 'react';
import debounce from '../core-app/utils/debounce';

export function useDebounce(callback, wait, immediate) {
  const callbackRef = React.useRef(callback);
  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  });
  return React.useMemo(
    () => debounce((...args) => callbackRef.current(...args), wait, immediate),
    [wait, immediate],
  );
}

export default useDebounce;
