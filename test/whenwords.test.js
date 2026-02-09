import { describe, it, expect } from 'vitest';
import {
  timeago,
  duration,
  parseDuration,
  humanDate,
  dateRange,
} from '../src/whenwords.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} TimeagoTestInput
 * @property {number|string} timestamp
 * @property {number|string} [reference]
 */

/**
 * @typedef {Object} DurationOptions
 * @property {boolean} [compact]
 * @property {number} [max_units]
 */

/**
 * @typedef {Object} DurationTestInput
 * @property {number} seconds
 * @property {DurationOptions} [options]
 */

/**
 * @typedef {Object} ParseDurationTestInput
 * @property {string} input
 */

/**
 * @typedef {Object} HumanDateTestInput
 * @property {number} timestamp
 * @property {number} reference
 */

/**
 * @typedef {Object} DateRangeTestInput
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} TestCase
 * @property {string} name
 * @property {TimeagoTestInput|DurationTestInput|string|HumanDateTestInput|DateRangeTestInput} input
 * @property {string} [output]
 * @property {boolean} [error]
 */

/**
 * @typedef {Object} TestSuite
 * @property {TestCase[]} timeago
 * @property {TestCase[]} duration
 * @property {TestCase[]} parse_duration
 * @property {TestCase[]} human_date
 * @property {TestCase[]} date_range
 */

// Load tests from YAML files
const testsYaml = fs.readFileSync(
  path.join(__dirname, '..', 'spec', 'tests.yaml'),
  'utf8'
);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const tests = /** @type {TestSuite} */ (/** @type {unknown} */ (yaml.load(testsYaml)));

const jsTestsYaml = fs.readFileSync(
  path.join(__dirname, 'js-tests.yaml'),
  'utf8'
);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const jsTests = /** @type {TestSuite} */ (/** @type {unknown} */ (yaml.load(jsTestsYaml)));

describe('timeago', () => {
  for (const test of tests.timeago) {
    it(test.name, () => {
      const input = /** @type {TimeagoTestInput} */ (test.input);
      expect(timeago(input.timestamp, input.reference)).toBe(test.output);
    });
  }
});

describe('timeago (js-specific)', () => {
  for (const test of jsTests.timeago || []) {
    if (test.error) {
      it(test.name, () => {
        const input = /** @type {TimeagoTestInput} */ (test.input);
        expect(() => timeago(input.timestamp, input.reference)).toThrow();
      });
    } else {
      it(test.name, () => {
        const input = /** @type {TimeagoTestInput} */ (test.input);
        expect(timeago(input.timestamp, input.reference)).toBe(test.output);
      });
    }
  }
});

describe('duration', () => {
  for (const test of tests.duration) {
    if (test.error) {
      it(test.name, () => {
        const input = /** @type {DurationTestInput} */ (test.input);
        expect(() => duration(input.seconds, input.options)).toThrow();
      });
    } else {
      it(test.name, () => {
        const input = /** @type {DurationTestInput} */ (test.input);
        expect(duration(input.seconds, input.options)).toBe(test.output);
      });
    }
  }
});

describe('duration (js-specific)', () => {
  for (const test of jsTests.duration || []) {
    if (test.error) {
      it(test.name, () => {
        const input = /** @type {DurationTestInput} */ (test.input);
        expect(() => duration(input.seconds, input.options)).toThrow();
      });
    } else {
      it(test.name, () => {
        const input = /** @type {DurationTestInput} */ (test.input);
        expect(duration(input.seconds, input.options)).toBe(test.output);
      });
    }
  }
});

describe('parseDuration', () => {
  for (const test of tests.parse_duration) {
    if (test.error) {
      it(test.name, () => {
        const input = /** @type {string} */ (test.input);
        expect(() => parseDuration(input)).toThrow();
      });
    } else {
      it(test.name, () => {
        const input = /** @type {string} */ (test.input);
        expect(parseDuration(input)).toBe(test.output);
      });
    }
  }
});

describe('parseDuration (js-specific)', () => {
  for (const test of jsTests.parse_duration || []) {
    if (test.error) {
      it(test.name, () => {
        const input = /** @type {string} */ (test.input);
        expect(() => parseDuration(input)).toThrow();
      });
    } else {
      it(test.name, () => {
        const input = /** @type {string} */ (test.input);
        expect(parseDuration(input)).toBe(test.output);
      });
    }
  }
});

describe('humanDate', () => {
  for (const test of tests.human_date) {
    it(test.name, () => {
      const input = /** @type {HumanDateTestInput} */ (test.input);
      expect(humanDate(input.timestamp, input.reference)).toBe(test.output);
    });
  }
});

describe('humanDate (js-specific)', () => {
  for (const test of jsTests.human_date || []) {
    it(test.name, () => {
      const input = /** @type {HumanDateTestInput} */ (test.input);
      expect(humanDate(input.timestamp, input.reference)).toBe(test.output);
    });
  }
});

describe('dateRange', () => {
  for (const test of tests.date_range) {
    it(test.name, () => {
      const input = /** @type {DateRangeTestInput} */ (test.input);
      expect(dateRange(input.start, input.end)).toBe(test.output);
    });
  }
});

describe('dateRange (js-specific)', () => {
  for (const test of jsTests.date_range || []) {
    it(test.name, () => {
      const input = /** @type {DateRangeTestInput} */ (test.input);
      expect(dateRange(input.start, input.end)).toBe(test.output);
    });
  }
});
