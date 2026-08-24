import type { BloodPressureReading } from '../types/reading';

export const MOCK_READINGS: BloodPressureReading[] = Array.from({ length: 90 }, (_, i) => {
  const daysAgo = Math.floor(i / 3);
  const readingOfDay = i % 3;
  const date = new Date('2026-08-24');
  date.setDate(date.getDate() - daysAgo);

  const times = [
    { hour: 8, minute: 30, notes: 'Morning, after coffee' },
    { hour: 14, minute: 15, notes: 'Afternoon' },
    { hour: 20, minute: 0, notes: 'Evening, relaxed' },
  ];

  const timeConfig = times[readingOfDay];
  date.setHours(timeConfig.hour, timeConfig.minute, 0, 0);

  const baseSystolic = 120 + Math.sin(i * 0.5) * 15;
  const baseDiastolic = 78 + Math.sin(i * 0.5) * 10;
  const basePulse = 72 + Math.sin(i * 0.3) * 10;

  return {
    id: String(i + 1),
    systolic: Math.round(baseSystolic + (Math.random() - 0.5) * 10),
    diastolic: Math.round(baseDiastolic + (Math.random() - 0.5) * 8),
    pulse: Math.round(basePulse + (Math.random() - 0.5) * 6),
    timestamp: date,
    notes: readingOfDay === 0 || Math.random() > 0.7 ? timeConfig.notes : undefined,
  };
});
