import React, { createContext, useState, useContext } from 'react';
import { COLORS as DEFAULT_COLORS } from '../utils/constants';

const ThemeContext = createContext();

// Karanlık Mod Renkleri
const darkColors = {
  ...DEFAULT_COLORS,
  light: '#121212',      // Arka plan rengi (koyu)
  dark: '#FFFFFF',       // Ana metin rengi (açık)
  white: '#1E1E1E',      // Kart/Kutu arka planları (koyu gri)
  gray: '#A0A0A0',       // Gri metinler (daha açık gri)
  modalOverlay: 'rgba(255,255,255,0.1)', // Modal arka planı
};

// Açık Mod Renkleri (Mevcut renklerin)
const lightColors = {
  ...DEFAULT_COLORS,
  modalOverlay: 'rgba(0,0,0,0.5)',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);