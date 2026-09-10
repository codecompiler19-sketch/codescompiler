/**
 * CodesCompiler — Local Admin Server
 * Run:  node admin-server.cjs   (inside the App folder)
 * Open: http://localhost:3001
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT          = 3001;
const APP_DIR       = __dirname;
const TUTORIALS_DIR = path.join(APP_DIR, 'src/content/tutorials');
const BLOG_DIR      = path.join(APP_DIR, 'src/content/blog');
const BOOKS_DIR     = path.join(APP_DIR, 'src/data/books');
const MEDIA_DIR     = path.join(APP_DIR, 'public/images/uploads');
const NAV_FILE      = path.join(APP_DIR, 'src/nav.json');
const SETTINGS_FILE = path.join(APP_DIR, 'src/site-settings.json');
const ADS_FILE      = path.join(APP_DIR, 'src/ads-config.json');
const PAGES_DIR     = path.join(APP_DIR, 'src/pages');
const TRASH_DIR     = path.join(APP_DIR, 'src/content/trash');
const TRASH_BLOGS   = path.join(TRASH_DIR, 'blogs');
const TRASH_TUTS    = path.join(TRASH_DIR, 'tutorials');
const TRASH_PAGES   = path.join(TRASH_DIR, 'pages');
const UI_FILE       = path.join(APP_DIR, 'admin-ui.html');

const CATEGORIES_FILE = path.join(APP_DIR, 'src/data/categories.json');

[TUTORIALS_DIR, BLOG_DIR, TRASH_DIR, TRASH_BLOGS, TRASH_TUTS, TRASH_PAGES].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// Ensure categories file exists with defaults
if (!fs.existsSync(CATEGORIES_FILE)) {
  const dir = path.dirname(CATEGORIES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const defaults = ['HTML & CSS','JavaScript','JavaScript Projects','Login Form','Card Design','Navigation Bar','Blog','Website Designs','Image Slider','API Projects','Sidebar Menu','CSS Buttons','JavaScript Games','Preloader or Loader','Form Validation','Accordion','Bootstrap','Tabs','Calendar'].map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g,'-'), description: '' }));
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const norm  = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = norm.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const ci = line.indexOf(':');
    if (ci === -1) return;
    const k = line.slice(0, ci).trim();
    let   v = line.slice(ci + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (v === 'true') v = true; else if (v === 'false') v = false;
    if (k) fm[k] = v;
  });
  return fm;
}

function readDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
}

function listTutorials() {
  return readDir(TUTORIALS_DIR).map(file => {
    const fm = parseFrontmatter(fs.readFileSync(path.join(TUTORIALS_DIR, file), 'utf-8'));
    return { file, ...fm };
  }).sort((a, b) => Number(a.order || 99) - Number(b.order || 99));
}

function listBlogs() {
  return readDir(BLOG_DIR).map(file => {
    const fm = parseFrontmatter(fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8'));
    return { file, ...fm };
  }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function getRecentActivity() {
  const activity = [];
  const addFiles = (dir, type) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
      const fullPath = path.join(dir, f);
      if (fs.statSync(fullPath).isDirectory()) return;
      const st = fs.statSync(fullPath);
      activity.push({ file: f, type, mtime: st.mtimeMs });
    });
  };
  addFiles(BLOG_DIR, 'Post');
  addFiles(TUTORIALS_DIR, 'Tutorial');
  addFiles(PAGES_DIR, 'Page');
  addFiles(BOOKS_DIR, 'Book');
  addFiles(MEDIA_DIR, 'Media');
  return activity.sort((a,b)=>b.mtime-a.mtime).slice(0, 8);
}

function getStats() {
  const tutorials = listTutorials();
  const blogs     = listBlogs();
  const pagesCount = fs.existsSync(PAGES_DIR) ? fs.readdirSync(PAGES_DIR).filter(f=>f.endsWith('.astro')).length : 0;
  const booksCount = fs.existsSync(BOOKS_DIR) ? fs.readdirSync(BOOKS_DIR).filter(f=>f.endsWith('.json')).length : 0;
  const mediaCount = fs.existsSync(MEDIA_DIR) ? fs.readdirSync(MEDIA_DIR).filter(f=>!fs.statSync(path.join(MEDIA_DIR, f)).isDirectory()).length : 0;

  const tByCat = {};
  tutorials.forEach(t => { const c = t.category || 'other'; tByCat[c] = (tByCat[c] || 0) + 1; });
  const bByCat = {};
  blogs.forEach(b => { const c = b.category || 'other'; bByCat[c] = (bByCat[c] || 0) + 1; });
  return { 
    totalTutorials: tutorials.length, 
    totalBlogs: blogs.length, 
    totalPages: pagesCount,
    totalBooks: booksCount,
    totalMedia: mediaCount,
    recentActivity: getRecentActivity(),
    tutorialsByCategory: tByCat, 
    blogsByCategory: bByCat 
  };
}

function readJSON(file, fallback) {
  try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch(e) {}
  return fallback;
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { reject(e); } });
    req.on('error', reject);
  });
}

function jsonRes(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' });
  res.end(JSON.stringify(data));
}

// ── Auto-inject scripts into BaseLayout ─────────────────────────────────────
function injectHeadScripts(settings) {
  const layoutFile = path.join(APP_DIR, 'src/layouts/BaseLayout.astro');
  if (!fs.existsSync(layoutFile)) return;
  let html = fs.readFileSync(layoutFile, 'utf-8');

  // Remove old injected block
  html = html.replace(/<!-- ADMIN-INJECTED-START -->[\s\S]*?<!-- ADMIN-INJECTED-END -->\n?/g, '');

  // Build injection
  let inject = '';
  if (settings.adsenseId) {
    inject += `    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsenseId}" crossorigin="anonymous"></script>\n`;
  }
  if (settings.searchConsoleTag) {
    inject += `    <meta name="google-site-verification" content="${settings.searchConsoleTag}" />\n`;
  }
  if (settings.cacheControl) {
    inject += `    <meta http-equiv="Cache-Control" content="${settings.cacheControl}" />\n`;
  }
  if (settings.customHeadScripts) {
    inject += `    ${settings.customHeadScripts}\n`;
  }

  if (inject) {
    const marker = `<!-- ADMIN-INJECTED-START -->\n${inject}    <!-- ADMIN-INJECTED-END -->\n`;
    // Insert right before </head>
    html = html.replace('</head>', marker + '  </head>');
    fs.writeFileSync(layoutFile, html, 'utf-8');
    console.log('  ✅ Head scripts injected into BaseLayout.astro');
  }

  // Handle Robots.txt
  const publicDir = path.join(APP_DIR, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), settings.robotsTxt || 'User-agent: *\nAllow: /', 'utf-8');
}

function generateSitemap() {
  const publicDir = path.join(APP_DIR, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  
  const siteUrl = readJSON(SETTINGS_FILE, {}).siteUrl || 'https://codescompiler.com';
  let urls = [];
  
  // Add static pages
  if (fs.existsSync(PAGES_DIR)) {
    const pages = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.astro') && !f.startsWith('admin') && f !== '404.astro');
    pages.forEach(p => {
      const slug = p === 'index.astro' ? '' : p.replace('.astro', '/');
      urls.push(`${siteUrl}/${slug}`);
    });
  }
  
  // Add Blogs
  listBlogs().forEach(b => {
    if (b.draft !== 'true' && b.draft !== true) {
      urls.push(`${siteUrl}/blog/${b.file.replace(/\.mdx?$/, '/')}`);
    }
  });
  
  // Add Tutorials
  listTutorials().forEach(t => {
    urls.push(`${siteUrl}/tutorial/${t.file.replace(/\.mdx?$/, '/')}`);
  });

  // Create XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </url>`).join('\n')}\n</urlset>`;
  
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), xml, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf-8');
  console.log('  ✅ Custom Sitemap Generated (' + urls.length + ' URLs)');
}

// Generate on startup
generateSitemap();

// ── Server ────────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  try {
    // Serve UI
    if (pathname === '/' || pathname === '/admin') {
      const html = fs.readFileSync(UI_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html); return;
    }

    // Serve admin JS
    if (pathname === '/admin-app.js') {
      const js = fs.readFileSync(path.join(APP_DIR, 'admin-app.js'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      res.end(js); return;
    }

    // Stats
    if (pathname === '/api/stats') { jsonRes(res, getStats()); return; }

    // Tutorials
    if (pathname === '/api/tutorials/list') { jsonRes(res, listTutorials()); return; }
    if (pathname === '/api/tutorials/get') {
      const f = parsed.query.file;
      const p = path.join(TUTORIALS_DIR, f);
      jsonRes(res, fs.existsSync(p) ? { content: fs.readFileSync(p, 'utf-8') } : { error: 'Not found' }); return;
    }
    if (pathname === '/api/tutorials/save' && req.method === 'POST') {
      const b = await collectBody(req);
      if (!b.filename || !b.content) { jsonRes(res, { ok: false, error: 'Missing fields' }, 400); return; }
      fs.writeFileSync(path.join(TUTORIALS_DIR, b.filename), b.content, 'utf-8');
      generateSitemap();
      jsonRes(res, { ok: true }); return;
    }
    if (pathname === '/api/tutorials/delete' && req.method === 'POST') {
      const b = await collectBody(req);
      const p = path.join(TUTORIALS_DIR, b.filename);
      if (fs.existsSync(p)) fs.renameSync(p, path.join(TRASH_TUTS, b.filename));
      generateSitemap();
      jsonRes(res, { ok: true }); return;
    }

    // Blogs
    if (pathname === '/api/blogs/list') { jsonRes(res, listBlogs()); return; }
    if (pathname === '/api/blogs/get') {
      const f = parsed.query.file;
      const p = path.join(BLOG_DIR, f);
      jsonRes(res, fs.existsSync(p) ? { content: fs.readFileSync(p, 'utf-8') } : { error: 'Not found' }); return;
    }
    if (pathname === '/api/blogs/save' && req.method === 'POST') {
      const b = await collectBody(req);
      if (!b.filename || !b.content) { jsonRes(res, { ok: false, error: 'Missing fields' }, 400); return; }
      fs.writeFileSync(path.join(BLOG_DIR, b.filename), b.content, 'utf-8');
      generateSitemap();
      jsonRes(res, { ok: true }); return;
    }
    if (pathname === '/api/blogs/delete' && req.method === 'POST') {
      const b = await collectBody(req);
      const p = path.join(BLOG_DIR, b.filename);
      if (fs.existsSync(p)) fs.renameSync(p, path.join(TRASH_BLOGS, b.filename));
      generateSitemap();
      jsonRes(res, { ok: true }); return;
    }

    // Books
    if (pathname === '/api/books/list') {
      const books = (fs.existsSync(BOOKS_DIR) ? fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.json')) : []).map(file => {
        return { file, ...readJSON(path.join(BOOKS_DIR, file), {}) };
      }).sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
      jsonRes(res, books); return;
    }
    if (pathname === '/api/books/get') {
      const f = parsed.query.file;
      const p = path.join(BOOKS_DIR, f);
      jsonRes(res, fs.existsSync(p) ? { content: fs.readFileSync(p, 'utf-8') } : { error: 'Not found' }); return;
    }
    if (pathname === '/api/books/save' && req.method === 'POST') {
      const b = await collectBody(req);
      if (!b.filename || !b.content) { jsonRes(res, { ok: false, error: 'Missing fields' }, 400); return; }
      fs.writeFileSync(path.join(BOOKS_DIR, b.filename), typeof b.content === 'string' ? b.content : JSON.stringify(b.content, null, 2), 'utf-8');
      generateSitemap();
      jsonRes(res, { ok: true }); return;
    }
    if (pathname === '/api/books/delete' && req.method === 'POST') {
      const b = await collectBody(req);
      const p = path.join(BOOKS_DIR, b.filename);
      const TRASH_BOOKS = path.join(TRASH_DIR, 'books');
      if (!fs.existsSync(TRASH_BOOKS)) fs.mkdirSync(TRASH_BOOKS, { recursive: true });
      if (fs.existsSync(p)) fs.renameSync(p, path.join(TRASH_BOOKS, b.filename));
      generateSitemap();
      jsonRes(res, { ok: true }); return;
    }

    // Navigation
    if (pathname === '/api/nav/get') { jsonRes(res, readJSON(NAV_FILE, [])); return; }
    if (pathname === '/api/nav/save' && req.method === 'POST') {
      const b = await collectBody(req);
      writeJSON(NAV_FILE, b.items || []);
      jsonRes(res, { ok: true }); return;
    }

    // Settings (AdSense, Search Console, custom scripts)
    const DEFAULT_SETTINGS = {
      adsenseId: '',
      adsenseAutoAds: false,
      searchConsoleTag: '',
      customHeadScripts: '',
      customBodyScripts: '',
      siteTitle: 'CodesCompiler',
      siteDescription: 'Free web development tutorials for HTML, CSS, and JavaScript. Learn step-by-step with a live code editor. Perfect for beginners. No sign-up needed. Start coding today.',
      siteUrl: 'https://codescompiler.com',
      permalinkStructure: '/blog/{slug}/',
      tutorialPermalinkStructure: '/tutorial/{slug}/',
      robotsTxt: 'User-agent: *\nAllow: /\nSitemap: https://codescompiler.com/sitemap.xml\nSitemap: https://codescompiler.com/sitemap-index.xml',
      cacheControl: 'public, max-age=3600'
    };
    if (pathname === '/api/settings/get') {
      jsonRes(res, readJSON(SETTINGS_FILE, DEFAULT_SETTINGS)); return;
    }
    if (pathname === '/api/settings/save' && req.method === 'POST') {
      const b = await collectBody(req);
      writeJSON(SETTINGS_FILE, b);
      // Also inject AdSense into BaseLayout if provided
      injectHeadScripts(b);
      jsonRes(res, { ok: true }); return;
    }

    // Rename file (change permalink / URL slug)
    if (pathname === '/api/rename' && req.method === 'POST') {
      const b = await collectBody(req);
      const dir = b.type === 'blog' ? BLOG_DIR : TUTORIALS_DIR;
      const oldPath = path.join(dir, b.oldFile);
      const newFile = b.newFile.endsWith('.mdx') ? b.newFile : b.newFile + '.mdx';
      const newPath = path.join(dir, newFile);
      if (!fs.existsSync(oldPath)) { jsonRes(res, { ok: false, error: 'File not found' }, 404); return; }
      if (fs.existsSync(newPath) && b.oldFile !== newFile) { jsonRes(res, { ok: false, error: 'A file with that slug already exists' }, 409); return; }
      fs.renameSync(oldPath, newPath);
      generateSitemap();
      jsonRes(res, { ok: true, newFile }); return;
    }

    // List all permalinks
    if (pathname === '/api/permalinks') {
      const tuts = listTutorials().map(t => ({ type: 'tutorial', file: t.file, title: t.title, url: '/tutorial/' + t.file.replace(/\.mdx?$/, '/'), category: t.category }));
      const bposts = listBlogs().map(b => ({ type: 'blog', file: b.file, title: b.title, url: '/blog/' + b.file.replace(/\.mdx?$/, '/'), category: b.category, date: b.date }));
      jsonRes(res, { tutorials: tuts, blogs: bposts }); return;
    }

    // ══ PAGES ══
    if (pathname === '/api/pages/list') {
      function walkDir(dir, prefix='') {
        let results = [];
        fs.readdirSync(dir).forEach(f => {
          const fullPath = path.join(dir, f);
          const relPath = prefix ? prefix + '/' + f : f;
          if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(walkDir(fullPath, relPath));
          } else if (f.endsWith('.astro') && !relPath.startsWith('admin')) {
            results.push(relPath);
          }
        });
        return results;
      }
      
      const pages = walkDir(PAGES_DIR).map(file => {
        const fullPath = path.join(PAGES_DIR, file);
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const slug = file.replace(/\.astro$/, '');
        const titleMatch = raw.match(/<title[^>]*>([^<]+)/i);
        const defaultTitle = titleMatch ? titleMatch[1].replace(/\s*\|.*$/, '') : slug;
        
        let meta = {};
        const metaMatch = raw.match(/<!-- WP_META:\s*({.*?})\s*-->/);
        if (metaMatch) {
          try { meta = JSON.parse(metaMatch[1]); } catch(e) {}
        }
        
        return { 
          file, 
          slug, 
          title: meta.title || defaultTitle, 
          url: '/' + slug, 
          size: raw.length,
          author: meta.author || '',
          category: meta.category || '',
          tags: meta.tags || [],
          draft: meta.draft || false,
          date: meta.date || '',
          image: meta.image || ''
        };
      });
      jsonRes(res, pages); return;
    }
    if (pathname === '/api/pages/get') {
      const f = parsed.query.file;
      const q = url.parse(req.url, true).query;
      const targetPath = path.join(PAGES_DIR, q.file);
      if (fs.existsSync(targetPath)) {
        jsonRes(res, { content: fs.readFileSync(targetPath, 'utf-8') });
      } else { jsonRes(res, { error: true }); }
      return;
    }
    if (pathname === '/api/pages/save' && req.method === 'POST') {
      const b = await collectBody(req);
      const targetPath = path.join(PAGES_DIR, b.filename);
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(targetPath, b.content, 'utf-8');
      jsonRes(res, { ok: true }); return;
    }
    if (pathname === '/api/pages/delete' && req.method === 'POST') {
      const b = await collectBody(req);
      const p = path.join(PAGES_DIR, b.filename);
      if (fs.existsSync(p)) fs.renameSync(p, path.join(TRASH_PAGES, b.filename));
      generateSitemap();
      jsonRes(res, { ok: true }); return;
    }

    // ══ MEDIA ══
    if (pathname === '/api/media/upload' && req.method === 'POST') {
      const b = await collectBody(req);
      if (!b.filename || !b.data) { jsonRes(res, { ok: false, error: 'Missing filename or data' }, 400); return; }
      const base64Data = b.data.replace(/^data:image\/\w+;base64,/, '');
      const ext = path.extname(b.filename) || '.jpg';
      let name = path.basename(b.filename, ext).replace(/[^a-zA-Z0-9_-]/g, '') + '-' + Date.now() + ext;
      const outPath = path.join(MEDIA_DIR, name);
      if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });
      fs.writeFileSync(outPath, base64Data, 'base64');
      jsonRes(res, { ok: true, url: '/images/uploads/' + name }); return;
    }
    
    // ══ CATEGORIES ══
    if (pathname === '/api/categories/list') {
      const cats = fs.existsSync(CATEGORIES_FILE) ? JSON.parse(fs.readFileSync(CATEGORIES_FILE,'utf-8')) : [];
      // Count posts per category
      const countMap = {};
      if (fs.existsSync(BLOG_DIR)) {
        fs.readdirSync(BLOG_DIR).filter(f=>f.endsWith('.mdx')||f.endsWith('.md')).forEach(f => {
          try {
            const raw = fs.readFileSync(path.join(BLOG_DIR,f),'utf-8');
            const m = raw.match(/^category:\s*["']?([^"'\n]+)["']?/m);
            if (m) { const c = m[1].trim(); countMap[c] = (countMap[c]||0)+1; }
          } catch(e){}
        });
      }
      const result = cats.map(c => ({ ...c, count: countMap[c.name]||0 }));
      jsonRes(res, result); return;
    }
    if (pathname === '/api/categories/save' && req.method === 'POST') {
      const b = await collectBody(req);
      const cats = fs.existsSync(CATEGORIES_FILE) ? JSON.parse(fs.readFileSync(CATEGORIES_FILE,'utf-8')) : [];
      const slug = b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
      const existing = cats.findIndex(c => c.slug === b.originalSlug || c.name === b.name);
      if (existing >= 0) {
        cats[existing] = { name: b.name, slug, description: b.description||'' };
      } else {
        cats.push({ name: b.name, slug, description: b.description||'' });
      }
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(cats,null,2),'utf-8');
      jsonRes(res, { ok: true }); return;
    }
    if (pathname === '/api/categories/delete' && req.method === 'POST') {
      const b = await collectBody(req);
      let cats = fs.existsSync(CATEGORIES_FILE) ? JSON.parse(fs.readFileSync(CATEGORIES_FILE,'utf-8')) : [];
      cats = cats.filter(c => c.slug !== b.slug && c.name !== b.name);
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(cats,null,2),'utf-8');
      jsonRes(res, { ok: true }); return;
    }

    if (pathname === '/api/media/list') {
      if (!fs.existsSync(MEDIA_DIR)) { jsonRes(res, []); return; }
      const files = fs.readdirSync(MEDIA_DIR).filter(f => !fs.statSync(path.join(MEDIA_DIR, f)).isDirectory());
      const media = files.map(f => {
        const st = fs.statSync(path.join(MEDIA_DIR, f));
        return { name: f, url: '/images/uploads/' + f, size: st.size, date: st.mtimeMs };
      }).sort((a,b) => b.date - a.date);
      jsonRes(res, media); return;
    }

    if (pathname === '/api/media/delete' && req.method === 'POST') {
      const b = await collectBody(req);
      const targetPath = path.join(MEDIA_DIR, b.filename);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      jsonRes(res, { ok: true }); return;
    }

    // ══ TRASH BIN ══
    if (pathname === '/api/trash/list') {
      const trash = [];
      ['tutorials', 'blogs', 'pages'].forEach(type => {
        const dir = path.join(TRASH_DIR, type);
        if (fs.existsSync(dir)) {
          fs.readdirSync(dir).forEach(f => {
            trash.push({ type, file: f, deletedAt: fs.statSync(path.join(dir, f)).mtime });
          });
        }
      });
      trash.sort((a,b) => b.deletedAt - a.deletedAt);
      jsonRes(res, trash); return;
    }
    if (pathname === '/api/trash/restore' && req.method === 'POST') {
      const b = await collectBody(req);
      const typeMap = { 'tutorials': TUTORIALS_DIR, 'blogs': BLOG_DIR, 'pages': PAGES_DIR };
      const destDir = typeMap[b.type];
      const srcPath = path.join(TRASH_DIR, b.type, b.file);
      if (destDir && fs.existsSync(srcPath)) {
        fs.renameSync(srcPath, path.join(destDir, b.file));
        generateSitemap();
      }
      jsonRes(res, { ok: true }); return;
    }
    if (pathname === '/api/trash/delete' && req.method === 'POST') {
      const b = await collectBody(req);
      const srcPath = path.join(TRASH_DIR, b.type, b.file);
      if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
      jsonRes(res, { ok: true }); return;
    }

    // ══ ADS MANAGEMENT ══
    const DEFAULT_ADS = {
      globalEnabled: true,
      adsenseId: '',
      positions: {
        header: { enabled: false, code: '', label: 'Header (below nav)' },
        sidebar: { enabled: false, code: '', label: 'Sidebar' },
        betweenParagraphs: { enabled: false, code: '', afterParagraph: 3, label: 'Between Paragraphs' },
        footer: { enabled: false, code: '', label: 'Footer (above footer)' },
        beforeContent: { enabled: false, code: '', label: 'Before Content' },
        afterContent: { enabled: false, code: '', label: 'After Content' }
      },
      excludedPages: [],
      excludedPosts: []
    };
    if (pathname === '/api/ads/get') {
      jsonRes(res, readJSON(ADS_FILE, DEFAULT_ADS)); return;
    }
    if (pathname === '/api/ads/save' && req.method === 'POST') {
      const b = await collectBody(req);
      writeJSON(ADS_FILE, b);
      jsonRes(res, { ok: true }); return;
    }

    res.writeHead(404); res.end('Not found');
  } catch (err) {
    console.error('Error:', err.message);
    jsonRes(res, { ok: false, error: err.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  CodesCompiler Admin Panel           ║');
  console.log('║  http://localhost:' + PORT + '               ║');
  console.log('╚══════════════════════════════════════╝\n');
  console.log('  Content:', APP_DIR);
  console.log('  Press Ctrl+C to stop\n');
});
