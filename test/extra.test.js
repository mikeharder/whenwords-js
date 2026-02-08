import { describe, it, expect } from 'vitest';
import { timeago, humanDate, dateRange } from '../src/whenwords.js';

describe('extra coverage tests', () => {
  describe('Date object support', () => {
    it('should handle ISO 8601 string timestamp', () => {
      // Test that ISO 8601 strings are accepted and parsed correctly
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
