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
    log('Step 0: Refreshing Instagram access token...');
    execSync(`node ${path.join(__dirname, 'refresh-instagram-token.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 0: Done');
  } catch (err) {
    log('Step 0 FAILED: ' + err.message + ' (token may be near expiry — report will flag this)');
  }

  try {
    log('Step 1: Pulling profile data...');
    execSync(`node ${path.join(__dirname, 'pull-data.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 1: Done');
  } catch (err) {
    log('Step 1 FAILED: ' + err.message);
  }

  try {
    log('Step 2: Pulling real Instagram post data (overwrites sample posts for @vpspaceman)...');
    execSync(`node ${path.join(__dirname, 'pull-real-posts.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 2: Done');
  } catch (err) {
    log('Step 2 FAILED: ' + err.message);
  }

  try {
    log('Step 3: Pulling daily briefing headlines (Astronomy/NASA/Space/Rockets/Bikes)...');
    execSync(`node ${path.join(__dirname, 'pull-news.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 3: Done');
  } catch (err) {
    log('Step 3 FAILED: ' + err.message);
  }

  try {
    log('Step 4: Pulling real planet positions from NASA JPL Horizons...');
    execSync(`node ${path.join(__dirname, 'pull-planet-positions.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 4: Done');
  } catch (err) {
    log('Step 4 FAILED: ' + err.message);
  }

  try {
    log('Step 5: Pulling near-Earth asteroid data from NASA NeoWs...');
    execSync(`node ${path.join(__dirname, 'pull-neows.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 5: Done');
  } catch (err) {
    log('Step 5 FAILED: ' + err.message);
  }

  try {
    log('Step 6: Pulling upcoming launches from Launch Library 2 (all agencies)...');
    execSync(`node ${path.join(__dirname, 'pull-launches.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 6: Done');
  } catch (err) {
    log('Step 6 FAILED: ' + err.message);
  }

  try {
    log('Step 7: Pulling space weather events from NASA DONKI...');
    execSync(`node ${path.join(__dirname, 'pull-spaceweather.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 7: Done');
  } catch (err) {
    log('Step 7 FAILED: ' + err.message);
  }

  try {
    log('Step 8: Sending Telegram report...');
    execSync(`node ${path.join(__dirname, 'telegram-report.js')}`, { cwd: ROOT, stdio: 'inherit' });
    log('Step 8: Done');
  } catch (err) {
    log('Step 8 FAILED: ' + err.message);
  }

  log('=== Daily run complete ===\n');
}

main().then(() => process.exit(0)).catch(err => {
  log('FATAL: ' + err.message);
  process.exit(1);
});