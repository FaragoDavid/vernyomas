import { CACHE_KEY, type Store } from './store';
import type { BloodPressureReading } from '../types/reading';
import { MOCK_READINGS } from './mock-data';

export function createLocalStore(): Store {
  return {
    async readReadings(): Promise<BloodPressureReading[]> {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp),
        }));
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(MOCK_READINGS));
      return MOCK_READINGS;
    },

    async addReading(reading: Omit<BloodPressureReading, 'id'>): Promise<string> {
      const id = crypto.randomUUID();
      const readings = await this.readReadings();
      readings.push({ ...reading, id });
      localStorage.setItem(CACHE_KEY, JSON.stringify(readings));
      return id;
    },

    async updateReading(reading: BloodPressureReading): Promise<void> {
      const readings = await this.readReadings();
      const index = readings.findIndex((r) => r.id === reading.id);
      if (index !== -1) {
        readings[index] = reading;
        localStorage.setItem(CACHE_KEY, JSON.stringify(readings));
      }
    },

    async deleteReading(id: string): Promise<void> {
      const readings = await this.readReadings();
      const filtered = readings.filter((r) => r.id !== id);
      localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
    },
  };
}
