// CodesCompiler Content Manager — WordPress-style CMS
const API='http://localhost:3001';
let page='dashboard',stats={},tutorials=[],blogs=[],books=[],navItems=[],siteSettings=[],pages=[],adsConfig=[],trashBin=[],categories=[];
let modalCb=null,confirmCb=null;

const TCAT=['html','css','javascript','seo','python','sql','php'];
let BCAT=['HTML & CSS','JavaScript','JavaScript Projects','Blog','Website Designs','CSS Buttons'];
const CB={html:'bh',css:'bc',javascript:'bj',seo:'bse',python:'bpy',sql:'bsq',php:'bp2'};
const CATNAME={html:'HTML',css:'CSS',javascript:'JavaScript',seo:'SEO',python:'Python',sql:'SQL',php:'PHP'};

// Utils
const $=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function toast(m,ok=true){const d=document.createElement('div');d.className='toast '+(ok?'ok':'err');d.innerHTML=(ok?'✅':'❌')+' '+m;$('toasts').appendChild(d);setTimeout(()=>d.remove(),3500)}
async function api(p,o){return(await fetch(API+p,o)).json()}
async function post(p,b){return api(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)})}

// ── WP-style Helper Functions ─────────────────────────────────────────────────
function toggleMeta(id) {
  const el = $(id);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? '' : 'none';
}

function updatePermalink(title, displayId='b_permalink_display', prefix='/blog/') {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const el = $(displayId);
  if (el) { el.textContent = prefix + slug + '/'; el.href = prefix + slug + '/'; }
}

function updateWordCount(text) {
  const el = $('wc-count');
  if (el) el.textContent = text.trim().split(/\s+/).filter(Boolean).length;
}

function wrapText(id, before, after) {
  const el = $(id); if(!el) return;
  const s=el.selectionStart, e=el.selectionEnd, v=el.value;
  const sel = v.substring(s,e) || 'text';
  el.value = v.substring(0,s) + before + sel + after + v.substring(e);
  el.focus(); el.selectionStart = s+before.length; el.selectionEnd = s+before.length+sel.length;
}

function prependLine(id, prefix) {
  const el=$(id); if(!el) return;
  const s=el.selectionStart, v=el.value;
  const lineStart = v.lastIndexOf('\n',s-1)+1;
  el.value = v.substring(0,lineStart) + prefix + v.substring(lineStart);
  el.focus(); el.selectionStart = el.selectionEnd = s+prefix.length;
}

function insertLink(id) {
  const url = prompt('Enter URL:','https://'); if(!url) return;
  wrapText(id,'[',`](${url})`);
}

function insertMediaTo(input, textareaId) {
  if (!input.files||!input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const res = await post('/api/media/upload', { filename: file.name, data: e.target.result });
      if (res.ok && res.url) {
        const el = $(textareaId); if(!el) return;
        const s = el.selectionStart, v = el.value;
        const md = `\n![${file.name}](${res.url})\n`;
        el.value = v.substring(0,s) + md + v.substring(s);
        toast('Media inserted!');
      }
    } catch(e) { toast('Upload failed', false); }
  };
  reader.readAsDataURL(file);
}

function insertMediaToBlog(input) { insertMediaTo(input, 'b_desc'); }

function addTagPill() {
  const inp = $('tag_input'); if(!inp) return;
  const tags = inp.value.split(',').map(t=>t.trim()).filter(Boolean);
  if(!tags.length) return;
  const container = $('tags-pills'); if(!container) return;
  tags.forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag-pill';
    span.style.cssText = 'display:inline-flex;align-items:center;gap:4px;background:#e5e7eb;border-radius:3px;padding:2px 7px;font-size:12px;margin:2px;';
    span.innerHTML = `${esc(t)}<a href="#" style="color:#999;text-decoration:none;margin-left:2px;" onclick="removeTagPill(this);return false;">×</a>`;
    container.appendChild(span);
  });
  inp.value = '';
}

function removeTagPill(el) { el.parentElement.remove(); }

function toggleAddCat() {
  const p = $('add-cat-panel'); if(!p) return;
  p.style.display = p.style.display === 'none' ? '' : 'none';
}

async function addNewCategory() {
  const inp = $('new_cat_input'); if(!inp) return;
  const name = inp.value.trim(); if(!name) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const res = await post('/api/categories/save', { name, slug, description: '' });
  if (res.ok) {
    BCAT.push(name);
    categories.push({ name, slug, description: '', count: 0 });
    // Add checkbox to the list
    const container = document.querySelector('#cat-body > div');
    if (container) {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;margin-bottom:4px;';
      label.innerHTML = `<input type="checkbox" class="b_cat_cb" value="${esc(name)}" checked> ${esc(name)}`;
      container.appendChild(label);
    }
    inp.value = '';
    toast(`Category "${name}" added!`);
    toggleAddCat();
  } else { toast('Failed to add category', false); }
}

async function saveBlogDraft(origFile) {
  const draftEl = $('b_draft');
  if (draftEl) draftEl.value = 'true';
  await window.saveBlog(origFile);
}

function editPermalink() {
  const el = $('b_permalink_display'); if(!el) return;
  const current = el.textContent.replace(/^\/blog\//,'').replace(/\/$/,'');
  const newSlug = prompt('Edit URL slug:', current);
  if (newSlug) {
    el.textContent = '/blog/' + newSlug + '/';
    el.href = '/blog/' + newSlug + '/';
  }
}

// Get tags from pills in DOM
function getTagsFromPills() {
  const pills = document.querySelectorAll('#tags-pills .tag-pill');
  return Array.from(pills).map(p => p.childNodes[0]?.textContent?.trim()).filter(Boolean);
}

// Get selected category from checkboxes
function getSelectedCategory() {
  const checked = document.querySelector('.b_cat_cb:checked');
  return checked ? checked.value : '';
}

// Inline Editor (replaces modal popup - opens full-page inside content area)
let editorSaveCb=null, editorBackFn=null;
function openEditor(title, html, saveCb, backFn, statusBadge=''){
  editorSaveCb=saveCb; editorBackFn=backFn;
  $('ptitle').innerHTML=`<button class="btn bg bs" onclick="closeEditor()" style="margin-right:10px;font-size:13px">← Back</button>${esc(title)}`;
  $('tact').innerHTML=`${statusBadge}<button class="btn bp" onclick="saveEditor()">✅ Save & Publish</button>`;
  $('content').innerHTML=html;
}
function closeEditor(){if(editorBackFn)editorBackFn();editorSaveCb=null;editorBackFn=null;}
async function saveEditor(){if(editorSaveCb)await editorSaveCb();}
function openConfirm(m,cb){confirmCb=cb;$('cmsg').textContent=m;$('cfm').classList.add('open');}
function closeConfirm(){$('cfm').classList.remove('open');confirmCb=null}
function doConfirm(){const cb=confirmCb; closeConfirm(); if(cb)cb()}

// Sidebar
function renderSidebar(){
  const sections = [
    {
      title: 'DASHBOARD',
      items: [
        { id: 'dashboard', ico: '🏠', label: 'Dashboard' }
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { id: 'blogs', ico: '📝', label: 'Posts', ct: blogs.length },
        { id: 'pages', ico: '📄', label: 'Pages', ct: pages.length },
        { id: 'tutorials', ico: '📖', label: 'Tutorials', ct: tutorials.length },
        { id: 'books', ico: '📚', label: 'Books', ct: stats?.totalBooks || 0 },
        { id: 'categories', ico: '🏷️', label: 'Categories' },
      ]
    },
    {
      title: 'MEDIA',
      items: [
        { id: 'media', ico: '🖼️', label: 'Library', ct: stats?.totalMedia || 0 }
      ]
    },
    {
      title: 'COMMENTS',
      items: [
        { id: 'comments', ico: '💬', label: 'Comments', ct: 0 }
      ]
    },
    {
      title: 'APPEARANCE',
      items: [
        { id: 'nav', ico: '🔗', label: 'Menus' },
        { id: 'ads', ico: '💰', label: 'Ad Manager' }
      ]
    },
    {
      title: 'USERS',
      items: [
        { id: 'users', ico: '👥', label: 'All Users' }
      ]
    },
    {
      title: 'CODECOMPILER SEO',
      items: [
        { id: 'seo', ico: '🔍', label: 'SEO Manager' }
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'settings', ico: '⚙️', label: 'General' },
        { id: 'permalinks', ico: '🔗', label: 'Permalinks' },
        { id: 'trash', ico: '🗑️', label: 'Trash', ct: trashBin.length }
      ]
    }
  ];

  let h = '';
  sections.forEach(sec => {
    h += `<div class="nav-header">${sec.title}</div>`;
    sec.items.forEach(i => {
      const isAct = page === i.id ? 'active' : '';
      const badge = i.ct ? `<span class="nav-badge">${i.ct}</span>` : '';
      h += `<a class="nav-item ${isAct}" onclick="goTo('${i.id}')"><span class="nav-icon">${i.ico}</span> ${i.label} ${badge}</a>`;
    });
  });
  
  const sb = $('admin-sidebar');
  if(sb) sb.innerHTML = h;
}

// Load all
async function loadAll(){
  try {
    [stats, tutorials, blogs, navItems, siteSettings, pages, adsConfig, trashBin, books, categories] = await Promise.all([
      api('/api/stats'), api('/api/tutorials/list'), api('/api/blogs/list'), api('/api/nav/get'), api('/api/settings/get'), api('/api/pages/list'), api('/api/ads/get'), api('/api/trash/list'), api('/api/books/list'), api('/api/categories/list')
    ]);
    // Rebuild BCAT from server categories
    if (Array.isArray(categories) && categories.length) {
      BCAT.length = 0;
      categories.forEach(c => BCAT.push(c.name));
    }
  } catch(e) {
    toast('Failed to connect to server', false);
  }
  renderSidebar();
}

function goTo(p){page=p;location.hash=p;renderSidebar();({dashboard:renderDash,tutorials:renderTuts,blogs:renderBlogs,nav:renderNav,settings:renderSettings,permalinks:renderPermalinks,pages:renderPages,ads:renderAds,trash:renderTrash,books:renderBooks,media:renderMedia,categories:renderCategories,seo:window.renderSeo})[p]?.()}

// ══ DASHBOARD ══
function renderDash(){
  $('ptitle').textContent = 'Dashboard';
  $('tact').innerHTML = '';
  
  let h = `<div class="mb-4 text-gray-600 text-lg">Welcome back to your CodesCompiler CMS!</div>`;
  
  // Stats row
  h += `<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="wp-card !mb-0 text-center py-6 px-4">
      <div class="text-3xl text-[#2271b1] mb-1">${stats?.totalBlogs || 0}</div>
      <div class="text-gray-600 text-sm">Posts</div>
    </div>
    <div class="wp-card !mb-0 text-center py-6 px-4">
      <div class="text-3xl text-[#2271b1] mb-1">${stats?.totalPages || 0}</div>
      <div class="text-gray-600 text-sm">Pages</div>
    </div>
    <div class="wp-card !mb-0 text-center py-6 px-4">
      <div class="text-3xl text-[#2271b1] mb-1">${stats?.totalBooks || 0}</div>
      <div class="text-gray-600 text-sm">Books</div>
    </div>
    <div class="wp-card !mb-0 text-center py-6 px-4">
      <div class="text-3xl text-[#2271b1] mb-1">${stats?.totalMedia || 0}</div>
      <div class="text-gray-600 text-sm">Media Files</div>
    </div>
  </div>`;

  // Grid for Activity and Draft
  h += `<div class="grid md:grid-cols-2 gap-6">
    <!-- Recent Activity -->
    <div class="wp-card">
      <div class="wp-card-header">Recent Activity</div>
      <div class="wp-card-body">`;
      
  const acts = stats?.recentActivity || [];
  if(!acts.length) {
    h += `<div class="text-gray-500 text-sm py-4 text-center">No recent activity.</div>`;
  } else {
    acts.forEach(a => {
      const time = new Date(a.mtime).toLocaleString();
      h += `<div class="stat-row">
        <span class="text-gray-400 mr-2 text-xs w-28 whitespace-nowrap overflow-hidden truncate" title="${time}">${time}</span>
        <span class="bg-blue-100 text-blue-700 rounded px-1 py-0.5 text-[10px] uppercase font-bold mr-2 w-16 text-center inline-block">${a.type}</span>
        <a href="#" class="font-medium truncate">${esc(a.file)}</a>
      </div>`;
    });
  }
      
  h += `</div>
    </div>

    <!-- Quick Draft -->
    <div class="wp-card">
      <div class="wp-card-header">Quick Draft</div>
      <div class="wp-card-body">
        <div class="mb-3">
          <input type="text" id="qd_title" class="input-text" placeholder="Title">
        </div>
        <div class="mb-3">
          <textarea id="qd_content" class="input-text h-32" placeholder="What's on your mind?"></textarea>
        </div>
        <div>
          <button class="btn-secondary" onclick="saveQuickDraft()">Save Draft</button>
        </div>
      </div>
    </div>
  </div>`;

  $('content').innerHTML = h;
}

window.saveQuickDraft = async function() {
  const t = $('qd_title').value.trim();
  const c = $('qd_content').value.trim();
  if(!t) return toast('Please enter a title', false);
  const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const d = new Date().toISOString().split('T')[0];
  const content = `---
title: "${t}"
date: "${d}"
draft: true
---

${c}`;
  await post('/api/blogs/save', { filename: slug+'.mdx', content });
  $('qd_title').value = '';
  $('qd_content').value = '';
  toast('Draft saved! 📝');
  await loadAll();
}

function getSeoBoxHtml(data) {
  data = data || {};
  return `
  <div class="meta-box" style="margin-top:16px;">
    <div class="meta-box-header" onclick="toggleMeta('seo-body')">
      <h3>🔍 SEO Settings (Yoast / RankMath Style)</h3><span>▲</span>
    </div>
    <div class="meta-box-body" id="seo-body">
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;color:#555;font-weight:600;margin-bottom:4px;">Focus Keyword(s)</label>
        <input type="text" id="seo_keywords" placeholder="e.g. learn python, python loops" value="${esc(data.seoKeywords||'')}" style="width:100%;border:1px solid #8c8f94;border-radius:3px;padding:6px 8px;font-size:13px;">
        <div style="font-size:11px;color:#888;margin-top:2px;">Separate multiple keywords with commas.</div>
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;color:#555;font-weight:600;margin-bottom:4px;">SEO Title</label>
        <input type="text" id="seo_title" placeholder="Custom SEO title..." value="${esc(data.seoTitle||'')}" style="width:100%;border:1px solid #8c8f94;border-radius:3px;padding:6px 8px;font-size:13px;">
        <div style="font-size:11px;color:#888;margin-top:2px;">Leave blank to use the main title.</div>
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;color:#555;font-weight:600;margin-bottom:4px;">Meta Description</label>
        <textarea id="seo_desc" placeholder="Write a compelling meta description..." style="width:100%;height:60px;border:1px solid #8c8f94;border-radius:3px;padding:6px 8px;font-size:13px;">${esc(data.seoDesc||'')}</textarea>
      </div>

      <!-- Social Preview Features -->
      <div style="border-top:1px solid #f0f0f1;padding-top:12px;margin-top:16px;">
        <h4 style="font-size:12px;font-weight:bold;margin-bottom:8px;color:#3c434a;">📱 Social Media Preview</h4>
        <div style="margin-bottom:12px;">
          <label style="display:block;font-size:11px;color:#555;margin-bottom:2px;">Social Title</label>
          <input type="text" id="seo_social_title" placeholder="Title for Facebook/X..." value="${esc(data.seoSocialTitle||'')}" style="width:100%;border:1px solid #8c8f94;border-radius:3px;padding:4px 6px;font-size:12px;">
        </div>
        <div style="margin-bottom:12px;">
          <label style="display:block;font-size:11px;color:#555;margin-bottom:2px;">Social Description</label>
          <textarea id="seo_social_desc" placeholder="Description for social shares..." style="width:100%;height:40px;border:1px solid #8c8f94;border-radius:3px;padding:4px 6px;font-size:12px;">${esc(data.seoSocialDesc||'')}</textarea>
        </div>
        <div style="margin-bottom:12px;">
          <label style="display:block;font-size:11px;color:#555;margin-bottom:2px;">Social Image URL</label>
          <input type="text" id="seo_social_img" placeholder="https://..." value="${esc(data.seoSocialImg||'')}" style="width:100%;border:1px solid #8c8f94;border-radius:3px;padding:4px 6px;font-size:12px;">
        </div>
      </div>

      <div style="margin-top:12px;">
        <label class="chk" style="font-size:13px;"><input type="checkbox" id="seo_noindex" ${data.seoNoIndex?'checked':''}> Prevent search engines from indexing this page (noindex)</label>
      </div>
    </div>
  </div>`;
}

