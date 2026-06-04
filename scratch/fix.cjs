const fs = require('fs');

const files = [
  'C:/Users/Computer/.gemini/antigravity/brain/450525e6-a4a0-48e9-89e5-959ed14f4b8b/update.js',
  'C:/Users/Computer/.gemini/antigravity/brain/e3142f49-6437-47b4-a578-0b61764bb699/scratch/script.js',
  'C:/Users/Computer/.gemini/antigravity/brain/b9e1b7f7-9ba2-44f5-b9cc-73eee7266b05/scratch/update-5-files.js'
];

files.forEach(f => {
  let s = fs.readFileSync(f, 'utf8');
  let old = s;
  
  // Actually replace \` with `
  s = s.split('\\`').join('`');
  // Replace \$ with $
  s = s.split('\\$').join('$');
  
  if (old !== s) {
    fs.writeFileSync(f, s);
    console.log('Fixed', f);
  } else {
    console.log('No change', f);
  }
});
