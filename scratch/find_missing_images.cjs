const fs = require('fs');
const path = require('path');
const dir = 'src/content/blog';

const files = fs.readdirSync(dir);
files.forEach(f => {
  if (!f.endsWith('.mdx') && !f.endsWith('.md')) return;
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const match = content.match(/image:\s*"(.*?)"/);
  if (match) {
    const imgPath = match[1];
    // Remove leading slash if present
    const cleanImgPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
    const fullPath = path.join('public', cleanImgPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`http://localhost:4321/blog/${f.replace('.mdx', '').replace('.md', '')}`);
    }
  }
});