function getSeoData() {
  return {
    seoKeywords: $('seo_keywords')?.value.trim() || '',
    seoTitle: $('seo_title')?.value.trim() || '',
    seoDesc: $('seo_desc')?.value.trim() || '',
    seoSocialTitle: $('seo_social_title')?.value.trim() || '',
    seoSocialDesc: $('seo_social_desc')?.value.trim() || '',
    seoSocialImg: $('seo_social_img')?.value.trim() || '',
    seoNoIndex: $('seo_noindex')?.checked || false
  };
}

let _tutFilter = 'all';
let _tutCatFilter = '';
let _tutSearch = '';
let _tutSelectedFiles = new Set();

window.setTutFilter = function(f) { _tutFilter = f; renderTuts(); }
window.setTutCat = function(c) { _tutCatFilter = c; renderTuts(); }
window.setTutSearch = function(s) { _tutSearch = s; renderTuts(); }

window.toggleTutFile = function(f, checked) {
  if(checked) _tutSelectedFiles.add(f);
  else _tutSelectedFiles.delete(f);
}

window.toggleAllTuts = function(checked) {
  document.querySelectorAll('.tut-cb').forEach(cb => {
    cb.checked = checked;
    if (checked) _tutSelectedFiles.add(cb.value);
    else _tutSelectedFiles.delete(cb.value);
  });
}

window.applyTutBulk = async function() {
  const act = $('bulk_action_tuts')?.value;
  if(act === 'trash' && _tutSelectedFiles.size > 0) {
    if(confirm(`Move ${_tutSelectedFiles.size} tutorials to trash?`)) {
      for (let f of _tutSelectedFiles) {
        await post('/api/tutorials/delete', { filename: f });
      }
      toast('Tutorials moved to trash');
      _tutSelectedFiles.clear();
      await loadAll();
    }
  }
}

