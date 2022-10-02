import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useLocationChange = (callback) => {
  const location = useLocation();
  useEffect(() => {
    callback(location);
  }, [location, callback]);
};
