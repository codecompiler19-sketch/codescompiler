const fs = require('fs');
const path = require('path');

const dlPath = 'C:/Users/Computer/Downloads/CodesCompiler-CSS-MDX-Tutorials (2)/codescompiler-css-mdx';
const wsPath = 'c:/Users/Computer/Desktop/github/New_codecompiler/codescompiler/src/content/tutorials';

const dlFiles = fs.readdirSync(dlPath).filter(f => f.endsWith('.mdx'));
let updated = 0;

dlFiles.forEach(f => {
  const filePath = path.join(wsPath, f);
  let content = fs.readFileSync(filePath, 'utf-8');
  const norm = content.replace(/\r\n/g, '\n');
  const m = norm.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  let fmStr = '', body = norm;
  if (m) {
    fmStr = m[1];
    body = m[2];
  }

  const fm = {};
  fmStr.split('\n').forEach(l => {
    const ci = l.indexOf(':');
    if (ci === -1) return;
    const k = l.slice(0, ci).trim();
    let v = l.slice(ci + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    fm[k] = v;
  });

  const title = fm.title || f.replace('.mdx', '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const desc = fm.description || (`Learn ${title} with practical CSS examples and tutorials.`);
  const permalink = fm.permalink || f.replace('.mdx', '');
  const order = (fm.order !== undefined && fm.order !== null && fm.order !== '') ? Number(fm.order) : 99;

  let newFrontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndescription: "${desc.replace(/"/g, '\\"')}"\ncategory: "css"\norder: ${order}\npermalink: "${permalink}"\n`;
  if (fm.group) newFrontmatter += `group: "${fm.group.replace(/"/g, '\\"')}"\n`;
  newFrontmatter += `---\n\n${body.trim()}`;

  fs.writeFileSync(filePath, newFrontmatter, 'utf-8');
  updated++;
});

console.log(`Successfully formatted all ${updated} CSS tutorial files in src/content/tutorials!`);
