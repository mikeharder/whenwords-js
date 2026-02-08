import { describe, it, expect } from 'vitest';
import {
  timeago,
  parseDuration,
  humanDate,
  dateRange,
} from '../src/whenwords.js';

describe('extra coverage tests', () => {
  describe('normalizeTimestamp edge cases', () => {
    it('should handle invalid string timestamp', () => {
      expect(() => timeago('invalid-date-string', 1609459200)).toThrow(
        'Invalid timestamp format'
      );
    });

    it('should handle valid ISO 8601 string timestamp', () => {
      // Explicitly test valid string parsing (line 17 coverage)
      expect(timeago('2024-01-01T00:00:00Z', '2024-01-01T03:00:00Z')).toBe(
        '3 hours ago'
      );
    });

    it('should handle Date object as timestamp', () => {
      const date = new Date('2024-03-15T12:00:00Z');
      const refDate = new Date('2024-03-15T15:00:00Z');
      expect(timeago(date, refDate)).toBe('3 hours ago');
    });

    it('should handle Date object as reference', () => {
      const refDate = new Date('2024-03-15T15:00:00Z');
      expect(timeago(1710507600, refDate)).toBe('2 hours ago');
    });

    it('should throw on invalid timestamp type', () => {
      expect(() => timeago(null, 1609459200)).toThrow(
        'Invalid timestamp format'
      );
    });

    it('should throw on invalid timestamp type (array)', () => {
      expect(() => timeago([1, 2, 3], 1609459200)).toThrow(
        'Invalid timestamp format'
      );
    });

    it('should throw on invalid timestamp type (object)', () => {
      expect(() => timeago({ time: 123 }, 1609459200)).toThrow(
        'Invalid timestamp format'
      );
    });
  });

  describe('parseDuration edge cases', () => {
    it('should handle potential negative value parsing', () => {
      // The code checks for negative values after parsing, but also before
      // Testing the regex that detects negative numbers
      expect(() => parseDuration('- 5 hours')).toThrow(
        'Negative durations not allowed'
      );
    });

    it('should throw on whitespace-only string', () => {
      expect(() => parseDuration('   ')).toThrow('Empty string');
    });

    it('should throw on non-string input', () => {
      expect(() => parseDuration(123)).toThrow('Empty string');
    });
  });

  describe('additional Date object coverage', () => {
    it('should handle Date objects in humanDate', () => {
      const date = new Date('2024-03-15T00:00:00Z');
      const ref = new Date('2024-03-15T12:00:00Z');
      expect(humanDate(date, ref)).toBe('Today');
    });

    it('should handle Date objects in dateRange', () => {
      const start = new Date('2024-03-15T00:00:00Z');
      const end = new Date('2024-03-20T00:00:00Z');
      expect(dateRange(start, end)).toBe('March 15–20, 2024');
    });
  });
});
