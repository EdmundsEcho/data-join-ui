import { useCallback, useState } from 'react';

/* eslint-disable no-console */

export const useThemeMode = () => {
  const [themeMode, setThemeMode] = useState(() => {
    const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    try {
      const item = window.localStorage.getItem('theme');
      return item ? JSON.parse(item) : defaultTheme;
    } catch (error) {
      return defaultTheme;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(themeMode) : value;
        setThemeMode(valueToStore);
        window.localStorage.setItem('theme', JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error);
      }
    },
    [themeMode],
  );

  return [themeMode, setValue];
};

export default useThemeMode;
