import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { parse } from 'yaml';

export const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const origin = 'https://qwiso.dev';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const displayDate = date => new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(date));
let nav, footer;

function page({ title, description, url, content, post }) {
  const absolute = origin + url;
  const currentClass = url === '/about/' ? 'about-nav' : url.startsWith('/blog/') ? 'blog-nav' : null;
  const navigation = currentClass ? nav.replace(`class="${currentClass}"`, `class="${currentClass}" aria-current="${post ? 'location' : 'page'}"`) : nav;
  const schema = post ? { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description, datePublished: post.date, author: { '@type': 'Person', name: 'Qwiso', url: origin }, mainEntityOfPage: absolute, url: absolute, image: `${origin}/site-icon.png` } : null;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#121013"><title>${escape(title)} | QwisoDEV</title>
<meta name="description" content="${escape(description)}"><link rel="canonical" href="${absolute}">
<meta property="og:type" content="${post ? 'article' : 'website'}"><meta property="og:url" content="${absolute}">
<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}">
<meta property="og:image" content="${origin}/site-icon.png"><meta property="og:site_name" content="QwisoDEV">
${post ? `<meta property="article:published_time" content="${post.date}T00:00:00Z">` : ''}
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${origin}/site-icon.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/blog.css">
${url === '/about/' ? '<link rel="stylesheet" href="/about.css">' : ''}
<link rel="alternate" type="application/rss+xml" title="QwisoDEV Blog" href="/feed.xml">
${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : ''}
</head><body class="blog-page${url === '/about/' ? ' about-page' : ''}"><a class="skip" href="#main">Skip to content</a>${navigation}<main id="main">${content}</main>${footer}</body></html>`;
}

function card(post, index) {
  return `<article class="repo-card post-card"><div class="card-top"><span class="post-category">${escape(post.category)}</span><span class="card-number">POST / ${String(index + 1).padStart(2, '0')}</span></div><h3><a href="${post.url}">${escape(post.title)}</a></h3><p>${escape(post.description)}</p><div class="card-meta"><time datetime="${post.date}">${displayDate(post.date)}</time><span>${post.minutes} min read</span><span class="card-arrow" aria-hidden="true">↗</span></div></article>`;
}

export async function build() {
  let home = await readFile(path.join(root, 'index.html'), 'utf8');
  // Use the homepage's actual navigation and footer, so markup cannot drift.
  nav = home.match(/<header class="topbar">[\s\S]*?<\/header>/)[0]
    .replace('class="brand" href="#"', 'class="brand" href="/"');
  footer = home.match(/<footer>[\s\S]*?<\/footer>/)[0]
    .replace('class="brand" href="#"', 'class="brand" href="/"');
  const posts = [];
  for (const filename of (await readdir(path.join(root, 'posts'))).filter(name => name.endsWith('.md'))) {
    const slug = filename.slice(0, -3);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid post filename: ${filename}`);
    const source = await readFile(path.join(root, 'posts', filename), 'utf8');
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) throw new Error(`Missing front matter: ${filename}`);
    const meta = parse(match[1]);
    if (meta.draft === true) continue;
    for (const key of ['title', 'description', 'date', 'category']) if (typeof meta[key] !== 'string' || !meta[key].trim()) throw new Error(`Missing ${key}: ${filename}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date) || !Number.isFinite(Date.parse(meta.date)) || new Date(meta.date).toISOString().slice(0, 10) !== meta.date) throw new Error(`Invalid date: ${filename}`);
    posts.push({ ...meta, slug, url: `/blog/${slug}/`, html: marked.parse(match[2]), minutes: Math.max(1, Math.ceil(match[2].split(/\s+/).length / 220)) });
  }
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  await rm(out, { recursive: true, force: true });
  await mkdir(path.join(out, 'blog'), { recursive: true });
  for (const file of ['style.css', 'blog.css', 'about.css', 'app.js', 'repos.json', 'favicon.ico', 'favicon.svg', 'moon.svg', 'site-icon.png']) await copyFile(path.join(root, file), path.join(out, file));
  const cards = posts.map(card).join('\n');
  await writeFile(path.join(out, 'index.html'), home);
  const content = `<header class="blog-masthead"><h1 class="eyebrow"><span class="signal" aria-hidden="true"></span> THE QWISODEV BLOG</h1></header><section class="writing" aria-labelledby="writing-heading"><div class="writing-heading"><h2 id="writing-heading">Latest writing</h2><span>${posts.length} ${posts.length === 1 ? 'entry' : 'entries'} / newest first</span></div><div class="post-grid">${cards || '<p>No posts yet. Check back soon.</p>'}</div></section>`;
  await writeFile(path.join(out, 'blog/index.html'), page({ title: 'From the workshop — Blog', description: 'Ideas, experiments, and notes on making things for the web. The QwisoDEV blog.', url: '/blog/', content }));
  const experience = JSON.parse(await readFile(path.join(root, 'about.json'), 'utf8'));
  if (!Array.isArray(experience) || experience.some(entry => ['title', 'company', 'location'].some(key => typeof entry[key] !== 'string' || !entry[key].trim()) || typeof entry.description !== 'string')) throw new Error('Each about.json entry needs a title, company, location, and a description string (which may be empty).');
  const resume = `<header class="blog-masthead"><h1 class="eyebrow"><span class="signal" aria-hidden="true"></span> ABOUT QWISODEV</h1></header><section class="resume" aria-labelledby="experience-heading"><div class="section-heading"><h2 id="experience-heading">Experience<span class="accent">.</span></h2></div><div class="resume-entries">${experience.map(entry => `<article class="resume-entry"><h3><span class="job-title">${escape(entry.title)}</span><span class="job-company">, ${escape(entry.company)} <span class="job-location">(${escape(entry.location)})</span></span></h3><p>${escape(entry.description)}</p></article>`).join('')}</div></section>`;
  await mkdir(path.join(out, 'about'), { recursive: true });
  await writeFile(path.join(out, 'about/index.html'), page({ title: 'About', description: 'Professional experience and background — QwisoDEV.', url: '/about/', content: resume }));
  for (const post of posts) {
    const related = posts.filter(other => other.slug !== post.slug).slice(0, 2);
    const content = `<article class="article"><header class="article-header"><a class="text-link" href="/blog/">← All writing</a><p class="eyebrow">${escape(post.category)}</p><h1>${escape(post.title)}</h1><p class="article-deck">${escape(post.description)}</p><div class="post-details"><span>By Qwiso</span><time datetime="${post.date}">${displayDate(post.date)}</time><span>${post.minutes} min read</span></div></header><div class="prose">${post.html}</div><div class="article-end"><span class="end-mark" aria-hidden="true">✳</span><p>From the QwisoDEV workshop.</p><a class="text-link" href="/blog/">Back to all writing ↗</a></div></article>${related.length ? `<section class="more-writing"><h2>Keep exploring<span class="accent">.</span></h2><div class="post-grid">${related.map(card).join('')}</div></section>` : ''}`;
    await mkdir(path.join(out, 'blog', post.slug), { recursive: true });
    await writeFile(path.join(out, 'blog', post.slug, 'index.html'), page({ title: post.title, description: post.description, url: post.url, content, post }));
  }
  await writeFile(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/blog/', '/about/', ...posts.map(p => p.url)].map(url => `<url><loc>${origin}${url}</loc></url>`).join('')}</urlset>`);
  await writeFile(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  await writeFile(path.join(out, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>QwisoDEV — From the workshop</title><link>${origin}/blog/</link><description>Ideas, experiments, and notes on making things for the web.</description><language>en</language>${posts.map(p => `<item><title>${escape(p.title)}</title><link>${origin}${p.url}</link><guid>${origin}${p.url}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${escape(p.description)}</description></item>`).join('')}</channel></rss>`);
  await writeFile(path.join(out, '404.html'), page({ title: 'Page not found', description: 'This page could not be found.', url: '/404.html', content: '<section class="blog-intro"><p class="eyebrow">404 / LOST IN THE WORKSHOP</p><h1>Nothing<br><span>here yet.</span></h1><a class="text-link" href="/blog/">Explore the blog ↗</a></section>' }).replace('<meta name="theme-color"', '<meta name="robots" content="noindex"><meta name="theme-color"'));
  console.log(`Built ${posts.length} posts into dist/`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
