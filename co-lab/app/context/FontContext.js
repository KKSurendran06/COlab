// app/context/FontContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const FontContext = createContext();

export function FontContextProvider({ children }) {
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('default');
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [highContrast, setHighContrast] = useState(false);

  // Load preferences from localStorage on startup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFontSize = localStorage.getItem('fontSize');
      const savedFontFamily = localStorage.getItem('fontFamily');
      const savedLineSpacing = localStorage.getItem('lineSpacing');
      const savedHighContrast = localStorage.getItem('highContrast');
      
      if (savedFontSize) setFontSize(savedFontSize);
      if (savedFontFamily) setFontFamily(savedFontFamily);
      if (savedLineSpacing) setLineSpacing(parseFloat(savedLineSpacing));
      if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fontSize', fontSize);
      localStorage.setItem('fontFamily', fontFamily);
      localStorage.setItem('lineSpacing', lineSpacing.toString());
      localStorage.setItem('highContrast', highContrast.toString());
      
      // Apply line spacing to body
      document.body.style.lineHeight = `${lineSpacing}`;
      
      // Apply high contrast if enabled
      if (highContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    }
  }, [fontSize, fontFamily, lineSpacing, highContrast]);

  const changeFontSize = (size) => {
    setFontSize(size);
  };

  const changeFontFamily = (family) => {
    setFontFamily(family);
  };

  const changeLineSpacing = (spacing) => {
    setLineSpacing(spacing);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  return (
    <FontContext.Provider value={{
      fontSize,
      fontFamily,
      lineSpacing,
      highContrast,
      changeFontSize,
      changeFontFamily,
      changeLineSpacing,
      toggleHighContrast
    }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  return useContext(FontContext);
}