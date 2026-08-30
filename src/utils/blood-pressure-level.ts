import { config } from '../config';
import { ReadingType } from '../types/reading';

export type BloodPressureLevel = 'low' | 'normal' | 'elevated' | 'hypertension';

export const getReadingLevel = (readingType: ReadingType, readingValue: number): BloodPressureLevel => {
  switch (readingType) {
    case 'systolic':
    case 'diastolic': {
      const { low, elevated, hypertension } = config.bloodPressureThresholds[readingType];
      if (readingValue < low) return 'low';
      if (readingValue >= hypertension) return 'hypertension';
      if (readingValue >= elevated) return 'elevated';
      return 'normal';
    }
    case 'pulse':
      return 'normal';
  }
};
