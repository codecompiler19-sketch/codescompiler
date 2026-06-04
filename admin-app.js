// CodesCompiler Content Manager — WordPress-style CMS
const API='';
let page='dashboard',stats={},tutorials=[],blogs=[],navItems=[],siteSettings={},pages=[],adsConfig={},trashBin=[];
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
  const items=[
    {id:'dashboard',ico:'📊',label:'Dashboard'},
    {id:'tutorials',ico:'📖',label:'Tutorials',ct:tutorials.length},
    {id:'blogs',ico:'✍️',label:'Posts',ct:blogs.length},
    {id:'pages',ico:'📄',label:'Pages',ct:pages.length},
    {id:'nav',ico:'🔗',label:'Menus'},
    {id:'ads',ico:'💰',label:'Ad Manager'},
    {id:'permalinks',ico:'🔗',label:'Permalinks'},
    {id:'settings',ico:'⚙️',label:'Settings'},
    {id:'trash',ico:'🗑️',label:'Trash',ct:trashBin.length},
  ];
  let h='<div class="slab">Content</div>';
  items.forEach(i=>{h+=`<div class="si ${page===i.id?'on':''}" onclick="goTo('${i.id}')"><span class="ico">${i.ico}</span>${i.label}${i.ct!=null?`<span class="ct">${i.ct}</span>`:''}</div>`});
  $('snav').innerHTML=h;
  $('sfoot').innerHTML=`<strong>${tutorials.length+blogs.length}</strong> total items · <strong>${Object.keys(stats.tutorialsByCategory||{}).length+Object.keys(stats.blogsByCategory||{}).length}</strong> categories`;
}

// Load all
async function loadAll(){
  try{[stats,tutorials,blogs,navItems,siteSettings,pages,adsConfig,trashBin]=await Promise.all([api('/api/stats'),api('/api/tutorials/list'),api('/api/blogs/list'),api('/api/nav/get'),api('/api/settings/get'),api('/api/pages/list'),api('/api/ads/get'),api('/api/trash/list')])}
  catch(e){toast('Failed to connect to server',false)}
  renderSidebar();
}

function goTo(p){page=p;location.hash=p;renderSidebar();({dashboard:renderDash,tutorials:renderTuts,blogs:renderBlogs,nav:renderNav,settings:renderSettings,permalinks:renderPermalinks,pages:renderPages,ads:renderAds,trash:renderTrash})[p]?.()}

// ══ DASHBOARD ══
function renderDash(){
  $('ptitle').textContent='Dashboard';
  $('tact').innerHTML=`<button class="btn bg" onclick="loadAll().then(()=>goTo('dashboard'))">🔄 Refresh</button>`;
  const tc=stats.tutorialsByCategory||{},bc=stats.blogsByCategory||{};
  let h=`<div class="sgrid">
    <div class="sc s1"><h3>${stats.totalTutorials||0}</h3><p>Tutorials</p></div>
    <div class="sc s2"><h3>${stats.totalBlogs||0}</h3><p>Posts</p></div>
    <div class="sc s3"><h3>${navItems.length||0}</h3><p>Menu Links</p></div>
    <div class="sc s4"><h3>${TCAT.length}</h3><p>Languages</p></div>
  </div>`;
  // Tutorials table
  h+=`<div class="card"><div class="ch"><h3>📖 Tutorials by Language</h3></div><table><thead><tr><th>Language</th><th>Lessons</th><th></th></tr></thead><tbody>`;
  TCAT.forEach(c=>{h+=`<tr><td><span class="badge ${CB[c]||'bdf'}">${CATNAME[c]||c}</span></td><td><strong>${tc[c]||0}</strong> lessons</td><td><button class="btn bg bs" onclick="tutFilter='${c}';goTo('tutorials')">View All →</button></td></tr>`});
  h+=`</tbody></table></div>`;
  // Blog table
  h+=`<div class="card"><div class="ch"><h3>✍️ Posts by Category</h3></div><table><thead><tr><th>Category</th><th>Posts</th></tr></thead><tbody>`;
  Object.entries(bc).sort((a,b)=>b[1]-a[1]).forEach(([c,n])=>{h+=`<tr><td>${esc(c)}</td><td><strong>${n}</strong></td></tr>`});
  h+=`</tbody></table></div>`;
  $('content').innerHTML=h;
}

