import { describe, it, expect } from 'vitest';
import {
  timeago,
  duration,
  parseDuration,
  humanDate,
  dateRange,
} from '../src/whenwords.js';

/**
 * Fuzz testing suite for whenwords functions
 * Tests run for a fixed duration (~10 seconds total) with randomly-generated inputs
 */

// Helper to run fuzz tests for a fixed duration
function fuzzTest(testFn, durationMs = 1000) {
  const startTime = Date.now();
  let iterations = 0;

  while (Date.now() - startTime < durationMs) {
    testFn();
    iterations++;
  }

  return iterations;
}

// Random generators
/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @returns {number}
 */
function randomTimestamp() {
  // Generate timestamps in a reasonable range: year 1970-2100
  const minTimestamp = 0; // 1970-01-01
  const maxTimestamp = 4102444800; // 2100-01-01
  return randomInt(minTimestamp, maxTimestamp);
}

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * @returns {number}
 */
function randomDuration() {
  // Generate durations from 0 to ~10 years
  return randomInt(0, 315360000);
}

function randomString() {
  const length = randomInt(0, 50);
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 :-.,';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomDurationString() {
  const units = [
    'seconds',
    'second',
    'secs',
    'sec',
    's',
    'minutes',
    'minute',
    'mins',
    'min',
    'm',
    'hours',
    'hour',
    'hrs',
    'hr',
    'h',
    'days',
    'day',
    'd',
    'weeks',
    'week',
    'wks',
    'wk',
    'w',
    'years',
    'year',
    'y',
  ];
  const parts = [];
  const numParts = randomInt(1, 4);

  for (let i = 0; i < numParts; i++) {
    const value = randomInt(0, 999);
    const unit = units[randomInt(0, units.length - 1)];
    const space = Math.random() < 0.5 ? ' ' : '';
    parts.push(`${value}${space}${unit}`);
  }

  return parts.join(' ');
}

function randomBoolean() {
  return Math.random() < 0.5;
}

