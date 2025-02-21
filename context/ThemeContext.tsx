'use client';
import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: any;
  updateTheme: (updates: any) => void;
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState({
    global: {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#ff0000',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
      },
    },
    components: {
      'home-hero-image': {
        src: '/placeholders/landscape-placeholder.svg',
        alt: 'Welcome to our store'
      },
      'marquee-announcement': {
        text: 'Free shipping on orders over ₹999 • Same day dispatch • Easy returns',
        speed: 30
      }
    }
  });

  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateTheme = (updates: any) => {
    setTheme(prev => ({
      ...prev,
      ...updates
    }));
  };

  if (!isClient) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      updateTheme,
      activeSection,
      setActiveSection
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}; 