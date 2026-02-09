import { Bench } from 'tinybench';
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

// Load tests from YAML file
const testsYaml = fs.readFileSync(
  path.join(__dirname, '..', 'spec', 'tests.yaml'),
  'utf8'
);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const tests = /** @type {TestSuite} */ (/** @type {unknown} */ (yaml.load(testsYaml)));

const bench = new Bench({ time: 50, warmupTime: 10 });

// Select a subset of timeago tests for benchmarking
const timeagoTests = [
  tests.timeago.find((t) => t.name === 'just now - identical timestamps'),
  tests.timeago.find((t) => t.name === '30 minutes ago'),
  tests.timeago.find((t) => t.name === '5 hours ago'),
  tests.timeago.find((t) => t.name === '25 days ago'),
  tests.timeago.find((t) => t.name === '5 years ago'),
];

for (const test of timeagoTests) {
  if (test) {
    bench.add(`timeago - ${test.name}`, () => {
      const input = /** @type {TimeagoTestInput} */ (test.input);
      timeago(input.timestamp, input.reference);
    });
  }
}

// Select a subset of duration tests for benchmarking
const durationTests = [
  tests.duration.find((t) => t.name === 'zero seconds'),
  tests.duration.find((t) => t.name === '1 minute 30 seconds'),
  tests.duration.find((t) => t.name === '1 hour'),
  tests.duration.find((t) => t.name === '1 day'),
  tests.duration.find((t) => t.name === '1 year (365 days)'),
  tests.duration.find((t) => t.name === 'compact - 2h 30m'),
  tests.duration.find((t) => t.name === 'max_units 1 - days only'),
];

for (const test of durationTests) {
  if (test) {
    bench.add(`duration - ${test.name}`, () => {
      const input = /** @type {DurationTestInput} */ (test.input);
      duration(input.seconds, input.options);
    });
  }
}

// Select a subset of parse_duration tests for benchmarking
const parseDurationTests = [
  tests.parse_duration.find((t) => t.name === 'compact hours minutes'),
  tests.parse_duration.find((t) => t.name === 'verbose'),
  tests.parse_duration.find((t) => t.name === 'colon notation h:mm'),
  tests.parse_duration.find((t) => t.name === 'decimal hours'),
  tests.parse_duration.find((t) => t.name === 'mixed compact'),
];

for (const test of parseDurationTests) {
  if (test) {
    bench.add(`parseDuration - ${test.name}`, () => {
      const input = /** @type {string} */ (test.input);
      parseDuration(input);
    });
  }
}

// Select a subset of human_date tests for benchmarking
const humanDateTests = [
  tests.human_date.find((t) => t.name === 'today'),
  tests.human_date.find((t) => t.name === 'yesterday'),
  tests.human_date.find((t) => t.name === 'last Friday (3 days ago)'),
  tests.human_date.find((t) => t.name === 'same year different month'),
  tests.human_date.find((t) => t.name === 'previous year'),
];

for (const test of humanDateTests) {
  if (test) {
    bench.add(`humanDate - ${test.name}`, () => {
      const input = /** @type {HumanDateTestInput} */ (test.input);
      humanDate(input.timestamp, input.reference);
    });
  }
}

// Select a subset of date_range tests for benchmarking
const dateRangeTests = [
  tests.date_range.find((t) => t.name === 'same day'),
  tests.date_range.find((t) => t.name === 'same month range'),
  tests.date_range.find((t) => t.name === 'same year different months'),
  tests.date_range.find((t) => t.name === 'different years'),
];

for (const test of dateRangeTests) {
  if (test) {
    bench.add(`dateRange - ${test.name}`, () => {
      const input = /** @type {DateRangeTestInput} */ (test.input);
      dateRange(input.start, input.end);
    });
  }
}

await bench.run();

console.table(bench.table());
