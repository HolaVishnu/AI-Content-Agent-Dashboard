// scripts/daily-run.js
// Runs every day at 8 AM via Task Scheduler
// Chains: pull data → send Telegram report
require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOG = path.join(ROOT, 'daily-run.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  require('fs').appendFileSync(LOG, line + '\n');
}

async function main() {
  log('=== Daily run started ===');
  try {
    log('Step 1: Pulling profile data...');
    execSync(`node ${path.join(__dirname, 'pull-data.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 1: Done');
  } catch (err) {
    log('Step 1 FAILED: ' + err.message);
  }

  try {
    log('Step 2: Sending Telegram report...');
    execSync(`node ${path.join(__dirname, 'telegram-report.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 2: Done');
  } catch (err) {
    log('Step 2 FAILED: ' + err.message);
  }

  log('=== Daily run complete ===\n');
}

main().then(() => process.exit(0)).catch(err => {
  log('FATAL: ' + err.message);
  process.exit(1);
});