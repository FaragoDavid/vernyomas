import { createContext, useContext } from 'react';

import type { BloodPressureReading } from '../types/reading';

export const CACHE_KEY = 'vernyomas_readings';

export interface Store {
  readReadings(skipCache?: boolean): Promise<BloodPressureReading[]>;
  addReading(reading: Omit<BloodPressureReading, 'id'>): Promise<string>;
  updateReading(reading: BloodPressureReading): Promise<void>;
  deleteReading(id: string): Promise<void>;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ store, children }: { store: Store; children: React.ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within a StoreProvider');
  return store;
}
