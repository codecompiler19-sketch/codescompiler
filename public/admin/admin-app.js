// CodesCompiler Content Manager — WordPress-style CMS
const API='http://localhost:3001';
let page='dashboard',stats={},tutorials=[],blogs=[],navItems=[],siteSettings={},pages=[],adsConfig={},trashBin=[],themeSettings={},stagedUploads={blog:[],tutorial:[],page:[],book:[]};
let modalCb=null,confirmCb=null;

const TCAT=['html','css','javascript','seo','python','sql','php'];
const BCAT=['HTML & CSS','JavaScript','JavaScript Projects','Login Form','Card Design','Navigation Bar','Blog','Website Designs','Image Slider','API Projects','Sidebar Menu','CSS Buttons','JavaScript Games','Preloader or Loader','Form Validation','Accordion','Bootstrap','Tabs','Calendar'];
const CB={html:'bh',css:'bc',javascript:'bj',seo:'bse',python:'bpy',sql:'bsq',php:'bp2'};
const CATNAME={html:'HTML',css:'CSS',javascript:'JavaScript',seo:'SEO',python:'Python',sql:'SQL',php:'PHP'};

// Utils
const $=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function toast(m,ok=true){const d=document.createElement('div');d.className='toast '+(ok?'ok':'err');d.innerHTML=(ok?'✅':'❌')+' '+m;$('toasts').appendChild(d);setTimeout(()=>d.remove(),3500)}
async function api(p,o){return(await fetch(API+p,o)).json()}
async function post(p,b){return api(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)})}

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
        { id: 'theme', ico: '🎨', label: 'Themes' },
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
  try{[stats,tutorials,blogs,navItems,siteSettings,pages,adsConfig,trashBin,themeSettings]=await Promise.all([api('/api/stats'),api('/api/tutorials/list'),api('/api/blogs/list'),api('/api/nav/get'),api('/api/settings/get'),api('/api/pages/list'),api('/api/ads/get'),api('/api/trash/list'),api('/api/theme/get')])}
  catch(e){toast('Failed to connect to server',false)}
  renderSidebar();
}

function goTo(p){page=p;location.hash=p;renderSidebar();({dashboard:renderDash,tutorials:renderTuts,blogs:renderBlogs,books:renderBooks,categories:renderCategories,media:renderMedia,nav:renderNav,settings:renderSettings,permalinks:renderPermalinks,pages:renderPages,ads:renderAds,trash:renderTrash,theme:renderTheme})[p]?.()}

// ══ CATEGORIES ══
function renderCategories() {
  $('ptitle').textContent = 'Categories';
  $('tact').innerHTML = `<button class="btn bp" onclick="alert('Category editing will be available in Phase 4. They are currently synced from config.')">+ Add New Category</button>`;
  
  let h = `<div style="background:rgba(99,102,241,.08);padding:16px 20px;border-radius:10px;margin-bottom:20px;font-size:13px;color:var(--muted)">
    <strong>ℹ️ Category Overview:</strong> Here you can view all active categories used for Posts and Tutorials.
  </div>`;
  
  h += `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">`;
  
  // Post Categories
  h += `<div class="card" style="margin-bottom:0;"><div class="ch"><h3>📝 Post Categories</h3><span style="color:var(--dim);font-size:12px">${BCAT.length} categories</span></div>
  <table><thead><tr><th>Name</th><th>Slug</th></tr></thead><tbody>`;
  BCAT.forEach(c => {
    const slug = c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    h += `<tr><td><strong>${esc(c)}</strong></td><td style="font-family:monospace;color:var(--dim);font-size:12px;">${slug}</td></tr>`;
  });
  h += `</tbody></table></div>`;
  
  // Tutorial Categories
  h += `<div class="card" style="margin-bottom:0;"><div class="ch"><h3>📖 Tutorial Languages</h3><span style="color:var(--dim);font-size:12px">${TCAT.length} languages</span></div>
  <table><thead><tr><th>Language Code</th><th>Display Name</th></tr></thead><tbody>`;
  TCAT.forEach(c => {
    h += `<tr><td style="font-family:monospace;color:var(--dim);font-size:12px;">${esc(c)}</td><td><strong>${esc(CATNAME[c]||c)}</strong></td></tr>`;
  });
  h += `</tbody></table></div>`;
  
  h += `</div>`;
  
  $('content').innerHTML = h;
}

// ══ MEDIA LIBRARY ══
let mediaFiles = [];
async function renderMedia() {
  $('ptitle').textContent = 'Media Library';
  $('tact').innerHTML = `<button class="btn bp" onclick="uploadMediaUI()">+ Upload New Media</button>`;
  
  mediaFiles = await api('/api/media/list').catch(() => []);
  
  let h = `<div class="card"><div class="ch"><h3>🖼️ Media Files</h3><span style="color:var(--dim);font-size:12px">${mediaFiles.length} files</span></div>`;
  
  if(!mediaFiles.length) {
    h += `<div style="padding:24px;text-align:center;color:var(--dim)">No media files found. Upload some images!</div></div>`;
  } else {
    h += `<div style="padding:16px; display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px;">`;
    mediaFiles.forEach(m => {
      h += `
      <div style="border:1px solid #c3c4c7; border-radius:4px; overflow:hidden; background:#fff; position:relative;" class="media-card">
        <div style="height:120px; background:#f0f0f1; display:flex; align-items:center; justify-content:center;">
          <img src="${m.url}" style="max-height:100%; max-width:100%; object-fit:contain;" />
        </div>
        <div style="padding:8px; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${esc(m.file)}">
          <strong>${esc(m.file)}</strong><br>
          <span style="color:var(--dim)">${(m.size/1024).toFixed(1)} KB</span><br>
          <span style="color:#2271b1; cursor:pointer;" onclick="navigator.clipboard.writeText('${m.url}');toast('URL copied!')">Copy URL</span>
        </div>
        <div style="position:absolute; top:4px; right:4px;">
          <button class="btn bd bs" style="padding:4px; background:#fff; border-radius:50%; box-shadow:0 1px 2px rgba(0,0,0,0.2)" onclick="delMedia('${esc(m.file)}')">🗑️</button>
        </div>
      </div>`;
    });
    h += `</div></div>`;
  }
  
  h += `<div id="media-upload-area" style="display:none; margin-top:20px; padding:24px; border:2px dashed #8c8f94; border-radius:8px; text-align:center; background:#fff;">
    <h3>Upload New Image</h3>
    <p style="font-size:12px; color:var(--dim); margin-bottom:10px;">Select an image to upload to the media library</p>
    <input type="file" id="media_file_inp" accept="image/*" style="display:none" onchange="handleMediaUpload(this)">
    <button class="btn bp" onclick="$('media_file_inp').click()">Select File</button>
  </div>`;
  
  $('content').innerHTML = h;
}

function uploadMediaUI() {
  $('media-upload-area').style.display = 'block';
}

function delMedia(filename) {
  openConfirm(`Delete media "${filename}"?`, async () => {
    await post('/api/media/delete', { filename });
    toast('Media deleted');
    await loadAll();
    renderMedia();
  });
}

async function handleMediaUpload(input) {
  if(!input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64 = e.target.result.split(',')[1];
    toast('Uploading media...', true);
    try {
      await post('/api/media/upload', { name: file.name, data: base64 });
      toast('Media uploaded successfully! ✅');
      await loadAll();
      renderMedia();
    } catch (e) {
      toast('Failed to upload media.', false);
    }
  };
  reader.readAsDataURL(file);
}

// ══ UPLOAD PANEL ══
// Sample file templates for each content type
const SAMPLES = {
  blog: {
    filename: 'sample-blog-post.mdx',
    content: `---
# ╔══════════════════════════════════════════════════════════╗
# ║         CODESCOMPILER — BLOG POST FORMAT GUIDE           ║
# ╚══════════════════════════════════════════════════════════╝
#
# FILE LOCATION: src/content/blog/your-post-slug.mdx
# FILE FORMAT  : MDX (Markdown + optional JSX components)
# URL will be  : /blog/your-post-slug/
#
# ┌──────────────────────────────────────────────────────────┐
# │ REQUIRED FIELDS (must not be empty)                      │
# └──────────────────────────────────────────────────────────┘

title: "How to Build a Glassmorphism Login Form with CSS"
# ↑ REQUIRED. The main heading shown on the page and in Google results.

description: "Learn how to create a stunning glassmorphism login form using CSS backdrop-filter, rgba colors, and box-shadow for a modern frosted glass effect."
# ↑ REQUIRED. 1-2 sentences. Used for SEO meta description (keep under 160 chars).

date: "2026-09-14"
# ↑ REQUIRED. Format: YYYY-MM-DD. Controls sort order on the blog page.

category: "Login Form"
# ↑ REQUIRED. MUST be EXACTLY one of these values (copy-paste):
#   "HTML & CSS"         "JavaScript"           "JavaScript Projects"
#   "Login Form"         "Card Design"          "Navigation Bar"
#   "Blog"               "Website Designs"      "Templates html"
#   "Image Slider"       "API Projects"         "Sidebar Menu"
#   "CSS Buttons"        "JavaScript Games"     "Preloader or Loader"
#   "Form Validation"    "Accordion"            "Bootstrap"
#   "Tabs"               "Calendar"
# ↑ Any other value will cause a BUILD ERROR.

# ┌──────────────────────────────────────────────────────────┐
# │ OPTIONAL FIELDS                                          │
# └──────────────────────────────────────────────────────────┘

tags: ["css", "glassmorphism", "login-form", "backdrop-filter"]
# ↑ Array of lowercase tags. Helps with search & filtering.

image: "/images/posts/glassmorphism-login.png"
# ↑ Path to the thumbnail image shown on the blog listing card.
#   Must be placed in: public/images/posts/

imageAlt: "Glassmorphism login form with frosted glass effect"
# ↑ Alt text for the image (for accessibility & SEO).

status: "published"
# ↑ Options: "published" | "draft" | "scheduled"
#   "draft" hides the post from all listings and sitemaps.

featured: false
# ↑ Set to true to show this post in the Featured section on the homepage.

hasDemo: true
# ↑ Set to true if the post contains a live code demo.

author: "CodesCompiler"
# ↑ Author name displayed on the post.

seoTitle: "Glassmorphism Login Form Tutorial — HTML & CSS"
# ↑ Optional. Override the page <title> for Google (keep under 60 chars).

noindex: false
# ↑ Set to true to tell search engines NOT to index this page.
---

## Introduction

Welcome to this tutorial! Here we'll build a glassmorphism login form step by step.

## HTML Structure

\`\`\`html
<div class="glass-card">
  <form class="login-form">
    <h2>Sign In</h2>
    <input type="email" placeholder="Email address">
    <input type="password" placeholder="Password">
    <button type="submit">Login</button>
  </form>
</div>
\`\`\`

## CSS Styling

\`\`\`css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
\`\`\`

## Conclusion

You've built a beautiful glassmorphism login form!
`
  },
  tutorial: {
    filename: 'sample-tutorial.mdx',
    content: `---
# ╔══════════════════════════════════════════════════════════╗
# ║        CODESCOMPILER — TUTORIAL FORMAT GUIDE             ║
# ╚══════════════════════════════════════════════════════════╝
#
# FILE LOCATION: src/content/tutorials/your-tutorial-slug.mdx
# FILE FORMAT  : MDX (Markdown + optional <Editor /> component)
# URL will be  : /tutorial/your-tutorial-slug/
#
# ┌──────────────────────────────────────────────────────────┐
# │ REQUIRED FIELDS (must not be empty)                      │
# └──────────────────────────────────────────────────────────┘

title: "CSS Flexbox Layout"
# ↑ REQUIRED. Short, clear lesson title.

description: "Learn how CSS Flexbox works to create flexible, responsive one-dimensional layouts for rows and columns."
# ↑ REQUIRED. One sentence describing what the student will learn.

category: "css"
# ↑ REQUIRED. MUST be EXACTLY one of these values (lowercase):
#   "html"  "css"  "javascript"  "seo"  "python"  "sql"  "php"
# ↑ Any other value will cause a BUILD ERROR.

order: 12
# ↑ REQUIRED. Integer. Controls the order in the tutorial sidebar.
#   Lower numbers appear first. Use gaps (10, 20, 30) to allow easy insertion.

# ┌──────────────────────────────────────────────────────────┐
# │ OPTIONAL FIELDS                                          │
# └──────────────────────────────────────────────────────────┘

group: "Box Model & Layout"
# ↑ Groups lessons under a section header in the sidebar.

seoTitle: "CSS Flexbox Tutorial — Complete Guide with Examples"
# ↑ Override the page <title> for Google (keep under 60 chars).

permalink: "css-flexbox-layout"
# ↑ Custom URL slug. If omitted, the filename is used.
---

## What is Flexbox?

CSS Flexbox (Flexible Box Layout) is a layout method for arranging items in rows or columns.

### Setting Up Flex Container

To use flexbox, add \`display: flex\` to the parent element.

<Editor
  initialHtml={\`<div class="container">
  <div class="box">1</div>
  <div class="box">2</div>
  <div class="box">3</div>
</div>\`}
  initialCss={\`.container {
  display: flex;
  gap: 10px;
  background: #f0f0f0;
  padding: 10px;
}
.box {
  background: #04AA6D;
  color: white;
  padding: 20px;
  font-size: 18px;
}\`}
/>

### Flex Direction

Use \`flex-direction\` to switch between row (default) and column layouts.

\`\`\`css
.container {
  display: flex;
  flex-direction: column; /* row | column | row-reverse | column-reverse */
}
\`\`\`

## Summary

| Property | Values | Description |
| :--- | :--- | :--- |
| flex-direction | row, column | Main axis direction |
| justify-content | flex-start, center, space-between | Main axis alignment |
| align-items | flex-start, center, stretch | Cross axis alignment |
`
  },
  page: {
    filename: 'sample-page.astro',
    content: `---
// ╔══════════════════════════════════════════════════════════╗
// ║          CODESCOMPILER — PAGE FORMAT GUIDE               ║
// ╚══════════════════════════════════════════════════════════╝
//
// FILE LOCATION : src/pages/your-page-name.astro
// FILE FORMAT   : Astro Component (.astro)
// URL will be   : /your-page-name/
//
// RULES:
//   - Always import BaseLayout from '../layouts/BaseLayout.astro'
//   - The <BaseLayout> title and description are REQUIRED for SEO
//   - The file name becomes the URL slug (use lowercase, hyphens only)
//   - Do NOT use spaces or underscores in filenames

import BaseLayout from '../layouts/BaseLayout.astro';

// You can fetch data or do server-side logic here
const pageTitle = "About Us";
const pageDescription = "Learn about CodesCompiler and our mission to make web development accessible to everyone.";
---

<!--
  ↑ Everything between --- and --- is the "frontmatter" (server-side JS)
  ↓ Everything below is your HTML template
-->

<BaseLayout title={pageTitle} description={pageDescription}>
  <!--
    IMPORTANT: Always wrap your content in a max-width container.
    Use Tailwind classes for styling.
  -->
  <div class="max-w-screen-xl mx-auto px-5 py-12">

    <!-- Page Header -->
    <h1 class="text-4xl font-bold text-gray-900 mb-6">{pageTitle}</h1>

    <!-- Main Content -->
    <div class="prose max-w-none">
      <p class="text-lg text-gray-600 mb-4">
        Welcome to CodesCompiler! We are dedicated to helping developers
        learn web technologies through hands-on tutorials and examples.
      </p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
      <p>
        To make web development education free, accessible, and practical
        for developers at every skill level.
      </p>

      <!-- Example of a styled card section -->
      <div class="grid md:grid-cols-3 gap-6 mt-8">
        <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 class="font-bold text-lg mb-2">📖 Tutorials</h3>
          <p class="text-gray-600">Step-by-step lessons for HTML, CSS, JavaScript, Python, SQL, and PHP.</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 class="font-bold text-lg mb-2">💻 Live Editor</h3>
          <p class="text-gray-600">Practice code directly in the browser with our built-in live editor.</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 class="font-bold text-lg mb-2">🆓 Free Forever</h3>
          <p class="text-gray-600">All content is completely free. No sign-up required to start learning.</p>
        </div>
      </div>
    </div>

  </div>
</BaseLayout>
`
  },
  book: {
    filename: 'sample-book.json',
    content: `{
  "$$comment": "╔══════════════════════════════════════════════════════════╗",
  "$$comment2": "║         CODESCOMPILER — BOOK FORMAT GUIDE                ║",
  "$$comment3": "╚══════════════════════════════════════════════════════════╝",
  "$$comment4": "FILE LOCATION: src/data/books/your-book-slug.json",
  "$$comment5": "FILE FORMAT  : JSON (remove all lines starting with $$comment before uploading)",

  "title": "JavaScript: The Complete Guide",
  "description": "A comprehensive guide covering everything from basic syntax to advanced concepts like closures, async/await, and the event loop.",
  "author": "CodesCompiler",
  "date": "2026-09-14",
  "category": "JavaScript",
  "tags": ["javascript", "beginner", "advanced", "es6"],
  "coverImage": "/images/books/javascript-complete-guide.png",
  "slug": "javascript-complete-guide",
  "status": "published",
  "featured": false,
  "chapters": [
    {
      "order": 1,
      "title": "Getting Started",
      "description": "Introduction to JavaScript and setting up your environment",
      "url": "/tutorial/javascript-introduction/"
    },
    {
      "order": 2,
      "title": "Variables & Data Types",
      "description": "Learn about var, let, const and JavaScript data types",
      "url": "/tutorial/js-variables/"
    },
    {
      "order": 3,
      "title": "Functions",
      "description": "Declaring and calling functions, arrow functions, callbacks",
      "url": "/tutorial/js-functions/"
    }
  ],
  "meta": {
    "totalChapters": 3,
    "difficulty": "Beginner to Advanced",
    "estimatedTime": "8 hours"
  }
}`
  }
};