// ══ TUTORIALS ══
let tutFilter='';
function renderTuts(){
  $('ptitle').textContent='Tutorials';
  $('tact').innerHTML=`<input class="srch" placeholder="Search tutorials..." oninput="tutSrch(this.value)"><button class="btn bp" style="margin-left:10px" onclick="newTut()">+ Add New</button>`;
  showTuts(tutorials);
}
function tutSrch(q){q=q.toLowerCase();showTuts(tutorials.filter(t=>(t.title||'').toLowerCase().includes(q)||(t.category||'').includes(q)))}
function showTuts(list){
  const f=tutFilter?list.filter(t=>t.category===tutFilter):list;
  let h='';
  if(tutFilter)h+=`<div style="margin-bottom:14px"><button class="btn bg bs" onclick="tutFilter='';renderTuts()">✕ Showing: ${CATNAME[tutFilter]||tutFilter} only</button></div>`;
  h+=`<div class="card"><table><thead><tr><th style="width:40px">#</th><th>Title</th><th>Language</th><th>Lesson #</th><th>File</th><th style="width:100px">Actions</th></tr></thead><tbody>`;
  if(!f.length)h+=`<tr><td colspan="6" class="empty">No tutorials found</td></tr>`;
  f.forEach((t,i)=>{h+=`<tr><td>${i+1}</td><td><strong>${esc(t.title)}</strong></td><td><span class="badge ${CB[t.category]||'bdf'}">${CATNAME[t.category]||esc(t.category||'?')}</span></td><td>${t.order||'-'}</td><td style="color:var(--dim);font-size:12px">${esc(t.file)}</td><td><button class="btn bg bs" onclick="editTut('${esc(t.file)}')">✏️ Edit</button> <button class="btn bd bs" onclick="delTut('${esc(t.file)}')">🗑️</button></td></tr>`});
  h+=`</tbody></table></div>`;
  $('content').innerHTML=h;
}

