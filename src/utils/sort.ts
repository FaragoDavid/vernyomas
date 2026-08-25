import type { BloodPressureReading } from '../types/reading';

export const sortByTimestampAsc = (a: BloodPressureReading, b: BloodPressureReading): number =>
  a.timestamp.getTime() - b.timestamp.getTime();
