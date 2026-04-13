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
const LAYOUTS_DIR   = path.join(__dirname, 'src/layouts');

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

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildMdx({ title, description, category, order, content }) {
  return `---\ntitle: "${title}"\ndescription: "${description}"\ncategory: "${category}"\norder: ${order}\ndate: ${new Date().toISOString()}\n---\n\n${content}`;
}

// ─── HTML UI ─────────────────────────────────────────────────────────────────
function renderHTML(tutorials) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>CodesCompiler Admin</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#f4f6f9;color:#1a1a2e;min-height:100vh}
    /* Sidebar */
    .layout{display:flex;min-height:100vh}
    .sidebar{width:240px;background:#282A35;color:#fff;display:flex;flex-direction:column;position:fixed;top:0;bottom:0;left:0;overflow-y:auto}
    .sidebar-logo{padding:20px 20px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
    .sidebar-logo h1{font-size:18px;font-weight:900;color:#04AA6D}
    .sidebar-logo p{font-size:11px;color:#9ca3af;margin-top:2px}
    .sidebar-nav{padding:12px 0;flex:1}
    .sidebar-nav a{display:flex;align-items:center;gap:10px;padding:10px 20px;color:#d1d5db;font-size:13px;font-weight:600;text-decoration:none;transition:all .15s;border-left:3px solid transparent}
    .sidebar-nav a:hover,.sidebar-nav a.active{background:rgba(255,255,255,.07);color:#fff;border-left-color:#04AA6D}
    .sidebar-nav .icon{font-size:16px;width:20px;text-align:center}
    .sidebar-section{padding:8px 20px 4px;font-size:10px;font-weight:700;text-transform:uppercase;color:#6b7280;letter-spacing:.08em;margin-top:8px}
    /* Main */
    .main{margin-left:240px;flex:1;display:flex;flex-direction:column;min-height:100vh}
    .topbar{background:#fff;border-bottom:1px solid #e5e7eb;padding:14px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
    .topbar h2{font-size:18px;font-weight:700}
    .topbar .badge{background:#04AA6D;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px}
    .page{padding:28px 32px;flex:1}
    /* Cards */
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:28px}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;transition:shadow .2s,transform .2s;cursor:pointer}
    .card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08);transform:translateY(-2px)}
    .card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
    .card-title{font-size:15px;font-weight:700;color:#111}
    .card-cat{font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px}
    .cat-html{background:#fff4ee;color:#c2410c}
    .cat-css{background:#eff6ff;color:#1d4ed8}
    .cat-javascript{background:#fefce8;color:#a16207}
    .card-desc{font-size:12px;color:#6b7280;line-height:1.5;margin-bottom:14px}
    .card-footer{display:flex;gap:8px}
    .btn{padding:7px 14px;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
    .btn-green{background:#04AA6D;color:#fff} .btn-green:hover{background:#038a58}
    .btn-blue{background:#3b82f6;color:#fff} .btn-blue:hover{background:#2563eb}
    .btn-red{background:#ef4444;color:#fff} .btn-red:hover{background:#dc2626}
    .btn-gray{background:#f3f4f6;color:#374151;border:1px solid #e5e7eb} .btn-gray:hover{background:#e5e7eb}
    .btn-lg{padding:11px 22px;font-size:14px;border-radius:9px}
    /* Forms */
    .form-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px;max-width:760px}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .form-group{margin-bottom:18px}
    label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px}
    input,select,textarea{width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;font-family:'Inter',sans-serif;outline:none;transition:border .15s;background:#fafafa}
    input:focus,select:focus,textarea:focus{border-color:#04AA6D;background:#fff}
    textarea{resize:vertical;min-height:260px;font-family:'Fira Code',monospace;font-size:12.5px;line-height:1.7}
    .hint{font-size:11px;color:#9ca3af;margin-top:4px}
    /* Alert */
    .alert{padding:12px 18px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:20px;display:none}
    .alert-green{background:#d1fae5;color:#065f46;border:1px solid #a7f3d0}
    .alert-red{background:#fee2e2;color:#991b1b;border:1px solid #fecaca}
    /* Stats */
    .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:28px}
    .stat{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center}
    .stat-val{font-size:32px;font-weight:900;color:#04AA6D}
    .stat-label{font-size:12px;color:#6b7280;margin-top:4px}
    /* Tabs */
    .tabs{display:flex;gap:2px;margin-bottom:24px;border-bottom:2px solid #e5e7eb}
    .tab-btn{padding:10px 20px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;color:#6b7280;border-bottom:2px solid transparent;margin-bottom:-2px}
    .tab-btn.active{color:#04AA6D;border-bottom-color:#04AA6D}
    .tab-content{display:none} .tab-content.active{display:block}
    /* Responsive */
    @media(max-width:700px){.sidebar{display:none}.main{margin-left:0}.form-row{grid-template-columns:1fr}}
  </style>
</head>
<body>
<div class="layout">

  <!-- Sidebar -->
  <nav class="sidebar">
    <div class="sidebar-logo">
      <h1>CodesCompiler</h1>
      <p>Admin Dashboard</p>
    </div>
    <div class="sidebar-nav">
      <div class="sidebar-section">Content</div>
      <a href="#" onclick="showTab('dashboard')" class="active" id="nav-dashboard"><span class="icon">🏠</span> Dashboard</a>
      <a href="#" onclick="showTab('tutorials')" id="nav-tutorials"><span class="icon">📚</span> All Tutorials</a>
      <a href="#" onclick="showTab('create')" id="nav-create"><span class="icon">➕</span> New Tutorial</a>
      <div class="sidebar-section">Site</div>
      <a href="#" onclick="showTab('header')" id="nav-header"><span class="icon">🔧</span> Edit Header Nav</a>
      <div class="sidebar-section">Preview</div>
      <a href="http://localhost:4321" target="_blank"><span class="icon">🌐</span> View Live Site</a>
    </div>
  </nav>

  <!-- Main -->
  <div class="main">
    <div class="topbar">
      <h2 id="page-title">Dashboard</h2>
      <span class="badge">🟢 Local Server</span>
    </div>
    <div class="page">

      <div id="alert" class="alert"></div>

      <!-- ── DASHBOARD TAB ── -->
      <div id="tab-dashboard" class="tab-content active">
        <div class="stats">
          <div class="stat"><div class="stat-val">${tutorials.length}</div><div class="stat-label">Total Tutorials</div></div>
          <div class="stat"><div class="stat-val">${tutorials.filter(t=>t.category==='html').length}</div><div class="stat-label">HTML Chapters</div></div>
          <div class="stat"><div class="stat-val">${tutorials.filter(t=>t.category==='css').length}</div><div class="stat-label">CSS Chapters</div></div>
          <div class="stat"><div class="stat-val">${tutorials.filter(t=>t.category==='javascript').length}</div><div class="stat-label">JS Chapters</div></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h3 style="font-size:16px;font-weight:700">Recent Tutorials</h3>
          <button class="btn btn-green btn-lg" onclick="showTab('create')">➕ New Tutorial</button>
        </div>
        <div class="grid">
          ${tutorials.slice(0,6).map(t => `
          <div class="card" onclick="editTutorial('${t.file}')">
            <div class="card-header">
              <span class="card-title">${t.title || t.file}</span>
              <span class="card-cat cat-${t.category||'html'}">${(t.category||'html').toUpperCase()} Ch.${t.order||'?'}</span>
            </div>
            <p class="card-desc">${t.description||'No description'}</p>
            <div class="card-footer">
              <button class="btn btn-blue" onclick="event.stopPropagation();editTutorial('${t.file}')">✏️ Edit</button>
              <button class="btn btn-red" onclick="event.stopPropagation();deleteTutorial('${t.file}')">🗑 Delete</button>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- ── ALL TUTORIALS TAB ── -->
      <div id="tab-tutorials" class="tab-content">
        <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
          <button class="btn btn-green btn-lg" onclick="showTab('create')">➕ New Tutorial</button>
        </div>
        <div class="grid">
          ${tutorials.map(t => `
          <div class="card">
            <div class="card-header">
              <span class="card-title">${t.title||t.file}</span>
              <span class="card-cat cat-${t.category||'html'}">${(t.category||'html').toUpperCase()} Ch.${t.order||'?'}</span>
            </div>
            <p class="card-desc">${t.description||'No description'}</p>
            <div class="card-footer">
              <button class="btn btn-blue" onclick="editTutorial('${t.file}')">✏️ Edit</button>
              <button class="btn btn-red" onclick="deleteTutorial('${t.file}')">🗑 Delete</button>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- ── CREATE TUTORIAL TAB ── -->
      <div id="tab-create" class="tab-content">
        <div class="form-card">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:20px">✏️ Create / Edit Tutorial</h3>
          <input type="hidden" id="edit-file"/>
          <div class="form-row">
            <div class="form-group">
              <label>Title *</label>
              <input id="f-title" type="text" placeholder="e.g. HTML Headings"/>
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select id="f-category">
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Description *</label>
            <input id="f-description" type="text" placeholder="One sentence describing this chapter"/>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Chapter Order *</label>
              <input id="f-order" type="number" value="1" min="1"/>
              <p class="hint">1 = first chapter in sidebar</p>
            </div>
            <div class="form-group">
              <label>File Name</label>
              <input id="f-filename" type="text" placeholder="auto-generated from title"/>
              <p class="hint">Leave blank to auto-generate</p>
            </div>
          </div>
          <div class="form-group">
            <label>Tutorial Content (Markdown)</label>
            <textarea id="f-content" placeholder="## Introduction&#10;&#10;Write your tutorial here...&#10;&#10;To add a live code editor:&#10;&#10;&lt;Editor&#10;  initialHtml={\`&lt;h1&gt;Hello&lt;/h1&gt;\`}&#10;  initialCss={\`h1{color:green}\`}&#10;/&gt;"></textarea>
          </div>
          <div style="display:flex;gap:12px">
            <button class="btn btn-green btn-lg" onclick="saveTutorial()">💾 Save Tutorial</button>
            <button class="btn btn-gray btn-lg" onclick="clearForm()">✕ Clear</button>
          </div>
        </div>
      </div>

      <!-- ── HEADER EDITOR TAB ── -->
      <div id="tab-header" class="tab-content">
        <div class="form-card">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:8px">🔧 Header Navigation Links</h3>
          <p style="font-size:13px;color:#6b7280;margin-bottom:24px">These are the links shown in the dark language strip below the header. Edit the labels and URLs, then click Save.</p>
          <div id="nav-links-editor"></div>
          <div style="margin-top:20px;display:flex;gap:12px">
            <button class="btn btn-green btn-lg" onclick="saveHeaderNav()">💾 Save Header</button>
            <button class="btn btn-gray btn-lg" onclick="loadHeaderNav()">↺ Reset</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<script>
  // ── Tab switching
  function showTab(name) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-'+name).classList.add('active');
    document.getElementById('nav-'+name)?.classList.add('active');
    const titles = {dashboard:'Dashboard',tutorials:'All Tutorials',create:'New Tutorial',header:'Edit Header Navigation'};
    document.getElementById('page-title').textContent = titles[name]||'Admin';
  }

  // ── Alerts
  function showAlert(msg, type='green') {
    const el = document.getElementById('alert');
    el.className = 'alert alert-'+type;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
  }

  // ── Clear form
  function clearForm() {
    ['f-title','f-description','f-filename','f-content'].forEach(id => document.getElementById(id).value='');
    document.getElementById('f-order').value = 1;
    document.getElementById('edit-file').value = '';
    document.getElementById('f-category').value = 'html';
  }

  // ── Save tutorial
  async function saveTutorial() {
    const title    = document.getElementById('f-title').value.trim();
    const desc     = document.getElementById('f-description').value.trim();
    const category = document.getElementById('f-category').value;
    const order    = document.getElementById('f-order').value;
    const content  = document.getElementById('f-content').value;
    let   filename = document.getElementById('f-filename').value.trim();
    const editFile = document.getElementById('edit-file').value;

    if (!title||!desc||!content) { showAlert('Please fill in Title, Description and Content.','red'); return; }

    if (!filename) filename = (editFile || (title.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.mdx'));
    if (!filename.endsWith('.mdx')) filename += '.mdx';

    const mdx = '---\\ntitle: "'+title+'"\\ndescription: "'+desc+'"\\ncategory: "'+category+'"\\norder: '+order+'\\ndate: '+new Date().toISOString()+'\\n---\\n\\n'+content;

    const res = await fetch('/api/save', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({filename, content: mdx}) });
    const json = await res.json();
    if (json.ok) {
      showAlert('✅ Tutorial saved! Refresh your site to see it.');
      clearForm();
      showTab('tutorials');
      setTimeout(()=>location.reload(),1500);
    } else {
      showAlert('Error: '+json.error,'red');
    }
  }

  // ── Edit tutorial (load into form)
  async function editTutorial(file) {
    showTab('create');
    document.getElementById('page-title').textContent = 'Edit Tutorial';
    const res = await fetch('/api/get?file='+encodeURIComponent(file));
    const json = await res.json();
    if (!json.content) return;
    const raw = json.content;
    const fm = {};
    const match = raw.match(/^---\\n([\\s\\S]*?)\\n---/);
    if (match) match[1].split('\\n').forEach(l=>{const[k,...v]=l.split(':');if(k)fm[k.trim()]=v.join(':').trim().replace(/^"|"$/g,'')});
    const body = raw.replace(/^---\\n[\\s\\S]*?\\n---\\n*/,'');
    document.getElementById('f-title').value       = fm.title||'';
    document.getElementById('f-description').value = fm.description||'';
    document.getElementById('f-category').value    = fm.category||'html';
    document.getElementById('f-order').value       = fm.order||1;
    document.getElementById('f-filename').value    = file;
    document.getElementById('f-content').value     = body;
    document.getElementById('edit-file').value     = file;
  }

  // ── Delete tutorial
  async function deleteTutorial(file) {
    if (!confirm('Delete "'+file+'"? This cannot be undone.')) return;
    const res  = await fetch('/api/delete', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename:file})});
    const json = await res.json();
    if (json.ok) { showAlert('🗑 Deleted '+file); setTimeout(()=>location.reload(),1200); }
    else showAlert('Error: '+json.error,'red');
  }

  // ── Header nav editor
  const defaultNavItems = [
    {label:'HTML', href:'/tutorial/html-introduction'},
    {label:'CSS', href:'/tutorial/css-introduction'},
    {label:'JavaScript', href:'/tutorial/js-introduction'},
    {label:'About', href:'/about'},
    {label:'Contact', href:'/contact'},
  ];

  function loadHeaderNav() {
    const items = JSON.parse(localStorage.getItem('navItems')||JSON.stringify(defaultNavItems));
    renderNavEditor(items);
  }

  function renderNavEditor(items) {
    const container = document.getElementById('nav-links-editor');
    container.innerHTML = items.map((item,i)=>\`
      <div style="display:flex;gap:10px;margin-bottom:10px;align-items:center">
        <input style="flex:1" type="text" placeholder="Label" value="\${item.label}" id="nav-label-\${i}" />
        <input style="flex:2" type="text" placeholder="URL" value="\${item.href}" id="nav-href-\${i}" />
        <button class="btn btn-red" onclick="removeNavItem(\${i})">✕</button>
      </div>
    \`).join('')+\`
      <button class="btn btn-gray" onclick="addNavItem()">+ Add Link</button>
    \`;
  }

  function getNavItems() {
    const items = [];
    let i = 0;
    while (document.getElementById('nav-label-'+i)) {
      items.push({ label: document.getElementById('nav-label-'+i).value, href: document.getElementById('nav-href-'+i).value });
      i++;
    }
    return items;
  }

  function addNavItem() { const items = getNavItems(); items.push({label:'New Link',href:'/'}); renderNavEditor(items); }
  function removeNavItem(idx) { const items = getNavItems(); items.splice(idx,1); renderNavEditor(items); }

  async function saveHeaderNav() {
    const items = getNavItems();
    localStorage.setItem('navItems', JSON.stringify(items));
    const res  = await fetch('/api/save-nav', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items})});
    const json = await res.json();
    if (json.ok) showAlert('✅ Header navigation saved! Restart npm run dev to see changes.');
    else showAlert('Error: '+json.error,'red');
  }

  // Init
  document.addEventListener('DOMContentLoaded', loadHeaderNav);
</script>
</body>
</html>`;
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsed  = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // ── GET /api/list
  if (pathname === '/api/list') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(listTutorials()));
    return;
  }

  // ── GET /api/get?file=xxx
  if (pathname === '/api/get') {
    const file = parsed.query.file;
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
      } catch(e) {
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
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
      } catch(e) {
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // ── POST /api/save-nav (writes nav items to a JSON file)
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
      } catch(e) {
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // ── GET / — serve admin UI
  if (pathname === '/') {
    const tutorials = listTutorials();
    res.setHeader('Content-Type', 'text/html');
    res.end(renderHTML(tutorials));
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
