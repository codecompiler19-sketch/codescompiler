const fs = require('fs');
const path = require('path');
const files = ['css-3d-parallax-cards.mdx', 'css-glass-fracture-reveal.mdx', 'css-hexagon-crop-spin.mdx', 'css-holographic-profile-card.mdx', 'css-liquid-morphing.mdx', 'css-love-letter-envelope.mdx', 'css-magic-ink-button.mdx', 'css-morning-coffee-card.mdx', 'css-neon-generator.mdx', 'css-neumorphism-calculator.mdx', 'css-only-accordion.mdx', 'css-only-tabs.mdx', 'css-origami-fold-card.mdx', 'css-origami-photo-hinge.mdx', 'css-paper-plane-button.mdx', 'css-pill-nav-tabs.mdx', 'css-puzzle-piece-hover.mdx', 'css-restaurant-menu.mdx', 'css-rgb-split-snap.mdx'];

files.forEach(f => {
  const content = fs.readFileSync('src/content/blog/' + f, 'utf8');
  const match = content.match(/image:\s*\"(.*?)\"/);
  if (match) {
    console.log(`${f} -> ${match[1]}`);
  }
});
