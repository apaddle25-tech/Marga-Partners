# CLAUDE.md: Marga-Partners

The public marketing site for Marga Partners. Static HTML, CSS, and vanilla JS with no
build step. Served by GitHub Pages from `main` at the repository root, with a CNAME for
`www.margapartners.com`.

**This repository is public. Read the Security rules before adding anything.**

---

## Copy rules (all human-visible text)
- No em dashes and no en dashes. Ever. Use commas, colons, or a full stop.
- No "not X, but Y" antithesis constructions.
- Average sentence length near 18 words with deliberate variation. No run-on
  cumulative sentences.
- Plain declarative voice.
- If you write copy, run the cadence check before committing.

## Brand tokens (never hardcode, always reference)
--ink #16140F, --ink2 #14120E, --bronze #9A742F, --gold #C7A24B,
--bronze2/gold2 #B0863C, --cream #FBF6EC, --cream2 #F1E9DB,
--cream3 #EBE0CC, --body #4A4435
Type: Newsreader (display and headings), Manrope (body, UI and every
uppercase eyebrow or label), Spline Sans Mono (code blocks and numerals
only, where fixed advance widths are the point).

Eyebrows and labels are uppercase Manrope 700 on one of two tracking
tokens, never a literal:
  --track-eyebrow .18em   primary eyebrows
  --track-label   .14em   secondary labels, chips, table heads
Changed 2026-08-30. These were Spline Sans Mono 600 at six different
tracking values between .14em and .24em, which is drift rather than
hierarchy: the same role was set differently depending on which page you
landed on. Mono stays only where the glyphs need to line up in a column.
IMPORTANT: #C7A24B on cream fails WCAG AA for text at roughly 2:1. Gold is a
fill and rule color only. For text on cream use --bronze at minimum, and
prefer a darkened variant that clears 4.5:1. Never ship gold text on cream.

Measured 2026-07-28, contrast against the three cream grounds:

| Foreground | on cream | on cream2 | on cream3 | Verdict |
|---|---|---|---|---|
| gold #C7A24B | 2.24 | 2.00 | 1.85 | fill and rules only, never text |
| gold2 #B0863C | 3.08 | 2.76 | 2.54 | never body text |
| bronze #9A742F | 3.97 | 3.55 | 3.27 | large text only, floor for eyebrows |
| #7A5A20 (darkened bronze) | 5.89 | 5.26 | 4.85 | clears AA on all three |
| body #4A4435 | 8.99 | 8.03 | 7.41 | body copy |
| ink #16140F | 17.09 | 15.27 | 14.08 | headings |

Bronze alone does not clear 4.5:1 on any cream.

### The accent is #6B4F1C, updated 2026-08-02

The v4 design adds three grounds, and the darkest of them broke the old floor. #7A5A20
measures **4.48:1** on `--sand2`, which misses AA by two hundredths. The v4 prototype uses
#6B4F1C for this text and it clears everywhere, so the design's own value is now the token.

| Ground | | #7A5A20 | **#6B4F1C** |
|---|---|---|---|
| `--card` | #FBF6EC | 5.89 | **7.06** |
| `--card2` | #F6F0E3 | 5.59 | **6.70** |
| `--card3` | #F4EEE1 | 5.49 | **6.58** |
| `--proof` | #F4EBD9 | 5.36 | **6.42** |
| `--cream` | #F1E9DB | 5.26 | **6.31** |
| `--sand` | #EBE0CC | 4.85 | **5.82** |
| `--sand2` | #E3D8BE | **4.48 fails** | **5.37** |

Darkening only ever raises contrast, so nothing already shipped can regress on this.

`--text-numeral` rgba(22,20,15,.5) is for the large faint index numerals. The v4 design draws
them at .26, which is 1.77:1. .50 is the faintest that clears the 3:1 large-text bar on every
ground, 3.19 on sand2 to 3.41 on card.

**The article template is not on this yet.** `margazine-build/seo-package/design-tokens.json`
still carries #7A5A20 and its grounds are unchanged, so it remains correct there. The two
converge when the v4 article design lands.

