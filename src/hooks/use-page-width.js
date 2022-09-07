import { useEffect, useState } from 'react';

import throttle from '../core-app/utils/throttle';

export const usePageWidth = () => {
  const [pageWidth, setPageWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = throttle(() => setPageWidth(window.innerWidth), 250, {
      leading: false,
    });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return pageWidth;
};

export default usePageWidth;
