import { createLocalStore } from './local-store';
import { CACHE_KEY } from './store';
import { MOCK_READINGS } from './mock-data';
import { makeLocalStorageMock } from './test-helpers';

let localStorageMock: ReturnType<typeof makeLocalStorageMock>;

beforeEach(() => {
  localStorageMock = makeLocalStorageMock();
  Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true, configurable: true });
});

const reading = (overrides: Partial<{ id: string; systolic: number; diastolic: number; pulse: number; timestamp: Date }> = {}) => ({
  id: 'r1',
  systolic: 120,
  diastolic: 80,
  pulse: 70,
  timestamp: new Date('2026-01-01T10:00:00Z'),
  ...overrides,
});

describe('createLocalStore', () => {
  describe('readReadings', () => {
    it('returns sorted mock data and writes cache when cache is empty', async () => {
      const store = createLocalStore();
      const readings = await store.readReadings();

      expect(readings).toHaveLength(MOCK_READINGS.length);
      for (let i = 1; i < readings.length; i++) {
        expect(readings[i].timestamp.getTime()).toBeGreaterThanOrEqual(readings[i - 1].timestamp.getTime());
      }
      expect(localStorageMock.getItem(CACHE_KEY)).not.toBeNull();
    });

    it('returns cached data with timestamps as Date objects when cache is populated', async () => {
      const cached = [reading()];
      localStorageMock.setItem(CACHE_KEY, JSON.stringify(cached.map((r) => ({ ...r, timestamp: r.timestamp.getTime() }))));

      const store = createLocalStore();
      const readings = await store.readReadings();

      expect(readings).toHaveLength(1);
      expect(readings[0].timestamp).toBeInstanceOf(Date);
      expect(readings[0].timestamp.getTime()).toBe(cached[0].timestamp.getTime());
    });
  });

  describe('addReading', () => {
    it('appends reading with a new id, writes sorted cache, and returns the id', async () => {
      const uuidSpy = vi
        .spyOn(globalThis.crypto, 'randomUUID')
        .mockReturnValue('test-uuid' as `${string}-${string}-${string}-${string}-${string}`);

      const store = createLocalStore();
      const { id: _, ...newReading } = reading();
      const id = await store.addReading(newReading);

      expect(id).toBe('test-uuid');
      const cached = JSON.parse(localStorageMock.getItem(CACHE_KEY)!);
      expect(cached.some((r: { id: string }) => r.id === 'test-uuid')).toBe(true);

      uuidSpy.mockRestore();
    });

    it('inserts reading in sorted order by timestamp', async () => {
      const early = reading({ id: 'e1', timestamp: new Date('2026-01-01T08:00:00Z') });
      const late = reading({ id: 'l1', timestamp: new Date('2026-01-01T20:00:00Z') });
      localStorageMock.setItem(CACHE_KEY, JSON.stringify([early, late].map((r) => ({ ...r, timestamp: r.timestamp.getTime() }))));

      vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('mid-uuid' as `${string}-${string}-${string}-${string}-${string}`);
      const store = createLocalStore();
      const { id: _, ...midReading } = reading({ timestamp: new Date('2026-01-01T12:00:00Z') });
      await store.addReading(midReading);

      const cached: { id: string; timestamp: number }[] = JSON.parse(localStorageMock.getItem(CACHE_KEY)!);
      expect(cached.map((r) => r.id)).toEqual(['e1', 'mid-uuid', 'l1']);
      vi.restoreAllMocks();
    });
  });

  describe('updateReading', () => {
    it('replaces the matching reading in the cache', async () => {
      const original = reading({ id: 'r1', systolic: 120 });
      localStorageMock.setItem(CACHE_KEY, JSON.stringify([{ ...original, timestamp: original.timestamp.getTime() }]));

      const store = createLocalStore();
      await store.updateReading({ ...original, systolic: 135 });

      const cached: { id: string; systolic: number }[] = JSON.parse(localStorageMock.getItem(CACHE_KEY)!);
      expect(cached[0].systolic).toBe(135);
    });

    it('does nothing when id is not found', async () => {
      const r = reading({ id: 'r1' });
      const serialised = JSON.stringify([{ ...r, timestamp: r.timestamp.getTime() }]);
      localStorageMock.setItem(CACHE_KEY, serialised);

      const store = createLocalStore();
      await store.updateReading({ ...r, id: 'nonexistent' });

      expect(localStorageMock.getItem(CACHE_KEY)).toBe(serialised);
    });
  });

  describe('deleteReading', () => {
    it('removes the reading with the given id from the cache', async () => {
      const r1 = reading({ id: 'r1' });
      const r2 = reading({ id: 'r2' });
      localStorageMock.setItem(CACHE_KEY, JSON.stringify([r1, r2].map((r) => ({ ...r, timestamp: r.timestamp.getTime() }))));

      const store = createLocalStore();
      await store.deleteReading('r1');

      const cached: { id: string }[] = JSON.parse(localStorageMock.getItem(CACHE_KEY)!);
      expect(cached.map((r) => r.id)).toEqual(['r2']);
    });
  });
});
