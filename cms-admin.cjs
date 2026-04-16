/**
 * CodesCompiler — Custom Admin Server
 * Run with: node cms-admin.cjs  (from the codescompiler/ folder)
 * Opens at: http://localhost:3001
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT          = 3001;
const APP_DIR       = path.join(__dirname, '..', 'App');          // Astro project root
const TUTORIALS_DIR = path.join(APP_DIR, 'src/content/tutorials');
const BLOG_DIR      = path.join(APP_DIR, 'src/content/blog');
const NAV_FILE      = path.join(APP_DIR, 'src/nav.json');
const SIDEBAR_FILE  = path.join(APP_DIR, 'src/sidebar.json');
const UI_FILE       = path.join(__dirname, 'admin-ui.html');

// Ensure content directories exist on startup
[TUTORIALS_DIR, BLOG_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Default sidebar structure (w3schools-style)
const DEFAULT_SIDEBAR = {
  html: [],
  css: [],
  javascript: []
};

// Default nav bar items
const DEFAULT_NAV = [
  { label: 'HTML', href: '/tutorial/html-introduction', color: '#E34F26' },
  { label: 'CSS', href: '/tutorial/css-introduction', color: '#264DE4' },
  { label: 'JavaScript', href: '/tutorial/js-introduction', color: '#F7DF1E' },
  { label: 'About', href: '/about', color: '#9CA3AF' },
  { label: 'Contact', href: '/contact', color: '#9CA3AF' },
];

console.log('  Tutorials dir:', TUTORIALS_DIR);
console.log('  Blog dir:     ', BLOG_DIR);
console.log('  Nav file:     ', NAV_FILE);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const normalised = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalised.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const k = line.slice(0, colonIdx).trim();
    const v = line.slice(colonIdx + 1).trim().replace(/^"|"$/g, '');
    if (k) fm[k] = v;
  });
  return fm;
}

function readJSON(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) { /* fall through */ }
  return fallback;
}

function writeJSON(file, data) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
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

function listBlogs() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
    .map(file => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      return { file, ...parseFrontmatter(raw) };
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function getFileContent(dir, file) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

function saveFileContent(dir, file, content) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), content, 'utf-8');
}

