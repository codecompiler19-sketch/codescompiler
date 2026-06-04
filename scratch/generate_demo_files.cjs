const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../src/content/blog');
const demosDir = path.join(__dirname, '../public/demos');

if (!fs.existsSync(demosDir)) {
  fs.mkdirSync(demosDir, { recursive: true });
}

const files = fs.readdirSync(blogDir);

files.forEach(file => {
  if (file.endsWith('.mdx')) {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
    
    // Check if hasDemo: true is in the file
    if (content.includes('hasDemo: true')) {
      const slug = file.replace('.mdx', '');
      const demoPath = path.join(demosDir, `${slug}.html`);
      
      // Try to extract title for the demo
      let title = slug.replace(/-/g, ' ');
      const titleMatch = content.match(/title:\s*"(.*?)"/);
      if (titleMatch) {
        title = titleMatch[1];
      }
      
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} Demo</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f3f4f6;
      color: #333;
      text-align: center;
    }
    .demo-container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      max-width: 600px;
    }
    h1 { color: #04AA6D; }
  </style>
</head>
<body>
  <div class="demo-container">
    <h1>${title}</h1>
    <p>This is a live demo environment. You can implement your HTML, CSS, and JavaScript here based on the tutorial!</p>
  </div>
</body>
</html>`;
      
      // Only generate if it doesn't already exist or if we want to overwrite
      if (!fs.existsSync(demoPath)) {
        fs.writeFileSync(demoPath, htmlContent);
        console.log(`Created demo file for: ${slug}`);
      }
    }
  }
});

console.log("Demo generation complete.");
