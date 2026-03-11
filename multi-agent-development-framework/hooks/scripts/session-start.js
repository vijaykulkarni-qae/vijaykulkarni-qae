#!/usr/bin/env node

/**
 * MADF Session Start Hook
 * 
 * Fires on every new Cursor session. Reads PROJECT_STATE.md and the active
 * agent's learning file, then injects context so the Orchestrator can
 * immediately resume without the user typing "Read PROJECT_STATE.md."
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
  const output = [];

  if (fs.existsSync(statePath)) {
    const state = fs.readFileSync(statePath, 'utf-8');
    const phaseMatch = state.match(/Phase:\s*(\d)/);
    const agentMatch = state.match(/Active Agent:\s*(.+)/);
    const statusMatch = state.match(/Status:\s*(.+)/);

    output.push('[MADF Session Start]');
    output.push(`  Phase: ${phaseMatch ? phaseMatch[1] : 'unknown'}`);
    output.push(`  Active Agent: ${agentMatch ? agentMatch[1].trim() : 'unknown'}`);
    output.push(`  Status: ${statusMatch ? statusMatch[1].trim() : 'unknown'}`);

    const learningsDir = path.join(root, 'agent-learnings');
    if (agentMatch && fs.existsSync(learningsDir)) {
      const agentName = agentMatch[1].trim().toLowerCase().replace(/\s+/g, '-');
      const learningFile = path.join(learningsDir, `${agentName}-learnings.md`);
      if (fs.existsSync(learningFile)) {
        const lessons = fs.readFileSync(learningFile, 'utf-8');
        const lessonCount = (lessons.match(/### \[LESSON-/g) || []).length;
        output.push(`  Learnings loaded: ${lessonCount} lessons from ${agentName}`);
      }
    }
  } else {
    output.push('[MADF Session Start] No PROJECT_STATE.md found — new project or not initialized.');
  }

  process.stderr.write(output.join('\n') + '\n');
}

try { run(); } catch (e) { /* non-blocking */ }
