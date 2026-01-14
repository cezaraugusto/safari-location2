#!/usr/bin/env node
'use strict';

const api = require('./dist/index.cjs');
const locateSafari = api.default || api;
const getSafariVersion = api.getSafariVersion;
const getInstallGuidance = api.getInstallGuidance;

const argv = process.argv.slice(2);
const allowFallback = argv.includes('--fallback') || argv.includes('-f');
const printBrowserVersion =
  argv.includes('--safari-version') || argv.includes('--browser-version');
const allowExec = argv.includes('--allow-exec');

try {
  const safariPath =
    (typeof locateSafari === 'function' && locateSafari(allowFallback)) ||
    (typeof locateSafari === 'function' && locateSafari(true)) ||
    null;

  if (!safariPath) {
    const guidance =
      (typeof getInstallGuidance === 'function' && getInstallGuidance()) ||
      'Safari not found.';
    console.error(guidance);
    process.exit(1);
  }

  if (printBrowserVersion && typeof getSafariVersion === 'function') {
    const v = getSafariVersion(safariPath, { allowExec });
    if (!v) {
      console.log('');
      process.exit(2);
    }
    console.log(String(v));
    process.exit(0);
  }

  console.log(String(safariPath));
} catch (e) {
  console.error(String(e?.message ? e.message : e));
  process.exit(1);
}

