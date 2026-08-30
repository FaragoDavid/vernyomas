import { ReadingType } from '../types/reading';
import { config } from '../config';

export type BloodPressureLevel = 'normal' | 'warning' | 'danger';

export const getReadingLevel = (readingType: ReadingType, readingValue: number): BloodPressureLevel => {
  switch (readingType) {
    case 'systolic':
    case 'diastolic':
      const levels = config.bloodPressureThresholds[readingType];
      return readingValue > levels.danger ? 'danger' : readingValue > levels.warning ? 'warning' : 'normal';
    case 'pulse':
      return 'normal';
  }
};