function deleteFile(dir, file) {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// Helper to collect POST body
function collectBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch(e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// Auto-build sidebar from existing tutorial files
function buildSidebarFromFiles() {
  const tutorials = listTutorials();
  const sidebar = { html: [], css: [], javascript: [] };
  tutorials.forEach(t => {
    const cat = t.category || 'html';
    if (!sidebar[cat]) sidebar[cat] = [];
    sidebar[cat].push({
      title: t.title || t.file,
      slug: t.file.replace(/\.mdx?$/, ''),
      order: Number(t.order || 99)
    });
  });
  // Sort each category by order
  Object.keys(sidebar).forEach(cat => {
    sidebar[cat].sort((a, b) => a.order - b.order);
  });
  return sidebar;
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────
function jsonRes(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  try {

    // ── GET / ── serve admin UI
    if (pathname === '/') {
      const html = fs.readFileSync(UI_FILE, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
      return;
    }

    // ══════════════════════════════════════════════════════════════════
    // TUTORIAL APIs
    // ══════════════════════════════════════════════════════════════════

    if (pathname === '/api/tutorials/list') {
      jsonRes(res, listTutorials());
      return;
    }

    if (pathname === '/api/tutorials/get') {
      const file = parsed.query.file;
      const content = getFileContent(TUTORIALS_DIR, file);
      jsonRes(res, content ? { content } : { error: 'Not found' });
      return;
    }

    if (pathname === '/api/tutorials/save' && req.method === 'POST') {
      const body = await collectBody(req);
      if (!body.filename || !body.content) {
        jsonRes(res, { ok: false, error: 'Missing filename or content' }, 400);
        return;
      }
      saveFileContent(TUTORIALS_DIR, body.filename, body.content);
      jsonRes(res, { ok: true });
      return;
    }

    if (pathname === '/api/tutorials/delete' && req.method === 'POST') {
      const body = await collectBody(req);
      deleteFile(TUTORIALS_DIR, body.filename);
      jsonRes(res, { ok: true });
      return;
    }

    // ══════════════════════════════════════════════════════════════════
    // BLOG APIs
    // ══════════════════════════════════════════════════════════════════

    if (pathname === '/api/blogs/list') {
      jsonRes(res, listBlogs());
      return;
    }

    if (pathname === '/api/blogs/get') {
      const file = parsed.query.file;
      const content = getFileContent(BLOG_DIR, file);
      jsonRes(res, content ? { content } : { error: 'Not found' });
      return;
    }

    if (pathname === '/api/blogs/save' && req.method === 'POST') {
      const body = await collectBody(req);
      if (!body.filename || !body.content) {
        jsonRes(res, { ok: false, error: 'Missing filename or content' }, 400);
        return;
      }
      saveFileContent(BLOG_DIR, body.filename, body.content);
      jsonRes(res, { ok: true });
      return;
    }

    if (pathname === '/api/blogs/delete' && req.method === 'POST') {
      const body = await collectBody(req);
      deleteFile(BLOG_DIR, body.filename);
      jsonRes(res, { ok: true });
      return;
    }

    // ══════════════════════════════════════════════════════════════════
    // NAV BAR API — manages the dark language strip
    // ══════════════════════════════════════════════════════════════════

    if (pathname === '/api/nav/get') {
      const nav = readJSON(NAV_FILE, DEFAULT_NAV);
      jsonRes(res, nav);
      return;
    }

    if (pathname === '/api/nav/save' && req.method === 'POST') {
      const body = await collectBody(req);
      writeJSON(NAV_FILE, body.items || []);
      jsonRes(res, { ok: true });
      return;
    }

    // ══════════════════════════════════════════════════════════════════
    // SIDEBAR API — manages tutorial sidebar per category
    // ══════════════════════════════════════════════════════════════════

    if (pathname === '/api/sidebar/get') {
      // Auto-build from existing files
      const sidebar = buildSidebarFromFiles();
      jsonRes(res, sidebar);
      return;
    }

    if (pathname === '/api/sidebar/save' && req.method === 'POST') {
      const body = await collectBody(req);
      writeJSON(SIDEBAR_FILE, body);
      jsonRes(res, { ok: true });
      return;
    }

    // ══════════════════════════════════════════════════════════════════
    // SAVE-FILE API — for sitemap, robots.txt, etc.
    // ══════════════════════════════════════════════════════════════════

    if (pathname === '/api/save-file' && req.method === 'POST') {
      const body = await collectBody(req);
      const fullPath = path.join(APP_DIR, body.path);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, body.content, 'utf-8');
      jsonRes(res, { ok: true });
      return;
    }

    // ══════════════════════════════════════════════════════════════════
    // LEGACY COMPAT — old api paths still work
    // ══════════════════════════════════════════════════════════════════
    if (pathname === '/api/list') {
      jsonRes(res, listTutorials());
      return;
    }
    if (pathname === '/api/get') {
      const file = parsed.query.file;
      const content = getFileContent(TUTORIALS_DIR, file);
      jsonRes(res, content ? { content } : { error: 'Not found' });
      return;
    }
    if (pathname === '/api/save' && req.method === 'POST') {
      const body = await collectBody(req);
      if (!body.filename || !body.content) {
        jsonRes(res, { ok: false, error: 'Missing fields' }, 400);
        return;
      }
      saveFileContent(TUTORIALS_DIR, body.filename, body.content);
      jsonRes(res, { ok: true });
      return;
    }
    if (pathname === '/api/delete' && req.method === 'POST') {
      const body = await collectBody(req);
      deleteFile(TUTORIALS_DIR, body.filename);
      jsonRes(res, { ok: true });
      return;
    }

    res.writeHead(404);
    res.end('Not found');

  } catch (err) {
    console.error('Server error:', err);
    jsonRes(res, { ok: false, error: err.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log('\n=========================================');
  console.log('  CodesCompiler Admin Panel');
  console.log('  http://localhost:' + PORT);
  console.log('=========================================\n');
  console.log('  Content dir: ' + TUTORIALS_DIR);
  console.log('  Keep npm run dev in another terminal');
  console.log('  Press Ctrl+C to stop\n');
});
