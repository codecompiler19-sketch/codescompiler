const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Computer\\Downloads\\images (8)';
const destDir = path.join(process.cwd(), 'public', 'images', 'posts');
const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');

const files = fs.readdirSync(srcDir);
for (const file of files) {
  if (file.endsWith('.png') || file.endsWith('.jpg')) {
    const nameWithoutExt = path.parse(file).name;
    const kebabName = nameWithoutExt.toLowerCase().replace(/\s+/g, '-');
    const newFileName = kebabName + path.parse(file).ext;
    
    // Copy image
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, newFileName));
    console.log('Copied', file, 'to', newFileName);
    
    // Update MDX
    const mdxPath = path.join(blogDir, kebabName + '.mdx');
    if (fs.existsSync(mdxPath)) {
      let content = fs.readFileSync(mdxPath, 'utf8');
      const newImageStr = '/images/posts/' + newFileName;
      content = content.replace(/image:\s*["'].*?["']/g, 'image: "' + newImageStr + '"');
      fs.writeFileSync(mdxPath, content);
      console.log('Updated', kebabName + '.mdx');
    } else {
      console.log('MDX not found for', kebabName);
    }
  }
}
