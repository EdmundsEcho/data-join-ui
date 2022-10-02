import { createContext } from 'react';

export const ThemeContext = createContext({
  theme: 'themeMode',
  toggleThemeMode: () => {},
});

export default ThemeContext;
