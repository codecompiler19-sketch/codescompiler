/**
 * CodesCompiler — Custom Admin Server
 * Run with: npm run admin
 * Opens at: http://localhost:3001
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT          = 3001;
const TUTORIALS_DIR = path.join(__dirname, 'src/content/tutorials');
const BLOG_DIR      = path.join(__dirname, 'src/content/blog');
const UI_FILE       = path.join(__dirname, 'admin-ui.html');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':');
    if (k) fm[k.trim()] = v.join(':').trim().replace(/^"|"$/g, '');
  });
  return fm;
}

function listTutorials() {
  if (!fs.existsSync(TUTORIALS_DIR)) return [];
  return fs.readdirSync(TUTORIALS_DIR)
    .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
    .map(file => {
      const raw = fs.readFileSync(path.join(TUTORIALS_DIR, file), 'utf-8');
      const fm  = parseFrontmatter(raw);
      return { file, ...fm };
    })
    .sort((a, b) => Number(a.order || 99) - Number(b.order || 99));
}

function getTutorial(file) {
  const filePath = path.join(TUTORIALS_DIR, file);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

function saveTutorial(file, content) {
  if (!fs.existsSync(TUTORIALS_DIR)) fs.mkdirSync(TUTORIALS_DIR, { recursive: true });
  fs.writeFileSync(path.join(TUTORIALS_DIR, file), content, 'utf-8');
}

function deleteTutorial(file) {
  const filePath = path.join(TUTORIALS_DIR, file);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // ── GET / ── serve static admin HTML UI
  if (pathname === '/') {
    const html = fs.readFileSync(UI_FILE, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
    return;
  }

  // ── BLOG API endpoints ──
  if (pathname === '/api/blogs/list') {
    if (!fs.existsSync(BLOG_DIR)) { res.setHeader('Content-Type', 'application/json'); res.end('[]'); return; }
    const list = fs.readdirSync(BLOG_DIR)
      .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
      .map(file => { const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8'); return { file, ...parseFrontmatter(raw) }; })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(list));
    return;
  }

  if (pathname === '/api/blogs/get') {
    const file = parsed.query.file;
    const fp   = path.join(BLOG_DIR, file);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(fs.existsSync(fp) ? { content: fs.readFileSync(fp, 'utf-8') } : { error: 'Not found' }));
    return;
  }

  if (pathname === '/api/blogs/save' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { filename, content } = JSON.parse(body);
        if (!filename || !content) { res.end(JSON.stringify({ ok: false, error: 'Missing fields' })); return; }
        if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
        fs.writeFileSync(path.join(BLOG_DIR, filename), content, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      } catch (e) { res.end(JSON.stringify({ ok: false, error: e.message })); }
    });
    return;
  }

  if (pathname === '/api/blogs/delete' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { filename } = JSON.parse(body);
        const fp = path.join(BLOG_DIR, filename);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      } catch (e) { res.end(JSON.stringify({ ok: false, error: e.message })); }
    });
    return;
  }

  // ── GET /api/list
  if (pathname === '/api/list') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(listTutorials()));
    return;
  }

  // ── GET /api/get?file=xxx
  if (pathname === '/api/get') {
    const file    = parsed.query.file;
    const content = getTutorial(file);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(content ? { content } : { error: 'Not found' }));
    return;
  }

  // ── POST /api/save
  if (pathname === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { filename, content } = JSON.parse(body);
        if (!filename || !content) { res.end(JSON.stringify({ ok: false, error: 'Missing fields' })); return; }
        saveTutorial(filename, content);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      } catch (e) { res.end(JSON.stringify({ ok: false, error: e.message })); }
    });
    return;
  }

  // ── POST /api/delete
  if (pathname === '/api/delete' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { filename } = JSON.parse(body);
        deleteTutorial(filename);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      } catch (e) { res.end(JSON.stringify({ ok: false, error: e.message })); }
    });
    return;
  }

  // ── POST /api/save-file (for sitemap, robots.txt, etc.)
  if (pathname === '/api/save-file' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { path: filePath, content } = JSON.parse(body);
        const fullPath = path.join(__dirname, filePath);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      } catch (e) { res.end(JSON.stringify({ ok: false, error: e.message })); }
    });
    return;
  }

  // ── POST /api/save-nav
  if (pathname === '/api/save-nav' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { items } = JSON.parse(body);
        const navPath = path.join(__dirname, 'src', 'nav.json');
        fs.writeFileSync(navPath, JSON.stringify(items, null, 2), 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      } catch (e) { res.end(JSON.stringify({ ok: false, error: e.message })); }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('\n=========================================');
  console.log('  CodesCompiler Admin Panel');
  console.log('  http://localhost:' + PORT);
  console.log('=========================================\n');
  console.log('  Keep npm run dev running in another CMD');
  console.log('  Press Ctrl+C to stop\n');
});
