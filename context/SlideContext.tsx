'use client';
import { createContext, useContext, useState } from 'react';

type SlideContextType = {
  currentSlide: string;
  setCurrentSlide: (slide: string) => void;
};

const SlideContext = createContext<SlideContextType | undefined>(undefined);

export function SlideProvider({ children }: { children: React.ReactNode }) {
  const [currentSlide, setCurrentSlide] = useState('new-year');

  return (
    <SlideContext.Provider value={{ currentSlide, setCurrentSlide }}>
      {children}
    </SlideContext.Provider>
  );
}

export function useSlide() {
  const context = useContext(SlideContext);
  if (context === undefined) {
    throw new Error('useSlide must be used within a SlideProvider');
  }
  return context;
} 