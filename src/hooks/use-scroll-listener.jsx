import { useCallback, useRef, useEffect } from 'react';
import { throttle } from '../core-app/utils/common';

export const useScrollListener = ({
  bufferRowCount = 50,
  rowHeight,
  callback,
  className,
  throttleInterval = 200,
}) => {
  // Use a ref for the latch so its state persists across renders without causing re-renders
  const latch = useRef('OPEN');
  const virtualScrollerRef = useRef(null); // Store the element reference to ensure consistent access

  // Memoize the reset function
  const reset = useCallback(() => {
    latch.current = 'OPEN';
  }, []);

  const handler = useCallback(
    throttle((event) => {
      const { scrollTop, clientHeight, scrollHeight } = event.target;
      const threshold = bufferRowCount * rowHeight;
      // Calculate the distance from the bottom
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      // Check if we're within the threshold of the bottom
      if (distanceFromBottom < threshold && latch.current === 'OPEN') {
        latch.current = 'CLOSED';
        throttle(callback(), 1000);
      }
    }, throttleInterval),
    [throttleInterval, bufferRowCount, rowHeight, callback],
  );

  // ---------------------------------------------------------------------------
  // 💥 Register scrolling listener; Get access to the virtual scroller
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
      // Do something with the virtualScroller, e.g., add an event listener
      virtualScroller.addEventListener('scroll', handler);
    }

    return () => {
      virtualScrollerRef.current?.removeEventListener('scroll', handler);
    };
  }, [handler, className]);

  return { reset };
};

export default useScrollListener;
