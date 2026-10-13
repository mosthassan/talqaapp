/**
 * Talqa Net - Speed Test Statistical & Unit Conversion Helpers
 * Pure functions with Vitest test coverage
 */

/**
 * Calculates the median of an array of numbers.
 * Discards empty input by returning 0.
 */
export function calculateMedian(numbers: number[]): number {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const val1 = sorted[mid - 1] ?? 0;
    const val2 = sorted[mid] ?? 0;
    return Number(((val1 + val2) / 2).toFixed(2));
  }
  return Number((sorted[mid] ?? 0).toFixed(2));
}

/**
 * Calculates the jitter (mean absolute difference between consecutive ping samples).
 * Jitter = (Σ |p[i] - p[i-1]|) / (N - 1)
 */
export function calculateJitter(numbers: number[]): number {
  if (!numbers || numbers.length < 2) return 0;
  let totalDiff = 0;
  for (let i = 1; i < numbers.length; i++) {
    const prev = numbers[i - 1] ?? 0;
    const curr = numbers[i] ?? 0;
    totalDiff += Math.abs(curr - prev);
  }
  const jitter = totalDiff / (numbers.length - 1);
  return Number(jitter.toFixed(2));
}

/**
 * Calculates the trimmed mean of an array of numbers by discarding
 * the highest and lowest portions (default 10% on each end).
 */
export function calculateTrimmedMean(numbers: number[], trimRatio: number = 0.1): number {
  if (!numbers || numbers.length === 0) return 0;
  if (numbers.length <= 2) {
    const sum = numbers.reduce((acc, v) => acc + v, 0);
    return Number((sum / numbers.length).toFixed(2));
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const trimCount = Math.floor(sorted.length * trimRatio);
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);

  if (trimmed.length === 0) {
    const sum = numbers.reduce((acc, v) => acc + v, 0);
    return Number((sum / numbers.length).toFixed(2));
  }

  const sum = trimmed.reduce((acc, v) => acc + v, 0);
  return Number((sum / trimmed.length).toFixed(2));
}

/**
 * Converts bytes transferred over a duration (in seconds) to Mbps (Megabits per second).
 * 1 Byte = 8 bits
 * 1 Megabit = 1,000,000 bits (standard network throughput convention) or 1,048,576 bits.
 * Standard network telecom convention: 1 Mbps = 1,000,000 bits/sec.
 */
export function bytesToMbps(bytes: number, durationSeconds: number): number {
  if (bytes <= 0 || durationSeconds <= 0) return 0;
  const bits = bytes * 8;
  const mbps = bits / durationSeconds / 1_000_000;
  return Number(mbps.toFixed(2));
}
