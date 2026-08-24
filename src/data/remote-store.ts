import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

import { CACHE_KEY, type Store } from './store';
import { db } from '../services/firebase';
import type { BloodPressureReading } from '../types/reading';

const COLLECTION = 'readings';

export function createRemoteStore(): Store {
  return {
    async readReadings(): Promise<BloodPressureReading[]> {
      try {
        const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const readings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp),
        })) as BloodPressureReading[];

        localStorage.setItem(CACHE_KEY, JSON.stringify(readings));
        return readings;
      } catch (error) {
        console.error('Failed to read readings from Firestore:', error);
        const cached = localStorage.getItem(CACHE_KEY);
        return cached ? JSON.parse(cached).map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })) : [];
      }
    },

    async addReading(reading: Omit<BloodPressureReading, 'id'>): Promise<string> {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...reading,
        timestamp: new Date(reading.timestamp),
      });
      return docRef.id;
    },

    async updateReading(reading: BloodPressureReading): Promise<void> {
      await updateDoc(doc(db, COLLECTION, reading.id), {
        ...reading,
        timestamp: new Date(reading.timestamp),
      });
    },

    async deleteReading(id: string): Promise<void> {
      await deleteDoc(doc(db, COLLECTION, id));
    },
  };
}
