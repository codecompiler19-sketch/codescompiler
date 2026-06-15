const fs = require('fs');
const path = require('path');

const map = {
  "3D Parallax Cards.png": "css-3d-parallax-cards.mdx",
  "CSS Only Accordion.png": "css-only-accordion.mdx",
  "CSS Only Tabs.png": "css-only-tabs.mdx",
  "Glass Fracture Reveal.png": "css-glass-fracture-reveal.mdx",
  "Hexagon Crop Spin.png": "css-hexagon-crop-spin.mdx",
  "Holographic Profile Card.png": "css-holographic-profile-card.mdx",
  "Liquid Morphing.png": "css-liquid-morphing.mdx",
  "Love Letter Envelope.png": "css-love-letter-envelope.mdx",
  "Magic Ink Button.png": "css-magic-ink-button.mdx",
  "Morning Coffee Card.png": "css-morning-coffee-card.mdx",
  "Neon Generator.png": "css-neon-generator.mdx",
  "Neumorphism Calculator.png": "css-neumorphism-calculator.mdx",
  "Origami Fold Card.png": "css-origami-fold-card.mdx",
  "Origami Photo Hinge.png": "css-origami-photo-hinge.mdx",
  "Paper Plane Button.png": "css-paper-plane-button.mdx",
  "Pill Nav Tabs.png": "css-pill-nav-tabs.mdx",
  "Puzzle Piece Hover.png": "css-puzzle-piece-hover.mdx",
  "RGB Split Snap.png": "css-rgb-split-snap.mdx",
  "Restaurant Menu.png": "css-restaurant-menu.mdx"
};

const srcDir = 'C:\\Users\\Computer\\Downloads\\images (5)';
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