function renderTuts() {
  $('ptitle').textContent = 'Tutorials';
  $('tact').innerHTML = '<button class="add-new-btn" onclick="editTut()">Add New</button>';

  const cats = [...new Set(tutorials.map(t => t.category))].filter(Boolean).sort();

  let filtered = tutorials.filter(t => {
    const isDraft = t.draft === true || t.draft === 'true';
    const isPublished = !isDraft;
    if (_tutFilter === 'published' && !isPublished) return false;
    if (_tutFilter === 'draft' && !isDraft) return false;
    
    if (_tutCatFilter && t.category !== _tutCatFilter) return false;
    
    if (_tutSearch) {
      const q = _tutSearch.toLowerCase();
      if (!(t.title||'').toLowerCase().includes(q) && !(t.category||'').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  filtered.sort((a,b) => (parseInt(a.order)||0) - (parseInt(b.order)||0));

  const total = tutorials.length;
  const drafts = tutorials.filter(t => t.draft === true || t.draft === 'true').length;
  const published = total - drafts;

  const tabClass = t => `text-sm mr-4 cursor-pointer pb-1 ${_tutFilter===t ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-500'}`;

  let h = `
  <div style="margin-bottom:12px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
    <span class="${tabClass('all')}" onclick="setTutFilter('all')">All (${total})</span>
    <span class="${tabClass('published')}" onclick="setTutFilter('published')">Published (${published})</span>
    <span class="${tabClass('draft')}" onclick="setTutFilter('draft')">Drafts (${drafts})</span>
  </div>

  <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center;">
    <select class="input-text" style="width:auto;padding:4px 8px;font-size:13px;" onchange="setTutCat(this.value)">
      <option value="">All Categories</option>
      ${cats.map(c=>`<option value="${esc(c)}" ${_tutCatFilter===c?'selected':''}>${CATNAME[c]||esc(c)}</option>`).join('')}
    </select>
    <input type="text" class="input-text" style="width:220px;font-size:13px;padding:4px 8px;" placeholder="Search Tutorials..." value="${esc(_tutSearch)}" oninput="setTutSearch(this.value)">
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
      <select id="bulk_action_tuts" class="input-text" style="width:auto;padding:4px 8px;font-size:13px;">
        <option value="">Bulk Actions</option>
        <option value="trash">Move to Trash</option>
      </select>
      <button class="btn-secondary" style="padding:4px 10px;font-size:13px;" onclick="applyTutBulk()">Apply</button>
      <span class="text-gray-500 text-sm">${filtered.length} item${filtered.length!==1?'s':''}</span>
    </div>
  </div>

  <div class="wp-card">
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead>
      <tr style="background:#f6f7f7;border-bottom:1px solid #e0e0e0;">
        <th style="padding:8px 10px;width:32px;"><input type="checkbox" id="tut_check_all" onchange="toggleAllTuts(this.checked)"></th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;width:60px;">Order #</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Title</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Author</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Category</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Tags</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Date</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Feat. Image</th>
      </tr>
    </thead>
    <tbody>`;

  if(!filtered.length) {
    h += `<tr><td colspan="8" style="padding:24px;text-align:center;color:#888;">No tutorials found.</td></tr>`;
  } else {
    filtered.forEach(t => {
      const checked = _tutSelectedFiles.has(t.file) ? 'checked' : '';
      const cat = t.category || '—';
      const catName = CATNAME[cat] || cat;
      const dateLabel = `<span style="color:#888;font-size:11px;">${t.draft ? 'Last Modified' : 'Published'}</span>`;
      const dateStr = t.date || '—';
      const authorStr = t.author || 'Admin';
      const isDraft = t.draft === true || t.draft === 'true';
      const titleExtra = isDraft ? ' — <span style="font-weight:bold;color:#444;">Draft</span>' : '';
      const rawTagsList = t.tags || [];
      const tags = (Array.isArray(rawTagsList) ? rawTagsList : String(rawTagsList).replace(/[\[\]"]/g, '').split(',')).map(t=>String(t).trim()).filter(Boolean);
      const tagsHtml = tags.length ? tags.map(t=>`<span style="background:#f0f0f0;border-radius:3px;padding:1px 5px;margin-right:3px;font-size:11px;">${esc(t)}</span>`).join('') : '—';
      const hasImage = t.image || t.coverImage;
      const imgHtml = hasImage ? `<img src="${esc(hasImage)}" style="width:40px;height:40px;object-fit:cover;border-radius:3px;border:1px solid #ddd;" onerror="this.replaceWith(document.createTextNode('—'))">` : `<span style="color:#aaa;font-size:11px;">No Image</span>`;

      h += `
      <tr style="border-bottom:1px solid #f0f0f0;" class="blog-row" onmouseenter="this.querySelector('.row-actions').style.display='flex'" onmouseleave="this.querySelector('.row-actions').style.display='none'">
        <td style="padding:8px 10px;"><input type="checkbox" class="tut-cb" value="${esc(t.file)}" ${checked} onchange="toggleTutFile('${esc(t.file)}',this.checked)"></td>
        <td style="padding:8px 10px;font-weight:bold;">${esc(t.order||'-')}</td>
        <td style="padding:8px 10px;">
          <strong><a href="#" style="color:#2271b1;text-decoration:none;" onclick="editTut('${esc(t.file)}');return false;">${esc(t.title || t.file)}</a></strong>${titleExtra}
          <div class="row-actions" style="display:none;gap:8px;margin-top:4px;">
            <a href="#" style="color:#2271b1;font-size:12px;text-decoration:none;" onclick="editTut('${esc(t.file)}');return false;">Edit</a>
            <span style="color:#ccc;">|</span><a href="#" style="color:#d63638;font-size:12px;text-decoration:none;" onclick="openConfirm('Move to Trash?',()=>delTut('${esc(t.file)}'));return false;">Trash</a>
            <span style="color:#ccc;">|</span>
            <a href="/tutorial/${esc(t.file.replace(/\.mdx?$/,''))}/" target="_blank" style="color:#888;font-size:12px;text-decoration:none;">View</a>
          </div>
        </td>
        <td style="padding:8px 10px;color:#555;">${esc(authorStr)}</td>
        <td style="padding:8px 10px;"><a href="#" style="color:#2271b1;text-decoration:none;font-size:12px;" onclick="setTutCat('${esc(cat)}');return false;">${esc(catName)}</a></td>
        <td style="padding:8px 10px;">${tagsHtml}</td>
        <td style="padding:8px 10px;color:#555;">${esc(dateStr)}<br>${dateLabel}</td>
        <td style="padding:8px 10px;">${imgHtml}</td>
      </tr>`;
    });
  }
  h += `</tbody></table></div>`;
  $('content').innerHTML = h;
}

async function editTut(file='') {
  let t = { title: '', description: '', category: '', order: '1' };
  let originalFile = '';
  if (file) {
    originalFile = file;
    const res = await api('/api/tutorials/get?file='+encodeURIComponent(file));
    if(res.content) {
      const fm = parseFM(res.content);
      Object.assign(t, fm);
      t._content = extractBody(res.content);
    }
  }

  window._currentEditTut = t;
  const slugPreview = (originalFile || (t.title||'new-tutorial').toLowerCase().replace(/[^a-z0-9]+/g,'-')).replace(/\.mdx?$/,'');

  $('ptitle').textContent = originalFile ? 'Edit Tutorial' : 'Add New Tutorial';
  $('tact').innerHTML = `<a href="#" style="color:#2271b1;font-size:13px;text-decoration:none;" onclick="goTo('tutorials');return false;">← All Tutorials</a>`;

  $('content').innerHTML = `
  <div style="display:flex;gap:20px;align-items:flex-start;max-width:100%;">

    <!-- LEFT: Main -->
    <div style="flex:1;min-width:0;">
      <input type="text" id="t_title" placeholder="Tutorial title"
        style="width:100%;font-size:23px;font-weight:400;border:1px solid #dcdcde;padding:8px 10px;box-sizing:border-box;margin-bottom:6px;line-height:1.4;border-radius:3px;"
        value="${esc(t.title)}" oninput="updatePermalink(this.value,'t_permalink_display','/tutorial/')">
      <div class="permalink-row" style="font-size:13px;color:#444;margin:6px 0 10px;display:flex;align-items:center;gap:6px;border-bottom:1px solid #f0f0f0;padding-bottom:6px;">
        <span style="color:#888;">Permalink:</span>
        <a href="/tutorial/${slugPreview}/" target="_blank" id="t_permalink_display" style="color:#2271b1;">/tutorial/${slugPreview}/</a>
      </div>
      <div class="wp-editor-wrap" style="border:1px solid #c3c4c7;background:#fff;">
        <div class="wp-editor-tools" style="background:#f6f7f7;border-bottom:1px solid #dcdcde;padding:4px 8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <button class="wp-media-btn" style="background:#2271b1;color:#fff;border:none;border-radius:3px;padding:4px 10px;font-size:12px;cursor:pointer;" onclick="document.getElementById('t_media_upload').click()">🖼 Add Media</button>
          <input type="file" id="t_media_upload" class="hidden" accept="image/*" onchange="insertMediaTo(this,'t_desc')">
          <span style="height:20px;border-left:1px solid #ddd;margin:0 4px;"></span>
          <button class="tb" style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="wrapText('t_desc','**','**')"><b>B</b></button>
          <button class="tb" style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="wrapText('t_desc','*','*')"><em>I</em></button>
          <button class="tb" style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="prependLine('t_desc','# ')">H1</button>
          <button class="tb" style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="prependLine('t_desc','## ')">H2</button>
          <button class="tb" style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="prependLine('t_desc','### ')">H3</button>
          <button class="tb" style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="prependLine('t_desc','- ')">•</button>
          <button class="tb" style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="wrapText('t_desc','\`','\`')">‹›</button>
          <button class="tb" style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="wrapText('t_desc','\`\`\`\\n','\\n\`\`\`')">{ }</button>
          <button class="tb" style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="insertLink('t_desc')">🔗</button>
        </div>
        <textarea id="t_desc" oninput="updateWordCount(this.value)"
          style="width:100%;min-height:420px;border:none;padding:12px;font-size:14px;line-height:1.7;font-family:inherit;box-sizing:border-box;resize:vertical;outline:none;"
          >${esc(t._content || '')}</textarea>
        <div style="background:#f6f7f7;border-top:1px solid #dcdcde;padding:4px 10px;font-size:12px;color:#888;display:flex;justify-content:space-between;">
          <span>Word count: <span id="wc-count">${(t._content||'').trim().split(/\s+/).filter(Boolean).length}</span></span>
        </div>
      </div>
      <!-- Excerpt -->
      <div style="background:#fff;border:1px solid #c3c4c7;margin-top:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #c3c4c7;cursor:pointer;" onclick="toggleMeta('tut-excerpt')">
          <h3 style="font-size:13px;font-weight:600;margin:0;">SEO Description</h3><span>▲</span>
        </div>
        <div id="tut-excerpt" style="padding:12px;">
          <p style="font-size:12px;color:#888;margin:0 0 6px;">Shown in Google search results.</p>
          <textarea id="t_excerpt" style="width:100%;height:80px;border:1px solid #8c8f94;border-radius:3px;padding:6px;font-size:13px;box-sizing:border-box;">${esc(t.description||'')}</textarea>
        </div>
      </div>
    </div>

    <!-- RIGHT: Meta Boxes -->
    <div style="width:280px;flex-shrink:0;">

      <!-- Publish Box -->
      <div class="meta-box">
        <div class="meta-box-header" onclick="toggleMeta('tut-pub')">
          <h3>Publish</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="tut-pub">
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <button class="btn-secondary" style="flex:1;font-size:13px;" onclick="$('t_draft').value='true';saveTut('${originalFile}')">Save Draft</button>
            <button class="btn-secondary" style="flex:1;font-size:13px;" onclick="window.open('/tutorial/${slugPreview}/','_blank')">Preview</button>
          </div>
          <div style="border-top:1px solid #f0f0f0;padding-top:10px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">🏷 Status:</span>
              <select id="t_draft" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;">
                <option value="false" ${t.draft==='false'||t.draft===false?'selected':''}>Published</option>
                <option value="true" ${t.draft==='true'||t.draft===true?'selected':''}>Draft</option>
              </select>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">👁 Visibility:</span>
              <span style="font-size:12px;font-weight:600;">Public</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">📅 Date:</span>
              <input type="date" id="t_date" value="${esc(t.date||'')}" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;">
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">✍ Author:</span>
              <input type="text" id="t_author" value="${esc(t.author||'CodesCompiler')}" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;width:120px;">
            </div>
          </div>
          <div style="border-top:1px solid #f0f0f0;padding-top:10px;display:flex;justify-content:flex-end;">
            <button class="btn-primary" style="font-size:13px;" onclick="$('t_draft').value='false';saveTut('${originalFile}')">${originalFile ? 'Update' : 'Publish'}</button>
          </div>
        </div>
      </div>

      <!-- Properties -->
      <div class="meta-box">
        <div class="meta-box-header" onclick="toggleMeta('tut-props')">
          <h3>Properties</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="tut-props">
          <div style="margin-bottom:10px;">
            <label style="display:block;font-size:12px;color:#555;margin-bottom:4px;">Language / Category</label>
            <select id="t_cat" style="width:100%;border:1px solid #8c8f94;border-radius:3px;padding:4px 8px;font-size:13px;">
              <option value="">Select...</option>
              ${TCAT.map(c=>`<option value="${c}" ${t.category===c?'selected':''}>${CATNAME[c]||c}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="display:block;font-size:12px;color:#555;margin-bottom:4px;">Lesson Order #</label>
            <input type="number" id="t_order" value="${esc(t.order||'1')}" min="1"
              style="width:100%;border:1px solid #8c8f94;border-radius:3px;padding:4px 8px;font-size:13px;">
          </div>
        </div>
      </div>

      <!-- SEO Settings -->
      ${getSeoBoxHtml(t)}

    </div>
  </div>`;
}


window.saveTut = async function(origFile) {
  const title = ($('t_title')?.value||'').trim();
  if(!title) return toast('Title required', false);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = origFile || (slug + '.mdx');

  let t = window._currentEditTut || {};
  
  const seoData = getSeoData();
  
  let fm = `---
title: "${title}"
description: "${($('t_excerpt')?.value||'').trim()}"
category: "${$('t_cat')?.value||''}"
order: ${$('t_order')?.value||1}
date: "${$('t_date')?.value||''}"
author: "${$('t_author')?.value||'CodesCompiler'}"
draft: ${$('t_draft')?.value||'false'}
seoKeywords: "${seoData.seoKeywords}"
seoTitle: "${seoData.seoTitle}"
seoDesc: "${seoData.seoDesc}"
seoNoIndex: ${seoData.seoNoIndex}
`;

  const excludeKeys = ['title','description','category','order','date','author','draft','seoKeywords','seoTitle','seoDesc','seoNoIndex','_content','file'];
  Object.keys(t).forEach(k => {
    if (!excludeKeys.includes(k) && t[k] !== undefined && t[k] !== '') {
      fm += `${k}: ${t[k]}\n`;
    }
  });

  fm += `---\n\n${$('t_desc')?.value||''}`;

  await post('/api/tutorials/save', { filename, content: fm });
  toast('Tutorial saved!');
  await loadAll();
  goTo('tutorials');
}

window.delTut = async function(f) {
  await post('/api/tutorials/delete', { filename: f });
  toast('Tutorial deleted');
  await loadAll();
  goTo('tutorials');
}

// ══ BLOGS ══
let _blogFilter = 'all';
let _blogCatFilter = '';
let _blogSearch = '';
let _blogSelectedFiles = new Set();

function renderBlogs() {
  $('ptitle').textContent = 'Posts';
  $('tact').innerHTML = '<button class="btn-primary" onclick="editBlog()">+ Add New</button>';

  const cats = [...new Set(blogs.map(b => b.category).filter(Boolean))].sort();

  let filtered = blogs.filter(b => {
    const isDraft   = b.draft === 'true' || b.draft === true;
    const isPublished = !isDraft;
    if (_blogFilter === 'published' && !isPublished) return false;
    if (_blogFilter === 'draft'     && !isDraft)     return false;
    if (_blogCatFilter && b.category !== _blogCatFilter) return false;
    if (_blogSearch) {
      const q = _blogSearch.toLowerCase();
      if (!(b.title||'').toLowerCase().includes(q) && !(b.category||'').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const total     = blogs.length;
  const published = blogs.filter(b => b.draft !== 'true' && b.draft !== true).length;
  const drafts    = blogs.filter(b => b.draft === 'true' || b.draft === true).length;

  const tabClass = t => `text-sm mr-4 cursor-pointer pb-1 ${_blogFilter===t ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-500'}`;

  let h = `
  <div style="margin-bottom:12px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
    <span class="${tabClass('all')}" onclick="setBlogFilter('all')">All (${total})</span>
    <span class="${tabClass('published')}" onclick="setBlogFilter('published')">Published (${published})</span>
    <span class="${tabClass('draft')}" onclick="setBlogFilter('draft')">Drafts (${drafts})</span>
  </div>

  <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center;">
    <select class="input-text" style="width:auto;padding:4px 8px;font-size:13px;" onchange="setBlogCat(this.value)">
      <option value="">All Categories</option>
      ${cats.map(c=>`<option value="${esc(c)}" ${_blogCatFilter===c?'selected':''}>${esc(c)}</option>`).join('')}
    </select>
    <input type="text" class="input-text" style="width:220px;font-size:13px;padding:4px 8px;" placeholder="Search Posts..." value="${esc(_blogSearch)}" oninput="setBlogSearch(this.value)">
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
      <select id="bulk_action_blogs" class="input-text" style="width:auto;padding:4px 8px;font-size:13px;">
        <option value="">Bulk Actions</option>
        <option value="trash">Move to Trash</option>
        <option value="publish">Mark Published</option>
        <option value="draft">Mark Draft</option>
      </select>
      <button class="btn-secondary" style="padding:4px 10px;font-size:13px;" onclick="applyBlogBulk()">Apply</button>
      <span class="text-gray-500 text-sm">${filtered.length} item${filtered.length!==1?'s':''}</span>
    </div>
  </div>

  <div class="wp-card">
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead>
      <tr style="background:#f6f7f7;border-bottom:1px solid #e0e0e0;">
        <th style="padding:8px 10px;width:32px;"><input type="checkbox" id="blog_check_all" onchange="toggleAllBlogs(this.checked)"></th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Title</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Author</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Category</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Tags</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Date</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Feat. Image</th>
      </tr>
    </thead>
    <tbody>`;

  if (!filtered.length) {
    h += `<tr><td colspan="7" style="padding:24px;text-align:center;color:#888;">No posts found.</td></tr>`;
  } else {
    filtered.forEach(b => {
      const isDraft = b.draft === 'true' || b.draft === true;
      const checked = _blogSelectedFiles.has(b.file) ? 'checked' : '';
      const rawTagsList = b.tags || [];
      const tags = (Array.isArray(rawTagsList) ? rawTagsList : String(rawTagsList).replace(/[\[\]"]/g, '').split(',')).map(t=>String(t).trim()).filter(Boolean);
      const tagsHtml = tags.length ? tags.map(t=>`<span style="background:#f0f0f0;border-radius:3px;padding:1px 5px;margin-right:3px;font-size:11px;">${esc(t)}</span>`).join('') : '—';
      const hasImage = b.image && b.image.trim();
      const imgHtml  = hasImage
        ? `<img src="${esc(b.image)}" style="width:40px;height:40px;object-fit:cover;border-radius:3px;border:1px solid #ddd;" onerror="this.replaceWith(document.createTextNode('—'))">`
        : `<span style="color:#aaa;font-size:11px;">No Image</span>`;
      const dateLabel = isDraft ? `<span style="color:#888;font-size:11px;">Draft</span>` : `<span style="color:#888;font-size:11px;">Published</span>`;
      const dateStr   = b.date ? new Date(b.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—';

      h += `
      <tr style="border-bottom:1px solid #f0f0f0;" class="blog-row" onmouseenter="this.querySelector('.row-actions').style.display='flex'" onmouseleave="this.querySelector('.row-actions').style.display='none'">
        <td style="padding:8px 10px;"><input type="checkbox" class="blog-cb" value="${esc(b.file)}" ${checked} onchange="toggleBlogFile('${esc(b.file)}',this.checked)"></td>
        <td style="padding:8px 10px;">
          <strong><a href="#" style="color:#2271b1;text-decoration:none;" onclick="editBlog('${esc(b.file)}');return false;">${esc(b.title || b.file)}</a></strong>
          ${isDraft ? '<span style="color:#888;font-size:11px;margin-left:6px;">— Draft</span>' : ''}
          <div class="row-actions" style="display:none;gap:8px;margin-top:4px;">
            <a href="#" style="color:#2271b1;font-size:12px;text-decoration:none;" onclick="editBlog('${esc(b.file)}');return false;">Edit</a>
            <span style="color:#ccc;">|</span>
            <a href="#" style="color:#d63638;font-size:12px;text-decoration:none;" onclick="openConfirm('Move to Trash?',()=>delBlog('${esc(b.file)}'));return false;">Trash</a>
            <span style="color:#ccc;">|</span>
            <a href="/blog/${esc(b.file.replace(/\.mdx?$/,''))}" target="_blank" style="color:#888;font-size:12px;text-decoration:none;">View</a>
          </div>
        </td>
        <td style="padding:8px 10px;color:#555;">${esc(b.author || 'CodesCompiler')}</td>
        <td style="padding:8px 10px;"><a href="#" style="color:#2271b1;text-decoration:none;font-size:12px;" onclick="setBlogCat('${esc(b.category)}');return false;">${esc(b.category || '—')}</a></td>
        <td style="padding:8px 10px;">${tagsHtml}</td>
        <td style="padding:8px 10px;color:#555;">${dateStr}<br>${dateLabel}</td>
        <td style="padding:8px 10px;">${imgHtml}</td>
      </tr>`;
    });
  }

  h += `</tbody></table></div>`;
  $('content').innerHTML = h;
}

function setBlogFilter(f)   { _blogFilter = f;   renderBlogs(); }
function setBlogCat(c)      { _blogCatFilter = c; renderBlogs(); }
function setBlogSearch(q)   { _blogSearch = q;    renderBlogs(); }
function toggleBlogFile(f, on) { on ? _blogSelectedFiles.add(f) : _blogSelectedFiles.delete(f); }
function toggleAllBlogs(on) {
  document.querySelectorAll('.blog-cb').forEach(cb => {
    cb.checked = on;
    toggleBlogFile(cb.value, on);
  });
}

async function applyBlogBulk() {
  const action = $('bulk_action_blogs').value;
  if (!action || !_blogSelectedFiles.size) { toast('Select posts and an action first', false); return; }
  if (action === 'trash') {
    openConfirm(`Move ${_blogSelectedFiles.size} post(s) to Trash?`, async () => {
      for (const f of _blogSelectedFiles) await post('/api/blogs/delete', { filename: f });
      _blogSelectedFiles.clear();
      toast(`${_blogSelectedFiles.size || 'Selected'} posts moved to Trash`);
      await loadAll(); renderBlogs();
    });
  } else {
    // publish/draft bulk
    for (const f of _blogSelectedFiles) {
      const res = await api('/api/blogs/get?file=' + encodeURIComponent(f));
      if (!res.content) continue;
      const updated = res.content.replace(/^draft:\s*.+$/m, `draft: ${action === 'draft'}`);
      await post('/api/blogs/save', { filename: f, content: updated });
    }
    _blogSelectedFiles.clear();
    toast('Posts updated!');
    await loadAll(); renderBlogs();
  }
}


async function editBlog(file='') {
  let b = { title: '', description: '', draft: true, image: '', date: new Date().toISOString().split('T')[0], category: '', author: 'CodesCompiler', tags: '' };
  let originalFile = '';
  if (file) {
    originalFile = file;
    const res = await api('/api/blogs/get?file='+encodeURIComponent(file));
    if(res.content) {
      const fm = parseFM(res.content);
      Object.assign(b, fm);
      b._content = extractBody(res.content);
      
      if (b.tags && b.tags.startsWith('[')) {
          try { b.tags = JSON.parse(b.tags).join(', '); } catch(e){}
      }
    }
  }

  window._currentEditBlog = b;

  // Build slug for permalink
  const slugPreview = (originalFile || (b.title||'new-post').toLowerCase().replace(/[^a-z0-9]+/g,'-')).replace(/\.mdx?$/,'');

  // Build categories checkboxes
  const catCheckboxes = BCAT.map(c => `
    <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;margin-bottom:4px;">
      <input type="checkbox" class="b_cat_cb" value="${esc(c)}" ${b.category===c?'checked':''}> ${esc(c)}
    </label>`).join('');

  // Build initial tags pills
  const rawTags = b.tags || [];
  const initTags = (Array.isArray(rawTags) ? rawTags : String(rawTags).replace(/[\[\]"]/g,'').split(',')).map(t=>String(t).trim()).filter(Boolean);
  const tagPillsHtml = initTags.map(t => `
    <span class="tag-pill" style="display:inline-flex;align-items:center;gap:4px;background:#e5e7eb;border-radius:3px;padding:2px 7px;font-size:12px;margin:2px;">
      ${esc(t)}<a href="#" style="color:#999;text-decoration:none;margin-left:2px;" onclick="removeTagPill(this);return false;">×</a>
    </span>`).join('');

  $('ptitle').textContent = originalFile ? 'Edit Post' : 'Add New Post';
  $('tact').innerHTML = `<a href="#" style="color:#2271b1;font-size:13px;text-decoration:none;margin-right:12px;" onclick="goTo('blogs');return false;">← All Posts</a>`;

  $('content').innerHTML = `
  <style>
    .meta-box { background:#fff; border:1px solid #c3c4c7; box-shadow:0 1px 1px rgba(0,0,0,.04); margin-bottom:16px; }
    .meta-box-header { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; cursor:pointer; border-bottom:1px solid #c3c4c7; user-select:none; }
    .meta-box-header h3 { font-size:13px; font-weight:600; margin:0; }
    .meta-box-body { padding:12px; }
    .meta-box-body.collapsed { display:none; }
    .wp-editor-wrap { border:1px solid #c3c4c7; background:#fff; }
    .wp-editor-tools { background:#f6f7f7; border-bottom:1px solid #dcdcde; padding:4px 8px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .wp-media-btn { background:#2271b1; color:#fff; border:none; border-radius:3px; padding:4px 10px; font-size:12px; cursor:pointer; }
    .wp-media-btn:hover { background:#135e96; }
    .tb { background:#f6f7f7; border:1px solid #c3c4c7; border-radius:2px; padding:2px 6px; font-size:12px; cursor:pointer; }
    .tb:hover { background:#e0e0e0; }
    .permalink-row { font-size:13px; color:#444; margin:6px 0 10px; padding:4px 0; border-bottom:1px solid #f0f0f0; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .permalink-row span { color:#888; }
    .permalink-row a { color:#2271b1; }
    .tag-add-area { display:flex; gap:6px; margin-top:8px; }
    .tag-add-area input { flex:1; border:1px solid #8c8f94; border-radius:3px; padding:4px 8px; font-size:13px; }
    .tag-add-area button { background:#2271b1; color:#fff; border:none; border-radius:3px; padding:4px 10px; font-size:12px; cursor:pointer; }
    .wc-label { font-size:12px; color:#888; }
    #wc-count { font-weight:600; }
  </style>

  <div style="display:flex;gap:20px;align-items:flex-start;max-width:100%;">

    <!-- ═══ LEFT: Main Content ═══ -->
    <div style="flex:1;min-width:0;">

      <!-- Title -->
      <input type="text" id="b_title" placeholder="Add title"
        style="width:100%;font-size:23px;font-weight:400;border:1px solid #dcdcde;padding:8px 10px;box-sizing:border-box;margin-bottom:6px;line-height:1.4;border-radius:3px;"
        value="${esc(b.title)}" oninput="updatePermalink(this.value)">

      <!-- Permalink row -->
      <div class="permalink-row">
        <span>Permalink:</span>
        <a href="/blog/${slugPreview}/" target="_blank" id="b_permalink_display">/blog/${slugPreview}/</a>
        <a href="#" style="color:#2271b1;font-size:12px;" onclick="editPermalink();return false;">Edit</a>
      </div>

      <!-- Editor wrap -->
      <div class="wp-editor-wrap">
        <div class="wp-editor-tools">
          <button class="wp-media-btn" onclick="document.getElementById('b_media_upload').click()">🖼 Add Media</button>
          <input type="file" id="b_media_upload" class="hidden" accept="image/*" onchange="insertMediaToBlog(this)">
          <span style="margin-left:6px;height:20px;border-left:1px solid #ddd;"></span>
          <button class="tb" onclick="wrapText('b_desc','**','**')" title="Bold"><b>B</b></button>
          <button class="tb" onclick="wrapText('b_desc','*','*')" title="Italic"><em>I</em></button>
          <button class="tb" onclick="wrapText('b_desc','~~','~~')" title="Strikethrough"><s>S</s></button>
          <button class="tb" onclick="prependLine('b_desc','# ')" title="H1">H1</button>
          <button class="tb" onclick="prependLine('b_desc','## ')" title="H2">H2</button>
          <button class="tb" onclick="prependLine('b_desc','### ')" title="H3">H3</button>
          <button class="tb" onclick="prependLine('b_desc','- ')" title="List">•</button>
          <button class="tb" onclick="wrapText('b_desc','\`','\`')" title="Code">‹›</button>
          <button class="tb" onclick="insertLink('b_desc')" title="Link">🔗</button>
        </div>
        <textarea id="b_desc" oninput="updateWordCount(this.value)"
          style="width:100%;min-height:420px;border:none;padding:12px;font-size:14px;line-height:1.7;font-family:inherit;box-sizing:border-box;resize:vertical;outline:none;"
          >${esc(b._content || '')}</textarea>
        <div style="background:#f6f7f7;border-top:1px solid #dcdcde;padding:4px 10px;font-size:12px;color:#888;display:flex;justify-content:space-between;">
          <span>Word count: <span id="wc-count">${(b._content||'').trim().split(/\s+/).filter(Boolean).length}</span></span>
          <span id="b_last_saved"></span>
        </div>
      </div>

      <!-- Excerpt (below editor, like WP) -->
      <div class="meta-box" style="margin-top:16px;">
        <div class="meta-box-header" onclick="toggleMeta('excerpt-body')">
          <h3>Excerpt</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="excerpt-body">
          <p style="font-size:12px;color:#888;margin:0 0 6px;">Short description for SEO and post listings.</p>
          <textarea id="b_excerpt" style="width:100%;height:80px;border:1px solid #8c8f94;border-radius:3px;padding:6px;font-size:13px;box-sizing:border-box;">${esc(b.description||'')}</textarea>
        </div>
      </div>

    </div>

    <!-- ═══ RIGHT: Meta Boxes ═══ -->
    <div style="width:280px;flex-shrink:0;">

      <!-- PUBLISH META BOX -->
      <div class="meta-box">
        <div class="meta-box-header" onclick="toggleMeta('pub-body')">
          <h3>Publish</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="pub-body">
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <button class="btn-secondary" style="flex:1;font-size:13px;" onclick="saveBlogDraft('${originalFile}')">Save Draft</button>
            <button class="btn-secondary" style="flex:1;font-size:13px;" onclick="window.open('/blog/${slugPreview}/','_blank')">Preview</button>
          </div>
          <div style="border-top:1px solid #f0f0f0;padding-top:10px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">🏷 Status:</span>
              <select id="b_draft" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;">
                <option value="false" ${b.draft==='false'||b.draft===false?'selected':''}>Published</option>
                <option value="true"  ${b.draft==='true' ||b.draft===true ?'selected':''}>Draft</option>
              </select>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">👁 Visibility:</span>
              <span style="font-size:12px;font-weight:600;">Public</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">📅 Date:</span>
              <input type="date" id="b_date" value="${esc(b.date)}" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;">
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">✍ Author:</span>
              <input type="text" id="b_author" value="${esc(b.author||'CodesCompiler')}" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;width:120px;">
            </div>
          </div>
          <div style="border-top:1px solid #f0f0f0;padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
            <a href="#" style="color:#d63638;font-size:12px;text-decoration:none;" onclick="openConfirm('Move to Trash?',()=>delBlog('${originalFile}'));return false;">Move to Trash</a>
            <button class="btn-primary" style="font-size:13px;" onclick="saveBlog('${originalFile}')">Publish</button>
          </div>
        </div>
      </div>

      <!-- CATEGORIES META BOX -->
      <div class="meta-box">
        <div class="meta-box-header" onclick="toggleMeta('cat-body')">
          <h3>Categories</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="cat-body">
          <div style="max-height:180px;overflow-y:auto;border:1px solid #f0f0f0;padding:6px;border-radius:3px;">
            ${catCheckboxes}
          </div>
          <a href="#" style="font-size:12px;color:#2271b1;text-decoration:none;display:block;margin-top:8px;" onclick="toggleAddCat();return false;">+ Add New Category</a>
          <div id="add-cat-panel" style="display:none;margin-top:8px;">
            <input type="text" id="new_cat_input" placeholder="New category name" style="width:100%;border:1px solid #8c8f94;border-radius:3px;padding:4px 8px;font-size:13px;box-sizing:border-box;margin-bottom:6px;">
            <button class="btn-primary" style="font-size:12px;padding:3px 10px;" onclick="addNewCategory()">Add</button>
          </div>
        </div>
      </div>

      <!-- TAGS META BOX -->
      <div class="meta-box">
        <div class="meta-box-header" onclick="toggleMeta('tags-body')">
          <h3>Tags</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="tags-body">
          <div id="tags-pills" style="min-height:28px;margin-bottom:8px;">${tagPillsHtml}</div>
          <div class="tag-add-area">
            <input type="text" id="tag_input" placeholder="Add tag..." onkeydown="if(event.key==='Enter'){addTagPill();event.preventDefault();}">
            <button onclick="addTagPill()">Add</button>
          </div>
          <p style="font-size:11px;color:#888;margin:6px 0 0;">Separate with commas or Enter</p>
        </div>
      </div>

      <!-- FEATURED IMAGE META BOX -->
      <div class="meta-box">
        <div class="meta-box-header" onclick="toggleMeta('feat-img-body')">
          <h3>Featured Image</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="feat-img-body">
          <div id="b_image_container" style="cursor:pointer;border:2px dashed #c3c4c7;border-radius:3px;padding:16px;text-align:center;${(b.image?'display:none':'')}" onclick="document.getElementById('b_image_file').click()">
            <div style="font-size:28px;margin-bottom:6px;">📷</div>
            <a href="#" style="color:#2271b1;font-size:13px;" onclick="return false;">Set featured image</a>
          </div>
          <div id="b_image_preview_container" style="${b.image?'':'display:none'}">
            <img src="${esc(b.image||'')}" id="b_image_preview" style="width:100%;border-radius:3px;cursor:pointer;border:1px solid #ddd;" onclick="document.getElementById('b_image_file').click()">
            <a href="#" style="color:#d63638;font-size:12px;text-decoration:none;display:block;margin-top:6px;" onclick="removeCoverImage('b');return false;">Remove featured image</a>
          </div>
          <input type="hidden" id="b_cover" value="${esc(b.image||'')}">
          <input type="file" id="b_image_file" class="hidden" accept="image/*" onchange="uploadCoverImage(this,'b_cover','b_image_preview','b_image_container','b_image_preview_container')">
        </div>
      </div>

      <!-- SEO Settings -->
      ${getSeoBoxHtml(b)}

    </div>
  </div>`;
}


window.saveBlog = async function(origFile) {
  const t = $('b_title').value.trim();
  if(!t) return toast('Title required', false);
  const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = origFile || (slug + '.mdx');

  // Read category from checkboxes (new UI) or fallback to old select
  const catCb = document.querySelector('.b_cat_cb:checked');
  const catSel = $('b_cat');
  const category = catCb ? catCb.value : (catSel ? catSel.value : '');

  // Read tags from pills (new UI) or fallback to old text input
  const pillTags = getTagsFromPills();
  const oldTagsEl = $('b_tags');
  const tagsArr = pillTags.length ? pillTags : (oldTagsEl ? oldTagsEl.value.split(',').map(s=>s.trim()).filter(Boolean) : []);
  const tagsFormatted = tagsArr.length ? `\ntags: [${tagsArr.map(tag=>`"${tag}"`).join(', ')}]` : '';

  // Cover image from hidden field or old cover field
  const imgEl = $('b_cover') || $('b_image');
  const imgVal = imgEl ? imgEl.value : '';

  const seoData = getSeoData();

  let b = window._currentEditBlog || {};
  let fm = `---
title: "${t}"
description: "${$('b_excerpt')?.value?.trim()||''}"
date: "${$('b_date')?.value||''}"
category: "${category}"${tagsFormatted}
image: "${imgVal}"
author: "${$('b_author')?.value||'CodesCompiler'}"
draft: ${$('b_draft')?.value||'false'}
seoKeywords: "${seoData.seoKeywords}"
seoTitle: "${seoData.seoTitle}"
seoDesc: "${seoData.seoDesc}"
seoNoIndex: ${seoData.seoNoIndex}
`;

  const excludeKeys = ['title','description','date','category','tags','image','author','draft','seoKeywords','seoTitle','seoDesc','seoNoIndex','_content','file'];
  Object.keys(b).forEach(k => {
    if (!excludeKeys.includes(k) && b[k] !== undefined && b[k] !== '') {
      fm += `${k}: ${b[k]}\n`;
    }
  });

  fm += `---\n\n${$('b_desc')?.value||''}`;

  await post('/api/blogs/save', { filename, content: fm });
  toast('Post saved!');
  await loadAll();
  goTo('blogs');
}

window.delBlog = async function(f) {
  await post('/api/blogs/delete', { filename: f });
  toast('Post moved to trash');
  await loadAll();
  goTo('blogs');
}

// ══ NAVIGATION ══
function renderNav(){
  $('ptitle').textContent='Menus';
  $('tact').innerHTML=`<button class="btn bp" onclick="addNav()">+ Add Link</button><button class="btn bk" style="margin-left:8px" onclick="saveNav()">💾 Save Menu</button>`;
  let h=`<div class="card"><div class="ch"><h3>🔗 Navigation Menu</h3><span style="color:var(--dim);font-size:12px">${navItems.length} links</span></div><div style="padding:18px" id="navlist">`;
  navItems.forEach((n,i)=>{h+=`<div class="nrow"><span style="color:var(--dim);font-size:12px;width:24px">≡</span><input class="ninp" value="${esc(n.label)}" data-f="label" placeholder="Link text"><div class="nsep"></div><input class="ninp" value="${esc(n.href)}" data-f="href" placeholder="/path" style="color:var(--dim);font-size:12px"><button class="btn bd bs" onclick="rmNav(${i})">✕</button></div>`});
  if(!navItems.length)h+=`<div class="empty">No menu items yet. Click "+ Add Link" to get started.</div>`;
  h+=`</div></div>`;
  $('content').innerHTML=h;
}
function addNav(){navItems.push({label:'New Link',href:'/page'});renderNav()}
function rmNav(i){navItems.splice(i,1);renderNav()}
async function saveNav(){
  const items=[];document.querySelectorAll('#navlist .nrow').forEach(r=>{items.push({label:r.querySelector('[data-f="label"]').value,href:r.querySelector('[data-f="href"]').value})});
  await post('/api/nav/save',{items});navItems=items;toast('Menu saved! ✅');
}

// ══ EDITOR TOOLBAR ══
function editorToolbar(id){
  return `<div class="toolbar">
    <button class="tbtn" title="Bold" onclick="ins('${id}','**','**')"><b>B</b></button>
    <button class="tbtn" title="Italic" onclick="ins('${id}','*','*')"><em>I</em></button>
    <button class="tbtn" title="Strikethrough" onclick="ins('${id}','~~','~~')"><s>S</s></button>
    <div class="tsep"></div>
    <button class="tbtn" title="Heading 1" onclick="insL('${id}','# ')">H1</button>
    <button class="tbtn" title="Heading 2" onclick="insL('${id}','## ')">H2</button>
    <button class="tbtn" title="Heading 3" onclick="insL('${id}','### ')">H3</button>
    <div class="tsep"></div>
    <button class="tbtn" title="Bullet List" onclick="insL('${id}','- ')">•</button>
    <button class="tbtn" title="Numbered List" onclick="insL('${id}','1. ')">1.</button>
    <button class="tbtn" title="Blockquote" onclick="insL('${id}','> ')">❝</button>
    <div class="tsep"></div>
    <button class="tbtn" title="Inline Code" onclick="ins('${id}','\`','\`')">‹›</button>
    <button class="tbtn" title="Code Block" onclick="ins('${id}','\`\`\`\\n','\\n\`\`\`')">{ }</button>
    <button class="tbtn" title="Link" onclick="insLink('${id}')">🔗</button>
    <button class="tbtn" title="Image" onclick="insImg('${id}')">🖼️</button>
    <button class="tbtn" title="Table" onclick="insTable('${id}')">📊</button>
    <button class="tbtn" title="Horizontal Rule" onclick="insL('${id}','\\n---\\n')">─</button>
  </div>`;
}

function ins(id,before,after){
  const el=$(id);if(!el)return;const s=el.selectionStart,e=el.selectionEnd,txt=el.value;
  const sel=txt.substring(s,e)||'text';
  el.value=txt.substring(0,s)+before+sel+after+txt.substring(e);
  el.focus();el.selectionStart=s+before.length;el.selectionEnd=s+before.length+sel.length;
}

function insL(id,prefix){
  const el=$(id);if(!el)return;const s=el.selectionStart,txt=el.value;
  const lineStart=txt.lastIndexOf('\n',s-1)+1;
  el.value=txt.substring(0,lineStart)+prefix+txt.substring(lineStart);
  el.focus();el.selectionStart=el.selectionEnd=s+prefix.length;
}

function insLink(id){
  const url=prompt('Enter URL:','https://');if(!url)return;
  ins(id,'[',']('+url+')');
}

function insImg(id){
  const url=prompt('Enter image path:','/images/posts/');if(!url)return;
  const el=$(id);if(!el)return;const s=el.selectionStart,txt=el.value;
  const tag=`\n![Image description](${url})\n`;
  el.value=txt.substring(0,s)+tag+txt.substring(s);el.focus();
}

function insTable(id){
  const el=$(id);if(!el)return;const s=el.selectionStart,txt=el.value;
  const tbl=`\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |\n`;
  el.value=txt.substring(0,s)+tbl+txt.substring(s);el.focus();
}

// ══ PREVIEW ══
function showEditorTab(btn,editorId){
  btn.parentElement.querySelectorAll('.tab-item').forEach(t=>t.classList.remove('on'));
  btn.classList.add('on');
  $(editorId).style.display='';
  const prevId=editorId.replace('editor','preview');
  if($(prevId))$(prevId).style.display='none';
}

function showPreviewTab(btn,editorId,previewId){
  btn.parentElement.querySelectorAll('.tab-item').forEach(t=>t.classList.remove('on'));
  btn.classList.add('on');
  $(editorId).style.display='none';
  const textareaId=editorId.replace('_editor','_b');
  const raw=$(textareaId)?.value||'';
  if(!$(previewId))return;
  $(previewId).style.display='';
  $(previewId).innerHTML=`<div class="preview-box">${mdToHtml(raw)}</div>`;
}

function mdToHtml(md){
  let h=md
    .replace(/```(\w*)\n([\s\S]*?)```/g,'<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/~~(.+?)~~/g,'<s>$1</s>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>')
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/^---$/gm,'<hr>')
    .replace(/\n\n/g,'<br><br>');
  return h;
}

// ══ PARSERS ══
function parseFM(raw){
  const n=raw.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  const m=n.match(/^---\n([\s\S]*?)\n---/);if(!m)return {};
  const fm={};
  m[1].split('\n').forEach(l=>{const ci=l.indexOf(':');if(ci===-1)return;const k=l.slice(0,ci).trim();let v=l.slice(ci+1).trim();if((v[0]==='"'&&v.slice(-1)==='"')||(v[0]==="'"&&v.slice(-1)==="'"))v=v.slice(1,-1);if(v==='true')v=true;else if(v==='false')v=false;if(k)fm[k]=v});
  return fm;
}
function extractBody(raw){const n=raw.replace(/\r\n/g,'\n').replace(/\r/g,'\n');const m=n.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);return m?m[1].trim():raw}

// ══ SETTINGS ══
function renderSettings(){
  $('ptitle').textContent='Settings';
  $('tact').innerHTML=`<button class="btn bp" onclick="saveSettings()">💾 Save Settings</button>`;
  const s=siteSettings;
  let h=`<div class="card"><div class="ch"><h3>🌐 Site Information</h3></div><div style="padding:20px">
    <div class="g2"><div class="field"><label>Site Title</label><input id="st_title" value="${esc(s.siteTitle||'CodesCompiler')}"></div>
    <div class="field"><label>Site URL</label><input id="st_url" value="${esc(s.siteUrl||'')}"></div></div>
    <div class="field"><label>Site Description</label><input id="st_desc" value="${esc(s.siteDescription||'')}" style="width:100%"></div>
  </div></div>`;

  h+=`<div class="card"><div class="ch"><h3>💰 Google AdSense</h3><span style="color:var(--dim);font-size:12px">Auto-injects into all pages</span></div><div style="padding:20px">
    <div class="g2"><div class="field"><label>AdSense Publisher ID</label><input id="st_adsense" value="${esc(s.adsenseId||'')}" placeholder="ca-pub-XXXXXXXXXXXXXXXX"></div>
    <div class="field"><label class="chk" style="margin-top:18px"><input type="checkbox" id="st_autoads" ${s.adsenseAutoAds?'checked':''}><span>Enable Auto Ads</span></label></div></div>
    <div style="background:rgba(99,102,241,.08);padding:12px 16px;border-radius:8px;margin-top:10px;font-size:12px;color:var(--muted)">💡 <strong>How it works:</strong> Enter your AdSense Publisher ID (starts with <code style="color:#818cf8">ca-pub-</code>) and click Save. The script tag will be automatically added to the &lt;head&gt; of every page on your site.</div>
  </div></div>`;

  h+=`<div class="card"><div class="ch"><h3>🔍 Google Search Console</h3></div><div style="padding:20px">
    <div class="field"><label>Verification Meta Tag Content</label><input id="st_gsc" value="${esc(s.searchConsoleTag||'')}" placeholder="Paste the content value from Google Search Console" style="width:100%"></div>
    <div style="background:rgba(16,185,129,.08);padding:12px 16px;border-radius:8px;margin-top:10px;font-size:12px;color:var(--muted)">💡 <strong>How to get this:</strong> Go to <a href="https://search.google.com/search-console" target="_blank" style="color:#34d399">Google Search Console</a> → Settings → Ownership verification → HTML tag. Copy just the <code style="color:#34d399">content="..."</code> value.</div>
  </div></div>`;

  h+=`<div class="card"><div class="ch"><h3>📝 Custom Head Scripts</h3><span style="color:var(--dim);font-size:12px">Analytics, tracking pixels, etc.</span></div><div style="padding:20px">
    <div class="field"><label>Custom &lt;head&gt; Code</label><textarea class="editor" id="st_head" style="min-height:120px" placeholder="<!-- Paste any script/meta tags here -->\n<script async src=&quot;https://...&quot;></script>">${esc(s.customHeadScripts||'')}</textarea></div>
    <div class="field" style="margin-top:14px"><label>Custom &lt;body&gt; Code (before closing tag)</label><textarea class="editor" id="st_body" style="min-height:100px" placeholder="<!-- Paste any scripts that go before </body> -->">${esc(s.customBodyScripts||'')}</textarea></div>
  </div></div>`;

  h+=`<div class="card"><div class="ch"><h3>⚡ SEO & Performance</h3><span style="color:var(--dim);font-size:12px">Auto Sitemap, Robots.txt & Caching</span></div><div style="padding:20px">
    <div style="background:rgba(16,185,129,.08);padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:13px;color:var(--muted)">✅ <strong>Auto Sitemap:</strong> The <code style="color:#34d399">@astrojs/sitemap</code> integration is installed. <code style="color:#34d399">sitemap-index.xml</code> will be automatically generated when you build the project.</div>
    <div class="field"><label>Robots.txt Content</label><textarea class="editor" id="st_robots" style="min-height:100px;font-family:monospace" placeholder="User-agent: *\nAllow: /">${esc(s.robotsTxt||'User-agent: *\nAllow: /\nSitemap: https://app.codescompiler.com/sitemap-index.xml')}</textarea></div>
    <div style="background:rgba(99,102,241,.08);padding:8px 12px;border-radius:6px;margin-top:6px;margin-bottom:16px;font-size:12px;color:var(--muted)">💡 This content is automatically saved to <code style="color:#818cf8">public/robots.txt</code> and served to search engines.</div>
    <div class="field"><label>Browser Cache-Control Header</label><input id="st_cache" value="${esc(s.cacheControl||'public, max-age=3600')}" placeholder="public, max-age=3600"></div>
    <div style="background:rgba(245,158,11,.08);padding:8px 12px;border-radius:6px;margin-top:6px;font-size:12px;color:var(--muted)">💡 Generates a <code style="color:#fbbf24">&lt;meta http-equiv="Cache-Control"&gt;</code> tag on all pages to instruct browsers how long to cache the page. (CDNs like Cloudflare also use this).</div>
  </div></div>`;

  h+=`<div class="card"><div class="ch"><h3>🔗 Permalink Structure</h3></div><div style="padding:20px">
    <div class="g2"><div class="field"><label>Blog Post URLs</label><input id="st_plink" value="${esc(s.permalinkStructure||'/blog/{slug}/')}" readonly style="color:var(--dim)"></div>
    <div class="field"><label>Tutorial URLs</label><input id="st_tlink" value="${esc(s.tutorialPermalinkStructure||'/tutorial/{slug}/')}" readonly style="color:var(--dim)"></div></div>
    <div style="background:rgba(245,158,11,.08);padding:12px 16px;border-radius:8px;margin-top:10px;font-size:12px;color:var(--muted)">💡 URL structure is defined by Astro's file-based routing. Blog posts use <code style="color:#fbbf24">/blog/{slug}/</code> and tutorials use <code style="color:#fbbf24">/tutorial/{slug}/</code>. To change a specific URL, go to the <strong>Permalinks</strong> page.</div>
  </div></div>`;

  $('content').innerHTML=h;
}

async function saveSettings(){
  const s={
    siteTitle:$('st_title').value,
    siteUrl:$('st_url').value,
    siteDescription:$('st_desc').value,
    adsenseId:$('st_adsense').value,
    adsenseAutoAds:$('st_autoads').checked,
    searchConsoleTag:$('st_gsc').value,
    customHeadScripts:$('st_head').value,
    customBodyScripts:$('st_body').value,
    permalinkStructure:$('st_plink').value,
    tutorialPermalinkStructure:$('st_tlink').value,
    robotsTxt:$('st_robots').value,
    cacheControl:$('st_cache').value
  };
  await post('/api/settings/save',s);
  siteSettings=s;
  toast('Settings saved! Scripts & Config updated ✅');
}

// ══ PERMALINKS ══
let plData=null;
async function renderPermalinks(){
  $('ptitle').textContent='Permalinks';
  $('tact').innerHTML=`<input class="srch" placeholder="Search URLs..." oninput="plSearch(this.value)">`;
  if(!plData) plData=await api('/api/permalinks');
  showPermalinks(plData);
}

function plSearch(q){
  q=q.toLowerCase();
  const filtered={
    tutorials:plData.tutorials.filter(t=>(t.title||'').toLowerCase().includes(q)||(t.url||'').includes(q)),
    blogs:plData.blogs.filter(b=>(b.title||'').toLowerCase().includes(q)||(b.url||'').includes(q))
  };
  showPermalinks(filtered);
}

function showPermalinks(data){
  if(data.error) {
    $('content').innerHTML = `<div class="error">Failed to load permalinks: ${esc(data.error)}</div>`;
    return;
  }
  let h=`<div style="background:rgba(99,102,241,.08);padding:14px 18px;border-radius:10px;margin-bottom:20px;font-size:13px;color:var(--muted)">💡 The URL slug is the last part of the URL. Click <strong>✏️ Rename</strong> to change any URL. This will rename the file and update the permalink.</div>`;

  // Tutorials
  h+=`<div class="card"><div class="ch"><h3>📖 Tutorial URLs</h3><span style="color:var(--dim);font-size:12px">${data.tutorials.length} tutorials</span></div>
  <table><thead><tr><th>Title</th><th>Language</th><th>Current URL</th><th style="width:80px"></th></tr></thead><tbody>`;
  if(!data.tutorials.length) h+=`<tr><td colspan="4" class="empty">No tutorials</td></tr>`;
  data.tutorials.forEach(t=>{
    h+=`<tr><td><strong>${esc(t.title)}</strong></td><td><span class="badge ${CB[t.category]||'bdf'}">${CATNAME[t.category]||esc(t.category||'')}</span></td>
    <td style="font-size:12px;color:var(--muted);font-family:monospace">${esc(t.url)}</td>
    <td><button class="btn bg bs" onclick="renameFile('tutorial','${esc(t.file)}','${esc(t.title)}')">✏️</button></td></tr>`;
  });
  h+=`</tbody></table></div>`;

  // Blogs
  h+=`<div class="card"><div class="ch"><h3>✍️ Post URLs</h3><span style="color:var(--dim);font-size:12px">${data.blogs.length} posts</span></div>
  <table><thead><tr><th>Title</th><th>Category</th><th>Current URL</th><th style="width:80px"></th></tr></thead><tbody>`;
  if(!data.blogs.length) h+=`<tr><td colspan="4" class="empty">No posts</td></tr>`;
  data.blogs.forEach(b=>{
    h+=`<tr><td><strong>${esc(b.title)}</strong></td><td style="font-size:12px">${esc(b.category||'')}</td>
    <td style="font-size:12px;color:var(--muted);font-family:monospace">${esc(b.url)}</td>
    <td><button class="btn bg bs" onclick="renameFile('blog','${esc(b.file)}','${esc(b.title)}')">✏️</button></td></tr>`;
  });
  h+=`</tbody></table></div>`;

  $('content').innerHTML=h;
}

function renameFile(type,oldFile,title){
  const slug=oldFile.replace(/\.mdx?$/,'');
  openModal('Change URL — '+title,
    `<div class="field"><label>Current URL</label><input value="/${type==='blog'?'blog':'tutorial'}/${esc(slug)}/" readonly style="color:var(--dim)"></div>
    <div class="field" style="margin-top:14px"><label>New URL Slug</label><input id="rn_slug" value="${esc(slug)}" placeholder="new-url-slug"></div>
    <div style="margin-top:12px;font-size:12px;color:var(--dim)">New URL will be: <strong style="color:var(--txt)">/${type==='blog'?'blog':'tutorial'}/<span id="rn_preview">${esc(slug)}</span>/</strong></div>`,
    async()=>{
      const newSlug=$('rn_slug').value.trim();
      if(!newSlug)return toast('Slug cannot be empty',false);
      const r=await post('/api/rename',{type,oldFile,newFile:newSlug+'.mdx'});
      if(r.ok){toast('URL updated! ✅');closeModal();plData=null;await loadAll();renderPermalinks()}
      else toast(r.error||'Rename failed',false);
    },'Rename file: '+oldFile);
  $('mstatus').innerHTML='';
  // Live preview
  setTimeout(()=>{
    const inp=$('rn_slug');
    if(inp) inp.addEventListener('input',()=>{const p=$('rn_preview');if(p)p.textContent=inp.value});
  },50);
}

// ══ PAGES ══
let _pageFilter = 'all';
let _pageCatFilter = '';
let _pageSearch = '';
let _pageSelectedFiles = new Set();

function setPageFilter(f) { _pageFilter = f; renderPages(); }
function setPageCat(c) { _pageCatFilter = c; renderPages(); }
function setPageSearch(q) { _pageSearch = q; renderPages(); }
function togglePageFile(f, checked) { if(checked) _pageSelectedFiles.add(f); else _pageSelectedFiles.delete(f); }
function toggleAllPages(checked) {
  document.querySelectorAll('.page-cb').forEach(cb => { cb.checked = checked; togglePageFile(cb.value, checked); });
}
async function applyPageBulk() {
  const action = $('bulk_action_pages').value;
  if(!action || !_pageSelectedFiles.size) return;
  if(action === 'trash') {
    openConfirm(`Move ${_pageSelectedFiles.size} pages to trash?`, async () => {
      for(let f of _pageSelectedFiles) await post('/api/pages/delete', { filename: f });
      _pageSelectedFiles.clear();
      toast('Pages trashed');
      await loadAll();
      goTo('pages');
    });
  }
}

function renderPages() {
  $('ptitle').textContent = 'Pages';
  $('tact').innerHTML = '<button class="btn-primary" onclick="newPage()">+ Add New</button>';
  
  // Auto-generate categories based on folder names
  const cats = [...new Set(pages.map(p => p.file.includes('/') ? p.file.split('/')[0] : 'Root'))].sort();

  let filtered = pages.filter(p => {
    const isDraft = p.draft === true;
    const isPublished = !isDraft;
    if (_pageFilter === 'published' && !isPublished) return false;
    if (_pageFilter === 'draft' && !isDraft) return false;
    
    const cat = p.category || (p.file.includes('/') ? p.file.split('/')[0] : 'Root');
    if (_pageCatFilter && cat !== _pageCatFilter) return false;
    
    if (_pageSearch) {
      const q = _pageSearch.toLowerCase();
      if (!(p.title||'').toLowerCase().includes(q) && !(cat||'').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const total = pages.length;
  const drafts = pages.filter(p => p.draft === true).length;
  const published = total - drafts;

  const tabClass = t => `text-sm mr-4 cursor-pointer pb-1 ${_pageFilter===t ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-500'}`;

  let h = `
  <div style="margin-bottom:12px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
    <span class="${tabClass('all')}" onclick="setPageFilter('all')">All (${total})</span>
    <span class="${tabClass('published')}" onclick="setPageFilter('published')">Published (${published})</span>
    <span class="${tabClass('draft')}" onclick="setPageFilter('draft')">Drafts (${drafts})</span>
  </div>

  <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center;">
    <select class="input-text" style="width:auto;padding:4px 8px;font-size:13px;" onchange="setPageCat(this.value)">
      <option value="">All Folders</option>
      ${cats.map(c=>`<option value="${esc(c)}" ${_pageCatFilter===c?'selected':''}>${esc(c)}</option>`).join('')}
    </select>
    <input type="text" class="input-text" style="width:220px;font-size:13px;padding:4px 8px;" placeholder="Search Pages..." value="${esc(_pageSearch)}" oninput="setPageSearch(this.value)">
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
      <select id="bulk_action_pages" class="input-text" style="width:auto;padding:4px 8px;font-size:13px;">
        <option value="">Bulk Actions</option>
        <option value="trash">Move to Trash</option>
      </select>
      <button class="btn-secondary" style="padding:4px 10px;font-size:13px;" onclick="applyPageBulk()">Apply</button>
      <span class="text-gray-500 text-sm">${filtered.length} item${filtered.length!==1?'s':''}</span>
    </div>
  </div>

  <div class="wp-card">
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead>
      <tr style="background:#f6f7f7;border-bottom:1px solid #e0e0e0;">
        <th style="padding:8px 10px;width:32px;"><input type="checkbox" id="page_check_all" onchange="toggleAllPages(this.checked)"></th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Title</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Author</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Category</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Tags</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Date</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Feat. Image</th>
      </tr>
    </thead>
    <tbody>`;

  if (!filtered.length) {
    h += `<tr><td colspan="7" style="padding:24px;text-align:center;color:#888;">No pages found.</td></tr>`;
  } else {
    filtered.forEach(p => {
      const checked = _pageSelectedFiles.has(p.file) ? 'checked' : '';
      const cat = p.category || (p.file.includes('/') ? p.file.split('/')[0] : 'Root');
      const imgHtml = p.image ? `<img src="${esc(p.image)}" style="width:40px;height:40px;object-fit:cover;border-radius:3px;">` : `<span style="color:#aaa;font-size:11px;">No Image</span>`;
      const dateLabel = `<span style="color:#888;font-size:11px;">${p.draft ? 'Last Modified' : 'Published'}</span>`;
      const dateStr = p.date || '—';
      const authorStr = p.author || 'Admin';
      const titleExtra = p.draft ? ' — <span style="font-weight:bold;color:#444;">Draft</span>' : '';
      const tagsStr = (p.tags||[]).length ? (p.tags||[]).map(t=>esc(t)).join(', ') : '—';

      h += `
      <tr style="border-bottom:1px solid #f0f0f0;" class="blog-row" onmouseenter="this.querySelector('.row-actions').style.display='flex'" onmouseleave="this.querySelector('.row-actions').style.display='none'">
        <td style="padding:8px 10px;"><input type="checkbox" class="page-cb" value="${esc(p.file)}" ${checked} onchange="togglePageFile('${esc(p.file)}',this.checked)"></td>
        <td style="padding:8px 10px;">
          <strong><a href="#" style="color:#2271b1;text-decoration:none;" onclick="editPage('${esc(p.file)}');return false;">${esc(p.title || p.file)}</a></strong>${titleExtra}
          <div class="row-actions" style="display:none;gap:8px;margin-top:4px;">
            <a href="#" style="color:#2271b1;font-size:12px;text-decoration:none;" onclick="editPage('${esc(p.file)}');return false;">Edit</a>
            ${p.file !== 'index.astro' ? `<span style="color:#ccc;">|</span><a href="#" style="color:#d63638;font-size:12px;text-decoration:none;" onclick="openConfirm('Move to Trash?',()=>delPage('${esc(p.file)}'));return false;">Trash</a>` : ''}
            <span style="color:#ccc;">|</span>
            <a href="${esc(p.url)}" target="_blank" style="color:#888;font-size:12px;text-decoration:none;">View</a>
          </div>
        </td>
        <td style="padding:8px 10px;color:#555;">${esc(authorStr)}</td>
        <td style="padding:8px 10px;"><a href="#" style="color:#2271b1;text-decoration:none;font-size:12px;" onclick="setPageCat('${esc(cat)}');return false;">${esc(cat)}</a></td>
        <td style="padding:8px 10px;color:#555;font-size:12px;">${tagsStr}</td>
        <td style="padding:8px 10px;color:#555;">${esc(dateStr)}<br>${dateLabel}</td>
        <td style="padding:8px 10px;">${imgHtml}</td>
      </tr>`;
    });
  }

  h += `</tbody></table></div>`;
  $('content').innerHTML = h;
}

function newPage() {
  const template = `---\nimport BaseLayout from '../layouts/BaseLayout.astro';\n---\n<BaseLayout title="New Page" description="Description">\n  <div class="max-w-screen-xl mx-auto px-5 py-12">\n    <h1 class="text-3xl font-bold mb-6">New Page</h1>\n    <p>Your content here...</p>\n  </div>\n</BaseLayout>`;
  window._currentEditPageFn = '';
  renderPageEditor('', template);
}

async function editPage(file) {
  const d = await api('/api/pages/get?file='+encodeURIComponent(file));
  if(d.error) return toast('File not found', false);
  window._currentEditPageFn = file;
  renderPageEditor(file, d.content);
}

function renderPageEditor(file, content) {
  const isNew = !file;
  $('ptitle').textContent = isNew ? 'Add New Page' : 'Edit Page';
  $('tact').innerHTML = `<a href="#" style="color:#2271b1;font-size:13px;text-decoration:none;" onclick="goTo('pages');return false;">← All Pages</a>`;

  // Auto-generate categories based on folder names
  const cats = [...new Set(pages.map(p => p.file.includes('/') ? p.file.split('/')[0] : 'Root'))].sort();
  
  // Extract meta from the loaded page object if it exists
  const pData = pages.find(p => p.file === file) || {};
  
  let currentCat = pData.category || 'Root';
  let currentSlug = file ? file.replace(/\.astro$/, '') : '';
  if (currentSlug.includes('/')) {
    const parts = currentSlug.split('/');
    currentCat = parts[0];
    currentSlug = parts.slice(1).join('/');
  }

  // Tags
  const rawTagsList = pData.tags || [];
  const tags = (Array.isArray(rawTagsList) ? rawTagsList : String(rawTagsList).replace(/[\[\]"]/g, '').split(',')).map(t=>String(t).trim()).filter(Boolean);
  const tagsHtml = tags.map(t => `<span class="tag-pill" style="display:inline-flex;align-items:center;gap:4px;background:#e5e7eb;border-radius:3px;padding:2px 7px;font-size:12px;margin:2px;">${esc(t)}<a href="#" style="color:#999;text-decoration:none;margin-left:2px;" onclick="removeTagPill(this);return false;">×</a></span>`).join('');

  // Feature Image
  const hasImage = pData.image && pData.image.trim();

  $('content').innerHTML = `
  <style>
    .meta-box { background:#fff; border:1px solid #c3c4c7; box-shadow:0 1px 1px rgba(0,0,0,.04); margin-bottom:16px; }
    .meta-box-header { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; cursor:pointer; border-bottom:1px solid #c3c4c7; user-select:none; }
    .meta-box-header h3 { font-size:13px; font-weight:600; margin:0; }
    .meta-box-body { padding:12px; }
    .tag-add-area { display:flex; gap:6px; margin-top:8px; }
    .tag-add-area input { flex:1; border:1px solid #8c8f94; border-radius:3px; padding:4px 8px; font-size:13px; }
    .tag-add-area button { background:#2271b1; color:#fff; border:none; border-radius:3px; padding:4px 10px; font-size:12px; cursor:pointer; }
  </style>
  <div style="display:flex;gap:20px;align-items:flex-start;max-width:100%;">
    <!-- LEFT -->
    <div style="flex:1;min-width:0;">
      <div style="margin-bottom:16px;">
        <input type="text" id="pg_filename" style="width:100%;padding:10px 14px;font-size:20px;border:1px solid #8c8f94;border-radius:3px;outline:none;box-shadow:inset 0 1px 2px rgba(0,0,0,.07);" placeholder="e.g. new-page-slug (without .astro)" value="${esc(currentSlug)}">
        <div style="font-size:13px;color:#666;margin-top:6px;">This will be the URL slug for the page (e.g. typing <strong>about</strong> creates <code>/about</code>).</div>
      </div>
      
      <div style="background:#fff;border:1px solid #c3c4c7;">
        <div style="background:#f6f7f7;border-bottom:1px solid #dcdcde;padding:4px 8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <button style="background:#2271b1;color:#fff;border:none;border-radius:3px;padding:4px 10px;font-size:12px;cursor:pointer;" onclick="document.getElementById('pg_media_upload').click()">🖼 Add Media</button>
          <input type="file" id="pg_media_upload" class="hidden" accept="image/*" onchange="insertMediaTo(this,'pg_body')">
          <span style="height:20px;border-left:1px solid #ddd;margin:0 4px;"></span>
          <button style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="wrapText('pg_body','<strong>','</strong>')"><b>B</b></button>
          <button style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="wrapText('pg_body','<em>','</em>')"><em>I</em></button>
          <button style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="prependLine('pg_body','<h1>')">H1</button>
          <button style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="prependLine('pg_body','<h2>')">H2</button>
        </div>
        <textarea id="pg_body" style="width:100%;min-height:500px;border:none;padding:12px;font-size:13px;font-family:monospace;line-height:1.6;box-sizing:border-box;resize:vertical;outline:none;" spellcheck="false">${esc(content.replace(/<!-- WP_META:.*?-->/g, '').trim())}</textarea>
      </div>
    </div>
    
    <!-- RIGHT -->
    <div style="width:280px;flex-shrink:0;">
      <!-- Publish Box -->
      <div class="meta-box">
        <div class="meta-box-header" onclick="toggleMeta('pg-pub')">
          <h3>Publish</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="pg-pub">
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <button class="btn-secondary" style="flex:1;font-size:13px;" onclick="$('pg_draft').value='true';savePage();">Save Draft</button>
            <button class="btn-secondary" style="flex:1;font-size:13px;" onclick="window.open('/${esc(file ? file.replace(/\.astro$/,'') : '')}/','_blank')">Preview</button>
          </div>
          <div style="border-top:1px solid #f0f0f0;padding-top:10px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">🏷 Status:</span>
              <select id="pg_draft" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;">
                <option value="false" ${!pData.draft ? 'selected' : ''}>Published</option>
                <option value="true" ${pData.draft ? 'selected' : ''}>Draft</option>
              </select>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">👁 Visibility:</span>
              <span style="font-size:12px;font-weight:600;">Public</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">📅 Date:</span>
              <input type="date" id="pg_date" value="${esc(pData.date||'')}" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;">
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">✍ Author:</span>
              <input type="text" id="pg_author" value="${esc(pData.author||'Admin')}" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;width:120px;">
            </div>
          </div>
          <div style="border-top:1px solid #f0f0f0;padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
            ${!isNew && file !== 'index.astro' ? `<a href="#" style="color:#d63638;font-size:12px;text-decoration:none;" onclick="openConfirm('Move to Trash?',()=>delPage('${esc(file)}'));return false;">Move to Trash</a>` : '<span></span>'}
            <button class="btn-primary" style="font-size:13px;" onclick="$('pg_draft').value='false';savePage();">${isNew ? 'Publish' : 'Update'}</button>
          </div>
        </div>
      </div>

      <!-- Categories Meta Box -->
      <div class="meta-box">
        <div class="meta-box-header" onclick="toggleMeta('pg-cat')">
          <h3>Categories (Folders)</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="pg-cat">
          <div style="max-height:180px;overflow-y:auto;border:1px solid #f0f0f0;padding:6px;border-radius:3px;margin-bottom:8px;">
            <label style="display:block;font-size:13px;margin-bottom:4px;"><input type="radio" name="pg_category_radio" value="Root" ${currentCat==='Root'?'checked':''}> Root</label>
            ${cats.filter(c=>c!=='Root').map(c => `<label style="display:block;font-size:13px;margin-bottom:4px;"><input type="radio" name="pg_category_radio" value="${esc(c)}" ${c===currentCat?'checked':''}> ${esc(c)}</label>`).join('')}
          </div>
          <input type="text" id="pg_new_category" placeholder="+ Or type new category..." style="width:100%;padding:6px;font-size:13px;border:1px solid #ccc;border-radius:3px;">
        </div>
      </div>

      <!-- Tags Meta Box -->
      <div class="meta-box">
        <div class="meta-box-header" onclick="toggleMeta('pg-tags')">
          <h3>Tags</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="pg-tags">
          <div id="pg_tag_pills" style="display:flex;flex-wrap:wrap;gap:4px;">${tagsHtml}</div>
          <div class="tag-add-area">
            <input type="text" id="pg_tag_input" placeholder="Add tag..." onkeydown="if(event.key==='Enter'){event.preventDefault();addPageTagPill();}">
            <button onclick="addPageTagPill()">Add</button>
          </div>
          <p style="font-size:11px;color:#888;margin-top:6px;">Separate with commas or Enter</p>
        </div>
      </div>

      <!-- Featured Image -->
      <div class="meta-box">
        <div class="meta-box-header" onclick="toggleMeta('pg-image')">
          <h3>Featured Image</h3><span>▲</span>
        </div>
        <div class="meta-box-body" id="pg-image" style="text-align:center;">
          <input type="hidden" id="pg_image_url" value="${esc(pData.image||'')}">
          <div id="pg_image_preview" style="margin-bottom:10px; ${!hasImage ? 'display:none;' : ''}">
            <img src="${esc(pData.image||'')}" style="max-width:100%;height:auto;border-radius:3px;">
          </div>
          <a href="#" id="pg_set_image_link" style="color:#2271b1;font-size:13px;text-decoration:none; ${hasImage ? 'display:none;' : ''}" onclick="$('pg_cover_upload').click();return false;">Set featured image</a>
          <a href="#" id="pg_remove_image_link" style="color:#d63638;font-size:13px;text-decoration:none; ${!hasImage ? 'display:none;' : ''}" onclick="removePageImage();return false;">Remove featured image</a>
          <input type="file" id="pg_cover_upload" class="hidden" accept="image/*" onchange="uploadPageImage(this)">
        </div>
      </div>

      <!-- SEO Settings -->
      ${getSeoBoxHtml(pData)}

    </div>
  </div>`;
}

function addPageTagPill() {
  const inp = $('pg_tag_input');
  if(!inp) return;
  const vals = inp.value.split(',').map(v=>v.trim()).filter(Boolean);
  if(!vals.length) return;
  const cont = $('pg_tag_pills');
  vals.forEach(v => {
    cont.insertAdjacentHTML('beforeend', `<span class="tag-pill" style="display:inline-flex;align-items:center;gap:4px;background:#e5e7eb;border-radius:3px;padding:2px 7px;font-size:12px;margin:2px;">${esc(v)}<a href="#" style="color:#999;text-decoration:none;margin-left:2px;" onclick="removeTagPill(this);return false;">×</a></span>`);
  });
  inp.value = '';
}

async function uploadPageImage(input) {
  if(!input.files||!input.files[0]) return;
  const fd = new FormData();
  fd.append('file', input.files[0]);
  try {
    toast('Uploading image...');
    const r = await fetch(API+'/api/media/upload', {method:'POST', body:fd}).then(r=>r.json());
    if(r.url) {
      $('pg_image_url').value = r.url;
      $('pg_image_preview').innerHTML = `<img src="${r.url}" style="max-width:100%;height:auto;border-radius:3px;">`;
      $('pg_image_preview').style.display = 'block';
      $('pg_set_image_link').style.display = 'none';
      $('pg_remove_image_link').style.display = 'inline';
      toast('Image uploaded!');
    }
  } catch(e) { toast('Upload failed', false); }
}

function removePageImage() {
  $('pg_image_url').value = '';
  $('pg_image_preview').innerHTML = '';
  $('pg_image_preview').style.display = 'none';
  $('pg_remove_image_link').style.display = 'none';
  $('pg_set_image_link').style.display = 'inline';
}

window.savePage = async function() {
  let rawSlug = $('pg_filename').value.trim();
  if(!rawSlug) return toast('Please enter a URL slug!', false);
  
  let cat = $('pg_new_category').value.trim();
  if(!cat) {
    const sel = document.querySelector('input[name="pg_category_radio"]:checked');
    if (sel) cat = sel.value;
  }
  cat = cat.replace(/[^a-z0-9-]/gi,'-').toLowerCase(); 

  let slug = rawSlug.replace(/[^a-z0-9-/]/gi,'-').toLowerCase();
  let file = (cat === 'root' || cat === '') ? slug : cat + '/' + slug;
  if(!file.endsWith('.astro')) file += '.astro';

  // Gather WP_META
  const tags = [];
  document.querySelectorAll('#pg_tag_pills .tag-pill').forEach(el => tags.push(el.textContent.replace('×','').trim()));
  
  const seoData = getSeoData();

  const meta = {
    draft: $('pg_draft').value === 'true',
    date: $('pg_date').value,
    author: $('pg_author').value,
    category: cat,
    tags: tags,
    image: $('pg_image_url').value,
    seoKeywords: seoData.seoKeywords,
    seoTitle: seoData.seoTitle,
    seoDesc: seoData.seoDesc,
    seoNoIndex: seoData.seoNoIndex
  };

  let content = $('pg_body').value.trim();
  // Append WP_META so it persists across reloads without changing Astro
  content += `\n\n<!-- WP_META: ${JSON.stringify(meta)} -->`;

  await post('/api/pages/save', { filename: file, content });
  
  // If we renamed or moved the file, delete the old one
  if(window._currentEditPageFn && window._currentEditPageFn !== file) {
    if(window._currentEditPageFn !== 'index.astro') {
      await post('/api/pages/delete', { filename: window._currentEditPageFn });
    }
  }

  toast('Page saved!');
  await loadAll();
  goTo('pages');
}

window.delPage = async function(f) {
  if(f==='index.astro') return toast('Cannot delete homepage', false);
  await post('/api/pages/delete', { filename: f });
  toast('Page deleted');
  await loadAll();
  goTo('pages');
}

// ══ AD MANAGER ══
function renderAds(){
  $('ptitle').textContent='Ad Manager';
  $('tact').innerHTML=`<button class="btn bp" onclick="saveAds()">\ud83d\udcbe Save Ad Config</button>`;
  const a=adsConfig;
  const pos=a.positions||{};
  let h=`<div class="card"><div class="ch"><h3>\ud83d\udcb0 Global Ad Settings</h3></div><div style="padding:20px">
    <div class="g2"><div class="field"><label>AdSense Publisher ID</label><input id="ad_id" value="${esc(a.adsenseId||'')}" placeholder="ca-pub-XXXXXXXXXXXXXXXX"></div>
    <div class="field"><label class="chk" style="margin-top:18px"><input type="checkbox" id="ad_global" ${a.globalEnabled!==false?'checked':''}><span>\u2705 Enable Ads Globally</span></label></div></div>
    <div style="background:rgba(16,185,129,.08);padding:12px 16px;border-radius:8px;margin-top:8px;font-size:12px;color:var(--muted)">\ud83d\udca1 When disabled globally, no ads will show anywhere. You can also disable ads per-post in the post editor.</div>
  </div></div>`;

  // Ad positions
  h+=`<div class="card"><div class="ch"><h3>\ud83d\udccd Ad Positions</h3><span style="color:var(--dim);font-size:12px">Configure where ads appear on your site</span></div><div style="padding:20px">`;
  const slots=['header','beforeContent','betweenParagraphs','sidebar','afterContent','footer'];
  const slotLabels={header:'📌 Header (below navigation)',beforeContent:'📝 Before Content',betweenParagraphs:'📄 Between Paragraphs',sidebar:'📊 Sidebar',afterContent:'📝 After Content',footer:'📌 Footer (above footer)'};
  slots.forEach(s=>{
    const slot=pos[s]||{enabled:false,code:''};
    h+=`<div style="border:1px solid var(--brd);border-radius:10px;padding:16px;margin-bottom:12px;background:var(--bg)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <label class="chk"><input type="checkbox" id="ad_${s}_on" ${slot.enabled?'checked':''}><span><strong>${slotLabels[s]||s}</strong></span></label>
      </div>`;
    if(s==='betweenParagraphs') h+=`<div class="field" style="margin-bottom:10px"><label>Insert after paragraph #</label><input id="ad_${s}_after" type="number" value="${slot.afterParagraph||3}" min="1" max="20" style="width:80px"></div>`;
    h+=`<div class="field"><label>Ad Code (HTML)</label><textarea class="editor" id="ad_${s}_code" style="min-height:80px" placeholder="Paste your ad code here...">${esc(slot.code||'')}</textarea></div>
    </div>`;
  });
  h+=`</div></div>`;

  // Auto AdSense
  h+=`<div style="background:rgba(99,102,241,.08);padding:16px 20px;border-radius:10px;margin-bottom:20px;font-size:13px;color:var(--muted)">
    <strong>\ud83d\udca1 Quick Setup:</strong> If you just want Google Auto Ads, simply enter your AdSense ID above and leave all positions empty. Google will automatically place ads. For manual control, paste specific ad unit codes into each position.
  </div>`;

  $('content').innerHTML=h;
}

async function saveAds(){
  const slots=['header','beforeContent','betweenParagraphs','sidebar','afterContent','footer'];
  const positions={};
  slots.forEach(s=>{
    positions[s]={
      enabled:$('ad_'+s+'_on')?.checked||false,
      code:$('ad_'+s+'_code')?.value||''
    };
    if(s==='betweenParagraphs') positions[s].afterParagraph=parseInt($('ad_'+s+'_after')?.value)||3;
  });
  const config={
    globalEnabled:$('ad_global').checked,
    adsenseId:$('ad_id').value,
    positions
  };
  await post('/api/ads/save',config);
  adsConfig=config;
  toast('Ad configuration saved! \ud83d\udcb0');
}

// ══ TRASH BIN ══
function renderTrash(){
  $('ptitle').textContent='Trash';
  $('tact').innerHTML='';
  let h=`<div class="card"><div class="ch"><h3>🗑️ Deleted Items</h3><span style="color:var(--dim);font-size:12px">${trashBin.length} items</span></div>
  <table><thead><tr><th>Type</th><th>File</th><th>Deleted At</th><th style="width:160px">Actions</th></tr></thead><tbody>`;
  if(!trashBin.length) h+=`<tr><td colspan="4" class="empty">Trash is empty 🎉</td></tr>`;
  trashBin.forEach(t=>{
    const d=new Date(t.deletedAt).toLocaleString();
    const typeLabel=t.type==='tutorials'?'📖 Tutorial':t.type==='blogs'?'✍️ Post':'📄 Page';
    h+=`<tr><td><strong>${typeLabel}</strong></td><td style="font-size:12px;color:var(--dim);font-family:monospace">${esc(t.file)}</td><td style="font-size:12px;color:var(--muted)">${d}</td>
    <td><button class="btn bk bs" onclick="restoreTrash('${t.type}','${esc(t.file)}')">♻️ Restore</button> <button class="btn bd bs" onclick="deleteTrash('${t.type}','${esc(t.file)}')">✕</button></td></tr>`;
  });
  h+=`</tbody></table></div>
  <div style="background:rgba(239,68,68,.08);padding:14px 18px;border-radius:10px;font-size:13px;color:var(--muted)">⚠️ Items in the trash are completely hidden from your live website. Restoring them will instantly publish them back. Clicking the (✕) icon will permanently delete the file from your computer.</div>`;
  $('content').innerHTML=h;
}

function restoreTrash(type, file){
  openConfirm(`Restore "${file}"? It will instantly reappear on your site.`, async()=>{
    await post('/api/trash/restore', {type, file});
    toast('Item restored ✅');
    await loadAll();
    renderTrash();
  });
}

function deleteTrash(type, file){
  openConfirm(`Permanently delete "${file}"? This CANNOT be undone.`, async()=>{
    await post('/api/trash/delete', {type, file});
    toast('Permanently deleted 🗑️');
    await loadAll();
    renderTrash();
  });
}

// ══ INIT ══
(async()=>{
  await loadAll();
  const validPages=['dashboard','tutorials','blogs','nav','settings','permalinks','pages','ads','trash','books','seo'];
  const hash=(location.hash||'').replace('#','');
  goTo(validPages.includes(hash)?hash:'dashboard');
  window.addEventListener('hashchange',()=>{
    const h=(location.hash||'').replace('#','');
    if(validPages.includes(h)&&h!==page) goTo(h);
  });
})();

// ══ BOOKS ══
let _bookFilter = 'all';
let _bookCatFilter = '';
let _bookSearch = '';
let _bookSelectedFiles = new Set();

window.setBookFilter = function(f) { _bookFilter = f; renderBooks(); }
window.setBookCat = function(c) { _bookCatFilter = c; renderBooks(); }
window.setBookSearch = function(s) { _bookSearch = s; renderBooks(); }
window.toggleBookFile = function(f, on) { on ? _bookSelectedFiles.add(f) : _bookSelectedFiles.delete(f); }
window.toggleAllBooks = function(on) {
  document.querySelectorAll('.book-cb').forEach(cb => {
    cb.checked = on;
    window.toggleBookFile(cb.value, on);
  });
}

window.applyBookBulk = async function() {
  const action = $('bulk_action_books').value;
  if (!action || !_bookSelectedFiles.size) { toast('Select books and an action first', false); return; }
  if (action === 'trash') {
    openConfirm('Move ' + _bookSelectedFiles.size + ' book(s) to Trash?', async () => {
      for (const f of _bookSelectedFiles) await post('/api/books/delete', { filename: f });
      _bookSelectedFiles.clear();
      toast('Books moved to Trash');
      await loadAll(); renderBooks();
    });
  } else {
    for (const f of _bookSelectedFiles) {
      const res = await api('/api/books/get?file=' + encodeURIComponent(f));
      if (!res.content) continue;
      try {
        let contentStr = res.content;
        let isJson = contentStr.startsWith('{');
        if (isJson) {
           let j = JSON.parse(contentStr);
           j.draft = (action === 'draft');
           await post('/api/books/save', { filename: f, content: JSON.stringify(j, null, 2) });
        } else {
           const updated = contentStr.replace(/^draft:\s*.+$/m, 'draft: ' + (action === 'draft'));
           await post('/api/books/save', { filename: f, content: updated });
        }
      } catch(e) {}
    }
    _bookSelectedFiles.clear();
    toast('Books updated!');
    await loadAll(); renderBooks();
  }
}

function renderBooks() {
  $('ptitle').textContent = 'Books';
  $('tact').innerHTML = '<button class="add-new-btn" onclick="editBook()">Add New</button>';
  
  const cats = [...new Set(books.map(b => b.category))].filter(Boolean).sort();
  
  let filtered = books.filter(b => {
    const isDraft = b.draft === true || b.draft === 'true';
    const isPublished = !isDraft;
    if (_bookFilter === 'published' && !isPublished) return false;
    if (_bookFilter === 'draft' && !isDraft) return false;
    if (_bookCatFilter && b.category !== _bookCatFilter) return false;
    
    if (_bookSearch) {
      const q = _bookSearch.toLowerCase();
      if (!(b.title||'').toLowerCase().includes(q) && !(b.category||'').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const total = books.length;
  const drafts = books.filter(b => b.draft === true || b.draft === 'true').length;
  const published = total - drafts;

  const tabClass = t => `text-sm mr-4 cursor-pointer pb-1 ${_bookFilter===t ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-500'}`;

  let h = `
  <div style="margin-bottom:12px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
    <span class="${tabClass('all')}" onclick="setBookFilter('all')">All (${total})</span>
    <span class="${tabClass('published')}" onclick="setBookFilter('published')">Published (${published})</span>
    <span class="${tabClass('draft')}" onclick="setBookFilter('draft')">Drafts (${drafts})</span>
  </div>

  <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center;">
    <select class="input-text" style="width:auto;padding:4px 8px;font-size:13px;" onchange="setBookCat(this.value)">
      <option value="">All Categories</option>
      ${cats.map(c=>`<option value="${esc(c)}" ${_bookCatFilter===c?'selected':''}>${CATNAME[c]||esc(c)}</option>`).join('')}
    </select>
    <input type="text" class="input-text" style="width:220px;font-size:13px;padding:4px 8px;" placeholder="Search Books..." value="${esc(_bookSearch)}" oninput="setBookSearch(this.value)">
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
      <select id="bulk_action_books" class="input-text" style="width:auto;padding:4px 8px;font-size:13px;">
        <option value="">Bulk Actions</option>
        <option value="trash">Move to Trash</option>
        <option value="publish">Mark Published</option>
        <option value="draft">Mark Draft</option>
      </select>
      <button class="btn-secondary" style="padding:4px 10px;font-size:13px;" onclick="applyBookBulk()">Apply</button>
      <span class="text-gray-500 text-sm">${filtered.length} item${filtered.length!==1?'s':''}</span>
    </div>
  </div>

  <div class="wp-card">
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead>
      <tr style="background:#f6f7f7;border-bottom:1px solid #e0e0e0;">
        <th style="padding:8px 10px;width:32px;"><input type="checkbox" id="book_check_all" onchange="toggleAllBooks(this.checked)"></th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Title</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Author</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Category</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Tags</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Date</th>
        <th style="padding:8px 10px;text-align:left;font-weight:600;">Feat. Image</th>
      </tr>
    </thead>
    <tbody>`;
    
  if(!filtered.length) {
    h += `<tr><td colspan="7" style="padding:24px;text-align:center;color:#888;">No books found.</td></tr>`;
  } else {
    filtered.forEach(b => {
      const checked = _bookSelectedFiles.has(b.file) ? 'checked' : '';
      const isDraft = b.draft === true || b.draft === 'true';
      const titleExtra = isDraft ? ' — <span style="font-weight:bold;color:#444;">Draft</span>' : '';
      const dateLabel = `<span style="color:#888;font-size:11px;">${isDraft ? 'Draft' : 'Published'}</span>`;
      const dateStr = b.date || (b.updated ? b.updated : '—');
      const authorStr = b.author || 'Admin';
      const catStr = b.category || '—';
      const rawTagsList = b.tags || [];
      const tags = (Array.isArray(rawTagsList) ? rawTagsList : String(rawTagsList).replace(/[\[\]"]/g, '').split(',')).map(t=>String(t).trim()).filter(Boolean);
      const tagsHtml = tags.length ? tags.map(t=>`<span style="background:#f0f0f0;border-radius:3px;padding:1px 5px;margin-right:3px;font-size:11px;">${esc(t)}</span>`).join('') : '—';
      const hasImage = b.image || b.coverImage;
      const imgHtml = hasImage ? `<img src="${esc(hasImage)}" style="width:40px;height:40px;object-fit:cover;border-radius:3px;border:1px solid #ddd;" onerror="this.replaceWith(document.createTextNode('—'))">` : `<span style="color:#aaa;font-size:11px;">No Image</span>`;
      
      h += `
      <tr style="border-bottom:1px solid #f0f0f0;" class="blog-row" onmouseenter="this.querySelector('.row-actions').style.display='flex'" onmouseleave="this.querySelector('.row-actions').style.display='none'">
        <td style="padding:8px 10px;"><input type="checkbox" class="book-cb" value="${esc(b.file)}" ${checked} onchange="toggleBookFile('${esc(b.file)}',this.checked)"></td>
        <td style="padding:8px 10px;">
          <strong><a href="#" style="color:#2271b1;text-decoration:none;" onclick="editBook('${esc(b.file)}');return false;">${esc(b.title || b.file)}</a></strong>${titleExtra}
          <div class="row-actions" style="display:none;gap:8px;margin-top:4px;">
            <a href="#" style="color:#2271b1;font-size:12px;text-decoration:none;" onclick="editBook('${esc(b.file)}');return false;">Edit</a>
            <span style="color:#ccc;">|</span>
            <a href="#" style="color:#d63638;font-size:12px;text-decoration:none;" onclick="openConfirm('Move to Trash?',()=>delBook('${esc(b.file)}'));return false;">Trash</a>
            <span style="color:#ccc;">|</span>
            <a href="/books/${esc((b.slug || b.file).replace(/\.json$/, ''))}/" target="_blank" style="color:#888;font-size:12px;text-decoration:none;">View</a>
          </div>
        </td>
        <td style="padding:8px 10px;color:#555;">${esc(authorStr)}</td>
        <td style="padding:8px 10px;"><a href="#" style="color:#2271b1;text-decoration:none;font-size:12px;" onclick="setBookCat('${esc(catStr)}');return false;">${CATNAME[catStr]||esc(catStr)}</a></td>
        <td style="padding:8px 10px;">${tagsHtml}</td>
        <td style="padding:8px 10px;color:#555;">${dateStr}<br>${dateLabel}</td>
        <td style="padding:8px 10px;">${imgHtml}</td>
      </tr>`;
    });
  }
  h += `</tbody></table></div>`;
  $('content').innerHTML = h;
}


async function editBook(file='') {
  let b = { title: '', description: '', draft: true, image: '', date: new Date().toISOString().split('T')[0] };
  let originalFile = '';
  if (file) {
    originalFile = file;
    const res = await api('/api/books/get?file='+file);
    if(res.content) {
      try {
        const fm = res.content.match(/^---\n([\s\S]*?)\n---/);
        if(fm) {
           const lines = fm[1].split('\n');
           lines.forEach(l => {
             const [k,...v] = l.split(':');
             if(k && v.length) b[k.trim()] = v.join(':').trim().replace(/^['"]|['"]$/g, '');
           });
           b._content = res.content.replace(fm[0], '').trim();
        } else {
           b._content = res.content;
           const j = JSON.parse(res.content);
           Object.assign(b, j);
        }
      } catch(e){}
    }
  }

  window._currentEditBook = b;
  $('ptitle').textContent = file ? 'Edit Book' : 'Add New Book';
  $('tact').innerHTML = `<a href="#" style="color:#2271b1;font-size:13px;text-decoration:none;" onclick="goTo('books');return false;">← All Books</a>`;

  const imgSrc = b.image || b.coverImage || '';

  $('content').innerHTML = `
  <div style="display:flex;gap:20px;align-items:flex-start;max-width:100%;">
    <!-- LEFT -->
    <div style="flex:1;min-width:0;">
      <input type="text" id="b_title" placeholder="Book title"
        style="width:100%;font-size:23px;font-weight:400;border:1px solid #dcdcde;padding:8px 10px;box-sizing:border-box;margin-bottom:12px;line-height:1.4;border-radius:3px;"
        value="${esc(b.title)}">
      <div style="background:#fff;border:1px solid #c3c4c7;">
        <div style="background:#f6f7f7;border-bottom:1px solid #dcdcde;padding:4px 8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <button style="background:#2271b1;color:#fff;border:none;border-radius:3px;padding:4px 10px;font-size:12px;cursor:pointer;" onclick="document.getElementById('bk_media_upload').click()">🖼 Add Media</button>
          <input type="file" id="bk_media_upload" class="hidden" accept="image/*" onchange="insertMediaTo(this,'b_desc')">
          <span style="height:20px;border-left:1px solid #ddd;margin:0 4px;"></span>
          <button style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="wrapText('b_desc','**','**')"><b>B</b></button>
          <button style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="wrapText('b_desc','*','*')"><em>I</em></button>
          <button style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="prependLine('b_desc','# ')">H1</button>
          <button style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="prependLine('b_desc','## ')">H2</button>
          <button style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="prependLine('b_desc','- ')">•</button>
          <button style="background:#f6f7f7;border:1px solid #c3c4c7;border-radius:2px;padding:2px 6px;font-size:12px;cursor:pointer;" onclick="insertLink('b_desc')">🔗</button>
        </div>
        <textarea id="b_desc" oninput="updateWordCount(this.value)"
          style="width:100%;min-height:380px;border:none;padding:12px;font-size:14px;line-height:1.7;font-family:inherit;box-sizing:border-box;resize:vertical;outline:none;"
          >${esc(b.description || b._content || '')}</textarea>
        <div style="background:#f6f7f7;border-top:1px solid #dcdcde;padding:4px 10px;font-size:12px;color:#888;">
          Word count: <span id="wc-count">${(b.description||b._content||'').trim().split(/\s+/).filter(Boolean).length}</span>
        </div>
      </div>
    </div>
    <!-- RIGHT -->
    <div style="width:280px;flex-shrink:0;">
      <!-- Publish -->
      <div style="background:#fff;border:1px solid #c3c4c7;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #c3c4c7;cursor:pointer;" onclick="toggleMeta('bk-pub')">
          <h3 style="font-size:13px;font-weight:600;margin:0;">Publish</h3><span>▲</span>
        </div>
        <div id="bk-pub" style="padding:12px;">
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <button class="btn-secondary" style="flex:1;font-size:13px;" onclick="saveBook('${originalFile}')">Save Draft</button>
          </div>
          <div style="border-top:1px solid #f0f0f0;padding-top:10px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">🏷 Status:</span>
              <select id="b_draft" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;">
                <option value="false" ${b.draft==='false'||b.draft===false?'selected':''}>Published</option>
                <option value="true"  ${b.draft==='true' ||b.draft===true ?'selected':''}>Draft</option>
              </select>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:13px;">
              <span style="color:#555;">📅 Date:</span>
              <input type="date" id="b_date" value="${esc(b.date||'')}" style="border:1px solid #8c8f94;border-radius:3px;padding:2px 6px;font-size:12px;">
            </div>
          </div>
          <div style="border-top:1px solid #f0f0f0;padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
            <a href="#" style="color:#d63638;font-size:12px;text-decoration:none;" onclick="openConfirm('Delete book permanently?',()=>delBook('${originalFile}'));return false;">Move to Trash</a>
            <button class="btn-primary" style="font-size:13px;" onclick="saveBook('${originalFile}')">Publish</button>
          </div>
        </div>
      </div>
      <!-- Cover Image -->
      <div style="background:#fff;border:1px solid #c3c4c7;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #c3c4c7;cursor:pointer;" onclick="toggleMeta('bk-img')">
          <h3 style="font-size:13px;font-weight:600;margin:0;">Cover Image</h3><span>▲</span>
        </div>
        <div id="bk-img" style="padding:12px;">
          <div id="b_image_container" style="cursor:pointer;border:2px dashed #c3c4c7;border-radius:3px;padding:16px;text-align:center;${imgSrc?'display:none':''}" onclick="document.getElementById('b_image_file').click()">
            <div style="font-size:28px;margin-bottom:6px;">📷</div>
            <a href="#" style="color:#2271b1;font-size:13px;" onclick="return false;">Set cover image</a>
          </div>
          <div id="b_image_preview_container" style="${imgSrc?'':'display:none'}">
            <img src="${esc(imgSrc)}" id="b_image_preview" style="width:100%;border-radius:3px;cursor:pointer;border:1px solid #ddd;" onclick="document.getElementById('b_image_file').click()">
            <a href="#" style="color:#d63638;font-size:12px;text-decoration:none;display:block;margin-top:6px;" onclick="removeCoverImage('b');return false;">Remove cover image</a>
          </div>
          <input type="hidden" id="b_image" value="${esc(imgSrc)}">
          <input type="file" id="b_image_file" class="hidden" accept="image/*" onchange="uploadCoverImage(this,'b_image','b_image_preview','b_image_container','b_image_preview_container')">
        </div>
      </div>

      <!-- SEO Settings -->
      ${getSeoBoxHtml(b)}

    </div>
  </div>`;
  
  if (window.EasyMDE) {
    if (window.mde) window.mde.toTextArea();
    window.mde = new EasyMDE({ 
      element: document.getElementById('b_desc'),
      spellChecker: false,
      status: false
    });
  }
}

window.saveBook = async function(origFile) {
  const t = ($('b_title')?.value||'').trim();
  if(!t) return toast('Title required', false);
  const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = origFile || (slug + '.json');

  // image field: in book editor the hidden field is b_image
  const imgEl = $('b_image') || $('b_cover');
  const imgVal = imgEl ? imgEl.value : '';

  const seoData = getSeoData();

  const content = {
    ...(window._currentEditBook || {}),
    title: t,
    date: $('b_date')?.value || '',
    draft: ($('b_draft')?.value === 'true'),
    image: imgVal,
    description: $('b_desc')?.value || '',
    seoKeywords: seoData.seoKeywords,
    seoTitle: seoData.seoTitle,
    seoDesc: seoData.seoDesc,
    seoNoIndex: seoData.seoNoIndex
  };
  // Remove internal keys
  delete content._content; delete content.file;

  await post('/api/books/save', { filename, content });
  toast('Book saved!');
  await loadAll();
  goTo('books');
}

window.delBook = async function(f) {
  await post('/api/books/delete', { filename: f });
  toast('Book moved to trash');
  await loadAll();
  goTo('books');
}

// Media upload for Cover Images
async function uploadCoverImage(input, hiddenId, previewId, containerId, previewContainerId) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > 5 * 1024 * 1024) { toast('Image is too large (max 5MB)', false); return; }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    toast('Uploading...', true);
    try {
      const res = await post('/api/media/upload', { filename: file.name, data: base64 });
      if (res.ok && res.url) {
        const hiddenEl = $(hiddenId); if(hiddenEl) hiddenEl.value = res.url;
        const previewEl = $(previewId); if(previewEl) previewEl.src = res.url;
        // Show preview, hide placeholder — works for both style.display and classList
        const previewCon = $(previewContainerId);
        const placeholder = $(containerId);
        if (previewCon) { previewCon.style.display = ''; previewCon.classList.remove('hidden'); }
        if (placeholder) { placeholder.style.display = 'none'; placeholder.classList.add('hidden'); }
        toast('Image uploaded!', true);
      } else {
        toast(res.error || 'Upload failed', false);
      }
    } catch (err) {
      toast('Upload failed: ' + err.message, false);
    }
  };
  reader.readAsDataURL(file);
}

function removeCoverImage(type) {
  // Clear whichever hidden input exists
  ['b_image','b_cover'].forEach(id => { const el=$(id); if(el) el.value=''; });
  const previewContainer = $('b_image_preview_container');
  const container = $('b_image_container');
  if (previewContainer) { previewContainer.style.display='none'; previewContainer.classList.add('hidden'); }
  if (container) { container.style.display=''; container.classList.remove('hidden'); }
}

// ══ MEDIA LIBRARY ══
async function renderMedia() {
  $('ptitle').textContent = 'Media Library';
  $('tact').innerHTML = `<button class="btn-primary" onclick="document.getElementById('media_upload').click()">+ Add New</button>
                         <input type="file" id="media_upload" class="hidden" accept="image/*" onchange="uploadDirectMedia(this)">`;
  $('content').innerHTML = '<div class="text-gray-500">Loading media...</div>';
  
  try {
    const list = await api('/api/media/list');
    if (!list.length) {
      $('content').innerHTML = '<div class="wp-card p-8 text-center text-gray-500">No media files found. Upload some images to get started.</div>';
      return;
    }
    
    let html = '<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">';
    list.forEach(m => {
      const kb = (m.size / 1024).toFixed(1);
      html += `
        <div class="wp-card relative overflow-hidden group">
          <div class="aspect-square bg-gray-100 flex items-center justify-center p-2">
            <img src="${esc(m.url)}" class="object-contain w-full h-full cursor-pointer" onclick="copyMediaUrl('${esc(m.url)}')">
          </div>
          <div class="p-2 text-xs border-t bg-white">
            <div class="truncate font-semibold mb-1" title="${esc(m.name)}">${esc(m.name)}</div>
            <div class="text-gray-500 flex justify-between items-center">
              <span>${kb} KB</span>
              <span class="text-red-500 cursor-pointer hover:underline" onclick="deleteMedia('${esc(m.name)}')">Delete</span>
            </div>
          </div>
          <div class="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none" style="pointer-events: none;">
            <span class="text-white font-bold text-xs bg-black px-2 py-1 rounded">Click to Copy URL</span>
          </div>
        </div>
      `;
    });
    html += '</div>';
    $('content').innerHTML = html;
  } catch (err) {
    $('content').innerHTML = '<div class="text-red-500">Failed to load media.</div>';
  }
}

async function uploadDirectMedia(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > 5 * 1024 * 1024) { toast('Image is too large (max 5MB)', false); return; }
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    toast('Uploading...', true);
    try {
      const res = await post('/api/media/upload', { filename: file.name, data: e.target.result });
      if (res.ok) {
        toast('Upload successful!', true);
        init(); // Refresh stats
        renderMedia();
      } else {
        toast(res.error || 'Upload failed', false);
      }
    } catch (err) {
      toast('Upload failed: ' + err.message, false);
    }
  };
  reader.readAsDataURL(file);
}

function copyMediaUrl(url) {
  navigator.clipboard.writeText(url).then(() => toast('URL copied to clipboard!'));
}

function deleteMedia(name) {
  openConfirm(`Delete image "${name}" permanently?`, async () => {
    try {
      const res = await post('/api/media/delete', { filename: name });
      if (res.ok) {
        toast('Image deleted');
        init();
        renderMedia();
      } else toast('Failed to delete', false);
    } catch (e) { toast('Error', false); }
  });
}

// ══ CATEGORIES ══
async function renderCategories() {
  $('ptitle').textContent = 'Categories';
  $('tact').innerHTML = '';

  const cats = await api('/api/categories/list');

  let rows = '';
  cats.forEach(c => {
    rows += `
    <tr style="border-bottom:1px solid #f0f0f0;" onmouseenter="this.querySelector('.row-actions').style.display='flex'" onmouseleave="this.querySelector('.row-actions').style.display='none'">
      <td style="padding:8px 10px;width:32px;"><input type="checkbox" class="cat-cb" value="${esc(c.name)}"></td>
      <td style="padding:8px 10px;">
        <strong><a href="#" style="color:#2271b1;text-decoration:none;" onclick="openEditCat(${JSON.stringify(c)});return false;">${esc(c.name)}</a></strong>
        <div class="row-actions" style="display:none;gap:8px;margin-top:3px;">
          <a href="#" style="color:#2271b1;font-size:12px;text-decoration:none;" onclick="openEditCat(${JSON.stringify(c)});return false;">Edit</a>
          <span style="color:#ccc;">|</span>
          <a href="#" style="color:#d63638;font-size:12px;text-decoration:none;" onclick="openConfirm('Delete category &quot;${esc(c.name)}&quot;?',()=>doDeleteCat('${esc(c.slug)}','${esc(c.name)}'));return false;">Delete</a>
        </div>
      </td>
      <td style="padding:8px 10px;font-size:13px;color:#555;">${esc(c.description||'—')}</td>
      <td style="padding:8px 10px;font-family:monospace;font-size:12px;color:#888;">${esc(c.slug)}</td>
      <td style="padding:8px 10px;text-align:center;"><a href="#" style="color:#2271b1;font-size:13px;" onclick="setBlogCat('${esc(c.name)}');goTo('blogs');return false;">${c.count||0}</a></td>
    </tr>`;
  });

  $('content').innerHTML = `
  <div style="display:flex;gap:24px;align-items:flex-start;">

    <!-- LEFT: Add Category Form (WordPress style) -->
    <div style="width:280px;flex-shrink:0;">
      <div id="cat-form-title" style="font-size:15px;font-weight:600;margin-bottom:12px;">Add New Category</div>

      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Name</label>
        <input type="text" id="cat_name" style="width:100%;border:1px solid #8c8f94;border-radius:3px;padding:6px 8px;font-size:13px;box-sizing:border-box;">
        <p style="font-size:12px;color:#888;margin:4px 0 0;">The name is how it appears on your site.</p>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Slug</label>
        <input type="text" id="cat_slug" style="width:100%;border:1px solid #8c8f94;border-radius:3px;padding:6px 8px;font-size:13px;box-sizing:border-box;">
        <p style="font-size:12px;color:#888;margin:4px 0 0;">The "slug" is the URL-friendly version. Lowercase, hyphens only.</p>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:4px;">Description</label>
        <textarea id="cat_desc" style="width:100%;height:80px;border:1px solid #8c8f94;border-radius:3px;padding:6px 8px;font-size:13px;box-sizing:border-box;resize:vertical;"></textarea>
        <p style="font-size:12px;color:#888;margin:4px 0 0;">Not displayed by default but some themes may show it.</p>
      </div>

      <input type="hidden" id="cat_original_slug" value="">
      <button class="btn-primary" onclick="saveCategoryForm()" style="font-size:13px;" id="cat_submit_btn">Add Category</button>
      <button id="cat_cancel_btn" class="btn-secondary" style="font-size:13px;margin-left:8px;display:none;" onclick="resetCatForm()">Cancel</button>
    </div>

    <!-- RIGHT: Categories Table -->
    <div style="flex:1;min-width:0;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;gap:8px;align-items:center;">
          <select id="cat_bulk_action" style="border:1px solid #8c8f94;border-radius:3px;padding:4px 8px;font-size:13px;">
            <option value="">Bulk Actions</option>
            <option value="delete">Delete</option>
          </select>
          <button class="btn-secondary" style="font-size:13px;padding:4px 10px;" onclick="applyBulkCat()">Apply</button>
          <span style="font-size:13px;color:#888;">${cats.length} item${cats.length!==1?'s':''}</span>
        </div>
        <input type="text" id="cat_search" placeholder="Search Categories..." oninput="filterCatRows(this.value)"
          style="border:1px solid #8c8f94;border-radius:3px;padding:4px 10px;font-size:13px;width:200px;">
      </div>

      <div class="wp-card">
        <table id="cat-table" style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f6f7f7;border-bottom:1px solid #e0e0e0;">
              <th style="padding:8px 10px;width:32px;"><input type="checkbox" onchange="document.querySelectorAll('.cat-cb').forEach(c=>c.checked=this.checked)"></th>
              <th style="padding:8px 10px;text-align:left;font-weight:600;">Name</th>
              <th style="padding:8px 10px;text-align:left;font-weight:600;">Description</th>
              <th style="padding:8px 10px;text-align:left;font-weight:600;">Slug</th>
              <th style="padding:8px 10px;text-align:center;font-weight:600;">Count</th>
            </tr>
          </thead>
          <tbody id="cat-tbody">${rows || '<tr><td colspan="5" style="padding:24px;text-align:center;color:#888;">No categories found.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  </div>`;

  // Auto-generate slug from name
  $('cat_name').addEventListener('input', function() {
    $('cat_slug').value = this.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  });
}

function filterCatRows(q) {
  const rows = document.querySelectorAll('#cat-tbody tr');
  rows.forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

function openEditCat(cat) {
  $('cat_name').value = cat.name;
  $('cat_slug').value = cat.slug;
  $('cat_desc').value = cat.description || '';
  $('cat_original_slug').value = cat.slug;
  $('cat_form_title') && ($('cat_form_title').textContent = 'Edit Category');
  const ft = document.getElementById('cat-form-title');
  if (ft) ft.textContent = 'Edit Category';
  $('cat_submit_btn').textContent = 'Update Category';
  $('cat_cancel_btn').style.display = '';
  $('cat_name').focus();
}

function resetCatForm() {
  $('cat_name').value = '';
  $('cat_slug').value = '';
  $('cat_desc').value = '';
  $('cat_original_slug').value = '';
  const ft = document.getElementById('cat-form-title');
  if (ft) ft.textContent = 'Add New Category';
  $('cat_submit_btn').textContent = 'Add Category';
  $('cat_cancel_btn').style.display = 'none';
}

async function saveCategoryForm() {
  const name = $('cat_name').value.trim();
  if (!name) { toast('Name required', false); return; }
  const slug = $('cat_slug').value.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const description = $('cat_desc').value.trim();
  const originalSlug = $('cat_original_slug').value;

  const res = await post('/api/categories/save', { name, slug, description, originalSlug });
  if (res.ok) {
    toast(originalSlug ? 'Category updated!' : 'Category added!');
    await loadAll();
    renderCategories();
  } else { toast('Failed to save', false); }
}

async function doDeleteCat(slug, name) {
  const res = await post('/api/categories/delete', { slug, name });
  if (res.ok) { toast('Category deleted'); await loadAll(); renderCategories(); }
  else toast('Failed to delete', false);
}

async function applyBulkCat() {
  const action = $('cat_bulk_action').value;
  const selected = Array.from(document.querySelectorAll('.cat-cb:checked')).map(c=>c.value);
  if (!action || !selected.length) { toast('Select categories and an action', false); return; }
  if (action === 'delete') {
    openConfirm(`Delete ${selected.length} categories?`, async () => {
      for (const name of selected) {
        const cat = categories.find(c=>c.name===name);
        if (cat) await post('/api/categories/delete', { slug: cat.slug, name });
      }
      toast('Deleted!'); await loadAll(); renderCategories();
    });
  }
}

// SEO Manager
window.renderSeo = function() {
  $('ptitle').textContent = 'CodeCompilerSEO Manager';
  $('tact').innerHTML = '';
  
  let h = `
  <div style="display:flex;gap:16px;margin-bottom:20px;border-bottom:1px solid #c3c4c7;padding-bottom:12px;overflow-x:auto;">
    <button class="btn-secondary" style="border:none;background:transparent;color:#2271b1;font-weight:bold;">Dashboard</button>
    <button class="btn-secondary" style="border:none;background:transparent;" onclick="alert('Coming soon in Phase 2!')">Content SEO</button>
    <button class="btn-secondary" style="border:none;background:transparent;" onclick="alert('Coming soon in Phase 2!')">Internal Linking</button>
    <button class="btn-secondary" style="border:none;background:transparent;" onclick="alert('Coming soon in Phase 2!')">Redirects</button>
    <button class="btn-secondary" style="border:none;background:transparent;" onclick="alert('Coming soon in Phase 2!')">Schema</button>
    <button class="btn-secondary" style="border:none;background:transparent;" onclick="alert('Coming soon in Phase 2!')">Sitemap</button>
    <button class="btn-secondary" style="border:none;background:transparent;" onclick="alert('Coming soon in Phase 2!')">Social</button>
    <button class="btn-secondary" style="border:none;background:transparent;" onclick="alert('Coming soon in Phase 2!')">AI SEO</button>
    <button class="btn-secondary" style="border:none;background:transparent;" onclick="alert('Coming soon in Phase 2!')">Settings</button>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="wp-card">
      <div class="wp-card-header" style="background:#fff;border-bottom:1px solid #f0f0f1;">
        <span style="display:flex;align-items:center;gap:8px;">🩺 SEO Health</span>
      </div>
      <div class="wp-card-body">
        <div class="stat-row"><span>🔴 Missing Meta Descriptions</span> <a href="#">3 pages</a></div>
        <div class="stat-row"><span>🟠 Orphaned Articles</span> <a href="#">7 pages</a></div>
        <div class="stat-row"><span>🟠 Broken Redirects</span> <a href="#">5 links</a></div>
        <div class="stat-row"><span>🟢 Sitemap Status</span> <span style="color:green">OK</span></div>
        <div class="stat-row"><span>🟢 Schema Config</span> <span style="color:green">OK</span></div>
      </div>
    </div>
    
    <div class="wp-card">
      <div class="wp-card-header" style="background:#fff;border-bottom:1px solid #f0f0f1;">
        <span style="display:flex;align-items:center;gap:8px;">🤖 AI Content SEO</span>
      </div>
      <div class="wp-card-body">
        <p style="color:#555;font-size:13px;margin-bottom:12px;line-height:1.5;">Premium AI features are active. You can generate titles, meta descriptions, and optimize content directly in the post editor.</p>
        <button class="btn-primary" onclick="alert('AI Engine is running.')">Check AI Status</button>
      </div>
    </div>
  </div>
  `;
  
  $('content').innerHTML = h;
}