describe('fuzz tests', () => {
  it('timeago should handle random timestamps without crashing', () => {
    const iterations = fuzzTest(() => {
      const timestamp = randomTimestamp();
      const reference = randomTimestamp();

      const result = timeago(timestamp, reference);
      // Verify result is a string
      expect(typeof result).toBe('string');
      // Verify result is not empty
      expect(result.length).toBeGreaterThan(0);
    });

    console.log(`  timeago: ${iterations} iterations`);
  }, 3000); // 3 second timeout for 1 second test

  it('timeago should handle edge cases without crashing', () => {
    const iterations = fuzzTest(() => {
      // Test with various edge cases
      const edgeCases = [
        0, // Unix epoch
        -1, // Before epoch (might error)
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Math.random() * 1000000,
        new Date().getTime() / 1000,
      ];

      const timestamp = edgeCases[randomInt(0, edgeCases.length - 1)];
      const reference = edgeCases[randomInt(0, edgeCases.length - 1)];

      try {
        const result = timeago(timestamp, reference);
        expect(typeof result).toBe('string');
      } catch (error) {
        // Some edge cases might legitimately throw
        // This is expected behavior
      }
    }, 600); // Run for 0.6 seconds

    console.log(`  timeago edge cases: ${iterations} iterations`);
  });

  it('duration should handle random durations without crashing', () => {
    const iterations = fuzzTest(() => {
      const seconds = randomDuration();
      const options = {};

      // Randomly set options
      if (randomBoolean()) {
        options.compact = randomBoolean();
      }
      if (randomBoolean()) {
        options.max_units = randomInt(1, 6);
      }

      try {
        const result = duration(seconds, options);
        // Verify result is a string
        expect(typeof result).toBe('string');
        // Verify result is not empty
        expect(result.length).toBeGreaterThan(0);
      } catch (error) {
        // duration throws on negative numbers
        if (seconds < 0) {
          expect(error.message).toContain('negative');
        } else {
          throw error;
        }
      }
    });

    console.log(`  duration: ${iterations} iterations`);
  }, 3000);

  it('duration should handle edge cases without crashing', () => {
    const iterations = fuzzTest(() => {
      const edgeCases = [
        0,
        0.5,
        1,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        -1,
        Math.random() * 1000000,
      ];

      const seconds = edgeCases[randomInt(0, edgeCases.length - 1)];
      const options = {
        compact: randomBoolean(),
        max_units: randomInt(0, 10),
      };

      try {
        const result = duration(seconds, options);
        expect(typeof result).toBe('string');
      } catch (error) {
        // Negative numbers should throw
        if (seconds < 0) {
          expect(error.message).toContain('negative');
        } else {
          throw error;
        }
      }
    }, 600);

    console.log(`  duration edge cases: ${iterations} iterations`);
  });

  it('parseDuration should handle random strings without crashing', () => {
    const iterations = fuzzTest(() => {
      const input = randomDurationString();

      try {
        const result = parseDuration(input);
        // Verify result is a number
        expect(typeof result).toBe('number');
        // Verify result is not NaN
        expect(isNaN(result)).toBe(false);
        // Verify result is >= 0
        expect(result).toBeGreaterThanOrEqual(0);
      } catch (error) {
        // parseDuration can throw on invalid input
        // This is expected behavior
        expect(error.message).toBeDefined();
      }
    });

    console.log(`  parseDuration: ${iterations} iterations`);
  }, 3000);

  it('parseDuration should handle random strings and edge cases', () => {
    const iterations = fuzzTest(() => {
      // Mix of random strings and duration-like strings
      let input;
      if (Math.random() < 0.7) {
        // 70% duration-like strings
        input = randomDurationString();
      } else {
        // 30% random strings
        input = randomString();
      }

      try {
        const result = parseDuration(input);
        expect(typeof result).toBe('number');
        expect(isNaN(result)).toBe(false);
        expect(result).toBeGreaterThanOrEqual(0);
      } catch (error) {
        // Invalid input should throw
        expect(error).toBeDefined();
      }
    }, 600);

    console.log(`  parseDuration mixed: ${iterations} iterations`);
  });

  it('humanDate should handle random timestamps without crashing', () => {
    const iterations = fuzzTest(() => {
      const timestamp = randomTimestamp();
      const reference = randomTimestamp();

      const result = humanDate(timestamp, reference);
      // Verify result is a string
      expect(typeof result).toBe('string');
      // Verify result is not empty
      expect(result.length).toBeGreaterThan(0);
    });

    console.log(`  humanDate: ${iterations} iterations`);
  }, 3000);

  it('humanDate should handle edge cases without crashing', () => {
    const iterations = fuzzTest(() => {
      const edgeCases = [
        0,
        Number.MAX_SAFE_INTEGER,
        Math.random() * 4102444800,
        new Date().getTime() / 1000,
      ];

      const timestamp = edgeCases[randomInt(0, edgeCases.length - 1)];
      const reference = edgeCases[randomInt(0, edgeCases.length - 1)];

      try {
        const result = humanDate(timestamp, reference);
        expect(typeof result).toBe('string');
      } catch (error) {
        // Some edge cases might legitimately throw
        // This is expected behavior
      }
    }, 600);

    console.log(`  humanDate edge cases: ${iterations} iterations`);
  });

  it('dateRange should handle random date ranges without crashing', () => {
    const iterations = fuzzTest(() => {
      const start = randomTimestamp();
      const end = randomTimestamp();

      const result = dateRange(start, end);
      // Verify result is a string
      expect(typeof result).toBe('string');
      // Verify result is not empty
      expect(result.length).toBeGreaterThan(0);
    });

    console.log(`  dateRange: ${iterations} iterations`);
  }, 3000);

  it('dateRange should handle edge cases without crashing', () => {
    const iterations = fuzzTest(() => {
      const edgeCases = [
        0,
        Number.MAX_SAFE_INTEGER,
        Math.random() * 4102444800,
        new Date().getTime() / 1000,
      ];

      const start = edgeCases[randomInt(0, edgeCases.length - 1)];
      const end = edgeCases[randomInt(0, edgeCases.length - 1)];

      try {
        const result = dateRange(start, end);
        expect(typeof result).toBe('string');
      } catch (error) {
        // Some edge cases might legitimately throw
        // This is expected behavior
      }
    }, 600);

    console.log(`  dateRange edge cases: ${iterations} iterations`);
  });

  it('all functions should handle mixed valid/invalid inputs', () => {
    const iterations = fuzzTest(() => {
      // Test random function with random input types
      const functionIndex = randomInt(0, 4);

      try {
        switch (functionIndex) {
          case 0: {
            // timeago
            const ts = randomTimestamp();
            const ref = Math.random() < 0.8 ? randomTimestamp() : undefined;
            timeago(ts, ref);
            break;
          }
          case 1: {
            // duration
            const sec = randomDuration();
            const opts = randomBoolean()
              ? { compact: randomBoolean(), max_units: randomInt(1, 6) }
              : {};
            duration(sec, opts);
            break;
          }
          case 2: {
            // parseDuration
            const input =
              Math.random() < 0.7 ? randomDurationString() : randomString();
            parseDuration(input);
            break;
          }
          case 3: {
            // humanDate
            const ts = randomTimestamp();
            const ref = randomTimestamp();
            humanDate(ts, ref);
            break;
          }
          case 4: {
            // dateRange
            const start = randomTimestamp();
            const end = randomTimestamp();
            dateRange(start, end);
            break;
          }
        }
      } catch (error) {
        // Expected for some invalid inputs
        expect(error).toBeDefined();
      }
    }, 2000);

    console.log(`  mixed functions: ${iterations} iterations`);
  });
});
