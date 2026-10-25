#!/usr/bin/env node
/**
 * Release gate: run before `eas build --profile production` (npm run release:check).
 * Fails when store-facing configuration is still missing, so no build ships with an empty privacy contact.
 */
const fs = require('fs');
const path = require('path');
const app = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8')).expo;
const problems = [];
const warn = [];
const extra = app.extra || {};
if (!extra.legal || !extra.legal.controller) problems.push('app.json extra.legal.controller is empty (veri sorumlusu adı, KVKK).');
if (!extra.legal || !extra.legal.contact) problems.push('app.json extra.legal.contact is empty (gizlilik iletişim e-postası).');
if (!app.ios || !app.ios.bundleIdentifier) problems.push('ios.bundleIdentifier missing.');
if (!app.android || !app.android.package) problems.push('android.package missing.');
if (!extra.eas || !extra.eas.projectId) warn.push('extra.eas.projectId missing: run `npx eas-cli@latest init` once (links the project to your Expo account).');
if (!extra.storeUrls || !extra.storeUrls.ios) warn.push('extra.storeUrls.ios empty: invite messages show only Google Play until the App Store URL is set.');
for (const f of [app.icon, app.android && app.android.adaptiveIcon && app.android.adaptiveIcon.foregroundImage]) {
  if (f && !fs.existsSync(path.join(__dirname, '..', f))) problems.push(`asset missing: ${f}`);
}
for (const w of warn) console.log(`uyarı / warning: ${w}`);
if (problems.length) {
  for (const p of problems) console.error(`EKSİK / MISSING: ${p}`);
  process.exit(1);
}
console.log('release-check: OK');
