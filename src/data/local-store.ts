import { CACHE_KEY, type Store } from './store';
import type { BloodPressureReading } from '../types/reading';
import { MOCK_READINGS } from './mock-data';
import { sortByTimestampAsc } from '../utils/sort';

export function createLocalStore(): Store {
  return {
    async readReadings(): Promise<BloodPressureReading[]> {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.map((r: any) => ({
          ...r,
          timestamp: new Date(typeof r.timestamp === 'number' ? r.timestamp : r.timestamp),
        }));
      }
      const sorted = [...MOCK_READINGS].sort(sortByTimestampAsc);
      localStorage.setItem(CACHE_KEY, JSON.stringify(sorted.map((r) => ({ ...r, timestamp: r.timestamp.getTime() }))));
      return sorted;
    },

    async addReading(reading: Omit<BloodPressureReading, 'id'>): Promise<string> {
      const id = crypto.randomUUID();
      const readings = await this.readReadings();
      readings.push({ ...reading, id });
      const sorted = readings.sort(sortByTimestampAsc);
      localStorage.setItem(CACHE_KEY, JSON.stringify(sorted.map((r) => ({ ...r, timestamp: r.timestamp.getTime() }))));
      return id;
    },

    async updateReading(reading: BloodPressureReading): Promise<void> {
      const readings = await this.readReadings();
      const index = readings.findIndex((r) => r.id === reading.id);
      if (index !== -1) {
        readings[index] = reading;
        const sorted = readings.sort(sortByTimestampAsc);
        localStorage.setItem(CACHE_KEY, JSON.stringify(sorted.map((r) => ({ ...r, timestamp: r.timestamp.getTime() }))));
      }
    },

    async deleteReading(id: string): Promise<void> {
      const readings = await this.readReadings();
      const filtered = readings.filter((r) => r.id !== id);
      localStorage.setItem(CACHE_KEY, JSON.stringify(filtered.map((r) => ({ ...r, timestamp: r.timestamp.getTime() }))));
    },
  };
}
