import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

import { CACHE_KEY, type Store } from './store';
import { db } from '../services/firebase';
import type { BloodPressureReading } from '../types/reading';

const COLLECTION = 'readings';

function readCache(): BloodPressureReading[] | null {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return parsed.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) }));
}

function writeCache(readings: BloodPressureReading[]): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(readings.map((r) => ({ ...r, timestamp: r.timestamp.getTime() }))));
}

export function createRemoteStore(): Store {
  return {
    async readReadings(skipCache = false): Promise<BloodPressureReading[]> {
      if (!skipCache) {
        const cached = readCache();
        if (cached) return cached;
      }

      try {
        const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy('timestamp', 'asc')));
        const readings = snapshot.docs.map((d) => {
          const data = d.data();
          const timestamp =
            typeof data.timestamp === 'number' ? new Date(data.timestamp) : data.timestamp?.toDate?.() || new Date(data.timestamp);
          return { id: d.id, ...data, timestamp };
        }) as BloodPressureReading[];

        writeCache(readings);
        return readings;
      } catch (error) {
        console.error('Failed to read readings from Firestore:', error);
        return [];
      }
    },

    async addReading(reading: Omit<BloodPressureReading, 'id'>): Promise<string> {
      const data = { ...reading, timestamp: reading.timestamp.getTime() };
      if (data.notes === undefined) delete data.notes;
      const docRef = await addDoc(collection(db, COLLECTION), data);
      const cached = readCache() ?? [];
      writeCache([...cached, { ...reading, id: docRef.id }].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
      return docRef.id;
    },

    async updateReading(reading: BloodPressureReading): Promise<void> {
      const data = { ...reading, timestamp: reading.timestamp.getTime() };
      if (data.notes === undefined) delete data.notes;
      await updateDoc(doc(db, COLLECTION, reading.id), data);
      const cached = readCache() ?? [];
      writeCache(cached.map((r) => (r.id === reading.id ? reading : r)));
    },

    async deleteReading(id: string): Promise<void> {
      await deleteDoc(doc(db, COLLECTION, id));
      const cached = readCache() ?? [];
      writeCache(cached.filter((r) => r.id !== id));
    },
  };
}
