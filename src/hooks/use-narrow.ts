import { useEffect, useState } from 'react';

export function useNarrow(): boolean {
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isNarrow;
}
