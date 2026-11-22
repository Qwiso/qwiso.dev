# QwisoDEV

Personal site and a static, Markdown-powered blog. Node.js 24 is used locally and in GitHub Actions; the site is hosted on Cloudflare Workers.

## Local preview

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4173. Changes to posts, HTML, CSS, and browser JavaScript rebuild automatically; refresh the browser to see them. Stop with Ctrl+C.

## Write a post

Add `posts/your-post-slug.md`:

```markdown
---
title: Your post title
description: A short, unique summary for readers and search engines.
date: 2026-11-04
category: Notes
---

Write the article in Markdown. Start with paragraphs and use level-two headings;
the template supplies the article's level-one title.
```

The filename becomes `/blog/your-post-slug/`. Use `draft: true` in the metadata to exclude a post from all generated output. Dates are explicit publication dates; future dates do not automatically schedule publication. Markdown is trusted repository content and may contain HTML; do not accept submissions from untrusted sources without sanitizing them.

`npm run build` produces `dist/`, including complete article HTML, the blog index, About page, unique metadata, canonical URLs, BlogPosting structured data, RSS, sitemap, robots.txt, and a 404 page. Generated files and dependencies are ignored by Git. Edit source files rather than `dist/`.

## Update About

Edit `about.json` to replace the résumé placeholders. Each entry has `title`, `company`, `location`, and `description` fields. Entries appear in the same order as the file, formatted as **Job Title, Company (Location)** with the description underneath. The page at `/about/` shares the homepage navigation, footer, and spacing. Changes rebuild during local preview; refresh to see them.

## Cloudflare Workers

The site deploys as a static-assets Worker configured in `wrangler.jsonc`: Cloudflare serves `dist/` directly, `/blog/post` redirects to `/blog/post/`, and unknown paths return `dist/404.html` with a 404 status. No Worker script is involved.

- `npm run preview` builds and serves the site with the Workers runtime at http://localhost:8787, to check routing and 404 behavior before deploying.
- `npm run deploy` builds and deploys from your machine (run `npx wrangler login` once first).
- `.github/workflows/deploy.yml` builds and deploys on pushes to `main` or manual runs. Add the repository secrets `CLOUDFLARE_API_TOKEN` (a token from the **Edit Cloudflare Workers** template) and `CLOUDFLARE_ACCOUNT_ID`.

The `qwiso.dev` zone must be on the same Cloudflare account; the `custom_domain` route in `wrangler.jsonc` creates the DNS record and certificate on deploy. Remove any existing `A`/`CNAME` records for the apex (such as the old GitHub Pages ones) first, or the deploy will fail. The canonical origin is `https://qwiso.dev`; update `wrangler.jsonc`, `scripts/build.mjs`, and homepage metadata if the domain changes.

After deploying, submit `/sitemap.xml` to Google Search Console and inspect a direct article URL. Article content and navigation work without JavaScript; the homepage repository feed retains its existing JavaScript behavior. Search eligibility does not guarantee indexing.
