import { getReadingLevel } from './blood-pressure-level';

describe('getReadingLevel', () => {
  describe('systolic', () => {
    it('returns low below 90', () => {
      expect(getReadingLevel('systolic', 89)).toBe('low');
      expect(getReadingLevel('systolic', 0)).toBe('low');
    });

    it('returns normal from 90 up to below 140', () => {
      expect(getReadingLevel('systolic', 90)).toBe('normal');
      expect(getReadingLevel('systolic', 120)).toBe('normal');
      expect(getReadingLevel('systolic', 139)).toBe('normal');
    });

    it('returns elevated from 140 up to below 160', () => {
      expect(getReadingLevel('systolic', 140)).toBe('elevated');
      expect(getReadingLevel('systolic', 159)).toBe('elevated');
    });

    it('returns hypertension at 160 and above', () => {
      expect(getReadingLevel('systolic', 160)).toBe('hypertension');
      expect(getReadingLevel('systolic', 200)).toBe('hypertension');
    });
  });

  describe('diastolic', () => {
    it('returns low below 60', () => {
      expect(getReadingLevel('diastolic', 59)).toBe('low');
      expect(getReadingLevel('diastolic', 0)).toBe('low');
    });

    it('returns normal from 60 up to below 90', () => {
      expect(getReadingLevel('diastolic', 60)).toBe('normal');
      expect(getReadingLevel('diastolic', 80)).toBe('normal');
      expect(getReadingLevel('diastolic', 89)).toBe('normal');
    });

    it('returns elevated from 90 up to below 110', () => {
      expect(getReadingLevel('diastolic', 90)).toBe('elevated');
      expect(getReadingLevel('diastolic', 109)).toBe('elevated');
    });

    it('returns hypertension at 110 and above', () => {
      expect(getReadingLevel('diastolic', 110)).toBe('hypertension');
      expect(getReadingLevel('diastolic', 140)).toBe('hypertension');
    });
  });

  describe('pulse', () => {
    it('always returns normal', () => {
      expect(getReadingLevel('pulse', 0)).toBe('normal');
      expect(getReadingLevel('pulse', 60)).toBe('normal');
      expect(getReadingLevel('pulse', 200)).toBe('normal');
    });
  });
});