// Renders the collapsible upload panel for a given content type
function renderUploadPanel(type) {
  const labels = {
    blog:     { icon: '📝', name: 'Blog Post',  ext: '.mdx',   accept: '.mdx,.md' },
    tutorial: { icon: '📖', name: 'Tutorial',   ext: '.mdx',   accept: '.mdx,.md' },
    page:     { icon: '📄', name: 'Page',       ext: '.astro', accept: '.astro' },
    book:     { icon: '📚', name: 'Book',       ext: '.json',  accept: '.json' }
  };
  const l = labels[type];
  const sample = SAMPLES[type] ? SAMPLES[type].content : '';

  return `
  <div class="card" style="margin-top:24px;border:1px solid #c3c4c7;border-radius:4px;" id="upload-panel-${type}">
    <div class="ch" style="cursor:pointer;user-select:none;background:#f6f7f7;padding:12px 16px;" onclick="toggleUploadPanel('${type}')">
      <h3 style="font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px;">
        📥 Import &amp; Upload ${l.name} Files
      </h3>
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="btn bp bs" onclick="event.stopPropagation();downloadSample('${type}')">
          ⬇️ Download Sample ${l.ext} Template
        </button>
        <span id="upload-toggle-${type}" style="color:var(--dim);font-size:13px;">▲ Collapse</span>
      </div>
    </div>

    <div id="upload-body-${type}" style="display:block;padding:20px;background:#fff;">
      
      <!-- Template Format Instructions -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:10px;">
          <h4 style="font-size:13px;font-weight:700;color:#1e293b;margin:0;">📋 Required File Format Guide (${l.ext})</h4>
          <button class="btn bg bs" onclick="downloadSample('${type}')">⬇️ Download Sample ${l.ext} Template File</button>
        </div>
        <p style="font-size:12px;color:#646970;margin-bottom:10px;">
          Files must follow the format shown below. Download the sample template to inspect required frontmatter metadata headers before uploading.
        </p>
        <pre style="background:#1e293b;color:#f8fafc;padding:12px;border-radius:4px;font-size:12px;max-height:240px;overflow-y:auto;font-family:monospace;margin:0;white-space:pre-wrap;"><code>${esc(sample.slice(0, 950))}${sample.length > 950 ? '\n...\n[Download template file to view full sample code]' : ''}</code></pre>
      </div>

      <!-- Drag & Drop Upload Zone -->
      <div id="dropzone-${type}"
        style="border:2px dashed #2271b1;border-radius:8px;padding:36px 20px;text-align:center;cursor:pointer;background:rgba(34,113,177,.03);transition:all 0.2s;"
        ondragover="event.preventDefault();this.style.borderColor='#135e96';this.style.background='rgba(34,113,177,.08)';"
        ondragleave="this.style.borderColor='#2271b1';this.style.background='rgba(34,113,177,.03)';"
        ondrop="handleFileDrop(event,'${type}')"
        onclick="document.getElementById('fileInput-${type}').click()">
        <div style="font-size:38px;margin-bottom:6px;">📁</div>
        <div style="font-weight:700;font-size:15px;color:#1d2327;margin-bottom:4px;">Drag &amp; drop your ${l.ext} files here to import</div>
        <div style="font-size:12px;color:#646970;">Or click to browse from your computer · Accepted: ${l.accept}</div>
      </div>
      <input type="file" id="fileInput-${type}" accept="${l.accept}" multiple style="display:none;" 
        onchange="handleFileInputChange(this,'${type}')">
      
      <!-- Upload results -->
      <div id="upload-results-${type}" style="margin-top:14px;"></div>
    </div>
  </div>`;
}

window.toggleUploadPanel = function(type) {
  const body = $('upload-body-' + type);
  const toggle = $('upload-toggle-' + type);
  if (!body) return;
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? 'block' : 'none';
  if (toggle) toggle.textContent = isHidden ? '▲ Collapse' : '▼ Expand';
};