## The marks (enforced by bin/naming-check.js)

The estate is **six product marks under one root mark, and nothing else**:

| Mark | What it names |
|---|---|
| **Marga Intelligence** | the proprietary lens the Method and the Index sit inside |
| **Marga Method** | the methodology |
| **Marga Index** | the composite score and the model that produces it |
| **Marga Exchange** | the respondent panel. Sixth mark, 2026-08-09, sunsetting Consortium |
| **Marga Studio** | the application surface |
| **MargaZine** | the publication |

The trademark is on **Marga** itself and covers every product name used under it.
Sub-brands are not registered separately, so a new Marga-prefixed name is covered the
moment it ships. That is a legal fact, not a naming licence: a seventh Marga-prefixed
product name would be covered and is still forbidden, because the estate is six marks.

**The bare word `consortium` is deliberately not retired.** It is a property key on the wire and
in the store, and a rule for it would fail the build on identifiers rather than on prose. Only the
branded phrase `Marga Consortium` is rewritten.

**Prose rule.**
- Trademark symbol on first prominent use in any human-visible surface.
- Attribution reads: Marga™ is a trademark of Marga Partners LLC and covers the product
  names used under it. Never claim each sub-brand as a separate mark.
- The five domains are Product, Patient, Provider, Price, and Practice. In running prose
  they are **the five P's**, lower case. That describes the model. It is not a product
  name and is never capitalised as a mark.
- Retired: P5 Studio, 5P Studio, P5/5P Index, P5/5P Method, P5/5P Playbook, Marga
  Framework, The Marga Journal. `naming.json` maps every one to its replacement.

**This is enforced, not advisory.** `bin/naming-check.js` reads `naming.json`, scans every
tracked text file, and fails CI and the pre-commit hook on a retired name.

```bash
node bin/naming-check.js
```

```bash
node bin/naming-check.js --fix
```

Identifiers are deliberately exempt and listed in `naming.json` under `neverReplace`:
`P5_*` environment variables, the `p5_session` cookie, the `p5-method-1.0` methodology
version stamped on frozen deliverables, and the `p5-studio` repository name. Renaming
those breaks deployments, signs out every member, or rewrites provenance on exports
already sent to clients. They are infrastructure, not branding.

## Security rules
- Marga-Partners is a PUBLIC repo. Nothing proprietary goes in it: no weight
  vectors, no band thresholds, no calibration constants, no anchor definitions,
  no attribute registry, no scoring code. If in doubt, it does not go in.
- Never commit .env. Every new credential gets an entry in .env.example with a
  placeholder and a comment explaining where to get it.
- Never log request bodies that contain user-submitted practice or contact data.

## Working rules
- If a spec is ambiguous, stop and ask. Do not guess on anything that affects
  a score.
- Tests before implementation on anything in the engine.
- One logical change per commit. Conventional commit prefixes:
  feat, fix, chore, docs, test, refactor.

---

## Repo-specific

### The guards are not optional
Two layers enforce the rules above, and both will block you if you get it wrong.

- `.github/workflows/content-guard.yml` runs on every push and PR: a gitleaks secret
  scan, plus checks that fail the build on personal email addresses, on calibrated band
  cutoffs in `*.html` or `*.js`, and on private scoring-engine identifiers.
- `.githooks/pre-commit` mirrors those checks locally. Enable it once per clone:

```bash
git config core.hooksPath .githooks
```

Both guard files exclude themselves, because they carry the detection patterns by
design. If a check fires, fix the content. Use `--no-verify` only for a genuine false
positive, and say so in the commit message.

### Scoring illustrations on this site are illustrative only
The public scorecard and the method radar are demonstrations, not the product.

- Band boundaries come from the shared display constants `BAND_LO` and `BAND_HI` in
  `the-marga-method.html`. They are evenly spaced thirds chosen to carry no information
  about the calibrated values. Never replace them with the real cutoffs.
- The five forces render as anonymized labels, "Force 01" through "Force 05". The page
  says they are named in full for clients. Keep it that way.
