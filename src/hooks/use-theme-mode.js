import { useEffect, useState } from 'react';

export const useThemeMode = () => {
  const [themeMode, setThemeMode] = useState(() => {
    const defaultTheme = 'light'; // get from OS later
    try {
      const item = window.localStorage.getItem('theme');
      return item ? JSON.parse(item) : defaultTheme;
    } catch (error) {
      return defaultTheme;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(themeMode) : value;
      setThemeMode(valueToStore);
      window.localStorage.setItem('theme', JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // console.log(`${themeMode} theme enabled`);
  }, [themeMode]);

  return [themeMode, setValue];
};

export default useThemeMode;
