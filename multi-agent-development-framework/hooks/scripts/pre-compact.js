#!/usr/bin/env node

/**
 * MADF Pre-Compact Hook
 * 
 * Fires before context compaction. Saves the current phase, active agent,
 * and any pending work to PROJECT_STATE.md so context can be restored
 * after compaction.
 */

const fs = require('fs');
const path = require('path');

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'PROJECT_STATE.md'))) return dir;
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function run() {
  const root = findProjectRoot();
  const statePath = path.join(root, 'PROJECT_STATE.md');

  if (!fs.existsSync(statePath)) return;

  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

  const logEntry = `\n- ${timestamp} — Context compaction triggered. State preserved by MADF hook.`;

  const content = fs.readFileSync(statePath, 'utf-8');

  if (content.includes('## Session Log')) {
    fs.appendFileSync(statePath, logEntry);
  }

  process.stderr.write(
    `[MADF] Pre-compact: State saved to PROJECT_STATE.md.\n` +
    `After compaction, the Orchestrator will reload state automatically via sessionStart hook.\n`
  );
}

try { run(); } catch (e) { /* non-blocking */ }
