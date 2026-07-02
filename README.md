# Marga Partners — Website

A static website. Every page is a self-contained HTML file (fonts and images embedded), so it can be hosted anywhere with no build step.

## Publish with GitHub Pages

1. Create a new repository on GitHub (for example `marga-website`).
2. Upload the entire contents of this folder to the repository root
   (so that `index.html` sits at the top level of the repo).
   - Via the web UI: **Add file → Upload files**, drag everything in, commit.
   - Or via git:
     ```
     git init
     git add .
     git commit -m "Publish Marga Partners website"
     git branch -M main
     git remote add origin https://github.com/USERNAME/REPO.git
     git push -u origin main
     ```
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source: Deploy from a branch**,
   **Branch: main**, **Folder: / (root)**, then **Save**.
5. Wait about a minute. Your site goes live at
   `https://USERNAME.github.io/REPO/`.

## Pages

- `index.html` — homepage
- `the-marga-difference.html` — how Marga works (dual lens, three phases, expertise, selected work)
- `5ps-index.html` — the P5 Method (framework)
- `5p-playbook.html` — the P5 playbook
- `products.html` — products, intelligence & the consortium
- `journal.html` — the MargaZine hub
- `journal/` — all MargaZine articles
- `the-long-way-around.html` — founding essay
- `article-template.html` — duplicate this to add a new article
- `Consultation.html` — intake form (adapts to inquiry type via `?type=` — e.g. `Consultation.html?type=consortium`)
- `social-5p.html` — social post templates

## Custom domain (optional)

Add a file named `CNAME` at the root containing your domain (e.g. `margapartners.com`),
then point your domain's DNS at GitHub Pages. See GitHub's docs on custom domains.

## Notes

- `.nojekyll` is included so GitHub serves every file and folder as-is.
- The main pages have fonts and images embedded and work fully offline. The
  article pages in `journal/` load fonts from Google Fonts, so they look best online.
