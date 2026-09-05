import { createRemoteStore } from './remote-store';
import { CACHE_KEY } from './store';
import { makeLocalStorageMock } from './test-helpers';

vi.mock('../services/firebase', () => ({ db: {} }));

const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: () => 'collection-ref',
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  doc: () => 'doc-ref',
  query: (...args: unknown[]) => args[0],
  orderBy: () => {},
}));

let localStorageMock: ReturnType<typeof makeLocalStorageMock>;

beforeEach(() => {
  localStorageMock = makeLocalStorageMock();
  Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true, configurable: true });
  vi.clearAllMocks();
});

const ts = new Date('2026-01-15T10:00:00Z');
const cachedReading = { id: 'r1', systolic: 120, diastolic: 80, pulse: 70, timestamp: ts };

function seedCache(readings = [cachedReading]) {
  localStorageMock.setItem(CACHE_KEY, JSON.stringify(readings.map((r) => ({ ...r, timestamp: r.timestamp.getTime() }))));
}

function firestoreDoc(id: string, data: Record<string, unknown>) {
  return { id, data: () => data };
}

describe('createRemoteStore', () => {
  describe('readReadings', () => {
    it('returns from cache without hitting Firestore when cache is populated', async () => {
      seedCache();
      const store = createRemoteStore();
      const readings = await store.readReadings();

      expect(readings).toHaveLength(1);
      expect(readings[0].timestamp).toBeInstanceOf(Date);
      expect(mockGetDocs).not.toHaveBeenCalled();
    });

    it('fetches from Firestore and writes cache when cache is empty', async () => {
      mockGetDocs.mockResolvedValue({ docs: [firestoreDoc('r1', { systolic: 120, diastolic: 80, pulse: 70, timestamp: ts.getTime() })] });
      const store = createRemoteStore();
      const readings = await store.readReadings();

      expect(mockGetDocs).toHaveBeenCalled();
      expect(readings).toHaveLength(1);
      expect(readings[0].id).toBe('r1');
      expect(localStorageMock.getItem(CACHE_KEY)).not.toBeNull();
    });

    it('skips cache and fetches from Firestore when skipCache is true', async () => {
      seedCache();
      mockGetDocs.mockResolvedValue({ docs: [firestoreDoc('r2', { systolic: 130, diastolic: 85, pulse: 75, timestamp: ts.getTime() })] });
      const store = createRemoteStore();
      const readings = await store.readReadings(true);

      expect(mockGetDocs).toHaveBeenCalled();
      expect(readings[0].id).toBe('r2');
    });
  });

  describe('addReading', () => {
    it('calls addDoc and appends reading to the cache', async () => {
      seedCache([]);
      mockAddDoc.mockResolvedValue({ id: 'new-id' });
      const store = createRemoteStore();
      const { id: _, ...newReading } = { ...cachedReading };
      const id = await store.addReading(newReading);

      expect(id).toBe('new-id');
      expect(mockAddDoc).toHaveBeenCalled();
      const cached: { id: string }[] = JSON.parse(localStorageMock.getItem(CACHE_KEY)!);
      expect(cached[0].id).toBe('new-id');
    });
  });

  describe('updateReading', () => {
    it('calls updateDoc and updates matching entry in cache', async () => {
      seedCache();
      mockUpdateDoc.mockResolvedValue(undefined);
      const store = createRemoteStore();
      await store.updateReading({ ...cachedReading, systolic: 135 });

      expect(mockUpdateDoc).toHaveBeenCalled();
      const cached: { id: string; systolic: number }[] = JSON.parse(localStorageMock.getItem(CACHE_KEY)!);
      expect(cached[0].systolic).toBe(135);
    });
  });

  describe('deleteReading', () => {
    it('calls deleteDoc and removes entry from cache', async () => {
      seedCache();
      mockDeleteDoc.mockResolvedValue(undefined);
      const store = createRemoteStore();
      await store.deleteReading('r1');

      expect(mockDeleteDoc).toHaveBeenCalled();
      const cached: unknown[] = JSON.parse(localStorageMock.getItem(CACHE_KEY)!);
      expect(cached).toHaveLength(0);
    });
  });
});