function tutForm(t={}){
  return `<div class="g2"><div class="field"><label>Title</label><input id="tf_t" value="${esc(t.title||'')}" placeholder="Enter tutorial title..."></div>
  <div class="field"><label>Language</label><select id="tf_c">${TCAT.map(c=>`<option value="${c}" ${t.category===c?'selected':''}>${CATNAME[c]}</option>`).join('')}</select></div></div>
  <div class="g3"><div class="field"><label>Lesson Order</label><input id="tf_o" type="number" value="${t.order||1}" min="1"></div>
  <div class="field"><label>URL Slug</label><input id="tf_f" value="${esc(t.file||'')}" ${t.file?'readonly':''} placeholder="my-tutorial-slug.mdx"></div>
  <div class="field"><label>SEO Description</label><input id="tf_d" value="${esc(t.description||'')}" placeholder="Brief description for search engines..."></div></div>
  <div class="tab-row"><div class="tab-item on" onclick="showEditorTab(this,'tf_editor')">✏️ Write</div><div class="tab-item" onclick="showPreviewTab(this,'tf_editor','tf_preview')">👁️ Preview</div></div>
  <div id="tf_editor">${editorToolbar('tf_b')}<textarea class="editor" id="tf_b" placeholder="Start writing your tutorial content here..."></textarea></div>
  <div id="tf_preview" style="display:none"></div>`;
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

function buildTutContent(){return`---\ntitle: "${$('tf_t').value}"\ndescription: "${$('tf_d').value}"\ncategory: "${$('tf_c').value}"\norder: ${$('tf_o').value}\n---\n\n${$('tf_b').value}`}

// ══ BLOGS ══
let blogFilters = { q: '', cat: '', status: '', author: '' };

function renderBlogs(){
  $('ptitle').textContent='Posts';
  $('tact').innerHTML=`<button class="btn bp" onclick="newBlog()">+ Add New Post</button>`;
  
  const authors = [...new Set(blogs.map(b => b.author || 'CodesCompiler'))].filter(Boolean);
  
  let h = `
    <div style="display:flex;gap:10px;margin-bottom:18px;background:var(--card);padding:14px;border-radius:10px;border:1px solid var(--brd);align-items:center;flex-wrap:wrap">
      <div style="font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;margin-right:4px">\ud83d\udd0d Filters:</div>
      <input class="srch" placeholder="Search title..." oninput="blogFilter('q', this.value)" style="width:200px" value="${esc(blogFilters.q)}">
      <select onchange="blogFilter('cat', this.value)" style="width:160px">
        <option value="">All Categories</option>
        ${BCAT.map(c => `<option value="${c}" ${blogFilters.cat===c?'selected':''}>${c}</option>`).join('')}
      </select>
      <select onchange="blogFilter('status', this.value)" style="width:140px">
        <option value="">All Statuses</option>
        <option value="publish" ${blogFilters.status==='publish'?'selected':''}>✅ Published</option>
        <option value="draft" ${blogFilters.status==='draft'?'selected':''}>📝 Drafts</option>
      </select>
      <select onchange="blogFilter('author', this.value)" style="width:160px">
        <option value="">All Authors</option>
        ${authors.map(a => `<option value="${a}" ${blogFilters.author===a?'selected':''}>${a}</option>`).join('')}
      </select>
      ${(blogFilters.q||blogFilters.cat||blogFilters.status||blogFilters.author) ? `<button class="btn bg bs" onclick="blogFilters={q:'',cat:'',status:'',author:''};renderBlogs()">Clear Filters</button>` : ''}
    </div>
    <div id="blog_table_container"></div>
  `;
  $('content').innerHTML = h;
  applyBlogFilters();
}

function blogFilter(key, val) {
  blogFilters[key] = val;
  applyBlogFilters();
  // If clear button state needs to update, we just re-render the whole header or update dynamically. 
  // For simplicity, re-rendering the whole page works since it's local state.
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
  let h=`<div class="card"><table><thead><tr><th style="width:40px">#</th><th>Title</th><th>Category</th><th>Author</th><th>Date</th><th>Status</th><th style="width:100px">Actions</th></tr></thead><tbody>`;
  if(!list.length)h+=`<tr><td colspan="7" class="empty">No posts match your filters.</td></tr>`;
  list.forEach((b,i)=>{
    const feat=b.featured==='true'||b.featured===true;
    const isDraft=b.draft==='true'||b.draft===true;
    h+=`<tr><td>${i+1}</td><td><strong>${esc(b.title)}</strong>${feat?' ⭐':''}</td><td style="font-size:12px">${esc(b.category||'')}</td><td style="font-size:12px;color:var(--dim)">${esc(b.author||'CodesCompiler')}</td><td style="color:var(--dim);font-size:12px">${esc(b.date||'')}</td><td>${isDraft?'<span class="badge" style="background:rgba(245,158,11,.12);color:#fbbf24">Draft</span>':'<span class="badge bpub">Published</span>'}</td><td><button class="btn bg bs" onclick="editBlog('${esc(b.file)}')">✏️ Edit</button> <button class="btn bd bs" onclick="delBlog('${esc(b.file)}')">🗑️</button></td></tr>`});
  h+=`</tbody></table></div>`;
  const cont = $('blog_table_container');
  if(cont) cont.innerHTML=h;
}

function blogForm(b={}){
  const isDraft=b.status==='draft'||b.draft==='true'||b.draft===true;
  return `<div class="g3"><div class="field"><label>Title</label><input id="bf_t" value="${esc(b.title||'')}" placeholder="Enter post title..."></div>
  <div class="field"><label>Category</label><select id="bf_c">${BCAT.map(c=>`<option value="${c}" ${b.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
  <div class="field"><label>Status</label><select id="bf_status"><option value="publish" ${!isDraft?'selected':''}>✅ Published</option><option value="draft" ${isDraft?'selected':''}>📝 Draft</option></select></div></div>
  <div class="g3"><div class="field"><label>Publish Date</label><input id="bf_dt" type="date" value="${b.date||new Date().toISOString().split('T')[0]}"></div>
  <div class="field"><label>URL Slug</label><input id="bf_f" value="${esc(b.file||'')}" ${b.file?'readonly':''} placeholder="my-post-slug.mdx"></div>
  <div class="field"><label>Featured Image Path</label><input id="bf_img" value="${esc(b.image||'')}" placeholder="/images/posts/image.png"></div></div>
  <div class="g2"><div class="field"><label>SEO Meta Title (optional override)</label><input id="bf_seo" value="${esc(b.seoTitle||'')}" placeholder="Custom title for Google results..."></div>
  <div class="field"><label>SEO Description</label><input id="bf_d" value="${esc(b.description||'')}" placeholder="Brief description for search engines..."></div></div>
  <div class="g2"><div class="field"><label>Tags (comma separated)</label><input id="bf_tg" value="${esc(b.tags||'')}" placeholder="css, animation, design"></div>
  <div class="field"><label>Author</label><input id="bf_au" value="${esc(b.author||'CodesCompiler')}"></div></div>
  <div class="g3"><div class="field"><label class="chk"><input type="checkbox" id="bf_ft" ${b.featured==='true'||b.featured===true?'checked':''}><span>⭐ Featured Post</span></label></div>
  <div class="field"><label class="chk"><input type="checkbox" id="bf_dm" ${b.hasDemo==='true'||b.hasDemo===true?'checked':''}><span>🖥️ Has Live Demo</span></label></div>
  <div class="field"><label class="chk"><input type="checkbox" id="bf_noads" ${b.disableAds==='true'||b.disableAds===true?'checked':''}><span>🚫 Disable Ads on this post</span></label></div></div>
  <div class="tab-row"><div class="tab-item on" onclick="showEditorTab(this,'bf_editor')">✏️ Write</div><div class="tab-item" onclick="showPreviewTab(this,'bf_editor','bf_preview')">👁️ Preview</div></div>
  <div id="bf_editor">${editorToolbar('bf_b')}<textarea class="editor" id="bf_b" placeholder="Start writing your post content here..."></textarea></div>
  <div id="bf_preview" style="display:none"></div>`;
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
function renderPages(){
  $('ptitle').textContent='Pages';
  $('tact').innerHTML=`<button class="btn bp" onclick="newPage()">+ New Page</button>`;
  let h=`<div class="card"><div class="ch"><h3>📄 Static Pages</h3><span style="color:var(--dim);font-size:12px">${pages.length} pages</span></div>
  <table><thead><tr><th>Title</th><th>URL</th><th>File</th><th style="width:100px">Actions</th></tr></thead><tbody>`;
  if(!pages.length) h+=`<tr><td colspan="4" class="empty">No pages</td></tr>`;
  pages.forEach(p=>{
    h+=`<tr><td><strong>${esc(p.title)}</strong></td><td style="font-size:12px;color:var(--muted);font-family:monospace">${esc(p.url)}</td><td style="font-size:12px;color:var(--dim)">${esc(p.file)}</td>
    <td><button class="btn bg bs" onclick="editPage('${esc(p.file)}')">\u270f\ufe0f Edit</button> <button class="btn bd bs" onclick="delPage('${esc(p.file)}')">\ud83d\uddd1\ufe0f</button></td></tr>`;
  });
  h+=`</tbody></table></div>`;
  h+=`<div style="background:rgba(99,102,241,.08);padding:14px 18px;border-radius:10px;font-size:13px;color:var(--muted)">\ud83d\udca1 Pages are Astro template files (.astro). You can edit the HTML content directly. For new pages, a basic template will be created for you.</div>`;
  $('content').innerHTML=h;
}

function newPage(){
  const slug=prompt('Enter page URL slug (e.g. "faq"):');
  if(!slug) return;
  const fn=slug.replace(/[^a-z0-9-]/gi,'-').toLowerCase()+'.astro';
  const template=`---\nimport BaseLayout from '../layouts/BaseLayout.astro';\n---\n<BaseLayout title="${slug.charAt(0).toUpperCase()+slug.slice(1)}" description="${slug} page">\n  <div class="max-w-screen-xl mx-auto px-5 py-12">\n    <h1 class="text-3xl font-bold mb-6">${slug.charAt(0).toUpperCase()+slug.slice(1)}</h1>\n    <p>Your content here...</p>\n  </div>\n</BaseLayout>`;
  openEditor('New Page: '+fn,
    `<div class="card"><div class="ch"><h3>Page Content</h3><span style="color:var(--dim);font-size:12px">${fn}</span></div><div style="padding:16px"><textarea class="editor" id="pg_body" style="min-height:500px">${esc(template)}</textarea></div></div>`,
    async()=>{
      await post('/api/pages/save',{filename:fn,content:$('pg_body').value});
      toast('Page created! 🎉');await loadAll();renderPages();
    },
    ()=>renderPages(),
    '<span class="badge bpub" style="margin-right:8px">New</span>'
  );
}

async function editPage(file){
  const d=await api('/api/pages/get?file='+encodeURIComponent(file));
  if(d.error)return toast('File not found',false);
  openEditor('Edit Page: '+file,
    `<div class="card"><div class="ch"><h3>Page Content (.astro template)</h3><span style="color:var(--dim);font-size:12px">${file}</span></div><div style="padding:16px"><textarea class="editor" id="pg_body" style="min-height:500px">${esc(d.content)}</textarea></div></div>`,
    async()=>{
      await post('/api/pages/save',{filename:file,content:$('pg_body').value});
      toast('Page saved! ✅');
    },
    ()=>renderPages(),
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
  const validPages=['dashboard','tutorials','blogs','nav','settings','permalinks','pages','ads','trash'];
  const hash=(location.hash||'').replace('#','');
  goTo(validPages.includes(hash)?hash:'dashboard');
  window.addEventListener('hashchange',()=>{
    const h=(location.hash||'').replace('#','');
    if(validPages.includes(h)&&h!==page) goTo(h);
  });
})();
