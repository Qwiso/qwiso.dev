import http from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { root } from './build.mjs';

async function rebuild() {
  const { build } = await import(`./build.mjs?version=${Date.now()}`);
  await build();
}
await rebuild();
const base = path.join(root, 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain' };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(base, '.' + pathname);
    if (!file.startsWith(base + path.sep) && file !== base) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { Location: pathname + '/' }).end(); return; }
      file = path.join(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await readFile(path.join(base, '404.html')));
  }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));

async function snapshot() {
  const files = ['index.html', 'style.css', 'blog.css', 'about.css', 'about.json', 'app.js', 'scripts/build.mjs', ... (await readdir(path.join(root, 'posts'))).map(f => 'posts/' + f)];
  return (await Promise.all(files.map(async f => `${f}:${(await stat(path.join(root, f))).mtimeMs}`))).join('|');
}
let previous = await snapshot(), busy = false;
setInterval(async () => {
  if (busy) return;
  busy = true;
  try { const next = await snapshot(); if (next !== previous) { await rebuild(); previous = next; console.log('Updated — refresh your browser.'); } }
  catch (error) { console.error(error.message); }
  finally { busy = false; }
}, 1000);
