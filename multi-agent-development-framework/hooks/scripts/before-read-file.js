#!/usr/bin/env node

/**
 * MADF Before Read File Hook
 * 
 * Warns when the agent is about to read sensitive files that should
 * not have their contents included in AI context.
 */

const fs = require('fs');
const path = require('path');

const SENSITIVE_PATTERNS = [
  /\.env$/,
  /\.env\..+$/,
  /\.pem$/,
  /\.key$/,
  /\.p12$/,
  /\.pfx$/,
  /credentials\.json$/,
  /service[_-]?account.*\.json$/,
  /secrets?\.(yaml|yml|json)$/,
  /\.npmrc$/,
  /\.netrc$/,
  /id_rsa$/,
  /id_ed25519$/,
];

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

  const fileName = path.basename(filePath);

  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(fileName) || pattern.test(filePath)) {
      process.stderr.write(
        `[MADF SECURITY] Reading sensitive file: ${filePath}\n` +
        'This file may contain secrets. Contents will be in the AI context.\n' +
        'Consider using environment variable references instead.\n'
      );
      break;
    }
  }
}

try { run(); } catch (e) { /* non-blocking */ }
