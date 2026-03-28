#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function exists(...segments) {
  return fs.existsSync(path.join(root, ...segments));
}

function read(...segments) {
  try {
    return fs.readFileSync(path.join(root, ...segments), 'utf8');
  } catch {
    return '';
  }
}

const frontendPkg = read('frontend', 'package.json');
const backendPkg = read('backend', 'package.json');
const infraCompose = read('infra', 'docker-compose.yml');
const backendSrc = read('backend', 'src', 'app.js') + '\n' + read('backend', 'src', 'routes', 'index.js');

const checks = [
  ['Monorepo root package.json', exists('package.json')],
  ['Backend package present', exists('backend', 'package.json')],
  ['Frontend package present', exists('frontend', 'package.json')],
  ['Docker compose present', exists('infra', 'docker-compose.yml') || exists('docker-compose.yml')],
  ['Backend uses JWT library', /jsonwebtoken/.test(backendPkg)],
  ['Backend exposes health route', /health/.test(backendSrc)],
  ['PostgreSQL or Timescale service declared', /(postgres|timescale)/i.test(infraCompose + backendPkg)],
  ['Frontend is Next.js', /"next"/.test(frontendPkg)],
  ['Frontend has Tailwind dependency/config', /(tailwindcss|postcss)/.test(frontendPkg) || exists('frontend', 'tailwind.config.js') || exists('frontend', 'tailwind.config.ts')],
  ['Wallet/Metamask integration markers', /(metamask|ethers|wagmi|walletconnect)/i.test(frontendPkg + read('frontend', 'src', 'main.tsx'))],
  ['Lending domain endpoints present', /(deposit|borrow|repay|withdraw|markets|positions)/i.test(backendSrc)],
  ['Automated frontend e2e config present', exists('playwright.config.ts') || exists('playwright.config.js') || exists('frontend', 'playwright.config.ts') || exists('frontend', 'playwright.config.js')],
];

let failing = 0;
console.log('QA architecture readiness report\n');
for (const [label, ok] of checks) {
  console.log(`${ok ? '✅' : '⚠️ '} ${label}`);
  if (!ok) failing += 1;
}

console.log(`\nSummary: ${checks.length - failing}/${checks.length} checks OK`);
if (failing > 0) {
  console.log('Note: warnings highlight gaps against the target lending platform specification, not necessarily runtime blockers for the current repo state.');
}
