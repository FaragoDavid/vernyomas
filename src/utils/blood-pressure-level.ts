import { ReadingType } from '../types/reading';

export type BloodPressureLevel = 'normal' | 'warning' | 'danger';

const BLOOD_PRESSURE_LEVELS = {
  systolic: {
    warning: parseInt(import.meta.env.VITE_SYSTOLIC_WARNING || '120'),
    danger: parseInt(import.meta.env.VITE_SYSTOLIC_DANGER || '140'),
  },
  diastolic: {
    warning: parseInt(import.meta.env.VITE_DIASTOLIC_WARNING || '80'),
    danger: parseInt(import.meta.env.VITE_DIASTOLIC_DANGER || '90'),
  },
};

export const getReadingLevel = (readingType: ReadingType, readingValue: number): BloodPressureLevel => {
  switch (readingType) {
    case 'systolic':
    case 'diastolic':
      const levels = BLOOD_PRESSURE_LEVELS[readingType];
      return readingValue > levels.danger ? 'danger' : readingValue > levels.warning ? 'warning' : 'normal';
    case 'pulse':
      return 'normal';
  }
};
