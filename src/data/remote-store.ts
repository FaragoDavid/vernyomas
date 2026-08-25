import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

import { CACHE_KEY, type Store } from './store';
import { db } from '../services/firebase';
import type { BloodPressureReading } from '../types/reading';

const COLLECTION = 'readings';

export function createRemoteStore(): Store {
  return {
    async readReadings(): Promise<BloodPressureReading[]> {
      try {
        const q = query(collection(db, COLLECTION), orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(q);
        const readings = snapshot.docs.map((doc) => {
          const data = doc.data();
          const timestamp =
            typeof data.timestamp === 'number' ? new Date(data.timestamp) : data.timestamp?.toDate?.() || new Date(data.timestamp);
          return {
            id: doc.id,
            ...data,
            timestamp,
          };
        }) as BloodPressureReading[];

        localStorage.setItem(CACHE_KEY, JSON.stringify(readings.map((r) => ({ ...r, timestamp: r.timestamp.getTime() }))));
        return readings;
      } catch (error) {
        console.error('Failed to read readings from Firestore:', error);
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return [];
        const parsed = JSON.parse(cached);
        return parsed.map((r: any) => ({
          ...r,
          timestamp: new Date(typeof r.timestamp === 'number' ? r.timestamp : r.timestamp),
        }));
      }
    },

    async addReading(reading: Omit<BloodPressureReading, 'id'>): Promise<string> {
      const data = {
        ...reading,
        timestamp: reading.timestamp.getTime(),
      };
      if (data.notes === undefined) delete data.notes;
      const docRef = await addDoc(collection(db, COLLECTION), data);
      return docRef.id;
    },

    async updateReading(reading: BloodPressureReading): Promise<void> {
      const data = {
        ...reading,
        timestamp: reading.timestamp.getTime(),
      };
      if (data.notes === undefined) delete data.notes;
      await updateDoc(doc(db, COLLECTION, reading.id), data);
    },

    async deleteReading(id: string): Promise<void> {
      await deleteDoc(doc(db, COLLECTION, id));
    },
  };
}
