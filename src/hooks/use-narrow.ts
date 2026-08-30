import { useEffect, useState } from 'react';

import { config } from '../config';

export function useNarrow(): boolean {
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < config.narrowBreakpoint);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < config.narrowBreakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isNarrow;
}
