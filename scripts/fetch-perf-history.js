#!/usr/bin/env node

/**
 * Fetches historical performance test results from GitHub Actions workflow runs.
 * Outputs a JSON file with the aggregated data for visualization.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const WORKFLOW_NAME = 'perf.yaml';
const BRANCH = 'main';
const MAX_RUNS = 50; // Fetch last 50 runs

/**
 * Fetch workflow runs using GitHub CLI
 * @returns {Array<{databaseId: number, createdAt: string, conclusion: string, status: string}>}
 */
function fetchWorkflowRuns() {
  try {
    const cmd = `gh run list --workflow=${WORKFLOW_NAME} --branch=${BRANCH} --limit=${MAX_RUNS} --json databaseId,createdAt,conclusion,status`;
    const output = execSync(cmd, { encoding: 'utf8' });
    // TypeScript ESLint is enabled for JS files in this project
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(output);
  } catch (error) {
    console.error('Error fetching workflow runs:', error.message);
    console.error(
      'Make sure you have gh CLI installed and authenticated (gh auth login)'
    );
    process.exit(1);
  }
}

/**
 * Fetch logs for a specific workflow run
 */
function fetchRunLogs(runId) {
  try {
    const cmd = `gh run view ${runId} --log`;
    return execSync(cmd, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error fetching logs for run ${runId}:`, error.message);
    return null;
  }
}

/**
 * Parse performance results from workflow log
 * Looks for the table output from perf.js
 * @param {string | null} logs
 * @returns {Record<string, number> | null}
 */
function parsePerformanceResults(logs) {
  if (!logs) return null;

  const results = {};
  const lines = logs.split('\n');

  // Table format constants (based on console.table output)
  const _TABLE_INDEX_COL = 0; // Not used but kept for documentation
  const TABLE_NAME_COL = 1;
  const TABLE_LATENCY_AVG_COL = 2;

  // Find the table section in the logs
  for (const line of lines) {
    // Look for table row with actual data (starts with │)
    if (line.includes('│') && !line.includes('Task name')) {
      // Skip header and separator rows
      if (line.includes('(index)') || line.includes('─')) continue;

      // Parse the table row
      // Format: │ index │ 'Task name' │ 'latency avg' │ 'latency med' │ ...
      const parts = line.split('│').map((p) => p.trim());
      if (parts.length >= 4) {
        // Extract task name from column 2 (index 2 because split creates empty first element)
        const taskName = parts[TABLE_NAME_COL + 1]?.replace(/'/g, '');
        // Extract latency average from column 3
        const latencyAvg = parts[TABLE_LATENCY_AVG_COL + 1]?.replace(/'/g, '');

        if (taskName && latencyAvg) {
          // Extract numeric value from latency (e.g., "50.75 ± 2.22%" -> 50.75)
          const match = latencyAvg.match(/^([\d.]+)/);
          if (match) {
            results[taskName] = parseFloat(match[1]);
          }
        }
      }
    }
  }

  return Object.keys(results).length > 0 ? results : null;
}

/**
 * Main function
 */
function main() {
  console.log('Fetching workflow runs...');
  const runs = fetchWorkflowRuns();

  console.log(`Found ${runs.length} workflow runs`);

  const perfHistory = [];

  for (const run of runs) {
    // Only process successful runs
    if (run.conclusion !== 'success') {
      console.log(
        `Skipping run ${run.databaseId} (${run.conclusion || run.status})`
      );
      continue;
    }

    console.log(`Processing run ${run.databaseId} from ${run.createdAt}...`);

    const logs = fetchRunLogs(run.databaseId);
    const results = parsePerformanceResults(logs);

    if (results) {
      perfHistory.push({
        runId: run.databaseId,
        date: run.createdAt,
        results,
      });
      console.log(`  ✓ Extracted ${Object.keys(results).length} test results`);
    } else {
      console.log('  ✗ No performance results found in logs');
    }
  }

  // Sort by date (oldest first)
  perfHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Save to file
  const outputPath = path.join(__dirname, '..', 'web', 'perf-history.json');
  fs.writeFileSync(outputPath, JSON.stringify(perfHistory, null, 2));

  console.log(`\n✓ Saved ${perfHistory.length} runs to ${outputPath}`);
  console.log(
    `  Date range: ${perfHistory[0]?.date} to ${perfHistory[perfHistory.length - 1]?.date}`
  );
}

main();
