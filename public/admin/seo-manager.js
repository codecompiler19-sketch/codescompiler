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