- Lens vectors in the build illustration are an anonymized model. They are not the real
  weights and must not be replaced with them.

### Do not hand-edit generated output
`margazine-build` publishes into this repo. Editing generated files here means your work
is silently overwritten on the next publish. Fix the source in `margazine-build` instead.

**As of the v4 migration on 2026-08-02, almost nothing here is hand-authored.** Twelve pages
are emitted by a generator in `margazine-build`, and an edit made here is thrown away the next
time that generator runs. Fix the generator.

| Page | Generator |
|---|---|
| `index.html` | `build_home.py` |
| `for-manufacturers.html`, `for-investors.html`, `for-providers.html` | `build_audience.py` |
| `the-marga-method.html` | `build_method.py` (+ `method-parts/`) |
| `about.html` | `build_about.py` |
| `journal.html` | `build_journal.py` |
| `Consultation.html` | `build_contact.py` (+ `contact-parts/`) |
| `benchmark.html` | `build_benchmark.py` (+ `benchmark-parts/`) |
| `privacy.html`, `subscribe.html`, `404.html` | `build_small.py` |

The nav and footer for all of them live in `margazine-build/v4_chrome.py`. Change them once,
there, and rebuild. They used to be copied into four generators, which is how they drift.

The `*-parts/` directories hold components lifted verbatim from the pre-v4 pages: the Marga
Index scorecard, the consultation form, and the benchmark wizard. Each carries a README
saying what must never change in it. They are carried rather than retyped because a form is a
contract with a server, and 5KB of DOM code does not survive being re-keyed.

- Fully generated: everything in `journal/`, and each released article page at the repo root
  (for example `the-long-way-around.html`).
- Regions rewritten on every publish by `build_site.py`:
  - `index.html`: the three `<!--PROOF1..3:slug-->` regions, one per proof card, flipped from
    a scheduled date to a live link the morning each essay lands.
  - `journal.html`: `<!--MZLIVE-->`, what is readable now, and `<!--MZSCHED-->`, what is
    coming. Both are rendered by `build_journal.py`, which `build_site.py` imports rather
    than duplicating.
  - `sitemap.xml` is regenerated whole. Marketing dates live in `MARKETING` in
    `build_site.py`; bump one when that page's content actually changes. Never hand-edit the
    file, and never stamp every page with today, which tells Google something untrue.
  - **Deleting or renaming any of those markers breaks the update silently.** The publish
    still reports success and the region simply stops changing.
- `essays.html` is a redirect stub to `journal.html` now. `write_essays` returns early when
  the `a-body` region is absent, so a publish leaves the stub untouched.
- Also generated: `assets/og/*.png`, produced by `make_og.py` in `margazine-build`.
  Regenerate there, do not edit the PNGs.

Hand-authored pages you still own here: `the-marga-difference.html`, `products.html`,
`5p-playbook.html`, `5ps-index.html`, `social-5p.html`. All five are one-line redirect stubs
pointing at `the-marga-method.html`.

### Contact and forms
The consultation form posts to `app.margapartners.com/contact`. No email address belongs
in this source. Business addresses on `margapartners.com` are fine when a page genuinely
needs to show one; a personal address never is, and the guard enforces it.

### Verifying a visual change
There is no dev server. Serve the directory and screenshot it:

```bash
python3 -m http.server 8000
```

Check both light rendering and mobile width before committing. A publish from
`margazine-build` may land between your commit and your push, so rebase rather than
merge if the push is rejected.

## AGENTS.md, and the second model

Added 2026-09-05. `AGENTS.md` in this repo is a symlink to this file. Claude reads `CLAUDE.md`,
Codex and tools following that convention read `AGENTS.md`, and both get these rules from one
place. Edit this file. The link needs nothing.

**This repo may be handed to a second model whole.** It holds no engine material. The exception is
`p5-studio-backend`, which holds the scoring engine and is reviewed as a diff instead. That split
is the operative rule, and the reasoning behind it sits in `p5-studio-backend/CLAUDE.md`.
