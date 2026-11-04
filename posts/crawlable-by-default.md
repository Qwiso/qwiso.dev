---
title: Crawlable by default
description: Real URLs, readable HTML, and ordinary links make a solid foundation for a small blog.
date: 2026-11-04
category: Field notes
---
The first request to an article should return an article. That simple rule makes a useful starting point for a static blog.

## Start with a real address

Give each post a URL such as `/blog/crawlable-by-default/`. Opening it in a new tab or refreshing it should return a successful response containing the full text.

A URL fragment is useful for jumping to a heading inside an article. It is a poor foundation for representing a separate article.

## Make the paths visible

Use ordinary links with meaningful text. A reader should be able to reach an article from the blog index, and a crawler should be able to follow the same path.

```html
<a href="/blog/crawlable-by-default/">Crawlable by default</a>
```

A sitemap provides another way to discover those URLs. It complements the links on the site.

## Describe the page you are serving

A unique title and description help explain what a post covers. A canonical URL identifies its preferred address. Structured article data can describe its author, headline, and publication date.

These should all describe the visible article, and they should be present in the HTML produced by the build.

## Verify the published result

Check the direct URL, view its HTML, and confirm that the text is present without running JavaScript. After publishing, use [Google Search Console's URL Inspection tool](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading) to inspect what Google can render.

Being crawlable makes indexing possible. Useful content and Google's indexing decisions still determine what appears in search.
