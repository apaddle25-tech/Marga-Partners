#!/usr/bin/env node
// Product naming guard. Reads naming.json and refuses a build that reintroduces
// a retired product name.
//
//   node bin/naming-check.js            check every tracked text file
//   node bin/naming-check.js --fix      apply the approved replacements
//   node bin/naming-check.js --staged   check only what is staged, for the hook
//
// EXIT CODES
//   0  clean, or review-only findings
//   1  at least one forbidden term with an approved replacement
//
// A term in `reviewRequired` warns and never fails, because there is no
// approved replacement to apply and failing a build with no fix available just
// teaches people to pass --no-verify.
//
// A term matched by `neverReplace` is skipped entirely. That list is load
// bearing: P5_STORE_FILE, the p5_session cookie, the p5-method-1.0 provenance
// string, and the p5-studio repository name are identifiers. Renaming them
// breaks deployments, signs out every member, or rewrites the provenance on
// deliverables already sent to clients.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const CONFIG = path.join(ROOT, 'naming.json');

const args = new Set(process.argv.slice(2));
const FIX = args.has('--fix');
const STAGED = args.has('--staged');
const QUIET = args.has('--quiet');

if (!existsSync(CONFIG)) {
  console.error(`naming-check: no naming.json at ${CONFIG}`);
  process.exit(1);
}
const config = JSON.parse(readFileSync(CONFIG, 'utf8'));

const EXTS = new Set(config.scan.extensions);
const ALLOW = config.scan.allowlist.map((a) => a.path);
const NEVER = config.neverReplace.map((n) => new RegExp(n.pattern, 'g'));

/** Files git knows about, so build output and node_modules never appear. */
function trackedFiles() {
  const cmd = STAGED
    ? ['diff', '--cached', '--name-only', '--diff-filter=ACMR']
    : ['ls-files'];
  const out = execFileSync('git', cmd, { cwd: ROOT, encoding: 'utf8' });
  const tracked = out.split('\n').filter(Boolean);
  // Extension match, plus an explicit list for files that have no scannable
  // extension. .env.example is the case that motivated this: it carries
  // EMAIL_FROM, which becomes the From header on real mail, and path.extname
  // returns ".example" so no extension rule could ever reach it.
  const extra = new Set(config.scan.extraFiles || []);
  return tracked.filter((f) => EXTS.has(path.extname(f)) || extra.has(f));
}

const isAllowed = (file) => ALLOW.some((a) => (a.endsWith('/') ? file.startsWith(a) : file === a));

/**
 * Character positions covered by a neverReplace pattern.
 *
 * This is what stops "P5 Studio" logic from firing inside P5_STORE_FILE and
 * what keeps "the five P's" out of the results. A hit is only reported when it
 * falls outside every protected span.
 */
function protectedSpans(line) {
  const spans = [];
  for (const re of NEVER) {
    re.lastIndex = 0;
    let m = re.exec(line);
    while (m) {
      spans.push([m.index, m.index + m[0].length]);
      m = re.exec(line);
    }
  }
  return spans;
}
const covered = (spans, start, end) => spans.some(([a, b]) => start >= a && end <= b);

/** Case-insensitive literal search that reports the casing it actually found. */
function findTerm(line, term) {
  const hits = [];
  const hay = line.toLowerCase();
  const needle = term.toLowerCase();
  let i = hay.indexOf(needle);
  while (i !== -1) {
    hits.push({ index: i, found: line.slice(i, i + term.length) });
    i = hay.indexOf(needle, i + 1);
  }
  return hits;
}

const findings = [];
const reviews = [];
let filesChanged = 0;

for (const file of trackedFiles()) {
  if (isAllowed(file)) continue;
  const full = path.join(ROOT, file);
  if (!existsSync(full)) continue;

  const original = readFileSync(full, 'utf8');
  const lines = original.split('\n');
  let updated = original;

  lines.forEach((line, idx) => {
    const spans = protectedSpans(line);

    for (const rule of config.rules) {
      for (const hit of findTerm(line, rule.find)) {
        if (covered(spans, hit.index, hit.index + rule.find.length)) continue;
        findings.push({
          file, line: idx + 1, column: hit.index + 1,
          found: hit.found, replace: rule.replace, note: rule.note || null,
          text: line.trim().slice(0, 110),
        });
      }
    }

    for (const review of config.reviewRequired) {
      const terms = review.apostropheVariants || [review.term];
      for (const term of terms) {
        for (const hit of findTerm(line, term)) {
          if (covered(spans, hit.index, hit.index + term.length)) continue;
          reviews.push({ file, line: idx + 1, found: hit.found, term: review.term, text: line.trim().slice(0, 110) });
        }
      }
    }
  });

  if (FIX) {
    // Longest first, so "The Marga Journal" is consumed before "Marga Journal"
    // and does not leave a stray article behind.
    const ordered = [...config.rules].sort((a, b) => b.find.length - a.find.length);
    for (const rule of ordered) {
      updated = updated.split('\n').map((line) => {
        const spans = protectedSpans(line);
        let out = '';
        let cursor = 0;
        for (const hit of findTerm(line, rule.find)) {
          if (hit.index < cursor) continue;
          if (covered(spans, hit.index, hit.index + rule.find.length)) continue;
          out += line.slice(cursor, hit.index) + matchCase(hit.found, rule.replace);
          cursor = hit.index + rule.find.length;
        }
        return out + line.slice(cursor);
      }).join('\n');
    }
    if (updated !== original) {
      writeFileSync(full, updated);
      filesChanged += 1;
    }
  }
}

/** Keep the surrounding casing convention when the found text is all caps. */
function matchCase(found, replacement) {
  if (found === found.toUpperCase() && /[A-Z]{2}/.test(found)) return replacement.toUpperCase();
  return replacement;
}

// --- report ---------------------------------------------------------------

if (FIX) {
  console.log(`\nnaming-check --fix: rewrote ${filesChanged} file(s).`);
  console.log('Run without --fix to confirm, and review the diff before committing.\n');
  process.exit(0);
}

const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

if (findings.length) {
  console.error(`\nnaming-check: ${findings.length} forbidden product name(s) in ${byFile.size} file(s).\n`);
  for (const [file, hits] of byFile) {
    console.error(`  ${file}`);
    for (const h of hits) {
      console.error(`    ${String(h.line).padStart(5)}:${String(h.column).padEnd(4)} "${h.found}" -> "${h.replace}"`);
      console.error(`          ${h.text}`);
    }
    console.error('');
  }
  console.error('  The estate is four marks: Marga Method, Marga Index, Marga Studio, MargaZine.');
  console.error('  Fix with: node bin/naming-check.js --fix\n');
}

if (reviews.length && !QUIET) {
  const seen = new Set();
  console.error(`naming-check: ${reviews.length} term(s) need a human decision. These are NOT auto-replaced.\n`);
  for (const r of reviews) {
    const key = `${r.file}:${r.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.error(`  ${r.file}:${r.line}  "${r.found}"`);
    console.error(`      ${r.text}`);
  }
  const which = [...new Set(reviews.map((r) => r.term))];
  console.error(`\n  Terms: ${which.join(', ')}`);
  console.error('  See reviewRequired in naming.json for the options. This does not fail the build.\n');
}

if (!findings.length && !reviews.length) {
  console.log('naming-check: clean. Four marks, no strays.');
}

process.exit(findings.length ? 1 : 0);
