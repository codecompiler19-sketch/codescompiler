const fs = require('fs');
const path = require('path');

const map = {
  "Animated JavaScript Accordion.png": "js-animated-accordion.mdx",
  "Building a Personal Portfolio.png": "html-css-masterclass-building-a-personal-portfolio-4.mdx",
  "Calendar Booking Time Slots.png": "js-calendar-booking.mdx",
  "Cuddle Creature Adoption Center.png": "js-cuddle-pets.mdx",
  "Flashcard Study App.png": "js-flashcard-app.mdx",
  "Interactive Canvas Particle Network.png": "javascript-particle-network.mdx",
  "JavaScript Array Methods Guide.png": "javascript-array-methods-a-complete-guide-with-examples-4.mdx",
  "Modern Music Player UI.png": "html-css-music-player.mdx",
  "Regex Validation for Registration Forms.png": "regex-validation-for-registration-forms-in-javascript-5.mdx",
  "Responsive Mega Menu Tutorial.png": "responsive-mega-menu-tutorial-with-html-css-4.mdx",
  "Responsive Product Card UI.png": "responsive-product-card-ui-using-html-css-2.mdx",
  "Responsive Website Layout in HTML & CSS.png": "how-to-build-a-responsive-website-layout-in-html-css-1.mdx",
  "Rock Paper Scissors Game in JavaScript.png": "how-to-code-a-rock-paper-scissors-game-in-javascript-5.mdx",
  "Simon Says Memory Game.png": "javascript-simon-says-game.mdx",
  "Weather App using Fetch API.png": "javascript-weather-api.mdx",
  "Wordle Clone in Vanilla JS.png": "js-wordle-clone.mdx"
};

const srcDir = 'C:\\Users\\Computer\\Downloads\\images (7)';
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
