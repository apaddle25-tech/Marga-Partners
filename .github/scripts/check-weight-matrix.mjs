#!/usr/bin/env node
// Fail if a lens weight matrix appears in tracked source.
//
// Why this is a script and not a grep: the matrix that shipped in this repo's
// history sat inside an HTML table, so the lens name and its weights were
// separated by markup. A regex over raw bytes misses that, which is precisely
// how it survived the first audit. This strips tags first, then looks for a
// lens name followed by a run of two-decimal weights.
//
//   node .github/scripts/check-weight-matrix.mjs [files...]
//
// With no arguments it scans every tracked text file.

import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const LENS = '(?:Investor|Industry|Patient|Operator|Provider|Practice[ _]?Owner'
  + '|INVESTOR|INDUSTRY|PRACTICE_OWNER|PROVIDER|Balanced)';
// One row: a lens name, then four or more weights.
//
// The gap before the first weight may contain letters, because the real leak
// wrote it as `Investor', w: [0.30, ...`. The gaps between weights may not, so a
// single match cannot run past the end of its row and swallow the next lens.
// Getting that wrong made one greedy match cover the whole table and report a
// single row, which is how an earlier version of this check passed a live matrix.
const MATRIX = new RegExp(
  `${LENS}[^0-9]{0,24}0?\\.\\d{2}(?:[^0-9A-Za-z]{0,8}0?\\.\\d{2}){3,}`,
  'g',
);
const TEXT = /\.(html|htm|js|mjs|cjs|json|md|csv|txt|xml|svg)$/i;

function tracked() {
  return execFileSync('git', ['ls-files'], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

function scan(file) {
  let raw;
  try {
    if (statSync(file).size > 8_000_000) return null;
    raw = readFileSync(file, 'utf8');
  } catch {
    return null;
  }
  // Strip markup and collapse whitespace so a table reads as a flat line.
  const flat = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  const rows = [...flat.matchAll(MATRIX)].map((m) => m[0].trim());
  // One stray run of decimals is noise. Two or more rows is a matrix.
  return rows.length >= 2 ? rows.slice(0, 4) : null;
}

const args = process.argv.slice(2);
const files = (args.length ? args : tracked()).filter((f) => TEXT.test(f));

let bad = 0;
for (const f of files) {
  const rows = scan(f);
  if (!rows) continue;
  bad += 1;
  console.error(`\n${f}: lens weight matrix detected`);
  for (const r of rows) console.error(`    ${r.replace(/\s+/g, ' ').slice(0, 110)}`);
}

if (bad) {
  console.error(
    `\n${bad} file(s) carry a weight matrix. Domain and lens weights are calibration `
    + 'constants and live server-side in p5-studio only.',
  );
  process.exit(1);
}
console.log(`OK: no lens weight matrix in ${files.length} tracked text files.`);
