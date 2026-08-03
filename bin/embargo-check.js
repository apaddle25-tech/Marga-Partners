#!/usr/bin/env node
// Public-surface embargo: no corpus identity and no corpus grade while scoring is open.
//
// The independence statement discloses a financial interest in a company whose products are
// cases in the blinded validation corpus. The private model card states which products and how
// each was graded, and that detail is correct there and unpublishable here: two assessors are
// being asked for a judgement blind to those outcomes, and a public page naming a case grade
// puts part of the answer key on the open web. The brief tells raters not to look things up. We
// should not be publishing the answers either.
//
// This is not a redaction rule about brand names. Brands appear legitimately across this site.
// It is narrower: no page may pair a corpus grade vocabulary with the corpus, and no page may
// state which products are in it.
//
// LIFTS WHEN SCORING CLOSES. Set MARGA_EMBARGO=lifted once both scorer seals exist, and record
// the date in the model card. Until then a violation fails the build.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const LIFTED = process.env.MARGA_EMBARGO === 'lifted';

// Grade vocabulary from outcomes.json. Matched only near corpus language, so an article using
// the word "tier" about anything else is not a violation.
const GRADE = /\btier\s*[ABCD]\b|\bgraded?\s+tier\b|\bsuccess\s*=\s*\[/i;
const CORPUS = /\b(validation corpus|retrospective corpus|the corpus|outcome key|answer key)\b/i;
const MEMBERSHIP = /\b(is|are)\s+(a\s+)?cases?\s+in\s+the\b/i;

const findings = [];
for (const f of readdirSync(ROOT)) {
  if (!f.endsWith('.html')) continue;
  const text = readFileSync(join(ROOT, f), 'utf8');
  for (const [i, line] of text.split('\n').entries()) {
    const hasCorpus = CORPUS.test(line);
    if (hasCorpus && GRADE.test(line)) {
      findings.push({ file: f, line: i + 1, why: 'a corpus grade', text: line.trim().slice(0, 110) });
    }
    if (MEMBERSHIP.test(line) && hasCorpus) {
      findings.push({ file: f, line: i + 1, why: 'corpus membership', text: line.trim().slice(0, 110) });
    }
  }
}

if (findings.length && !LIFTED) {
  console.error('\nEMBARGO VIOLATION: a public page states corpus detail while scoring is open.\n');
  for (const f of findings) console.error(`  ${f.file}:${f.line}  ${f.why}\n    ${f.text}`);
  console.error('\nTwo assessors are being asked for a judgement blind to these outcomes. Hold the');
  console.error('detail until both seals exist, then set MARGA_EMBARGO=lifted and record the date.\n');
  process.exit(1);
}
console.log(LIFTED
  ? `OK: embargo lifted, ${findings.length} corpus reference(s) permitted.`
  : 'OK: no public page states a corpus grade or corpus membership.');
