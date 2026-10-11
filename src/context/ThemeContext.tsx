import React, { createContext, useContext, useEffect, useState } from 'react';

export type ColorTheme = 'mystic' | 'soft' | 'warm';

interface ThemeContextType {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'mystic',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem('arcana_color_theme');
      if (saved === 'mystic' || saved === 'soft' || saved === 'warm') {
        return saved;
      }
    } catch {
      // storage disabled
    }
    return 'mystic';
  });

  const setTheme = (newTheme: ColorTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('arcana_color_theme', newTheme);
    } catch {
      // storage disabled
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    // Update theme-color meta tag for PWA status bar on smartphones
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (theme === 'warm') {
        metaThemeColor.setAttribute('content', '#1c120c');
      } else if (theme === 'soft') {
        metaThemeColor.setAttribute('content', '#0f141c');
      } else {
        metaThemeColor.setAttribute('content', '#070714');
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
