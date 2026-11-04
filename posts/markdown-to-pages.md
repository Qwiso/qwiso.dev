---
title: Markdown in. Web pages out.
description: A small publishing workflow for a fast blog, with plain Markdown at its heart and complete HTML at every URL.
date: 2026-11-04
category: Building the web
---
A blog can start with a folder of text files. The useful part is what happens between writing those files and serving them to a reader.

This site turns Markdown into HTML before publishing. Every article gets its own address, its own metadata, and a complete page that works without JavaScript.

## A file is the starting point

Each post lives in the `posts` directory. A short block of metadata describes the article, followed by ordinary Markdown:

```markdown
---
title: A new idea
description: A short introduction to the idea.
date: 2026-11-04
category: Notes
---

The first paragraph starts here.
```

The filename becomes the URL. A file named `a-new-idea.md` becomes `/blog/a-new-idea/`. Links can point straight to that address, and refreshing the page loads the same article.

## Do the work before the visit

The build reads the metadata, converts the Markdown, and wraps the result in the site's layout. It also updates the blog index, homepage previews, sitemap, and RSS feed.

That means the browser receives the article immediately. It does not need to fetch another file or run a Markdown parser before showing the words.

> Keep the publishing machinery behind the page. Let the reader arrive at the content.

JavaScript can still improve an experience. It just does not have to carry the article itself.

## Leave a path to every page

Every post is linked from the blog index using a normal HTML link. Each page includes a descriptive title, a canonical URL, and an introduction suitable for a search snippet.

These details make a site easier to discover and understand. They do not promise a place in search results, but they remove avoidable obstacles.

## Keep the loop small

The local workflow is two commands:

```sh
npm install
npm run dev
```

Edit a post, refresh the preview, and read it as a visitor would. When it is ready, the same build can produce the static files for GitHub Pages.

Plain files. Stable links. A little less machinery between an idea and a page.
