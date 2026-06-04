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
      
      // Extract code blocks
      let htmlCode = '';
      let cssCode = '';
      let jsCode = '';
      
      const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
      if (htmlMatch) htmlCode = htmlMatch[1];
      
      const cssMatch = content.match(/```css\n([\s\S]*?)\n```/);
      if (cssMatch) cssCode = cssMatch[1];
      
      const jsMatch = content.match(/```javascript\n([\s\S]*?)\n```/);
      if (jsMatch) jsCode = jsMatch[1];

      // If there is no specific code extracted, we'll fall back to default,
      // but since we generated the files, they all have code blocks.

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} Demo</title>
  <style>
    /* Reset & base styles for demo */
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* Extracted CSS */
${cssCode}
  </style>
</head>
<body>
  <!-- Extracted HTML -->
${htmlCode}

  <!-- Extracted JS -->
  <script>
${jsCode}
  </script>
</body>
</html>`;
      
      fs.writeFileSync(demoPath, htmlContent);
      console.log(`Updated demo file with actual code for: ${slug}`);
    }
  }
});

console.log("Demo update complete.");
