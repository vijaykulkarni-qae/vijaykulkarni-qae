#!/usr/bin/env node

/**
 * MADF Before Submit Prompt Hook
 * 
 * Scans prompts for accidental secret inclusion before sending to the AI.
 * Detects: API keys, tokens, passwords, AWS credentials, private keys.
 */

const fs = require('fs');

const SECRET_PATTERNS = [
  { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI/Stripe API key' },
  { pattern: /ghp_[a-zA-Z0-9]{36,}/, name: 'GitHub personal access token' },
  { pattern: /gho_[a-zA-Z0-9]{36,}/, name: 'GitHub OAuth token' },
  { pattern: /AKIA[A-Z0-9]{16}/, name: 'AWS access key' },
  { pattern: /xoxb-[a-zA-Z0-9-]+/, name: 'Slack bot token' },
  { pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/, name: 'Private key' },
  { pattern: /password\s*[:=]\s*["'][^"']{8,}["']/, name: 'Hardcoded password' },
  { pattern: /api[_-]?key\s*[:=]\s*["'][a-zA-Z0-9]{16,}["']/, name: 'API key assignment' },
  { pattern: /bearer\s+[a-zA-Z0-9._\-]{20,}/i, name: 'Bearer token' },
];

function run() {
  let input = '';
  try {
    input = fs.readFileSync(0, 'utf-8');
  } catch (e) {
    return;
  }

  const findings = [];

  for (const { pattern, name } of SECRET_PATTERNS) {
    if (pattern.test(input)) {
      findings.push(`  - ${name} detected`);
    }
  }

  if (findings.length > 0) {
    process.stderr.write(
      '[MADF SECURITY] Potential secrets detected in prompt:\n' +
      findings.join('\n') + '\n' +
      'Remove secrets and use environment variable references instead.\n'
    );
  }
}

try { run(); } catch (e) { /* non-blocking */ }
