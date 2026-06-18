const fs = require('fs');
const path = require('path');

const demosDir = path.join(__dirname, '../public/demos');
if (!fs.existsSync(demosDir)) {
  console.error("Demos directory not found at: " + demosDir);
  process.exit(1);
}

const files = fs.readdirSync(demosDir).filter(f => f.endsWith('.html'));
console.log(`Found ${files.length} demo files to check.`);

let updatedCount = 0;
let skippedCount = 0;

files.forEach(file => {
  const filePath = path.join(demosDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const slug = file.replace('.html', '');
  
  // Check if redirect script is already present
  if (content.includes('window.self === window.top')) {
    skippedCount++;
    return;
  }
  
  // Prepare canonical and redirect code
  const injection = `\n  <link rel="canonical" href="https://codescompiler.com/blog/${slug}/" />\n  <script>\n    if (window.self === window.top) {\n      window.location.replace('/blog-demo/' + window.location.pathname.split('/').pop().replace('.html', '') + '/');\n    }\n  </script>`;
  
  // Inject right after <head> or <HEAD> tag
  if (/<head>/i.test(content)) {
    // Replace case-insensitively, keeping the original head casing
    content = content.replace(/(<head>)/i, `$1${injection}`);
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
  } else {
    console.warn(`Warning: <head> tag not found in ${file}! Injected at top instead.`);
    content = injection + '\n' + content;
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
  }
});

console.log(`\nInjection execution completed.`);
console.log(`Successfully updated: ${updatedCount} files.`);
console.log(`Skipped (already injected): ${skippedCount} files.`);