window.downloadSample = function(type) {
  const s = SAMPLES[type];
  if (!s) return;
  const blob = new Blob([s.content], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = s.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  toast('Sample file downloaded! 📄 Open it, fill in your content, then upload it back here.');
};

window.handleFileDrop = function(e, type) {
  e.preventDefault();
  const dz = $('dropzone-' + type);
  if (dz) { dz.style.borderColor = '#2271b1'; dz.style.background = 'rgba(34,113,177,.03)'; }
  const files = Array.from(e.dataTransfer.files);
  stageUploadFiles(files, type);
};

window.handleFileInputChange = function(input, type) {
  const files = Array.from(input.files);
  stageUploadFiles(files, type);
  input.value = '';
};

function stageUploadFiles(files, type) {
  if (!files.length) return;
  stagedUploads[type] = files;
  renderStagedUploadsUI(type);
  toast('Selected ' + files.length + ' file' + (files.length > 1 ? 's' : '') + ' ready to upload! 📦 Review below and click Submit.');
}

function renderStagedUploadsUI(type) {
  const files = stagedUploads[type] || [];
  const resultsEl = $('upload-results-' + type);
  if (!resultsEl) return;
  if (!files.length) {
    resultsEl.innerHTML = '';
    return;
  }

  const allowedExt = { blog: ['.mdx','.md'], tutorial: ['.mdx','.md'], page: ['.astro'], book: ['.json'] };
  const typeLabel = { blog: 'Blog Posts', tutorial: 'Tutorials', page: 'Pages', book: 'Books' }[type] || 'Files';

  let html = `
    <div style="border:1px solid #2271b1;border-radius:6px;background:#fff;margin-top:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
      <div style="background:#f0f6fc;border-bottom:1px solid #bae6fd;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="font-weight:700;font-size:15px;color:#0369a1;display:flex;align-items:center;gap:6px;">
            <span>📦 Selected ${files.length} ${typeLabel} for Upload</span>
          </div>
          <div style="font-size:12px;color:#475569;margin-top:3px;">
            Review your files below. Click <strong>Submit Uploads</strong> to process and save them one by one.
          </div>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn bp" id="btn-submit-upload-${type}" onclick="startSequentialUpload('${type}')" style="font-size:14px;padding:8px 16px;">
            🚀 Submit All (${files.length} Files)
          </button>
          <button class="btn bg bs" id="btn-cancel-upload-${type}" onclick="clearStagedUploads('${type}')" style="font-size:13px;">
            ✕ Clear Selection
          </button>
        </div>
      </div>

      <!-- Live Progress Bar -->
      <div id="progress-bar-container-${type}" style="display:none;padding:14px 18px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#1e293b;margin-bottom:8px;">
          <span id="progress-text-${type}">Preparing upload...</span>
          <span id="progress-percent-${type}" style="color:#0284c7;">0%</span>
        </div>
        <div style="background:#e2e8f0;border-radius:10px;height:12px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);">
          <div id="progress-fill-${type}" style="width:0%;height:100%;background:linear-gradient(90deg, #0284c7 0%, #04AA6D 100%);transition:width 0.15s ease;"></div>
        </div>
      </div>

      <!-- Staged Files Item List -->
      <div style="max-height:360px;overflow-y:auto;" id="staged-file-list-${type}">
  `;

  files.forEach((file, idx) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const isAllowed = allowedExt[type].includes(ext);
    const sizeKb = (file.size / 1024).toFixed(1);
    
    html += `
      <div id="staged-item-${type}-${idx}" style="padding:10px 18px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;background:${isAllowed ? '#fff' : '#fff5f5'};">
        <div style="display:flex;align-items:center;gap:12px;overflow:hidden;margin-right:12px;">
          <span id="staged-status-icon-${type}-${idx}" style="font-size:18px;">📄</span>
          <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            <div style="font-weight:600;font-size:13px;color:#1e293b;">${esc(file.name)} <span style="font-size:11px;color:#64748b;font-weight:normal;">(${sizeKb} KB)</span></div>
            <div id="staged-status-text-${type}-${idx}" style="font-size:11px;color:${isAllowed ? '#64748b' : '#e11d48'};">
              ${isAllowed ? 'Ready to upload' : `Unsupported file format (Expected ${allowedExt[type].join(' or ')})`}
            </div>
          </div>
        </div>
        <div id="staged-status-badge-${type}-${idx}" style="flex-shrink:0;">
          ${isAllowed ? '<span class="badge" style="background:#f1f5f9;color:#475569;">Queued</span>' : '<span class="badge" style="background:#ffe4e6;color:#e11d48;">Invalid Format</span>'}
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  resultsEl.innerHTML = html;
  const body = $('upload-body-' + type);
  if (body) body.style.display = 'block';
  resultsEl.scrollIntoView({ behavior: 'smooth' });
}

window.clearStagedUploads = function(type) {
  stagedUploads[type] = [];
  const resultsEl = $('upload-results-' + type);
  if (resultsEl) resultsEl.innerHTML = '';
  toast('File selection cleared');
};

async function startSequentialUpload(type) {
  const files = stagedUploads[type] || [];
  if (!files.length) return;

  const btnSubmit = $('btn-submit-upload-' + type);
  const btnCancel = $('btn-cancel-upload-' + type);
  if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.innerHTML = '⏳ Submitting &amp; Updating Pages...'; }
  if (btnCancel) { btnCancel.style.display = 'none'; }

  const progressBar = $('progress-bar-container-' + type);
  const progressText = $('progress-text-' + type);
  const progressPercent = $('progress-percent-' + type);
  const progressFill = $('progress-fill-' + type);
  if (progressBar) progressBar.style.display = 'block';

  const allowedExt = { blog: ['.mdx','.md'], tutorial: ['.mdx','.md'], page: ['.astro'], book: ['.json'] };
  const apiMap    = { blog: '/api/blogs/save', tutorial: '/api/tutorials/save', page: '/api/pages/save', book: '/api/books/save' };

  let okCount = 0;
  let failCount = 0;
  const total = files.length;
  const confirmationList = [];

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const itemText = $('staged-status-text-' + type + '-' + i);
    const itemIcon = $('staged-status-icon-' + type + '-' + i);
    const itemBadge = $('staged-status-badge-' + type + '-' + i);
    const itemRow = $('staged-item-' + type + '-' + i);

    const currentNum = i + 1;
    const pct = Math.round((currentNum / total) * 100);
    if (progressText) progressText.textContent = 'Submitting page ' + currentNum + ' of ' + total + ': ' + file.name;
    if (progressPercent) progressPercent.textContent = pct + '%';
    if (progressFill) progressFill.style.width = pct + '%';

    if (itemRow) {
      itemRow.style.background = '#f0f9ff';
      itemRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    if (itemIcon) itemIcon.textContent = '⏳';
    if (itemBadge) itemBadge.innerHTML = '<span class="badge" style="background:#e0f2fe;color:#0369a1;">Submitting...</span>';

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExt[type].includes(ext)) {
      failCount++;
      if (itemIcon) itemIcon.textContent = '❌';
      if (itemText) { itemText.textContent = 'Wrong file type. Expected: ' + allowedExt[type].join(' or '); itemText.style.color = '#b91c1c'; }
      if (itemBadge) itemBadge.innerHTML = '<span class="badge" style="background:#fee2e2;color:#991b1b;">Failed</span>';
      if (itemRow) itemRow.style.background = '#fff5f5';
      confirmationList.push({ file: file.name, title: file.name, ok: false, error: 'Invalid file format' });
      continue;
    }

    try {
      const content = await file.text();
      let extractedTitle = file.name;
      const tm = content.match(/^title:\s*["']?([^"\n\r]+)["']?/m);
      if (tm && tm[1]) extractedTitle = tm[1].trim();

      const errs = validateContentFile(type, content, file.name);

      if (errs.length) {
        failCount++;
        if (itemIcon) itemIcon.textContent = '❌';
        if (itemText) { itemText.textContent = 'Validation error: ' + errs.join(' · '); itemText.style.color = '#b91c1c'; }
        if (itemBadge) itemBadge.innerHTML = '<span class="badge" style="background:#fee2e2;color:#991b1b;">Validation Error</span>';
        if (itemRow) itemRow.style.background = '#fff5f5';
        confirmationList.push({ file: file.name, title: extractedTitle, ok: false, error: errs.join(' · ') });
        continue;
      }

      const payload = { filename: file.name, content };
      const r = await post(apiMap[type], payload);

      if (r.ok !== false) {
        okCount++;
        if (itemIcon) itemIcon.textContent = '✅';
        if (itemText) { itemText.textContent = 'Updation Confirmed & Published ✅ (' + extractedTitle + ')'; itemText.style.color = '#15803d'; }
        if (itemBadge) itemBadge.innerHTML = '<span class="badge bpub">Confirmed ✅</span>';
        if (itemRow) itemRow.style.background = '#f0fdf4';
        confirmationList.push({ file: file.name, title: extractedTitle, ok: true });
      } else {
        failCount++;
        if (itemIcon) itemIcon.textContent = '❌';
        if (itemText) { itemText.textContent = r.error || 'Server save failed'; itemText.style.color = '#b91c1c'; }
        if (itemBadge) itemBadge.innerHTML = '<span class="badge" style="background:#fee2e2;color:#991b1b;">Server Error</span>';
        if (itemRow) itemRow.style.background = '#fff5f5';
        confirmationList.push({ file: file.name, title: extractedTitle, ok: false, error: r.error || 'Server error' });
      }
    } catch (err) {
      failCount++;
      if (itemIcon) itemIcon.textContent = '❌';
      if (itemText) { itemText.textContent = 'Read error: ' + err.message; itemText.style.color = '#b91c1c'; }
      if (itemBadge) itemBadge.innerHTML = '<span class="badge" style="background:#fee2e2;color:#991b1b;">Read Error</span>';
      if (itemRow) itemRow.style.background = '#fff5f5';
      confirmationList.push({ file: file.name, title: file.name, ok: false, error: err.message });
    }

    await new Promise(res => setTimeout(res, 50));
  }

  if (progressText) progressText.textContent = 'Completed! Updation confirmed for ' + okCount + ' of ' + total + ' pages.';
  if (progressPercent) progressPercent.textContent = '100%';
  if (progressFill) progressFill.style.width = '100%';

  if (btnSubmit) {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '✅ Updation Complete (' + okCount + ' Published, ' + failCount + ' Failed)';
    btnSubmit.style.background = okCount > 0 ? '#15803d' : '#b91c1c';
  }

  if (okCount > 0) {
    await loadAll();
    if (type === 'blog') applyBlogFilters();
    else if (type === 'tutorial') applyTutFilters();
  }

  renderUploadConfirmationReport(type, confirmationList, okCount, failCount);

  if (okCount > 0 && failCount === 0) {
    toast('🎉 Updation Confirmed! All ' + okCount + ' pages published successfully.');
  } else if (okCount > 0 && failCount > 0) {
    toast('Updation Confirmed for ' + okCount + ' pages (' + failCount + ' failed).', false);
  } else {
    toast('Submission failed for all ' + failCount + ' files.', false);
  }
}

function renderUploadConfirmationReport(type, confirmationList, okCount, failCount) {
  const existing = $('upload-confirmation-summary-' + type);
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'upload-confirmation-summary-' + type;
  container.style.marginTop = '16px';
  container.style.marginBottom = '16px';
  container.style.padding = '16px';
  container.style.background = okCount > 0 ? '#f0fdf4' : '#fff5f5';
  container.style.border = okCount > 0 ? '1px solid #86efac' : '1px solid #fca5a5';
  container.style.borderRadius = '6px';

  let listItems = '';
  confirmationList.forEach((item, idx) => {
    listItems += `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:${idx === confirmationList.length - 1 ? 'none' : '1px solid #e2e8f0'};">
        <div style="overflow:hidden;margin-right:12px;">
          <span style="font-weight:600;font-size:13px;color:#1e293b;">${idx + 1}. ${esc(item.title)}</span>
          <span style="font-size:11px;color:#64748b;margin-left:6px;">(${esc(item.file)})</span>
          ${item.error ? `<div style="font-size:11px;color:#b91c1c;margin-top:2px;">Error: ${esc(item.error)}</div>` : ''}
        </div>
        <div style="flex-shrink:0;">
          ${item.ok 
            ? '<span class="badge bpub" style="font-size:11px;padding:3px 8px;">✅ Updation Confirmed</span>' 
            : '<span class="badge" style="background:#fee2e2;color:#991b1b;font-size:11px;padding:3px 8px;">❌ Failed</span>'}
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
      <div>
        <h4 style="font-size:15px;font-weight:700;color:${okCount > 0 ? '#166534' : '#991b1b'};margin:0 0 4px;display:flex;align-items:center;gap:8px;">
          <span>🎉 Updation Confirmation Report</span>
        </h4>
        <div style="font-size:12px;color:#15803d;">
          Processed ${confirmationList.length} page(s): <strong>${okCount} Confirmed &amp; Published</strong> ${failCount > 0 ? `<span style="color:#b91c1c">(${failCount} Failed)</span>` : ''}
        </div>
      </div>
      <button class="btn bg bs" onclick="clearStagedUploads('${type}')" style="font-size:12px;">✕ Done / Clear Report</button>
    </div>
    <div style="background:#fff;border:1px solid ${okCount > 0 ? '#bbf7d0' : '#fecaca'};border-radius:4px;max-height:260px;overflow-y:auto;">
      ${listItems}
    </div>
  `;

  const resultsEl = $('upload-results-' + type);
  if (resultsEl) {
    resultsEl.prepend(container);
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function validateContentFile(type, content, filename) {
  const errs = [];

  if (type === 'book') {
    // JSON validation
    try {
      const data = JSON.parse(content);
      if (!data.title)       errs.push('"title" is required');
      if (!data.description) errs.push('"description" is required');
    } catch(e) {
      errs.push('Invalid JSON: ' + e.message);
    }
    return errs;
  }

  if (type === 'page') {
    // .astro — just check it's not empty and has BaseLayout
    if (!content.trim()) errs.push('File is empty');
    if (!content.includes('BaseLayout')) errs.push('Page must import and use BaseLayout');
    return errs;
  }

  // MDX (blog / tutorial) — validate frontmatter
  const norm  = content.replace(/\r\n/g, '\n');
  const match = norm.match(/^---\n([\s\S]*?)\n---/);
  if (!match) { errs.push('Missing frontmatter (the --- block at the top)'); return errs; }

  const fm = parseFM(content);

  if (!fm.title)       errs.push('"title" is required');
  if (!fm.description) errs.push('"description" is required');

  if (type === 'blog') {
    if (!fm.date) errs.push('"date" is required (format: YYYY-MM-DD)');
    if (!fm.category) {
      errs.push('"category" is required');
    } else if (!BCAT.includes(fm.category)) {
      errs.push(`Invalid category "${fm.category}". Must be one of: ${BCAT.join(', ')}`);
    }
  }

  if (type === 'tutorial') {
    if (!fm.category) {
      errs.push('"category" is required');
    } else if (!TCAT.includes(fm.category)) {
      errs.push(`Invalid category "${fm.category}". Must be one of: ${TCAT.join(', ')}`);
    }
    if (!fm.order && fm.order !== 0) errs.push('"order" is required (a number)');
  }

  return errs;
}

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
  const content = '---\ntitle: "' + t + '"\ndate: "' + d + '"\ndraft: true\n---\n\n' + c;
  await post('/api/blogs/save', { filename: slug+'.mdx', content });
  $('qd_title').value = '';
  $('qd_content').value = '';
  toast('Draft saved! 📝');
  await loadAll();
}

// ══ TUTORIALS ══
let tutFilters = { q: '', cat: '' };
let tutPagination = { page: 1, pageSize: 10 };
let selectedTuts = new Set();
let currentTutFiles = [];

function renderTuts(){
  $('ptitle').textContent='Tutorials';
  $('tact').innerHTML=`<button class="btn bp" onclick="newTut()">+ Add New Tutorial</button><button class="btn bg" style="margin-left:8px;" onclick="toggleUploadPanel('tutorial'); document.getElementById('upload-panel-tutorial').scrollIntoView({behavior:'smooth'})">📥 Import &amp; Upload</button>`;
  
  let h = `
    <div style="display:flex;gap:12px;margin-bottom:14px;background:#fff;padding:14px;border-radius:4px;border:1px solid #c3c4c7;align-items:center;flex-wrap:wrap">
      <div style="font-size:13px;font-weight:600;color:#3c434a;margin-right:2px">🔍 Filter Tutorials:</div>
      <input class="input-text" placeholder="Search by title..." oninput="tutFilterChange('q', this.value)" style="width:220px" value="${esc(tutFilters.q)}">
      <select class="input-text" onchange="tutFilterChange('cat', this.value)" style="width:160px">
        <option value="">All Categories</option>
        ${TCAT.map(c => `<option value="${c}" ${tutFilters.cat===c?'selected':''}>${CATNAME[c]||c}</option>`).join('')}
      </select>
      <div style="display:flex;align-items:center;gap:6px;margin-left:auto;">
        <span style="font-size:12px;font-weight:600;color:#646970;">Show per page:</span>
        <select class="input-text" onchange="tutPageSizeChange(this.value)" style="width:85px">
          <option value="10" ${tutPagination.pageSize===10?'selected':''}>10</option>
          <option value="30" ${tutPagination.pageSize===30?'selected':''}>30</option>
          <option value="50" ${tutPagination.pageSize===50?'selected':''}>50</option>
          <option value="all" ${tutPagination.pageSize==='all'?'selected':''}>All</option>
        </select>
      </div>
      ${(tutFilters.q||tutFilters.cat) ? `<button class="btn bg bs" onclick="tutFilters={q:'',cat:''};tutPagination.page=1;renderTuts()">Clear Filters</button>` : ''}
    </div>
    <div id="tut_bulk_bar" style="margin-bottom:14px;"></div>
    <div id="tut_table_container"></div>
    ${renderUploadPanel('tutorial')}
  `;
  $('content').innerHTML=h;
  applyTutFilters();
}

function tutPageSizeChange(val) {
  tutPagination.pageSize = val === 'all' ? 'all' : (parseInt(val, 10) || 10);
  tutPagination.page = 1;
  applyTutFilters();
}

function tutGoToPage(p) {
  tutPagination.page = p;
  applyTutFilters();
}

function updateTutBulkBar() {
  const bar = $('tut_bulk_bar');
  if(!bar) return;
  if(selectedTuts.size === 0) {
    bar.style.display = 'none';
    bar.innerHTML = '';
    return;
  }
  bar.style.display = 'block';
  bar.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;background:#e7f3ff;border:1px solid #2271b1;padding:10px 14px;border-radius:4px;">
      <span style="font-weight:600;color:#1d2327;font-size:13px;">📌 ${selectedTuts.size} tutorial(s) selected</span>
      <div style="display:flex;gap:8px;margin-left:auto;">
        <button class="btn" style="background:#2271b1;color:#fff;" onclick="bulkEditTutsModal()">🏷️ Bulk Edit Category / Author</button>
        <button class="btn" style="background:#d63638;color:#fff;" onclick="bulkDeleteTuts()">🗑️ Bulk Move to Trash</button>
        <button class="btn bg" onclick="clearTutSelection()">Clear Selection</button>
      </div>
    </div>
  `;
}

function toggleSelectAllTuts(checked) {
  if(checked) {
    currentTutFiles.forEach(f => selectedTuts.add(f));
  } else {
    currentTutFiles.forEach(f => selectedTuts.delete(f));
  }
  updateTutBulkBar();
  document.querySelectorAll('.tut-cb').forEach(cb => cb.checked = checked);
}

function toggleTutSelect(file, checked) {
  if(checked) selectedTuts.add(file);
  else selectedTuts.delete(file);
  
  const selectAllCb = $('tut_select_all');
  if(selectAllCb) {
    selectAllCb.checked = currentTutFiles.length > 0 && currentTutFiles.every(f => selectedTuts.has(f));
  }
  updateTutBulkBar();
}

function clearTutSelection() {
  selectedTuts.clear();
  const selectAllCb = $('tut_select_all');
  if(selectAllCb) selectAllCb.checked = false;
  document.querySelectorAll('.tut-cb').forEach(cb => cb.checked = false);
  updateTutBulkBar();
}

function tutFilterChange(key, val) {
  tutFilters[key] = val;
  tutPagination.page = 1;
  applyTutFilters();
  if(key === 'q') applyTutFilters(); else renderTuts();
}

function applyTutFilters() {
  const q = tutFilters.q.toLowerCase();
  const f = tutorials.filter(t => {
    if (q && !(t.title||'').toLowerCase().includes(q)) return false;
    if (tutFilters.cat && t.category !== tutFilters.cat) return false;
    return true;
  });
  showTuts(f);
}

function showTuts(f){
  const totalItems = f.length;
  const pageSize = tutPagination.pageSize === 'all' ? (totalItems || 1) : (tutPagination.pageSize || 10);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  if (tutPagination.page > totalPages) tutPagination.page = totalPages;
  if (tutPagination.page < 1) tutPagination.page = 1;
  const currentPage = tutPagination.page;

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const pagedItems = f.slice(startIdx, endIdx);

  currentTutFiles = pagedItems.map(t => t.file);
  const allSelected = currentTutFiles.length > 0 && currentTutFiles.every(file => selectedTuts.has(file));
  
  let h='';

  const renderPaginationControls = () => {
    if (totalItems === 0) return '';
    
    let btns = '';
    btns += `<button class="btn bg bs" ${currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="tutGoToPage(${currentPage - 1})">‹ Prev</button>`;
    
    let startP = Math.max(1, currentPage - 2);
    let endP = Math.min(totalPages, startP + 4);
    if (endP - startP < 4) startP = Math.max(1, endP - 4);

    for (let p = startP; p <= endP; p++) {
      btns += `<button class="btn ${p === currentPage ? 'bp' : 'bg bs'}" style="min-width:32px;padding:4px 8px;" onclick="tutGoToPage(${p})">${p}</button>`;
    }
    
    btns += `<button class="btn bg bs" ${currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="tutGoToPage(${currentPage + 1})">Next ›</button>`;

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-top:1px solid #c3c4c7;border-bottom-left-radius:4px;border-bottom-right-radius:4px;flex-wrap:wrap;gap:10px;">
        <div style="font-size:12px;color:#646970;">
          Showing <strong>${totalItems > 0 ? startIdx + 1 : 0}</strong> to <strong>${endIdx}</strong> of <strong>${totalItems}</strong> tutorials (Page ${currentPage} of ${totalPages})
        </div>
        <div style="display:flex;gap:4px;align-items:center;">
          ${btns}
        </div>
      </div>
    `;
  };

  h+=`<div class="card" style="margin-bottom:0;border-bottom-left-radius:0;border-bottom-right-radius:0;"><table><thead><tr>
    <th style="width:36px;text-align:center;"><input type="checkbox" id="tut_select_all" ${allSelected?'checked':''} onchange="toggleSelectAllTuts(this.checked)"></th>
    <th style="width:40px">#</th>
    <th>Title</th>
    <th>Language</th>
    <th>Lesson #</th>
    <th>File</th>
  </tr></thead><tbody>`;
  if(!pagedItems.length) h+=`<tr><td colspan="6" class="empty">No tutorials found</td></tr>`;
  pagedItems.forEach((t,i)=>{
    const itemNum = startIdx + i + 1;
    const slug = t.file.replace(/\.mdx?$/, '');
    const isSelected = selectedTuts.has(t.file);
    h+=`<tr style="${isSelected?'background:#f0f6fc;':''}">
      <td style="text-align:center;"><input type="checkbox" class="tut-cb" value="${esc(t.file)}" ${isSelected?'checked':''} onchange="toggleTutSelect('${esc(t.file)}', this.checked)"></td>
      <td>${itemNum}</td>
      <td>
        <strong>${esc(t.title)}</strong>
        <div class="row-actions" style="font-size:12px; margin-top:4px;">
          <a href="#" style="color:#2271b1; text-decoration:none;" onclick="event.preventDefault(); editTut('${esc(t.file)}')">Edit</a> <span style="color:#ddd">|</span> 
          <a href="#" style="color:#d63638; text-decoration:none;" onclick="event.preventDefault(); delTut('${esc(t.file)}')">Trash</a> <span style="color:#ddd">|</span> 
          <a href="/tutorial/${slug}/" target="_blank" style="color:#2271b1; text-decoration:none;">View</a>
        </div>
      </td>
      <td><span class="badge ${CB[t.category]||'bdf'}">${CATNAME[t.category]||esc(t.category||'?')}</span></td>
      <td>${t.order||'-'}</td>
      <td style="color:var(--dim);font-size:12px">${esc(t.file)}</td>
    </tr>`;
  });
  h+=`</tbody></table></div>`;
  h+=renderPaginationControls();
  const cont = $('tut_table_container');
  if(cont) cont.innerHTML=h;
  updateTutBulkBar();
}

async function bulkDeleteTuts() {
  if(selectedTuts.size === 0) return;
  const count = selectedTuts.size;
  openConfirm(`Are you sure you want to move ${count} selected tutorial(s) to Trash?`, async () => {
    try {
      const res = await post('/api/tutorials/bulk-delete', { filenames: Array.from(selectedTuts) });
      if(res.ok) {
        toast(`Successfully moved ${res.count || count} tutorial(s) to Trash! 🗑️`);
        selectedTuts.clear();
        await loadAll();
        renderTuts();
      } else {
        toast(res.error || 'Failed to delete selected tutorials', false);
      }
    } catch(err) {
      toast('Error performing bulk delete: ' + err.message, false);
    }
  });
}

function bulkEditTutsModal() {
  if(selectedTuts.size === 0) return;
  const count = selectedTuts.size;
  const bodyHtml = `
    <div style="padding:10px 0;">
      <p style="margin-bottom:14px;color:#3c434a;font-size:14px;">Updating <strong>${count} selected tutorial(s)</strong>. Leave any field blank to keep existing value.</p>
      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#3c434a;">Change Language / Category</label>
        <select id="bulk_tut_cat" class="input-text" style="width:100%;">
          <option value="">-- No Change --</option>
          ${TCAT.map(c => `<option value="${c}">${CATNAME[c] || c}</option>`).join('')}
        </select>
      </div>
      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#3c434a;">Change Author</label>
        <input id="bulk_tut_author" class="input-text" style="width:100%;" placeholder="e.g. CodesCompiler or leave blank">
      </div>
    </div>
  `;
  openEditor('Bulk Edit (' + count + ' Tutorials)', bodyHtml, async () => {
    const cat = $('bulk_tut_cat').value;
    const author = $('bulk_tut_author').value.trim();
    if(!cat && !author) {
      toast('No changes selected', false);
      return;
    }
    try {
      const res = await post('/api/tutorials/bulk-edit', {
        filenames: Array.from(selectedTuts),
        category: cat || undefined,
        author: author || undefined
      });
      if(res.ok) {
        toast('Successfully updated ' + (res.count || count) + ' tutorial(s)! 🎉');
        selectedTuts.clear();
        closeModal();
        await loadAll();
        renderTuts();
      } else {
        toast(res.error || 'Failed to edit tutorials', false);
      }
    } catch(err) {
      toast('Error performing bulk edit: ' + err.message, false);
    }
  });
}

function tutForm(t={}){
  return `<div style="display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;">
    <div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#3c434a;">Title</label>
        <input id="tf_t" value="${esc(t.title||'')}" placeholder="Add tutorial title..." style="width:100%;font-size:20px;font-weight:bold;padding:10px 12px;border:1px solid #8c8f94;border-radius:3px;">
      </div>
      <div class="tab-row"><div class="tab-item on" onclick="showEditorTab(this,'tf_editor')">✏️ Write</div><div class="tab-item" onclick="showPreviewTab(this,'tf_editor','tf_preview')">👁️ Preview</div></div>
      <div id="tf_editor">${editorToolbar('tf_b')}<textarea class="editor" id="tf_b" style="min-height:550px;" placeholder="Start writing your tutorial content here..."></textarea></div>
      <div id="tf_preview" style="display:none"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">📌 Publish &amp; Status</div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:12px;">
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Status</label>
            <select id="tf_status" class="input-text" style="width:100%;"><option value="publish">✅ Published</option><option value="draft">📝 Draft</option><option value="schedule">⏰ Schedule</option></select>
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Publish Date</label>
            <input id="tf_dt" type="date" class="input-text" style="width:100%;" value="${t.date||new Date().toISOString().split('T')[0]}">
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Author</label>
            <input id="tf_au" class="input-text" style="width:100%;" value="${esc(t.author||'CodesCompiler')}">
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Lesson Order</label>
            <input id="tf_o" type="number" class="input-text" style="width:100%;" value="${t.order||1}" min="1">
          </div>
        </div>
      </div>
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">🖼️ Featured Image</div>
        <div style="padding:14px;">
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Image Path / URL</label>
          <input id="tf_img" class="input-text" style="width:100%;" value="${esc(t.image||'')}" placeholder="/images/posts/sample.png" oninput="if($('tf_img_preview'))$('tf_img_preview').src=this.value">
          <div style="margin-top:10px;border:1px dashed #c3c4c7;border-radius:4px;padding:8px;text-align:center;background:#fafafa;">
            <img id="tf_img_preview" src="${esc(t.image||'https://placehold.co/300x160/e2e8f0/94a3b8?text=No+Featured+Image')}" style="max-width:100%;height:auto;border-radius:3px;" onerror="this.src='https://placehold.co/300x160/e2e8f0/94a3b8?text=Invalid+Image+URL'">
          </div>
        </div>
      </div>
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">🏷️ Category &amp; Tags</div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:12px;">
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Language</label>
            <select id="tf_c" class="input-text" style="width:100%;">${TCAT.map(c=>`<option value="${c}" ${t.category===c?'selected':''}>${CATNAME[c]}</option>`).join('')}</select>
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">URL Slug</label>
            <input id="tf_f" class="input-text" style="width:100%;" value="${esc(t.file||'')}" ${t.file?'readonly':''} placeholder="my-tutorial-slug.mdx">
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Tags</label>
            <input id="tf_tg" class="input-text" style="width:100%;" value="${esc(t.tags||'')}" placeholder="css, html, js">
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">SEO Description</label>
            <textarea id="tf_d" class="input-text" style="width:100%;height:60px;" placeholder="Search description...">${esc(t.description||'')}</textarea>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function newTut(){
  openEditor('Add New Tutorial', tutForm(),
    async()=>{
      let fn=$('tf_f').value.trim();if(!fn)return toast('URL slug is required',false);
      if(!fn.endsWith('.mdx'))fn+='.mdx';
      await post('/api/tutorials/save',{filename:fn,content:buildTutContent()});
      toast('Tutorial published! 🎉');await loadAll();renderTuts();
    },
    ()=>renderTuts(),
    '<span class="badge bpub" style="margin-right:8px">New</span>'
  );
}

async function editTut(file){
  const d=await api('/api/tutorials/get?file='+encodeURIComponent(file));
  if(d.error)return toast('File not found',false);
  const fm=parseFM(d.content),body=extractBody(d.content);
  openEditor('Edit Tutorial: '+file, tutForm({...fm,file}),
    async()=>{
      await post('/api/tutorials/save',{filename:file,content:buildTutContent()});
      toast('Changes published! ✅');
    },
    ()=>renderTuts(),
    '<span class="badge bpub" style="margin-right:8px">Published</span>'
  );
  setTimeout(()=>{if($('tf_b'))$('tf_b').value=body},60);
}

function delTut(f){openConfirm(`Delete tutorial "${f}"? This cannot be undone.`,async()=>{await post('/api/tutorials/delete',{filename:f});toast('Tutorial deleted');await loadAll();renderTuts()})}

function buildTutContent(){
  const tags=$('tf_tg').value.split(',').map(s=>s.trim()).filter(Boolean);
  const tStr=tags.length?`\ntags: [${tags.map(t=>`"${t}"`).join(', ')}]`:'';
  const img=$('tf_img').value.trim();const iStr=img?`\nimage: "${img}"`:'';
  return`---\ntitle: "${$('tf_t').value}"\ndescription: "${$('tf_d').value}"\ncategory: "${$('tf_c').value}"\norder: ${$('tf_o').value}\ndate: "${$('tf_dt').value}"\nauthor: "${$('tf_au').value}"${tStr}${iStr}\n---\n\n${$('tf_b').value}`
}

// ══ BLOGS ══
let blogFilters = { q: '', cat: '', status: '', author: '' };
let blogPagination = { page: 1, pageSize: 10 };

function renderBlogs(){
  $('ptitle').textContent='Posts';
  $('tact').innerHTML=`<button class="btn bp" onclick="newBlog()">+ Add New Post</button><button class="btn bg" style="margin-left:8px;" onclick="toggleUploadPanel('blog'); document.getElementById('upload-panel-blog').scrollIntoView({behavior:'smooth'})">📥 Import &amp; Upload</button>`;
  
  const authors = [...new Set(blogs.map(b => b.author || 'CodesCompiler'))].filter(Boolean);
  
  let h = `
    <div style="display:flex;gap:10px;margin-bottom:18px;background:#fff;padding:14px;border-radius:4px;border:1px solid #c3c4c7;align-items:center;flex-wrap:wrap">
      <div style="font-size:13px;font-weight:600;color:#3c434a;margin-right:4px">🔍 Filter Posts:</div>
      <input class="input-text" placeholder="Search title..." oninput="blogFilter('q', this.value)" style="width:200px" value="${esc(blogFilters.q)}">
      <select class="input-text" onchange="blogFilter('cat', this.value)" style="width:160px">
        <option value="">All Categories</option>
        ${BCAT.map(c => `<option value="${c}" ${blogFilters.cat===c?'selected':''}>${c}</option>`).join('')}
      </select>
      <select class="input-text" onchange="blogFilter('status', this.value)" style="width:140px">
        <option value="">All Statuses</option>
        <option value="publish" ${blogFilters.status==='publish'?'selected':''}>✅ Published</option>
        <option value="draft" ${blogFilters.status==='draft'?'selected':''}>📝 Drafts</option>
      </select>
      <select class="input-text" onchange="blogFilter('author', this.value)" style="width:160px">
        <option value="">All Authors</option>
        ${authors.map(a => `<option value="${a}" ${blogFilters.author===a?'selected':''}>${a}</option>`).join('')}
      </select>
      <div style="display:flex;align-items:center;gap:6px;margin-left:auto;">
        <span style="font-size:12px;font-weight:600;color:#646970;">Show per page:</span>
        <select class="input-text" onchange="blogPageSizeChange(this.value)" style="width:85px">
          <option value="10" ${blogPagination.pageSize===10?'selected':''}>10</option>
          <option value="30" ${blogPagination.pageSize===30?'selected':''}>30</option>
          <option value="50" ${blogPagination.pageSize===50?'selected':''}>50</option>
          <option value="all" ${blogPagination.pageSize==='all'?'selected':''}>All</option>
        </select>
      </div>
      ${(blogFilters.q||blogFilters.cat||blogFilters.status||blogFilters.author) ? `<button class="btn bg bs" onclick="blogFilters={q:'',cat:'',status:'',author:''};blogPagination.page=1;renderBlogs()">Clear Filters</button>` : ''}
    </div>
    <div id="blog_table_container"></div>
    ${renderUploadPanel('blog')}
  `;
  $('content').innerHTML = h;
  applyBlogFilters();
}

function blogPageSizeChange(val) {
  blogPagination.pageSize = val === 'all' ? 'all' : (parseInt(val, 10) || 10);
  blogPagination.page = 1;
  applyBlogFilters();
}

function blogGoToPage(p) {
  blogPagination.page = p;
  applyBlogFilters();
}

function blogFilter(key, val) {
  blogFilters[key] = val;
  blogPagination.page = 1;
  applyBlogFilters();
  if(key === 'q') applyBlogFilters(); else renderBlogs(); 
}

function applyBlogFilters() {
  const q = blogFilters.q.toLowerCase();
  const list = blogs.filter(b => {
    const isDraft = b.draft==='true'||b.draft===true;
    const stat = isDraft ? 'draft' : 'publish';
    const auth = b.author || 'CodesCompiler';
    
    if (q && !(b.title||'').toLowerCase().includes(q) && !(b.category||'').toLowerCase().includes(q)) return false;
    if (blogFilters.cat && b.category !== blogFilters.cat) return false;
    if (blogFilters.status && stat !== blogFilters.status) return false;
    if (blogFilters.author && auth !== blogFilters.author) return false;
    return true;
  });
  showBlogs(list);
}

function showBlogs(list){
  const totalItems = list.length;
  const pageSize = blogPagination.pageSize === 'all' ? (totalItems || 1) : (blogPagination.pageSize || 10);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (blogPagination.page > totalPages) blogPagination.page = totalPages;
  if (blogPagination.page < 1) blogPagination.page = 1;
  const currentPage = blogPagination.page;

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const pagedList = list.slice(startIdx, endIdx);

  const renderPaginationControls = () => {
    if (totalItems === 0) return '';
    let btns = '';
    btns += `<button class="btn bg bs" ${currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="blogGoToPage(${currentPage - 1})">‹ Prev</button>`;
    let startP = Math.max(1, currentPage - 2);
    let endP = Math.min(totalPages, startP + 4);
    if (endP - startP < 4) startP = Math.max(1, endP - 4);
    for (let p = startP; p <= endP; p++) {
      btns += `<button class="btn ${p === currentPage ? 'bp' : 'bg bs'}" style="min-width:32px;padding:4px 8px;" onclick="blogGoToPage(${p})">${p}</button>`;
    }
    btns += `<button class="btn bg bs" ${currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="blogGoToPage(${currentPage + 1})">Next ›</button>`;

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-top:1px solid #c3c4c7;border-bottom-left-radius:4px;border-bottom-right-radius:4px;flex-wrap:wrap;gap:10px;">
        <div style="font-size:12px;color:#646970;">
          Showing <strong>${totalItems > 0 ? startIdx + 1 : 0}</strong> to <strong>${endIdx}</strong> of <strong>${totalItems}</strong> posts (Page ${currentPage} of ${totalPages})
        </div>
        <div style="display:flex;gap:4px;align-items:center;">
          ${btns}
        </div>
      </div>
    `;
  };

  let h=`<div class="card" style="margin-bottom:0;border-bottom-left-radius:0;border-bottom-right-radius:0;"><table><thead><tr><th style="width:40px">#</th><th>Title</th><th>Category</th><th>Author</th><th>Date</th><th>Status</th></tr></thead><tbody>`;
  if(!pagedList.length)h+=`<tr><td colspan="6" class="empty">No posts match your filters.</td></tr>`;
  pagedList.forEach((b,i)=>{
    const itemNum = startIdx + i + 1;
    const feat=b.featured==='true'||b.featured===true;
    const isDraft=b.draft==='true'||b.draft===true;
    const slug = b.file.replace(/\.mdx?$/, '');
    h+=`<tr>
      <td>${itemNum}</td>
      <td>
        <strong>${esc(b.title)}</strong>${feat?' ⭐':''}
        <div class="row-actions" style="font-size:12px; margin-top:4px;">
          <a href="#" style="color:#2271b1; text-decoration:none;" onclick="event.preventDefault(); editBlog('${esc(b.file)}')">Edit</a> <span style="color:#ddd">|</span> 
          <a href="#" style="color:#d63638; text-decoration:none;" onclick="event.preventDefault(); delBlog('${esc(b.file)}')">Trash</a> <span style="color:#ddd">|</span> 
          <a href="/blog/${slug}/" target="_blank" style="color:#2271b1; text-decoration:none;">View</a>
        </div>
      </td>
      <td style="font-size:12px">${esc(b.category||'')}</td>
      <td style="font-size:12px;color:var(--dim)">${esc(b.author||'CodesCompiler')}</td>
      <td style="color:var(--dim);font-size:12px">${esc(b.date||'')}</td>
      <td>${isDraft?'<span class="badge" style="background:rgba(245,158,11,.12);color:#fbbf24">Draft</span>':'<span class="badge bpub">Published</span>'}</td>
    </tr>`;
  });
  h+=`</tbody></table></div>`;
  h+=renderPaginationControls();
  const cont = $('blog_table_container');
  if(cont) cont.innerHTML=h;
}

function blogForm(b={}){
  const isDraft=b.status==='draft'||b.draft==='true'||b.draft===true;
  return `<div style="display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;">
    <div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#3c434a;">Title</label>
        <input id="bf_t" value="${esc(b.title||'')}" placeholder="Add post title..." style="width:100%;font-size:20px;font-weight:bold;padding:10px 12px;border:1px solid #8c8f94;border-radius:3px;">
      </div>
      <div class="tab-row"><div class="tab-item on" onclick="showEditorTab(this,'bf_editor')">✏️ Write</div><div class="tab-item" onclick="showPreviewTab(this,'bf_editor','bf_preview')">👁️ Preview</div></div>
      <div id="bf_editor">${editorToolbar('bf_b')}<textarea class="editor" id="bf_b" style="min-height:550px;" placeholder="Start writing your post content here..."></textarea></div>
      <div id="bf_preview" style="display:none"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">📌 Publish &amp; Status</div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:12px;">
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Status</label>
            <select id="bf_status" class="input-text" style="width:100%;"><option value="publish" ${!isDraft?'selected':''}>✅ Published</option><option value="draft" ${isDraft?'selected':''}>📝 Draft</option><option value="schedule">⏰ Schedule</option></select>
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Publish Date</label>
            <input id="bf_dt" type="date" class="input-text" style="width:100%;" value="${b.date||new Date().toISOString().split('T')[0]}">
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Author</label>
            <input id="bf_au" class="input-text" style="width:100%;" value="${esc(b.author||'CodesCompiler')}">
          </div>
          <div style="border-top:1px solid #f0f0f1;padding-top:8px;">
            <label class="chk" style="display:block;margin-bottom:6px;"><input type="checkbox" id="bf_ft" ${b.featured==='true'||b.featured===true?'checked':''}><span>⭐ Featured Post</span></label>
            <label class="chk" style="display:block;margin-bottom:6px;"><input type="checkbox" id="bf_dm" ${b.hasDemo==='true'||b.hasDemo===true?'checked':''}><span>🖥️ Has Live Demo</span></label>
            <label class="chk" style="display:block;"><input type="checkbox" id="bf_noads" ${b.disableAds==='true'||b.disableAds===true?'checked':''}><span>🚫 Disable Ads</span></label>
          </div>
        </div>
      </div>
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">🖼️ Featured Image</div>
        <div style="padding:14px;">
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Image Path / URL</label>
          <input id="bf_img" class="input-text" style="width:100%;" value="${esc(b.image||'')}" placeholder="/images/posts/sample.png" oninput="if($('bf_img_preview'))$('bf_img_preview').src=this.value">
          <div style="margin-top:10px;border:1px dashed #c3c4c7;border-radius:4px;padding:8px;text-align:center;background:#fafafa;">
            <img id="bf_img_preview" src="${esc(b.image||'https://placehold.co/300x160/e2e8f0/94a3b8?text=No+Featured+Image')}" style="max-width:100%;height:auto;border-radius:3px;" onerror="this.src='https://placehold.co/300x160/e2e8f0/94a3b8?text=Invalid+Image+URL'">
          </div>
        </div>
      </div>
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">🏷️ Category &amp; Tags</div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:12px;">
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Category</label>
            <select id="bf_c" class="input-text" style="width:100%;">${BCAT.map(c=>`<option value="${c}" ${b.category===c?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Tags (comma separated)</label>
            <input id="bf_tg" class="input-text" style="width:100%;" value="${esc(b.tags||'')}" placeholder="css, animation, design">
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">URL Slug</label>
            <input id="bf_f" class="input-text" style="width:100%;" value="${esc(b.file||'')}" ${b.file?'readonly':''} placeholder="my-post-slug.mdx">
          </div>
        </div>
      </div>
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">🔍 SEO Settings</div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:10px;">
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">SEO Title</label>
            <input id="bf_seo" class="input-text" style="width:100%;" value="${esc(b.seoTitle||'')}" placeholder="Custom search title...">
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Meta Description</label>
            <textarea id="bf_d" class="input-text" style="width:100%;height:60px;" placeholder="Search engine snippet...">${esc(b.description||'')}</textarea>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function newBlog(){
  openEditor('Add New Post', blogForm(),
    async()=>{
      let fn=$('bf_f').value.trim();if(!fn)return toast('URL slug is required',false);
      if(!fn.endsWith('.mdx'))fn+='.mdx';
      await post('/api/blogs/save',{filename:fn,content:buildBlogContent()});
      toast('Post published! 🎉');await loadAll();renderBlogs();
    },
    ()=>renderBlogs(),
    '<span class="badge bpub" style="margin-right:8px">New</span>'
  );
}

async function editBlog(file){
  const d=await api('/api/blogs/get?file='+encodeURIComponent(file));
  if(d.error)return toast('File not found',false);
  const fm=parseFM(d.content),body=extractBody(d.content);
  openEditor('Edit Post: '+file, blogForm({...fm,file}),
    async()=>{
      await post('/api/blogs/save',{filename:file,content:buildBlogContent()});
      toast('Changes published! ✅');
    },
    ()=>renderBlogs(),
    '<span class="badge bpub" style="margin-right:8px">Published</span>'
  );
  setTimeout(()=>{if($('bf_b'))$('bf_b').value=body},60);
}

function delBlog(f){openConfirm(`Delete post "${f}"? This cannot be undone.`,async()=>{await post('/api/blogs/delete',{filename:f});toast('Post deleted');await loadAll();renderBlogs()})}

function buildBlogContent(){
  const tags=$('bf_tg').value.split(',').map(s=>s.trim()).filter(Boolean);
  const tStr=tags.length?`\ntags: [${tags.map(t=>`"${t}"`).join(', ')}]`:'';
  const img=$('bf_img').value.trim();const iStr=img?`\nimage: "${img}"`:'';
  const seo=$('bf_seo').value.trim();const seoStr=seo?`\nseoTitle: "${seo}"`:'';
  const isDraft=$('bf_status').value==='draft';
  const noads=$('bf_noads').checked;
  return`---\ntitle: "${$('bf_t').value}"\ndescription: "${$('bf_d').value}"\ndate: "${$('bf_dt').value}"\ncategory: "${$('bf_c').value}"${tStr}${iStr}${seoStr}\nfeatured: ${$('bf_ft').checked}\nhasDemo: ${$('bf_dm').checked}\nauthor: "${$('bf_au').value}"\ndraft: ${isDraft}${noads?'\ndisableAds: true':''}\n---\n\n${$('bf_b').value}`;
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
let pageFilters = { q: '' };
let pagePagination = { page: 1, pageSize: 10 };

function renderPages(){
  $('ptitle').textContent='Pages';
  $('tact').innerHTML=`<button class="btn bp" onclick="newPage()">+ New Page</button>`;
  let h = `
    <div style="display:flex;gap:12px;margin-bottom:14px;background:#fff;padding:14px;border-radius:4px;border:1px solid #c3c4c7;align-items:center;flex-wrap:wrap">
      <div style="font-size:13px;font-weight:600;color:#3c434a;margin-right:2px">🔍 Filter Pages:</div>
      <input class="input-text" placeholder="Search pages..." oninput="pageFilterChange(this.value)" style="width:250px" value="${esc(pageFilters.q)}">
      <div style="display:flex;align-items:center;gap:6px;margin-left:auto;">
        <span style="font-size:12px;font-weight:600;color:#646970;">Show per page:</span>
        <select class="input-text" onchange="pagePageSizeChange(this.value)" style="width:85px">
          <option value="10" ${pagePagination.pageSize===10?'selected':''}>10</option>
          <option value="30" ${pagePagination.pageSize===30?'selected':''}>30</option>
          <option value="50" ${pagePagination.pageSize===50?'selected':''}>50</option>
          <option value="all" ${pagePagination.pageSize==='all'?'selected':''}>All</option>
        </select>
      </div>
      ${pageFilters.q ? `<button class="btn bg bs" onclick="pageFilters.q='';pagePagination.page=1;renderPages()">Clear Filter</button>` : ''}
    </div>
    <div id="page_table_container"></div>
    <div style="background:rgba(99,102,241,.08);padding:14px 18px;border-radius:10px;font-size:13px;color:var(--muted);margin-top:16px;">💡 Pages are Astro template files (.astro). You can edit the HTML content directly. For new pages, a basic template will be created for you.</div>
    ${renderUploadPanel('page')}
  `;
  $('content').innerHTML=h;
  applyPageFilters();
}

function pagePageSizeChange(val) {
  pagePagination.pageSize = val === 'all' ? 'all' : (parseInt(val, 10) || 10);
  pagePagination.page = 1;
  applyPageFilters();
}

function pageGoToPage(p) {
  pagePagination.page = p;
  applyPageFilters();
}

function pageFilterChange(q) {
  pageFilters.q = q;
  pagePagination.page = 1;
  applyPageFilters();
}

function applyPageFilters() {
  const q = pageFilters.q.toLowerCase();
  const list = pages.filter(p => {
    if (q && !(p.title||p.file||'').toLowerCase().includes(q)) return false;
    return true;
  });
  showPages(list);
}

function showPages(list) {
  const totalItems = list.length;
  const pageSize = pagePagination.pageSize === 'all' ? (totalItems || 1) : (pagePagination.pageSize || 10);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (pagePagination.page > totalPages) pagePagination.page = totalPages;
  if (pagePagination.page < 1) pagePagination.page = 1;
  const currentPage = pagePagination.page;

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const pagedList = list.slice(startIdx, endIdx);

  const renderPaginationControls = () => {
    if (totalItems === 0) return '';
    let btns = '';
    btns += `<button class="btn bg bs" ${currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="pageGoToPage(${currentPage - 1})">‹ Prev</button>`;
    let startP = Math.max(1, currentPage - 2);
    let endP = Math.min(totalPages, startP + 4);
    if (endP - startP < 4) startP = Math.max(1, endP - 4);
    for (let p = startP; p <= endP; p++) {
      btns += `<button class="btn ${p === currentPage ? 'bp' : 'bg bs'}" style="min-width:32px;padding:4px 8px;" onclick="pageGoToPage(${p})">${p}</button>`;
    }
    btns += `<button class="btn bg bs" ${currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="pageGoToPage(${currentPage + 1})">Next ›</button>`;

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-top:1px solid #c3c4c7;border-bottom-left-radius:4px;border-bottom-right-radius:4px;flex-wrap:wrap;gap:10px;">
        <div style="font-size:12px;color:#646970;">
          Showing <strong>${totalItems > 0 ? startIdx + 1 : 0}</strong> to <strong>${endIdx}</strong> of <strong>${totalItems}</strong> pages (Page ${currentPage} of ${totalPages})
        </div>
        <div style="display:flex;gap:4px;align-items:center;">
          ${btns}
        </div>
      </div>
    `;
  };

  let h=`<div class="card" style="margin-bottom:0;border-bottom-left-radius:0;border-bottom-right-radius:0;"><div class="ch"><h3>📄 Static Pages</h3><span style="color:var(--dim);font-size:12px">${pages.length} pages</span></div>
  <table><thead><tr><th style="width:40px">#</th><th>Title</th><th>URL</th><th>File</th></tr></thead><tbody>`;
  if(!pagedList.length) h+=`<tr><td colspan="4" class="empty">No pages</td></tr>`;
  pagedList.forEach((p,i)=>{
    const itemNum = startIdx + i + 1;
    const slug = p.file === 'index.astro' ? '' : p.file.replace(/\.astro$/, '/');
    h+=`<tr>
      <td>${itemNum}</td>
      <td>
        <strong>${esc(p.title)}</strong>
        <div class="row-actions" style="font-size:12px; margin-top:4px;">
          <a href="#" style="color:#2271b1; text-decoration:none;" onclick="event.preventDefault(); editPage('${esc(p.file)}')">Edit</a> <span style="color:#ddd">|</span> 
          <a href="#" style="color:#d63638; text-decoration:none;" onclick="event.preventDefault(); delPage('${esc(p.file)}')">Trash</a> <span style="color:#ddd">|</span> 
          <a href="/${slug}" target="_blank" style="color:#2271b1; text-decoration:none;">View</a>
        </div>
      </td>
      <td style="font-size:12px;color:var(--muted);font-family:monospace">${esc(p.url)}</td>
      <td style="font-size:12px;color:var(--dim)">${esc(p.file)}</td>
    </tr>`;
  });
  h+=`</tbody></table></div>`;
  h+=renderPaginationControls();
  const cont = $('page_table_container');
  if(cont) cont.innerHTML=h;
}

// ══ BOOKS ══
let books = [];
let bookFilters = { q: '', cat: '' };
let bookPagination = { page: 1, pageSize: 10 };

async function renderBooks() {
  $('ptitle').textContent='Books';
  $('tact').innerHTML=`<button class="btn bp" onclick="newBook()">+ Add New Book</button>`;
  if(!books.length) books = await api('/api/books/list').catch(()=>[]);
  
  const bCats = [...new Set(books.map(b=>b.category).filter(Boolean))];
  
  let h = `
    <div style="display:flex;gap:10px;margin-bottom:18px;background:#fff;padding:14px;border-radius:4px;border:1px solid #c3c4c7;align-items:center;flex-wrap:wrap">
      <div style="font-size:13px;font-weight:600;color:#3c434a;margin-right:4px">🔍 Filter Books:</div>
      <input class="input-text" placeholder="Search by title..." oninput="bookFilterChange('q', this.value)" style="width:220px" value="${esc(bookFilters.q)}">
      <select class="input-text" onchange="bookFilterChange('cat', this.value)" style="width:160px">
        <option value="">All Categories</option>
        ${bCats.map(c => `<option value="${c}" ${bookFilters.cat===c?'selected':''}>${c}</option>`).join('')}
      </select>
      <div style="display:flex;align-items:center;gap:6px;margin-left:auto;">
        <span style="font-size:12px;font-weight:600;color:#646970;">Show per page:</span>
        <select class="input-text" onchange="bookPageSizeChange(this.value)" style="width:85px">
          <option value="10" ${bookPagination.pageSize===10?'selected':''}>10</option>
          <option value="30" ${bookPagination.pageSize===30?'selected':''}>30</option>
          <option value="50" ${bookPagination.pageSize===50?'selected':''}>50</option>
          <option value="all" ${bookPagination.pageSize==='all'?'selected':''}>All</option>
        </select>
      </div>
      ${(bookFilters.q||bookFilters.cat) ? `<button class="btn bg bs" onclick="bookFilters={q:'',cat:''};bookPagination.page=1;renderBooks()">Clear Filters</button>` : ''}
    </div>
    <div id="book_table_container"></div>
    ${renderUploadPanel('book')}
  `;
  $('content').innerHTML=h;
  applyBookFilters();
}

function bookPageSizeChange(val) {
  bookPagination.pageSize = val === 'all' ? 'all' : (parseInt(val, 10) || 10);
  bookPagination.page = 1;
  applyBookFilters();
}

function bookGoToPage(p) {
  bookPagination.page = p;
  applyBookFilters();
}

function bookFilterChange(key, val) {
  bookFilters[key] = val;
  bookPagination.page = 1;
  applyBookFilters();
  if(key === 'q') applyBookFilters(); else renderBooks();
}

function applyBookFilters() {
  const q = bookFilters.q.toLowerCase();
  const f = books.filter(b => {
    if (q && !(b.title||b.file||'').toLowerCase().includes(q)) return false;
    if (bookFilters.cat && b.category !== bookFilters.cat) return false;
    return true;
  });
  showBooks(f);
}

function showBooks(list) {
  const totalItems = list.length;
  const pageSize = bookPagination.pageSize === 'all' ? (totalItems || 1) : (bookPagination.pageSize || 10);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (bookPagination.page > totalPages) bookPagination.page = totalPages;
  if (bookPagination.page < 1) bookPagination.page = 1;
  const currentPage = bookPagination.page;

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const pagedList = list.slice(startIdx, endIdx);

  const renderPaginationControls = () => {
    if (totalItems === 0) return '';
    let btns = '';
    btns += `<button class="btn bg bs" ${currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="bookGoToPage(${currentPage - 1})">‹ Prev</button>`;
    let startP = Math.max(1, currentPage - 2);
    let endP = Math.min(totalPages, startP + 4);
    if (endP - startP < 4) startP = Math.max(1, endP - 4);
    for (let p = startP; p <= endP; p++) {
      btns += `<button class="btn ${p === currentPage ? 'bp' : 'bg bs'}" style="min-width:32px;padding:4px 8px;" onclick="bookGoToPage(${p})">${p}</button>`;
    }
    btns += `<button class="btn bg bs" ${currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="bookGoToPage(${currentPage + 1})">Next ›</button>`;

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f8fafc;border-top:1px solid #c3c4c7;border-bottom-left-radius:4px;border-bottom-right-radius:4px;flex-wrap:wrap;gap:10px;">
        <div style="font-size:12px;color:#646970;">
          Showing <strong>${totalItems > 0 ? startIdx + 1 : 0}</strong> to <strong>${endIdx}</strong> of <strong>${totalItems}</strong> books (Page ${currentPage} of ${totalPages})
        </div>
        <div style="display:flex;gap:4px;align-items:center;">
          ${btns}
        </div>
      </div>
    `;
  };

  let h=`<div class="card" style="margin-bottom:0;border-bottom-left-radius:0;border-bottom-right-radius:0;"><div class="ch"><h3>📚 Books</h3><span style="color:var(--dim);font-size:12px">${books.length} total books</span></div>
  <table><thead><tr><th>#</th><th>Title</th><th>Category</th><th>Date</th><th>File</th></tr></thead><tbody>`;
  if(!pagedList.length) h+=`<tr><td colspan="5" class="empty">No books match your filters.</td></tr>`;
  pagedList.forEach((b,i)=>{
    const itemNum = startIdx + i + 1;
    const slug = b.slug || b.file.replace(/\.(json|mdx?)$/, '');
    h+=`<tr>
      <td>${itemNum}</td>
      <td>
        <strong>${esc(b.title||b.file)}</strong>
        <div class="row-actions" style="font-size:12px; margin-top:4px;">
          <a href="#" style="color:#2271b1; text-decoration:none;" onclick="event.preventDefault(); editBook('${esc(b.file)}')">Edit</a> <span style="color:#ddd">|</span> 
          <a href="#" style="color:#d63638; text-decoration:none;" onclick="event.preventDefault(); delBook('${esc(b.file)}')">Trash</a> <span style="color:#ddd">|</span> 
          <a href="/books/${slug}" target="_blank" style="color:#2271b1; text-decoration:none;">View</a>
        </div>
      </td>
      <td style="font-size:12px">${esc(b.category||'')}</td>
      <td style="font-size:12px;color:var(--dim)">${esc(b.date||'')}</td>
      <td style="font-size:12px;color:var(--dim)">${esc(b.file)}</td>
    </tr>`;
  });
  h+=`</tbody></table></div>`;
  h+=renderPaginationControls();
  const cont = $('book_table_container');
  if(cont) cont.innerHTML=h;
}

function bookForm(b = {}) {
  let parsed = {};
  if (typeof b.content === 'string') {
    try { parsed = JSON.parse(b.content); } catch(e){}
  } else if (typeof b === 'object') {
    parsed = b;
  }
  const title = parsed.title || b.title || '';
  const tagline = parsed.tagline || b.tagline || '';
  const author = parsed.author || b.author || 'CodesCompiler';
  const category = parsed.category || b.category || '';
  const date = parsed.date || b.date || new Date().toISOString().split('T')[0];
  const image = parsed.image || b.image || parsed.coverImage || '';
  const isDraft = parsed.draft === true || b.draft === true;

  const level = parsed.level || '';
  const amazonUrl = parsed.amazonUrl || '';
  const pagesCount = parsed.pages !== undefined ? parsed.pages : '';
  const language = parsed.language || 'English';
  const publisher = parsed.publisher || 'Independently published';
  const isbn13 = parsed.isbn13 || '';
  const asin = parsed.asin || '';
  const itemWeight = parsed.itemWeight || '';
  const dimensions = parsed.dimensions || '';
  const description = parsed.description || '';
  const chapters = parsed.chapters || [];

  const defaultTemplate = {
    title: title || '',
    tagline: tagline || '',
    description: description,
    draft: isDraft,
    image: image,
    date: date,
    level: level,
    amazonUrl: amazonUrl,
    pages: pagesCount,
    language: language,
    publisher: publisher,
    isbn13: isbn13,
    asin: asin,
    itemWeight: itemWeight,
    dimensions: dimensions,
    category: category,
    chapters: chapters
  };

  const jsonStr = typeof b.content === 'string' ? b.content : JSON.stringify(defaultTemplate, null, 2);

  return `<div style="display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;">
    <div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#3c434a;">Book Title</label>
        <input id="bk_title_input" value="${esc(title)}" placeholder="Add book title..." style="width:100%;font-size:20px;font-weight:bold;padding:10px 12px;border:1px solid #8c8f94;border-radius:3px;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#3c434a;">Tagline / Subtitle</label>
        <input id="bk_tagline_input" value="${esc(tagline)}" placeholder="e.g. 30 Heartwarming Lessons About Kindness..." style="width:100%;font-size:14px;padding:8px 10px;border:1px solid #8c8f94;border-radius:3px;">
      </div>

      <!-- Description Section -->
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;margin-bottom:16px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">
          📖 Book Description / Synopsis
        </div>
        <div style="padding:16px;">
          <textarea id="bk_desc_input" class="editor" style="width:100%;min-height:220px;font-family:sans-serif;font-size:14px;line-height:1.6;padding:10px;border:1px solid #8c8f94;border-radius:3px;" placeholder="Write a heartwarming storybook description or synopsis here...">${esc(description)}</textarea>
        </div>
      </div>

      <!-- Chapters Section -->
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;margin-bottom:16px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;display:flex;justify-content:space-between;align-items:center;">
          <span>📑 Chapters &amp; Lessons</span>
          <span style="font-size:11px;color:#646970;">Chapter Data</span>
        </div>
        <div style="padding:16px;">
          <textarea id="bk_chapters_input" class="editor" style="width:100%;min-height:180px;font-family:monospace;font-size:13px;padding:10px;border:1px solid #8c8f94;border-radius:3px;" placeholder='[\n  { "title": "Lesson 1: Sharing is Caring", "content": "..." }\n]'>${esc(JSON.stringify(chapters, null, 2))}</textarea>
        </div>
      </div>

      <!-- Advanced Raw JSON Collapsible -->
      <div style="margin-top:8px;">
        <details>
          <summary style="font-size:12px;color:#646970;cursor:pointer;">🛠️ Advanced: View / Edit Raw JSON Source</summary>
          <textarea id="bk_body" style="width:100%;min-height:180px;font-family:monospace;font-size:12px;margin-top:8px;padding:8px;border:1px solid #c3c4c7;border-radius:3px;">${esc(jsonStr)}</textarea>
        </details>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      <!-- Publish Box -->
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">📌 Publish &amp; Status</div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:12px;">
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Status</label>
            <select id="bk_status" class="input-text" style="width:100%;"><option value="publish" ${!isDraft?'selected':''}>✅ Published</option><option value="draft" ${isDraft?'selected':''}>📝 Draft</option><option value="schedule">⏰ Schedule</option></select>
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Publish Date</label>
            <input id="bk_date_input" type="date" class="input-text" style="width:100%;" value="${date}">
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Author</label>
            <input id="bk_author_input" class="input-text" style="width:100%;" value="${esc(author)}">
          </div>
        </div>
      </div>
      <!-- Cover Image -->
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">🖼️ Cover / Featured Image</div>
        <div style="padding:14px;">
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Image Path / URL</label>
          <input id="bk_img_input" class="input-text" style="width:100%;" value="${esc(image)}" placeholder="/images/books/cover.png" oninput="if($('bk_img_preview'))$('bk_img_preview').src=this.value">
          <div style="margin-top:10px;border:1px dashed #c3c4c7;border-radius:4px;padding:8px;text-align:center;background:#fafafa;">
            <img id="bk_img_preview" src="${esc(image || 'https://placehold.co/300x160/e2e8f0/94a3b8?text=No+Cover+Image')}" style="max-width:100%;height:auto;border-radius:3px;" onerror="this.src='https://placehold.co/300x160/e2e8f0/94a3b8?text=Invalid+Image+URL'">
          </div>
        </div>
      </div>
      <!-- Amazon & Specifications -->
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">🛒 Amazon &amp; Specifications</div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:10px;">
          <div><label style="display:block;font-size:11px;font-weight:600;margin-bottom:2px;">Amazon Product URL</label>
            <input id="bk_amazon_input" class="input-text" style="width:100%;" value="${esc(amazonUrl)}" placeholder="https://www.amazon.com/dp/...">
          </div>
          <div><label style="display:block;font-size:11px;font-weight:600;margin-bottom:2px;">Age Level / Target Audience</label>
            <input id="bk_level_input" class="input-text" style="width:100%;" value="${esc(level)}" placeholder="e.g. 3-10 years">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div><label style="display:block;font-size:11px;font-weight:600;margin-bottom:2px;">ASIN</label>
              <input id="bk_asin_input" class="input-text" style="width:100%;" value="${esc(asin)}" placeholder="B0HJCW73Y2">
            </div>
            <div><label style="display:block;font-size:11px;font-weight:600;margin-bottom:2px;">ISBN-13</label>
              <input id="bk_isbn_input" class="input-text" style="width:100%;" value="${esc(isbn13)}" placeholder="979-8172897573">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div><label style="display:block;font-size:11px;font-weight:600;margin-bottom:2px;">Page Count</label>
              <input id="bk_pages_input" type="number" class="input-text" style="width:100%;" value="${esc(pagesCount)}" placeholder="30">
            </div>
            <div><label style="display:block;font-size:11px;font-weight:600;margin-bottom:2px;">Language</label>
              <input id="bk_lang_input" class="input-text" style="width:100%;" value="${esc(language)}" placeholder="English">
            </div>
          </div>
          <div><label style="display:block;font-size:11px;font-weight:600;margin-bottom:2px;">Publisher</label>
            <input id="bk_pub_input" class="input-text" style="width:100%;" value="${esc(publisher)}" placeholder="Independently published">
          </div>
          <div><label style="display:block;font-size:11px;font-weight:600;margin-bottom:2px;">Product Dimensions</label>
            <input id="bk_dim_input" class="input-text" style="width:100%;" value="${esc(dimensions)}" placeholder="21.59 x 0.20 x 27.94 cm">
          </div>
          <div><label style="display:block;font-size:11px;font-weight:600;margin-bottom:2px;">Item Weight</label>
            <input id="bk_weight_input" class="input-text" style="width:100%;" value="${esc(itemWeight)}" placeholder="127 g">
          </div>
          <div><label style="display:block;font-size:11px;font-weight:600;margin-bottom:2px;">Category</label>
            <input id="bk_cat_input" class="input-text" style="width:100%;" value="${esc(category)}" placeholder="Children's Books, Kindness">
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function syncBookDataFromInputs(parsed = {}) {
  if ($('bk_body')) {
    try {
      const raw = JSON.parse($('bk_body').value);
      parsed = { ...raw, ...parsed };
    } catch(e){}
  }

  if ($('bk_title_input') && $('bk_title_input').value.trim()) parsed.title = $('bk_title_input').value.trim();
  if ($('bk_tagline_input')) parsed.tagline = $('bk_tagline_input').value.trim();
  if ($('bk_desc_input')) parsed.description = $('bk_desc_input').value.trim();
  if ($('bk_author_input')) parsed.author = $('bk_author_input').value.trim();
  if ($('bk_status')) parsed.draft = $('bk_status').value === 'draft';
  if ($('bk_img_input')) {
    parsed.image = $('bk_img_input').value.trim();
    parsed.coverImage = $('bk_img_input').value.trim();
  }
  if ($('bk_date_input')) parsed.date = $('bk_date_input').value.trim();
  if ($('bk_amazon_input')) parsed.amazonUrl = $('bk_amazon_input').value.trim();
  if ($('bk_level_input')) parsed.level = $('bk_level_input').value.trim();
  if ($('bk_asin_input')) parsed.asin = $('bk_asin_input').value.trim();
  if ($('bk_isbn_input')) parsed.isbn13 = $('bk_isbn_input').value.trim();
  if ($('bk_pages_input')) {
    const val = $('bk_pages_input').value;
    parsed.pages = val ? Number(val) : '';
  }
  if ($('bk_lang_input')) parsed.language = $('bk_lang_input').value.trim();
  if ($('bk_pub_input')) parsed.publisher = $('bk_pub_input').value.trim();
  if ($('bk_dim_input')) parsed.dimensions = $('bk_dim_input').value.trim();
  if ($('bk_weight_input')) parsed.itemWeight = $('bk_weight_input').value.trim();
  if ($('bk_cat_input')) parsed.category = $('bk_cat_input').value.trim();

  if ($('bk_chapters_input')) {
    try {
      parsed.chapters = JSON.parse($('bk_chapters_input').value);
    } catch(e){}
  }

  return parsed;
}

function newBook(){
  openEditor('Add New Book', bookForm(),
    async () => {
      const content = $('bk_body').value;
      let parsed = {};
      try { parsed = JSON.parse(content); } catch(e) { return toast('Invalid JSON syntax: ' + e.message, false); }
      parsed = syncBookDataFromInputs(parsed);
      
      if (!parsed.title) return toast('Please provide a Book Title', false);
      const slug = parsed.slug || parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      parsed.slug = slug;
      const fn = slug + '.json';

      await post('/api/books/save', { filename: fn, content: JSON.stringify(parsed, null, 2) });
      toast('Book created! 🎉'); books = []; await loadAll(); renderBooks();
    },
    () => renderBooks(),
    '<span class="badge bpub" style="margin-right:8px">New</span>'
  );
}

async function editBook(file){
  const d = await api('/api/books/get?file=' + encodeURIComponent(file));
  if (d.error) return toast('File not found', false);
  openEditor('Edit Book: ' + file, bookForm({ file, content: d.content }),
    async () => {
      const content = $('bk_body').value;
      let parsed = {};
      try { parsed = JSON.parse(content); } catch(e) { return toast('Invalid JSON: ' + e.message, false); }
      parsed = syncBookDataFromInputs(parsed);

      await post('/api/books/save', { filename: file, content: JSON.stringify(parsed, null, 2) });
      toast('Book saved! ✅'); books = []; renderBooks();
    },
    () => renderBooks(),
    '<span class="badge bpub" style="margin-right:8px">Published</span>'
  );
}

function delBook(f){openConfirm(`Delete book "${f}"?`,async()=>{await post('/api/books/delete',{filename:f});toast('Book deleted');books=[];await loadAll();renderBooks()});}

function pageForm(p = {}) {
  const isNew = !p.file;
  const slugName = p.file ? p.file.replace(/\.astro$/, '') : '';
  const defaultBody = p.content || `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="${esc(p.title || 'New Page')}" description="Page description">
  <div class="max-w-screen-xl mx-auto px-5 py-12">
    <h1 class="text-3xl font-bold mb-6">${esc(p.title || 'New Page')}</h1>
    <p>Your content here...</p>
  </div>
</BaseLayout>`;

  return `<div style="display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;">
    <div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;color:#3c434a;">Page Title</label>
        <input id="pg_title_input" value="${esc(p.title || '')}" placeholder="Add page title (e.g. About Us)..." style="width:100%;font-size:20px;font-weight:bold;padding:10px 12px;border:1px solid #8c8f94;border-radius:3px;">
      </div>
      <div class="card">
        <div class="ch"><h3>Page Template Code (.astro)</h3><span style="color:var(--dim);font-size:12px">${p.file || 'New Template'}</span></div>
        <div style="padding:16px"><textarea class="editor" id="pg_body" style="min-height:550px;width:100%;font-family:monospace;">${esc(defaultBody)}</textarea></div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">📌 Publish &amp; Status</div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:12px;">
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Status</label>
            <select id="pg_status" class="input-text" style="width:100%;"><option value="publish">✅ Published</option><option value="draft">📝 Draft</option><option value="schedule">⏰ Schedule</option></select>
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Publish Date</label>
            <input id="pg_date" type="date" class="input-text" style="width:100%;" value="${p.date || new Date().toISOString().split('T')[0]}">
          </div>
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Page Layout</label>
            <select id="pg_layout" class="input-text" style="width:100%;"><option value="base">BaseLayout (Default)</option></select>
          </div>
        </div>
      </div>
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">🖼️ Featured Image</div>
        <div style="padding:14px;">
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">Image Path / URL</label>
          <input id="pg_img" class="input-text" style="width:100%;" value="${esc(p.image || '')}" placeholder="/images/pages/banner.png" oninput="if($('pg_img_preview'))$('pg_img_preview').src=this.value">
          <div style="margin-top:10px;border:1px dashed #c3c4c7;border-radius:4px;padding:8px;text-align:center;background:#fafafa;">
            <img id="pg_img_preview" src="${esc(p.image || 'https://placehold.co/300x160/e2e8f0/94a3b8?text=No+Featured+Image')}" style="max-width:100%;height:auto;border-radius:3px;" onerror="this.src='https://placehold.co/300x160/e2e8f0/94a3b8?text=Invalid+Image+URL'">
          </div>
        </div>
      </div>
      <div class="wp-card" style="background:#fff;border:1px solid #c3c4c7;border-radius:4px;">
        <div class="wp-card-header" style="border-bottom:1px solid #c3c4c7;padding:10px 14px;font-weight:600;background:#f6f7f7;">⚙️ Page Attributes &amp; Slug</div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:12px;">
          <div><label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px;">URL Slug / Filename</label>
            <input id="pg_slug_input" class="input-text" style="width:100%;" value="${esc(slugName)}" ${!isNew ? 'readonly' : ''} placeholder="e.g. about-us, contact">
            <span style="font-size:11px;color:#646970;display:block;margin-top:4px;">URL path: /<span id="pg_slug_preview">${slugName || 'slug'}</span>/</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function newPage(){
  openEditor('Add New Page', pageForm(),
    async () => {
      const rawSlug = $('pg_slug_input') ? $('pg_slug_input').value.trim() : '';
      if (!rawSlug) { return toast('Please enter a Page Slug / Filename', false); }
      const cleanSlug = rawSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      const fn = cleanSlug.endsWith('.astro') ? cleanSlug : cleanSlug + '.astro';
      const content = $('pg_body').value;
      await post('/api/pages/save', { filename: fn, content });
      toast(`Page created! 🎉 (${fn})`); await loadAll(); renderPages();
    },
    () => renderPages(),
    '<span class="badge bpub" style="margin-right:8px">Draft</span>'
  );

  setTimeout(() => {
    const input = $('pg_slug_input'); const preview = $('pg_slug_preview');
    if (input && preview) {
      input.addEventListener('input', () => {
        const v = input.value.trim().replace(/[^a-z0-9-]/gi, '-').toLowerCase();
        preview.textContent = v || 'slug';
      });
    }
  }, 50);
}

async function editPage(file){
  const d = await api('/api/pages/get?file=' + encodeURIComponent(file));
  if (d.error) return toast('File not found', false);
  const titleMatch = d.content ? d.content.match(/title=["']([^"']+)["']/) : null;
  const title = titleMatch ? titleMatch[1] : file.replace(/\.astro$/, '');

  openEditor('Edit Page: ' + file, pageForm({ file, content: d.content, title }),
    async () => {
      await post('/api/pages/save', { filename: file, content: $('pg_body').value });
      toast('Page saved! ✅');
    },
    () => renderPages(),
    '<span class="badge bpub" style="margin-right:8px">Published</span>'
  );
}

function delPage(f){
  if(f==='index.astro')return toast('Cannot delete homepage',false);
  openConfirm(`Delete page "${f}"?`,async()=>{await post('/api/pages/delete',{filename:f});toast('Page deleted');await loadAll();renderPages()});
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
let selectedTrash = new Set();

function toggleAllTrash(checked){
  if(checked) selectedTrash = new Set(trashBin.map((_, idx) => idx));
  else selectedTrash.clear();
  renderTrash();
}

function toggleTrashItem(idx){
  if(selectedTrash.has(idx)) selectedTrash.delete(idx);
  else selectedTrash.add(idx);
  renderTrash();
}

function renderTrash(){
  $('ptitle').textContent='Trash';
  
  let topActions = '';
  if(trashBin.length > 0) {
    topActions += `<button class="btn" style="background:#d63638;color:#fff;font-weight:600;margin-right:8px;" onclick="emptyTrash()">🗑️ Empty Trash (${trashBin.length})</button>`;
    if(selectedTrash.size > 0) {
      topActions += `<button class="btn bk" style="margin-right:6px;" onclick="restoreSelectedTrash()">♻️ Restore Selected (${selectedTrash.size})</button>`;
      topActions += `<button class="btn" style="background:#d63638;color:#fff;" onclick="deleteSelectedTrash()">🗑️ Delete Selected (${selectedTrash.size})</button>`;
    }
  }
  $('tact').innerHTML = topActions;
  
  const allChecked = trashBin.length > 0 && selectedTrash.size === trashBin.length;
  
  let h=`<div class="card">
    <div class="ch" style="display:flex;justify-content:space-between;align-items:center;">
      <h3>🗑️ Deleted Items</h3>
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="color:var(--dim);font-size:12px">${trashBin.length} items</span>
        ${trashBin.length > 0 ? `<button class="btn" style="background:#d63638;color:#fff;font-size:12px;padding:4px 10px;" onclick="emptyTrash()">🗑️ Empty Trash</button>` : ''}
      </div>
    </div>
  <table><thead><tr>
    <th style="width:30px"><input type="checkbox" ${allChecked?'checked':''} onchange="toggleAllTrash(this.checked)"></th>
    <th>Type</th><th>File</th><th>Deleted At</th><th style="width:200px">Actions</th>
  </tr></thead><tbody>`;
  
  if(!trashBin.length) h+=`<tr><td colspan="5" class="empty">Trash is empty 🎉</td></tr>`;
  trashBin.forEach((t, idx)=>{
    const d=new Date(t.deletedAt).toLocaleString();
    const typeLabel=t.type==='tutorials'?'📖 Tutorial':t.type==='blogs'?'✍️ Post':'📄 Page';
    const isChecked = selectedTrash.has(idx);
    h+=`<tr style="${isChecked?'background:#f0f7ff':''}">
      <td><input type="checkbox" ${isChecked?'checked':''} onchange="toggleTrashItem(${idx})"></td>
      <td><strong>${typeLabel}</strong></td>
      <td style="font-size:12px;color:var(--dim);font-family:monospace">${esc(t.file)}</td>
      <td style="font-size:12px;color:var(--muted)">${d}</td>
      <td><button class="btn bk bs" onclick="restoreTrash('${t.type}','${esc(t.file)}')">♻️ Restore</button> <button class="btn" style="background:#d63638;color:#fff;font-size:11px;padding:3px 8px;border:none;border-radius:3px;cursor:pointer;" onclick="deleteTrash('${t.type}','${esc(t.file)}')">🗑️ Delete</button></td>
    </tr>`;
  });
  h+=`</tbody></table></div>
  <div style="background:rgba(239,68,68,.08);padding:14px 18px;border-radius:10px;font-size:13px;color:var(--muted)">⚠️ Items in the trash are completely hidden from your live website. Restoring them will instantly publish them back. Clicking "Empty Trash" or "Delete" will permanently delete files from your server.</div>`;
  $('content').innerHTML=h;
}

function restoreTrash(type, file){
  openConfirm(`Restore "${file}"? It will instantly reappear on your site.`, async()=>{
    await post('/api/trash/restore', {type, file});
    toast('Item restored ✅');
    selectedTrash.clear();
    await loadAll();
    renderTrash();
  });
}

function deleteTrash(type, file){
  openConfirm(`Permanently delete "${file}"? This CANNOT be undone.`, async()=>{
    await post('/api/trash/delete', {type, file});
    toast('Permanently deleted 🗑️');
    selectedTrash.clear();
    await loadAll();
    renderTrash();
  });
}

function emptyTrash(){
  if(!trashBin.length) return toast('Trash is already empty!');
  openConfirm('Are you sure you want to PERMANENTLY delete all ' + trashBin.length + ' item(s) in the trash? This CANNOT be undone!', async () => {
    try {
      const res = await post('/api/trash/empty', {});
      if(res.ok) {
        toast('Trash emptied! ' + (res.count || trashBin.length) + ' item(s) permanently deleted 🗑️');
        selectedTrash.clear();
        await loadAll();
        renderTrash();
      } else {
        toast(res.error || 'Failed to empty trash', false);
      }
    } catch(err) {
      toast('Error emptying trash: ' + err.message, false);
    }
  });
}

async function restoreSelectedTrash(){
  if(!selectedTrash.size) return;
  const items = Array.from(selectedTrash).map(i => trashBin[i]).filter(Boolean);
  openConfirm(`Restore ${items.length} selected item(s)?`, async () => {
    for(const item of items){
      await post('/api/trash/restore', {type: item.type, file: item.file});
    }
    toast(`${items.length} item(s) restored ✅`);
    selectedTrash.clear();
    await loadAll();
    renderTrash();
  });
}

async function deleteSelectedTrash(){
  if(!selectedTrash.size) return;
  const items = Array.from(selectedTrash).map(i => trashBin[i]).filter(Boolean);
  openConfirm(`Permanently delete ${items.length} selected item(s)? This CANNOT be undone!`, async () => {
    for(const item of items){
      await post('/api/trash/delete', {type: item.type, file: item.file});
    }
    toast(`${items.length} item(s) permanently deleted 🗑️`);
    selectedTrash.clear();
    await loadAll();
    renderTrash();
  });
}

// ══ THEME / APPEARANCE ══
let themeTab = 'homepage';
function renderTheme() {
  $('ptitle').textContent = 'Themes';
  $('tact').innerHTML = `<button class="btn bp" onclick="saveTheme()">💾 Save Theme</button> <a href="http://localhost:4321/" target="_blank" style="display:inline-block; margin-left:12px; font-weight:bold; color:#04AA6D; text-decoration:none;">👁️ Preview Site ↗</a>`;
  const t = themeSettings;

  const tabs = [
    { id: 'homepage',   ico: '🏠', label: 'Homepage' },
    { id: 'colors',     ico: '🎨', label: 'Colors' },
    { id: 'typography', ico: '🔤', label: 'Typography' },
    { id: 'layout',     ico: '📏', label: 'Layout' },
    { id: 'template',   ico: '🖼️', label: 'Templates' },
    { id: 'customcss',  ico: '💅', label: 'Custom CSS' },
    { id: 'advanced',   ico: '⚙️', label: 'Advanced' },
  ];

  const GFONTS = ['Inter','Roboto','Open Sans','Lato','Montserrat','Poppins','Raleway','Nunito','Source Sans Pro','Merriweather','Playfair Display','PT Serif','system','monospace'];

  let h = `<div style="display:flex;gap:4px;margin-bottom:20px;background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:6px;flex-wrap:wrap">`;
  tabs.forEach(tab => {
    const active = themeTab === tab.id ? 'background:#2271b1;color:#fff;' : 'background:transparent;color:#3c434a;';
    h += `<button onclick="switchThemeTab('${tab.id}')" style="${active}border:none;border-radius:3px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;">${tab.ico} ${tab.label}</button>`;
  });
  h += `</div>`;

  // ── HOMEPAGE TAB ──
  h += `<div id="ttab-homepage" style="display:${themeTab==='homepage'?'block':'none'}">`;
  h += `<div class="card"><div class="ch"><h3>🏠 Homepage Settings</h3><span style="color:var(--dim);font-size:12px">Hero section & content toggles</span></div><div style="padding:20px">`;
  h += `<div class="g2"><div class="field"><label>Hero Title</label><input id="th_heroTitle" value="${esc(t.heroTitle||'Learn Web Development')}" placeholder="Main headline..."></div>
    <div class="field"><label>Hero Subtitle</label><input id="th_heroSubtitle" value="${esc(t.heroSubtitle||'')}" placeholder="Supporting text below the title..."></div></div>`;
  h += `<div class="g2"><div class="field"><label>Primary Button Text</label><input id="th_heroBtnText" value="${esc(t.heroBtnText||'Start Learning')}"></div>
    <div class="field"><label>Primary Button URL</label><input id="th_heroBtnUrl" value="${esc(t.heroBtnUrl||'/tutorials/')}"></div></div>`;
  h += `<div class="g2"><div class="field"><label>Secondary Button Text</label><input id="th_heroSecBtnText" value="${esc(t.heroSecondaryBtnText||'Browse Posts')}"></div>
    <div class="field"><label>Secondary Button URL</label><input id="th_heroSecBtnUrl" value="${esc(t.heroSecondaryBtnUrl||'/blog/')}"></div></div>`;
  h += `<div style="border-top:1px solid #f0f0f1;margin-top:16px;padding-top:16px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:12px">Section Visibility</div>
    <div class="g3">
      <div class="field"><label class="chk"><input type="checkbox" id="th_showFeat" ${t.showFeaturedSection!==false?'checked':''}><span>⭐ Featured Section</span></label></div>
      <div class="field"><label class="chk"><input type="checkbox" id="th_showRecent" ${t.showRecentPosts!==false?'checked':''}><span>📝 Recent Posts</span></label></div>
      <div class="field"><label class="chk"><input type="checkbox" id="th_showTutCats" ${t.showTutorialCategories!==false?'checked':''}><span>📖 Tutorial Categories</span></label></div>
    </div></div>`;
  h += `</div></div></div>`;

  // ── COLORS TAB ──
  h += `<div id="ttab-colors" style="display:${themeTab==='colors'?'block':'none'}">`;
  h += `<div class="card"><div class="ch"><h3>🎨 Color Settings</h3><span style="color:var(--dim);font-size:12px">All changes generate a custom.css file applied to your site</span></div><div style="padding:20px">`;
  const colorFields = [
    ['th_colorPrimary','colorPrimary','#2271b1','Primary Color','Buttons, links, highlights'],
    ['th_colorAccent','colorAccent','#135e96','Accent / Hover Color','Hover states on primary elements'],
    ['th_colorBackground','colorBackground','#ffffff','Page Background','Main body background'],
    ['th_colorSurface','colorSurface','#f6f7f7','Surface / Card Background','Cards, sidebar, panels'],
    ['th_colorText','colorText','#1d2327','Body Text','Main paragraph text'],
    ['th_colorMuted','colorMuted','#6b7280','Muted Text','Dates, meta, subtitles'],
    ['th_colorLink','colorLink','#2271b1','Link Color','Inline text links'],
    ['th_colorLinkHover','colorLinkHover','#135e96','Link Hover Color','Link hover state'],
    ['th_colorBorder','colorBorder','#c3c4c7','Border Color','Card edges, dividers'],
    ['th_colorButtonText','colorButtonText','#ffffff','Button Text Color','Text on colored buttons'],
    ['th_colorHeaderBg','colorHeaderBg','#1e1e1e','Header Background','Top navigation bar'],
    ['th_colorFooterBg','colorFooterBg','#1e1e1e','Footer Background','Bottom footer area'],
  ];
  h += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">`;
  colorFields.forEach(([id,key,def,label,hint]) => {
    h += `<div style="display:flex;align-items:center;gap:12px;padding:10px;background:#f9f9f9;border:1px solid #e5e7eb;border-radius:6px">
      <input type="color" id="${id}" value="${esc(t[key]||def)}" style="width:42px;height:42px;border:none;background:transparent;cursor:pointer;border-radius:4px;padding:0">
      <div>
        <div style="font-size:13px;font-weight:600;color:#1d2327">${label}</div>
        <div style="font-size:11px;color:#9ca3af">${hint}</div>
        <input type="text" id="${id}_hex" value="${esc(t[key]||def)}" style="font-size:11px;font-family:monospace;border:1px solid #ddd;border-radius:3px;padding:2px 6px;width:80px;margin-top:2px" oninput="syncColor('${id}',this.value)">
      </div>
    </div>`;
  });
  h += `</div>`;
  h += `<div style="background:rgba(34,113,177,.07);padding:12px 16px;border-radius:8px;margin-top:16px;font-size:12px;color:#6b7280">💡 <strong>How it works:</strong> Click Save Theme — your colors are written to <code style="color:#2271b1">public/custom.css</code> as CSS variables and instantly applied to <strong>http://localhost:4321</strong>.</div>`;
  h += `</div></div></div>`;

  // ── TYPOGRAPHY TAB ──
  h += `<div id="ttab-typography" style="display:${themeTab==='typography'?'block':'none'}">`;
  h += `<div class="card"><div class="ch"><h3>🖋️ Typography Settings</h3></div><div style="padding:20px">`;
  h += `<div class="g2">
    <div class="field"><label>Body Font (Google Fonts)</label>
      <select id="th_fontFamily">${GFONTS.map(f=>`<option value="${f}" ${(t.fontFamily||'Inter')===f?'selected':''}>${f==='system'?'System Default':f==='monospace'?'Monospace':f}</option>`).join('')}</select></div>
    <div class="field"><label>Heading Font (Google Fonts)</label>
      <select id="th_fontFamilyHeading">${GFONTS.map(f=>`<option value="${f}" ${(t.fontFamilyHeading||'Inter')===f?'selected':''}>${f==='system'?'Same as Body':f==='monospace'?'Monospace':f}</option>`).join('')}</select></div>
  </div>`;
  h += `<div class="g3">
    <div class="field"><label>Base Font Size (px)</label><input type="number" id="th_fontSizeBase" value="${t.fontSizeBase||'16'}" min="12" max="24"></div>
    <div class="field"><label>Small Font Size (px)</label><input type="number" id="th_fontSizeSmall" value="${t.fontSizeSmall||'14'}" min="10" max="20"></div>
    <div class="field"><label>Large Font Size (px)</label><input type="number" id="th_fontSizeLarge" value="${t.fontSizeLarge||'18'}" min="14" max="28"></div>
  </div>`;
  h += `<div class="g3">
    <div class="field"><label>Line Height</label><input type="number" id="th_lineHeight" value="${t.lineHeight||'1.7'}" min="1" max="3" step="0.1"></div>
    <div class="field"><label>Heading Font Weight</label>
      <select id="th_fontWeightHeading">
        ${['400','500','600','700','800','900'].map(w=>`<option value="${w}" ${(t.fontWeightHeading||'700')===w?'selected':''}>${w}</option>`).join('')}
      </select></div>
    <div class="field" style="grid-column:span 1"></div>
  </div>`;
  h += `<div style="border-top:1px solid #f0f0f1;margin-top:12px;padding-top:16px"><div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:12px">Heading Sizes (rem)</div>
  <div class="g3">
    <div class="field"><label>H1 Size (rem)</label><input type="number" id="th_h1" value="${t.headingSizeh1||'2.5'}" min="1" max="6" step="0.1"></div>
    <div class="field"><label>H2 Size (rem)</label><input type="number" id="th_h2" value="${t.headingSizeh2||'2'}" min="0.8" max="5" step="0.1"></div>
    <div class="field"><label>H3 Size (rem)</label><input type="number" id="th_h3" value="${t.headingSizeh3||'1.5'}" min="0.8" max="4" step="0.1"></div>
  </div></div>`;
  h += `<div style="background:#f9f9f9;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-top:16px">
    <div style="font-size:12px;color:#9ca3af;margin-bottom:8px;font-weight:600">LIVE PREVIEW</div>
    <div id="th_fontPreview" style="font-family:${t.fontFamily&&t.fontFamily!=='system'?`'${t.fontFamily}',`:''}sans-serif">
      <h1 style="font-size:${t.headingSizeh1||2.5}rem;font-weight:${t.fontWeightHeading||700};margin:0 0 6px">The quick brown fox</h1>
      <p style="font-size:${t.fontSizeBase||16}px;line-height:${t.lineHeight||1.7};color:#6b7280;margin:0">The quick brown fox jumps over the lazy dog. This is what your body text looks like.</p>
    </div>
  </div>`;
  h += `</div></div></div>`;

  // ── LAYOUT TAB ──
  h += `<div id="ttab-layout" style="display:${themeTab==='layout'?'block':'none'}">`;
  h += `<div class="card"><div class="ch"><h3>📐 Layout Settings</h3></div><div style="padding:20px">`;
  h += `<div class="g2">
    <div class="field"><label>Content Max Width (px)</label><input type="number" id="th_maxWidth" value="${t.contentMaxWidth||'1280'}" min="800" max="1920" step="20">
      <div style="font-size:11px;color:#9ca3af;margin-top:4px">Sets the max container width across all pages</div></div>
    <div class="field"><label>Sidebar Position</label>
      <select id="th_sidebarPos">
        <option value="right" ${(t.sidebarPosition||'right')==='right'?'selected':''}>Right Sidebar</option>
        <option value="left" ${t.sidebarPosition==='left'?'selected':''}>Left Sidebar</option>
        <option value="none" ${t.sidebarPosition==='none'?'selected':''}>No Sidebar (Full Width)</option>
      </select></div>
  </div>`;
  h += `<div class="g2">
    <div class="field"><label>Header Style</label>
      <select id="th_headerStyle">
        <option value="default" ${(t.headerStyle||'default')==='default'?'selected':''}>Default (Dark)</option>
        <option value="light" ${t.headerStyle==='light'?'selected':''}>Light Header</option>
        <option value="transparent" ${t.headerStyle==='transparent'?'selected':''}>Transparent / Overlay</option>
        <option value="sticky" ${t.headerStyle==='sticky'?'selected':''}>Sticky (Scrolls with page)</option>
      </select></div>
    <div class="field"><label>Footer Style</label>
      <select id="th_footerStyle">
        <option value="default" ${(t.footerStyle||'default')==='default'?'selected':''}>Default (Dark)</option>
        <option value="light" ${t.footerStyle==='light'?'selected':''}>Light Footer</option>
        <option value="minimal" ${t.footerStyle==='minimal'?'selected':''}>Minimal (1 row)</option>
      </select></div>
  </div>`;
  h += `<div class="g2">
    <div class="field"><label>Card Border Radius (px)</label><input type="number" id="th_radius" value="${t.borderRadius||'6'}" min="0" max="32">
      <div style="font-size:11px;color:#9ca3af;margin-top:4px">Applies to cards, buttons, images</div></div>
    <div class="field"><label>Card Shadow (CSS value)</label><input id="th_shadow" value="${esc(t.cardShadow||'0 1px 3px rgba(0,0,0,0.08)')}" placeholder="0 2px 8px rgba(0,0,0,0.1)"></div>
  </div>`;
  // Visual layout selector
  h += `<div style="border-top:1px solid #f0f0f1;margin-top:16px;padding-top:16px">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:12px">Layout Preview</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
      <div onclick="document.getElementById('th_sidebarPos').value='none'" style="border:2px solid #c3c4c7;border-radius:6px;padding:12px;cursor:pointer;text-align:center">
        <div style="height:40px;background:#e5e7eb;border-radius:3px;margin-bottom:6px"></div>
        <div style="font-size:12px;font-weight:600">Full Width</div><div style="font-size:11px;color:#9ca3af">No sidebar</div>
      </div>
      <div onclick="document.getElementById('th_sidebarPos').value='right'" style="border:2px solid #2271b1;border-radius:6px;padding:12px;cursor:pointer;text-align:center">
        <div style="height:40px;display:flex;gap:4px;margin-bottom:6px">
          <div style="flex:1;background:#e5e7eb;border-radius:3px"></div>
          <div style="width:30%;background:#c3c4c7;border-radius:3px"></div>
        </div>
        <div style="font-size:12px;font-weight:600">Content + Right Sidebar</div><div style="font-size:11px;color:#2271b1">Currently active</div>
      </div>
      <div onclick="document.getElementById('th_sidebarPos').value='left'" style="border:2px solid #c3c4c7;border-radius:6px;padding:12px;cursor:pointer;text-align:center">
        <div style="height:40px;display:flex;gap:4px;margin-bottom:6px">
          <div style="width:30%;background:#c3c4c7;border-radius:3px"></div>
          <div style="flex:1;background:#e5e7eb;border-radius:3px"></div>
        </div>
        <div style="font-size:12px;font-weight:600">Left Sidebar + Content</div><div style="font-size:11px;color:#9ca3af">Select to enable</div>
      </div>
    </div>
  </div>`;
  h += `</div></div></div>`;

  // ══ TEMPLATE TAB ══
  h += `<div id="ttab-template" style="display:${themeTab==='template'?'block':'none'}">`;
  h += `<div class="card"><div class="ch"><h3>🖼️ Theme Templates</h3><span style="color:var(--dim);font-size:12px">Choose your overall site design layout</span></div><div style="padding:20px">`;
  const layouts = [
    { id: 'layout1', name: '1. Developer Hub', img: 'https://placehold.co/400x250/2271b1/ffffff?text=Developer+Hub' },
    { id: 'layout2', name: '2. Clean & Minimal', img: 'https://placehold.co/400x250/135e96/ffffff?text=Clean+Minimal' },
    { id: 'layout3', name: '3. Split Screen', img: 'https://placehold.co/400x250/1d2327/ffffff?text=Split+Screen' },
    { id: 'layout4', name: '4. Bento Grid', img: 'https://placehold.co/400x250/04AA6D/ffffff?text=Bento+Grid' },
    { id: 'layout5', name: '5. SaaS Dark Mode', img: 'https://placehold.co/400x250/000000/ffffff?text=SaaS+Dark+Mode' },
    { id: 'layout6', name: '6. Creative Brutalism', img: 'https://placehold.co/400x250/FFE500/000000?text=Brutalism' },
    { id: 'layout7', name: '7. Elegant Editorial', img: 'https://placehold.co/400x250/FAF9F6/2C3E50?text=Elegant' },
    { id: 'layout8', name: '8. Enterprise Professional', img: 'https://placehold.co/400x250/0F172A/ffffff?text=Enterprise' }
  ];
  h += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;">`;
  layouts.forEach(l => {
    const isSel = (t.homepageLayout || 'layout1') === l.id;
    h += `
    <div style="border:2px solid ${isSel ? '#2271b1' : '#c3c4c7'}; border-radius:8px; overflow:hidden; cursor:pointer; background:#fff; position:relative; box-shadow:${isSel?'0 0 0 2px rgba(34,113,177,0.3)':'none'}" onclick="document.getElementById('th_homepageLayout').value='${l.id}'; document.querySelectorAll('.tmpl-check').forEach(c=>c.style.display='none'); document.getElementById('chk_${l.id}').style.display='inline';">
      <div style="height:140px; background:url(${l.img}) center/cover;"></div>
      <div style="padding:12px; text-align:center; font-weight:600; color:${isSel ? '#2271b1' : '#3c434a'};">
        <span id="chk_${l.id}" class="tmpl-check" style="display:${isSel?'inline':'none'}">✅ </span> ${l.name}
      </div>
    </div>`;
  });
  h += `</div>`;
  h += `<input type="hidden" id="th_homepageLayout" value="${esc(t.homepageLayout||'layout1')}">`;
  h += `</div></div></div>`;

  // ── CUSTOM CSS TAB ──
  h += `<div id="ttab-customcss" style="display:${themeTab==='customcss'?'block':'none'}">`;
  h += `<div class="card"><div class="ch"><h3>💅 Custom CSS</h3><span style="color:var(--dim);font-size:12px">Written directly into public/custom.css</span></div><div style="padding:20px">`;
  h += `<div style="background:rgba(99,102,241,.07);padding:12px 16px;border-radius:8px;margin-bottom:14px;font-size:12px;color:#6b7280">
    💡 CSS written here is appended to the bottom of <code style="color:#818cf8">public/custom.css</code> after all generated theme styles. This means you can override any generated style. Use browser DevTools to inspect class names.
  </div>`;
  h += `<div class="field"><label>Custom CSS</label>
    <textarea class="editor" id="th_customCSS" style="min-height:380px;font-family:monospace;font-size:13px;tab-size:2" placeholder="/* Write your custom CSS here */\n\n/* Example: change hero background */\n.hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }\n\n/* Example: custom font on headings */\nh1, h2 { letter-spacing: -0.02em; }">${esc(t.customCSS||'')}</textarea></div>`;
  h += `</div></div></div>`;

  // ── ADVANCED TAB ──
  h += `<div id="ttab-advanced" style="display:${themeTab==='advanced'?'block':'none'}">`;
  h += `<div class="card"><div class="ch"><h3>⚙️ Advanced Settings</h3></div><div style="padding:20px">`;
  h += `<div class="g3">
    <div class="field"><label>Theme Mode</label>
      <select id="th_themeMode">
        <option value="light" ${(t.themeMode||'light')==='light'?'selected':''}>☀️ Light Mode</option>
        <option value="dark" ${t.themeMode==='dark'?'selected':''}>🌙 Dark Mode</option>
        <option value="auto" ${t.themeMode==='auto'?'selected':''}>🌓 Auto (follows OS)</option>
      </select>
      <div style="font-size:11px;color:#9ca3af;margin-top:4px">Dark mode adds a dark CSS override block into custom.css</div></div>
    <div class="field"><label>Extra Body CSS Class</label>
      <input id="th_bodyClass" value="${esc(t.bodyClass||'')}" placeholder="my-theme dark-nav ...">
      <div style="font-size:11px;color:#9ca3af;margin-top:4px">Space-separated classes added to &lt;body&gt; tag</div></div>
    <div class="field" style="grid-column:span 1"></div>
  </div>`;
  h += `<div class="field" style="margin-top:16px"><label>Custom &lt;head&gt; Code</label>
    <textarea class="editor" id="th_customHead" style="min-height:120px;font-family:monospace;font-size:13px" placeholder="<!-- Extra meta tags, scripts, or fonts -->\n<link rel='preconnect' href='https://fonts.googleapis.com'>">${esc(t.customHeadCode||'')}</textarea>
    <div style="font-size:11px;color:#9ca3af;margin-top:4px">Injected into &lt;head&gt; of BaseLayout.astro (appended after the auto-generated block)</div></div>`;
  h += `<div style="background:rgba(239,68,68,.07);padding:14px 18px;border-radius:8px;margin-top:16px;font-size:12px;color:#6b7280">
    ⚠️ <strong>Note on body class:</strong> The body class feature requires a small change in your <code>BaseLayout.astro</code> to read from a settings file or prop. For now it's stored in theme-settings.json for your reference.
  </div>`;
  h += `</div></div></div>`;

  $('content').innerHTML = h;

  // Sync color pickers ↔ hex inputs
  const colorIds = ['th_colorPrimary','th_colorAccent','th_colorBackground','th_colorSurface','th_colorText','th_colorMuted','th_colorLink','th_colorLinkHover','th_colorBorder','th_colorButtonText','th_colorHeaderBg','th_colorFooterBg'];
  setTimeout(() => {
    colorIds.forEach(id => {
      const picker = $(id), hex = $(id+'_hex');
      if (picker && hex) {
        picker.addEventListener('input', () => { hex.value = picker.value; });
        hex.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(hex.value)) picker.value = hex.value; });
      }
    });
  }, 50);
}

window.switchThemeTab = function(tab) {
  themeTab = tab;
  renderTheme();
};

window.syncColor = function(pickerId, val) {
  const picker = $(pickerId);
  if (picker && /^#[0-9a-f]{6}$/i.test(val)) picker.value = val;
};

window.saveTheme = async function() {
  const get = id => $(id) ? $(id).value : '';
  const chk = id => $(id) ? $(id).checked : true;
  const data = {
    homepageLayout: get('th_homepageLayout'),
    // Homepage
    heroTitle: get('th_heroTitle'),
    heroSubtitle: get('th_heroSubtitle'),
    heroBtnText: get('th_heroBtnText'),
    heroBtnUrl: get('th_heroBtnUrl'),
    heroSecondaryBtnText: get('th_heroSecBtnText'),
    heroSecondaryBtnUrl: get('th_heroSecBtnUrl'),
    showFeaturedSection: chk('th_showFeat'),
    showRecentPosts: chk('th_showRecent'),
    showTutorialCategories: chk('th_showTutCats'),
    // Colors
    colorPrimary: get('th_colorPrimary'),
    colorAccent: get('th_colorAccent'),
    colorBackground: get('th_colorBackground'),
    colorSurface: get('th_colorSurface'),
    colorText: get('th_colorText'),
    colorMuted: get('th_colorMuted'),
    colorLink: get('th_colorLink'),
    colorLinkHover: get('th_colorLinkHover'),
    colorBorder: get('th_colorBorder'),
    colorButtonText: get('th_colorButtonText'),
    colorHeaderBg: get('th_colorHeaderBg'),
    colorFooterBg: get('th_colorFooterBg'),
    // Typography
    fontFamily: get('th_fontFamily'),
    fontFamilyHeading: get('th_fontFamilyHeading'),
    fontSizeBase: get('th_fontSizeBase'),
    fontSizeSmall: get('th_fontSizeSmall'),
    fontSizeLarge: get('th_fontSizeLarge'),
    lineHeight: get('th_lineHeight'),
    fontWeightHeading: get('th_fontWeightHeading'),
    headingSizeh1: get('th_h1'),
    headingSizeh2: get('th_h2'),
    headingSizeh3: get('th_h3'),
    // Layout
    contentMaxWidth: get('th_maxWidth'),
    sidebarPosition: get('th_sidebarPos'),
    headerStyle: get('th_headerStyle'),
    footerStyle: get('th_footerStyle'),
    borderRadius: get('th_radius'),
    cardShadow: get('th_shadow'),
    // Custom CSS
    customCSS: get('th_customCSS'),
    // Advanced
    themeMode: get('th_themeMode'),
    bodyClass: get('th_bodyClass'),
    customHeadCode: get('th_customHead'),
  };
  // fill in from current tab only; merge with existing for non-rendered tabs
  const merged = { ...themeSettings, ...data };
  const r = await post('/api/theme/save', merged);
  if (r.ok) {
    themeSettings = merged;
    toast('Theme saved! 🎨 public/custom.css updated');
  } else {
    toast('Save failed', false);
  }
};

// ══ INIT ══
(async()=>{
  await loadAll();
  const validPages=['dashboard','tutorials','blogs','books','nav','settings','permalinks','pages','ads','trash','theme'];
  const hash=(location.hash||'').replace('#','');
  goTo(validPages.includes(hash)?hash:'dashboard');
  window.addEventListener('hashchange',()=>{
    const h=(location.hash||'').replace('#','');
    if(validPages.includes(h)&&h!==page) goTo(h);
  });
})();
