#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * @typedef {Object} FunctionInfo
 * @property {string} name - Function name
 * @property {number} startLine - Starting line number
 * @property {number|null} endLine - Ending line number
 * @property {number} loc - Lines of code
 */

/**
 * @typedef {Object} AnalysisResults
 * @property {FunctionInfo[]} functions - Array of function information
 * @property {number} totalLoc - Total lines of code
 * @property {number} totalLines - Total lines in file
 */

/**
 * Calculate code complexity metrics for a JavaScript file
 * @param {string} filePath - Path to the JavaScript file
 * @returns {AnalysisResults} Analysis results
 */
function analyzeCodeComplexity(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Track functions and their line ranges
  const functions = [];
  let currentFunction = null;
  let braceDepth = 0;
  let functionStartDepth = 0;
  let inMultilineComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track multiline comments
    if (trimmed.startsWith('/*')) {
      inMultilineComment = true;
    }
    if (trimmed.includes('*/')) {
      inMultilineComment = false;
      continue;
    }
    if (inMultilineComment) {
      continue;
    }

    // Detect function declarations (only at top level)
    const functionMatch = line.match(/^(?:export\s+)?function\s+(\w+)/);
    if (functionMatch && braceDepth === 0) {
      currentFunction = {
        name: functionMatch[1],
        startLine: i + 1,
        endLine: null,
        loc: 0,
      };
      functionStartDepth = braceDepth;
    }

    // Track brace depth to find function end
    for (const char of line) {
      if (char === '{') braceDepth++;
      if (char === '}') braceDepth--;
    }

    // Count non-empty, non-comment lines within the function
    if (currentFunction) {
      if (trimmed !== '' && !trimmed.startsWith('//')) {
        currentFunction.loc++;
      }

      // Function ended when we return to the starting depth
      if (braceDepth === functionStartDepth && currentFunction.loc > 0) {
        currentFunction.endLine = i + 1;
        functions.push(currentFunction);
        currentFunction = null;
      }
    }
  }

  // Calculate total non-empty, non-comment lines
  let totalLoc = 0;
  inMultilineComment = false;
  for (const line of lines) {
    const trimmed = line.trim();

    // Track multiline comments
    if (trimmed.startsWith('/*')) {
      inMultilineComment = true;
    }
    if (trimmed.includes('*/')) {
      inMultilineComment = false;
      continue;
    }
    if (inMultilineComment) {
      continue;
    }

    if (trimmed !== '' && !trimmed.startsWith('//')) {
      totalLoc++;
    }
  }

  return { functions, totalLoc, totalLines: lines.length };
}

/**
 * Format the complexity report
 * @param {AnalysisResults} results - Analysis results
 * @returns {string} Formatted report
 */
function formatReport(results) {
  const { functions, totalLoc, totalLines } = results;

  let report = '## 📊 Code Complexity\n\n';
  report += '### Lines of Code per Function\n\n';
  report += '| Function | LOC | Lines |\n';
  report += '|----------|-----|-------|\n';

  // Sort functions by LOC descending
  const sortedFunctions = [...functions].sort((a, b) => b.loc - a.loc);

  for (const func of sortedFunctions) {
    report += `| \`${func.name}\` | ${func.loc} | ${func.startLine}-${func.endLine} |\n`;
  }

  report += '\n';
  report += '### Summary\n\n';
  report += `- **Total Functions**: ${functions.length}\n`;
  report += `- **Total LOC** (non-empty, non-comment): ${totalLoc}\n`;
  report += `- **Total Lines**: ${totalLines}\n`;
  report += `- **Average LOC per Function**: ${Math.round(totalLoc / functions.length)}\n`;

  return report;
}

// Main execution
const filePath = resolve(process.argv[2] || 'src/whenwords.js');
const results = analyzeCodeComplexity(filePath);
const report = formatReport(results);
console.log(report);
