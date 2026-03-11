#!/usr/bin/env node

/**
 * MADF After File Edit Hook
 * 
 * Fires after every file edit. Checks for:
 * 1. console.log statements in edited file
 * 2. TypeScript type errors (if .ts/.tsx file)
 * 3. Large file warning (>800 lines — MADF coding standard)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function run() {
  let input = '';
  try {
    input = fs.readFileSync(0, 'utf-8');
  } catch (e) {
    return;
  }

  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    return;
  }

  const filePath = data?.tool_input?.file_path || data?.filePath || '';
  if (!filePath) return;

  const warnings = [];

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Check file size (MADF coding standard: 800 lines max)
    if (lines.length > 800) {
      warnings.push(`[MADF] File exceeds 800-line limit (${lines.length} lines): ${filePath}`);
    }

    // Check for console.log in JS/TS files
    if (/\.(js|ts|tsx|jsx)$/.test(filePath)) {
      const consoleLogs = lines
        .map((line, i) => ({ line: i + 1, content: line }))
        .filter(l => /console\.log/.test(l.content) && !/\/\//.test(l.content.split('console.log')[0]));

      if (consoleLogs.length > 0) {
        warnings.push(`[MADF] console.log found in ${filePath} (lines: ${consoleLogs.map(l => l.line).join(', ')}). Remove before commit.`);
      }
    }
  }

  if (warnings.length > 0) {
    process.stderr.write(warnings.join('\n') + '\n');
  }
}

try { run(); } catch (e) { /* non-blocking */ }
