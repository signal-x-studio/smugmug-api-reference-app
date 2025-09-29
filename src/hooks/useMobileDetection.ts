/**
 * Custom Hook: Mobile Detection
 * 
 * Detects mobile screen size and provides responsive state.
 */

import { useState, useEffect } from 'react';

interface UseMobileDetectionReturn {
  isMobile: boolean;
}

export const useMobileDetection = (): UseMobileDetectionReturn => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return { isMobile };
};