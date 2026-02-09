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
 * @typedef {Object} TestCase
 * @property {string} name
 * @property {any} input
 * @property {any} output
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

/**
 * Safely load YAML data
 * @param {any} data - Raw YAML data
 * @returns {unknown} Data as unknown
 */
function toUnknown(data) {
  return /** @type {unknown} */ (data);
}

// Load tests from YAML files
const testsYaml = fs.readFileSync(
  path.join(__dirname, '..', 'spec', 'tests.yaml'),
  'utf8'
);
// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- yaml.load returns any
const tests = /** @type {TestSuite} */ (toUnknown(yaml.load(testsYaml)));

const jsTestsYaml = fs.readFileSync(
  path.join(__dirname, 'js-tests.yaml'),
  'utf8'
);
const jsTests = /** @type {Partial<TestSuite>} */ (
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- yaml.load returns any
  toUnknown(yaml.load(jsTestsYaml))
);

describe('timeago', () => {
  for (const test of tests.timeago) {
    it(test.name, () => {
      expect(timeago(test.input.timestamp, test.input.reference)).toBe(
        test.output
      );
    });
  }
});

describe('timeago (js-specific)', () => {
  for (const test of jsTests.timeago || []) {
    if (test.error) {
      it(test.name, () => {
        expect(() =>
          timeago(test.input.timestamp, test.input.reference)
        ).toThrow();
      });
    } else {
      it(test.name, () => {
        expect(timeago(test.input.timestamp, test.input.reference)).toBe(
          test.output
        );
      });
    }
  }
});

describe('duration', () => {
  for (const test of tests.duration) {
    if (test.error) {
      it(test.name, () => {
        expect(() =>
          duration(test.input.seconds, test.input.options)
        ).toThrow();
      });
    } else {
      it(test.name, () => {
        expect(duration(test.input.seconds, test.input.options)).toBe(
          test.output
        );
      });
    }
  }
});

describe('duration (js-specific)', () => {
  for (const test of jsTests.duration || []) {
    if (test.error) {
      it(test.name, () => {
        expect(() =>
          duration(test.input.seconds, test.input.options)
        ).toThrow();
      });
    } else {
      it(test.name, () => {
        expect(duration(test.input.seconds, test.input.options)).toBe(
          test.output
        );
      });
    }
  }
});

describe('parseDuration', () => {
  for (const test of tests.parse_duration) {
    if (test.error) {
      it(test.name, () => {
        expect(() => parseDuration(test.input)).toThrow();
      });
    } else {
      it(test.name, () => {
        expect(parseDuration(test.input)).toBe(test.output);
      });
    }
  }
});

describe('parseDuration (js-specific)', () => {
  for (const test of jsTests.parse_duration || []) {
    if (test.error) {
      it(test.name, () => {
        expect(() => parseDuration(test.input)).toThrow();
      });
    } else {
      it(test.name, () => {
        expect(parseDuration(test.input)).toBe(test.output);
      });
    }
  }
});

describe('humanDate', () => {
  for (const test of tests.human_date) {
    it(test.name, () => {
      expect(humanDate(test.input.timestamp, test.input.reference)).toBe(
        test.output
      );
    });
  }
});

describe('humanDate (js-specific)', () => {
  for (const test of jsTests.human_date || []) {
    it(test.name, () => {
      expect(humanDate(test.input.timestamp, test.input.reference)).toBe(
        test.output
      );
    });
  }
});

describe('dateRange', () => {
  for (const test of tests.date_range) {
    it(test.name, () => {
      expect(dateRange(test.input.start, test.input.end)).toBe(test.output);
    });
  }
});

describe('dateRange (js-specific)', () => {
  for (const test of jsTests.date_range || []) {
    it(test.name, () => {
      expect(dateRange(test.input.start, test.input.end)).toBe(test.output);
    });
  }
});
