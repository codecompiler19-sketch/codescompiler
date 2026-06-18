const fs = require('fs');
const path = require('path');

const map = {
  "Building a Personal Portfolio.png": "html-css-masterclass-building-a-personal-portfolio-4.mdx",
  "JavaScript Array Methods Guide.png": "javascript-array-methods-a-complete-guide-with-examples-4.mdx",
  "Regex Validation for Registration Forms.png": "regex-validation-for-registration-forms-in-javascript-5.mdx",
  "Responsive Mega Menu Tutorial.png": "responsive-mega-menu-tutorial-with-html-css-4.mdx",
  "Responsive Product Card UI.png": "responsive-product-card-ui-using-html-css-2.mdx",
  "Responsive Website Layout in HTML & CSS.png": "how-to-build-a-responsive-website-layout-in-html-css-1.mdx",
  "Rock Paper Scissors Game in JavaScript.png": "how-to-code-a-rock-paper-scissors-game-in-javascript-5.mdx"
};

const srcDir = 'C:\\Users\\Computer\\Downloads\\images (7)';
const blogDir = 'src/content/blog';

Object.entries(map).forEach(([imgName, postFile]) => {
  const postPath = path.join(blogDir, postFile);
  if (!fs.existsSync(postPath)) return;
  
  let content = fs.readFileSync(postPath, 'utf8');
  
  // Create a unique name based on the post file name
  const uniqueImgName = postFile.replace('.mdx', '.png');
  const newImgPath = `/images/posts/${uniqueImgName}`;
  
  // Replace the image field in the frontmatter
  if (content.includes('image: "/images/posts/default-coding.png"')) {
    content = content.replace('image: "/images/posts/default-coding.png"', `image: "${newImgPath}"`);
    fs.writeFileSync(postPath, content, 'utf8');
    console.log(`Updated frontmatter in ${postFile} to ${newImgPath}`);
  }
  
  // Copy the image
  const destPath = path.join('public', newImgPath.slice(1));
  const srcImgPath = path.join(srcDir, imgName);
  if (fs.existsSync(srcImgPath)) {
    fs.copyFileSync(srcImgPath, destPath);
    console.log(`Copied ${imgName} to ${destPath}`);
  }
});
