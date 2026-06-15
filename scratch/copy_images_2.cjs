const fs = require('fs');
const path = require('path');

const map = {
  "3D Saloon Door Image Split.png": "css-saloon-door-split.mdx",
  "CSS Preloaders & Spinners.png": "css-spinners-preloaders.mdx",
  "CSS Sticky Stacking Cards.png": "css-stacking-cards.mdx",
  "Dynamic Text-Mask Unveiling.png": "css-text-mask-unveil.mdx",
  "Gentle Wave Border Hover Card.png": "css-wave-border-card.mdx",
  "Kindness Seed Growth Dashboard.png": "css-seed-growth-progress.mdx",
  "Ripple Pond Card.png": "css-ripple-pond-card.mdx",
  "SaaS Landing Page Template.png": "css-saas-landing-page.mdx",
  "Stained Glass Light Leak.png": "css-stained-glass-light.mdx",
  "Sweetheart Locket Profile Card.png": "css-sweetheart-locket.mdx",
  "Whimsical Star Twinkle String.png": "css-star-twinkle-string.mdx"
};

const srcDir = 'C:\\Users\\Computer\\Downloads\\images (6)';
const blogDir = 'src/content/blog';

Object.entries(map).forEach(([imgName, postFile]) => {
  const postPath = path.join(blogDir, postFile);
  if (!fs.existsSync(postPath)) {
    console.error('Post not found:', postPath);
    return;
  }
  
  const content = fs.readFileSync(postPath, 'utf8');
  const match = content.match(/image:\s*"(.*?)"/);
  
  if (match) {
    let imgPath = match[1];
    if (imgPath.startsWith('/')) imgPath = imgPath.slice(1);
    
    const destPath = path.join('public', imgPath);
    const destDir = path.dirname(destPath);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    const srcImgPath = path.join(srcDir, imgName);
    if (fs.existsSync(srcImgPath)) {
      fs.copyFileSync(srcImgPath, destPath);
      console.log(`Copied ${imgName} to ${destPath}`);
    } else {
      console.error('Source image not found:', srcImgPath);
    }
  } else {
    console.error('No image field in frontmatter:', postFile);
  }
});
