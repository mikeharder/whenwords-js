#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const summaryPath = join(
    __dirname,
    '..',
    'coverage',
    'coverage-summary.json'
  );
  const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
  const total = summary.total;

  console.log('Coverage Summary:');
  console.log('================');
  console.log(
    `Statements: ${total.statements.pct}% (${total.statements.covered}/${total.statements.total})`
  );
  console.log(
    `Branches:   ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`
  );
  console.log(
    `Functions:  ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`
  );
  console.log(
    `Lines:      ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`
  );
} catch (error) {
  console.error('Error reading coverage summary:', error.message);
  process.exit(1);
}
