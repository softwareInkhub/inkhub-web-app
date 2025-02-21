import { useState, useEffect } from 'react';

export function useFirstCardTutorial() {
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTutorial(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return showTutorial;
} 