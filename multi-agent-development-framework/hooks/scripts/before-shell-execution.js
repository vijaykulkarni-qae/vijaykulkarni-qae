#!/usr/bin/env node

/**
 * MADF Before Shell Execution Hook
 * 
 * Fires before shell commands. Checks for:
 * 1. git push — reminds to review changes first
 * 2. Long-running dev server commands — suggests backgrounding
 */

const fs = require('fs');

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

  const command = data?.tool_input?.command || data?.command || '';
  if (!command) return;

  const warnings = [];

  // Git push reminder
  if (/git\s+push/.test(command) && !/--dry-run/.test(command)) {
    warnings.push('[MADF] git push detected. Have you:');
    warnings.push('  - Run the verification-loop? (Build → Type → Lint → Test → Security → Diff)');
    warnings.push('  - Checked DECISIONS.md for uncommitted ADRs?');
    warnings.push('  - Updated PROJECT_STATE.md?');
  }

  // Force push warning
  if (/git\s+push\s+.*--force/.test(command) || /git\s+push\s+-f/.test(command)) {
    warnings.push('[MADF] FORCE PUSH detected. This rewrites history. Are you sure?');
  }

  // Dev server detection
  if (/npm\s+(run\s+)?(dev|start)|yarn\s+(dev|start)|pnpm\s+(dev|start)|node\s+.*server/.test(command)) {
    warnings.push('[MADF] Dev server command detected. Consider running in a separate terminal to keep this session free for development.');
  }

  if (warnings.length > 0) {
    process.stderr.write(warnings.join('\n') + '\n');
  }
}

try { run(); } catch (e) { /* non-blocking */ }
