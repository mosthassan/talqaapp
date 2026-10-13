import { describe, it, expect } from 'vitest';
import {
  calculateMedian,
  calculateJitter,
  calculateTrimmedMean,
  bytesToMbps,
} from './math';

describe('Speed Test Math Helpers', () => {
  describe('calculateMedian', () => {
    it('returns 0 for empty array', () => {
      expect(calculateMedian([])).toBe(0);
    });

    it('returns middle element for odd length arrays', () => {
      expect(calculateMedian([45, 12, 85, 32, 20])).toBe(32);
      expect(calculateMedian([10])).toBe(10);
    });

    it('returns average of two middle elements for even length arrays', () => {
      expect(calculateMedian([10, 20, 30, 40])).toBe(25);
      expect(calculateMedian([15, 25])).toBe(20);
    });
  });

  describe('calculateJitter', () => {
    it('returns 0 for arrays with less than 2 elements', () => {
      expect(calculateJitter([])).toBe(0);
      expect(calculateJitter([40])).toBe(0);
    });

    it('calculates average consecutive differences correctly', () => {
      // Diffs: |30 - 20| = 10, |25 - 30| = 5, |35 - 25| = 10 -> sum = 25 / 3 = 8.33
      expect(calculateJitter([20, 30, 25, 35])).toBe(8.33);
    });

    it('returns 0 for constant ping values', () => {
      expect(calculateJitter([25, 25, 25, 25])).toBe(0);
    });
  });

  describe('calculateTrimmedMean', () => {
    it('returns 0 for empty array', () => {
      expect(calculateTrimmedMean([])).toBe(0);
    });

    it('trims extreme outliers when array is large', () => {
      // 10 items: 10% trim removes 1 from top and 1 from bottom
      const samples = [5, 50, 52, 53, 50, 51, 52, 54, 51, 200];
      // Trimmed removes 5 and 200, remaining 8 items sum to 413 / 8 = 51.625 -> 51.63
      expect(calculateTrimmedMean(samples, 0.1)).toBe(51.63);
    });

    it('calculates simple average for short arrays', () => {
      expect(calculateTrimmedMean([10, 20])).toBe(15);
    });
  });

  describe('bytesToMbps', () => {
    it('returns 0 for invalid inputs', () => {
      expect(bytesToMbps(0, 5)).toBe(0);
      expect(bytesToMbps(1000, 0)).toBe(0);
      expect(bytesToMbps(-10, 2)).toBe(0);
    });

    it('calculates correct Mbps value', () => {
      // 12,500,000 bytes * 8 = 100,000,000 bits / 1,000,000 = 100 Megabits in 2 seconds = 50 Mbps
      expect(bytesToMbps(12_500_000, 2)).toBe(50);
      // 1,250,000 bytes in 1 second = 10 Mbps
      expect(bytesToMbps(1_250_000, 1)).toBe(10);
    });
  });
});
