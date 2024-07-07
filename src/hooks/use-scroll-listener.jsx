import { useCallback, useRef, useEffect, useState } from 'react';
import { throttle } from '../core-app/utils/common';

const computeDistanceFromBottom = (scrollWindowSpec) => {
  const { scrollTop, clientHeight, scrollHeight } = scrollWindowSpec;
  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
  return distanceFromBottom;
};

export const useScrollListener = ({
  bufferRowCount = 50,
  rowHeight,
  callback: callbackProp,
  className,
  throttleInterval = 200,
}) => {
  const latch = useRef('OPEN');
  const virtualScrollerRef = useRef(null);

  // derived from props
  const threshold = bufferRowCount * rowHeight;

  const callback = useCallback(() => callbackProp(), [callbackProp]);

  const reset = useCallback(() => {
    latch.current = 'OPEN';
  }, []);

  const throttledCallback = useCallback(() => {
    throttle(callback, throttleInterval)();
  }, [callback, throttleInterval]);

  const handler = useCallback(
    (event) => {
      // Calculate the distance from the bottom. The values changes both when
      // the user scrolls, and when more records are loaded into the component.
      const distanceFromBottom = computeDistanceFromBottom(event.target);
      if (distanceFromBottom < threshold && latch.current === 'OPEN') {
        latch.current = 'CLOSED';
        throttledCallback();
      }
    },
    [throttledCallback, threshold],
  );

  // ---------------------------------------------------------------------------
  // Register scrolling listener; Get access to the virtual scroller
  // 🔑 MuiDataGrid-virtualScroller
  //
  useEffect(() => {
    // register a scroll listener
    const cssClass = `.${className.split(' ').join('.')}`;
    const domSelector = `${cssClass} .MuiDataGrid-virtualScroller`;
    if (!virtualScrollerRef.current) {
      virtualScrollerRef.current = document.querySelector(domSelector);
    }
    const virtualScroller = virtualScrollerRef.current;
    if (virtualScroller) {
      virtualScroller.addEventListener('scroll', handler);
    }

    return () => {
      virtualScrollerRef.current?.removeEventListener('scroll', handler);
    };
  }, [handler, className]);

  return { reset };
};

export default useScrollListener;
