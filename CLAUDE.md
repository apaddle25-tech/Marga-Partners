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
Type: Newsreader (display and headings), Manrope (body and UI),
Spline Sans Mono (labels and mono).
IMPORTANT: #C7A24B on cream fails WCAG AA for text at roughly 2:1. Gold is a
fill and rule color only. For text on cream use --bronze at minimum, and
prefer a darkened variant that clears 4.5:1. Never ship gold text on cream.

Measured 2026-07-28, contrast against the three cream grounds:

| Foreground | on cream | on cream2 | on cream3 | Verdict |
|---|---|---|---|---|
| gold #C7A24B | 2.24 | 2.00 | 1.85 | fill and rules only, never text |
| gold2 #B0863C | 3.08 | 2.76 | 2.54 | never body text |
| bronze #9A742F | 3.97 | 3.55 | 3.27 | large text only, floor for eyebrows |
| **#7A5A20** (darkened bronze) | 5.89 | 5.26 | 4.85 | **clears AA on all three, use for body-size text** |
| body #4A4435 | 8.99 | 8.03 | 7.41 | body copy |
| ink #16140F | 17.09 | 15.27 | 14.08 | headings |

Bronze alone does not clear 4.5:1 on any cream. Use #7A5A20 when the text is body size.

## The marks (see WO-7)
The trademark is on Marga itself, and it covers every product name used under it.
Sub-brands are not registered separately, so a new Marga-prefixed name is covered
the moment it ships.
Product names in use: Marga Method, Marga Index, Marga Studio, MargaZine. Nothing else.
Trademark symbol on first use in any human-visible surface.
Attribution reads: Marga™ is a trademark of Marga Partners LLC and covers the
product names used under it. Do not claim each sub-brand as a separate mark.

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

- Fully generated: everything in `journal/`, each released article page at the repo root
  (for example `the-long-way-around.html`), and `essays.html`.
- Partially generated, so edit with care:
  - `index.html`: the "Free to read now" list between the `<!--MZFEED-->` and
    `<!--/MZFEED-->` markers is rewritten on every publish. The rest of the page is
    hand-authored and safe to edit.
  - `journal.html`: the five `.feat` blocks inside the domain cards are rewritten. The
    rest is hand-authored.
- Also generated: `assets/og/*.png`, produced by `make_og.py` in `margazine-build`.
  Regenerate there, do not edit the PNGs.

Hand-authored pages you own here: `Consultation.html`, `for-manufacturers.html`,
`for-investors.html`, `for-providers.html`, `the-marga-method.html`,
`the-marga-difference.html`, `products.html`, `subscribe.html`, `404.html`.

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
