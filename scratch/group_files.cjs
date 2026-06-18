const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../src/content/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx'));

const categories = {};

files.forEach(file => {
  const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
  const catMatch = content.match(/category:\s*"(.*?)"/);
  if (catMatch) {
    const cat = catMatch[1];
    if (!categories[cat]) categories[cat] = [];
    
    // Only include the files we just generated (they end with -1, -2, etc.)
    if (file.match(/-\d\.mdx$/)) {
      categories[cat].push(file);
    }
  }
});

for (const [cat, files] of Object.entries(categories)) {
  if (files.length > 0) {
    console.log(`Category: ${cat}`);
    console.log(`Files: ${files.join(', ')}`);
  }
}
