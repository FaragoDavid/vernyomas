import { sortByTimestampAsc } from './sort';
import type { BloodPressureReading } from '../types/reading';

const reading = (timestamp: Date, id = '1'): BloodPressureReading => ({
  id,
  systolic: 120,
  diastolic: 80,
  pulse: 70,
  timestamp,
});

describe('sortByTimestampAsc', () => {
  it('returns negative when a is earlier than b', () => {
    const a = reading(new Date('2026-01-01'));
    const b = reading(new Date('2026-01-02'));
    expect(sortByTimestampAsc(a, b)).toBeLessThan(0);
  });

  it('returns positive when a is later than b', () => {
    const a = reading(new Date('2026-01-02'));
    const b = reading(new Date('2026-01-01'));
    expect(sortByTimestampAsc(a, b)).toBeGreaterThan(0);
  });

  it('returns 0 for equal timestamps', () => {
    const ts = new Date('2026-01-01');
    expect(sortByTimestampAsc(reading(ts), reading(ts))).toBe(0);
  });

  it('sorts an array in ascending order', () => {
    const dates = [new Date('2026-03-01'), new Date('2026-01-01'), new Date('2026-02-01')];
    const readings = dates.map((d, i) => reading(d, String(i)));
    const sorted = [...readings].sort(sortByTimestampAsc);
    expect(sorted.map((r) => r.timestamp)).toEqual([new Date('2026-01-01'), new Date('2026-02-01'), new Date('2026-03-01')]);
  });
});
