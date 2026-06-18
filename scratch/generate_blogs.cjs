const fs = require('fs');
const path = require('path');

const categories = [
  { name: 'HTML & CSS', tags: ['html', 'css', 'design'] },
  { name: 'JavaScript', tags: ['javascript', 'js', 'frontend'] },
  { name: 'JavaScript Projects', tags: ['javascript', 'project', 'app'] },
  { name: 'Login Form', tags: ['login', 'form', 'ui', 'css'] },
  { name: 'Card Design', tags: ['card', 'css', 'ui', 'design'] },
  { name: 'Navigation Bar', tags: ['navbar', 'navigation', 'css'] },
  { name: 'Image Slider', tags: ['slider', 'carousel', 'javascript'] },
  { name: 'Sidebar Menu', tags: ['sidebar', 'menu', 'navigation'] },
  { name: 'CSS Buttons', tags: ['button', 'css', 'ui'] },
  { name: 'JavaScript Games', tags: ['game', 'javascript', 'fun'] },
  { name: 'Preloader or Loader', tags: ['loader', 'spinner', 'css'] },
  { name: 'Form Validation', tags: ['form', 'validation', 'javascript'] }
];

const seoTitles = {
  'HTML & CSS': [
    'How to Build a Responsive Website Layout in HTML & CSS',
    'Design a Modern Glassmorphism UI with HTML & CSS',
    'Create an Engaging Landing Page using HTML & CSS',
    'HTML & CSS Masterclass: Building a Personal Portfolio',
    'Advanced CSS Grid and Flexbox Layout Examples'
  ],
  'JavaScript': [
    'JavaScript Best Practices for Modern Web Development',
    'How to Manipulate the DOM with Vanilla JavaScript',
    'Understanding Async/Await and Promises in JavaScript',
    'JavaScript Array Methods: A Complete Guide with Examples',
    'How to Build Interactivity into your site using JavaScript'
  ],
  'JavaScript Projects': [
    'Build a Weather App with JavaScript and Fetch API',
    'Create a To-Do List Application using Vanilla JS',
    'How to Build a Calculator with JavaScript',
    'Develop a Countdown Timer Project in JavaScript',
    'Build a Notes App using JavaScript and Local Storage'
  ],
  'Login Form': [
    'Design a Modern Login & Registration Form with HTML and CSS',
    'How to Create a Glassmorphism Login Form',
    'Animated Login Form UI Design using CSS',
    'Responsive Login Page Template with HTML & CSS',
    'Create a Multi-Step Registration Form using JavaScript'
  ],
  'Card Design': [
    'How to Create Beautiful Profile Card Designs in CSS',
    'Responsive Product Card UI using HTML & CSS',
    'Design Interactive Hover Effect Cards with CSS',
    'Create 3D Flip Card Animations in HTML & CSS',
    'Modern Pricing Table Cards using CSS Flexbox'
  ],
  'Navigation Bar': [
    'How to Build a Responsive Navbar with HTML & CSS',
    'Create a Sticky Navigation Bar using CSS and JS',
    'Design an Animated Dropdown Menu in CSS',
    'Responsive Mega Menu Tutorial with HTML & CSS',
    'Build a Transparent Navigation Bar on Scroll'
  ],
  'Image Slider': [
    'Create a Responsive Image Slider using Vanilla JavaScript',
    'How to Build an Infinite Carousel with HTML & CSS',
    'Design an Auto-Playing Image Slider with JS',
    'Interactive 3D Image Slider using CSS & JS',
    'Build a Touch-Friendly Image Swiper in JavaScript'
  ],
  'Sidebar Menu': [
    'How to Build a Responsive Sidebar Menu using HTML & CSS',
    'Create a Collapsible Sidebar Navigation with JavaScript',
    'Design a Modern Dashboard Sidebar UI',
    'Animated Sidebar Menu using CSS Transitions',
    'Build a Dark Mode Sidebar Menu for Web Apps'
  ],
  'CSS Buttons': [
    '10 Creative CSS Button Hover Effects You Must Try',
    'How to Design Neumorphism Buttons in CSS',
    'Create Animated Gradient Buttons using HTML & CSS',
    'Design 3D Clickable Buttons with CSS Box-Shadow',
    'Build Interactive Social Media Share Buttons'
  ],
  'JavaScript Games': [
    'How to Build a Snake Game using JavaScript Canvas',
    'Create a Tic-Tac-Toe Game with HTML, CSS, and JS',
    'Build a Flappy Bird Clone in Vanilla JavaScript',
    'Develop a Memory Matching Game using JS',
    'How to Code a Rock Paper Scissors Game in JavaScript'
  ],
  'Preloader or Loader': [
    'How to Create Awesome CSS Loading Spinners',
    'Design a Custom Page Preloader using HTML & CSS',
    'Animated Skeleton Loaders using CSS Keyframes',
    'Create a Progress Bar Loader with JavaScript',
    'Build Beautiful Bouncing Loaders with CSS'
  ],
  'Form Validation': [
    'Client-Side Form Validation using Vanilla JavaScript',
    'How to Create Live Email Validation in JS',
    'Password Strength Checker using JavaScript',
    'Build a Custom Form Validation Library in JS',
    'Regex Validation for Registration Forms in JavaScript'
  ]
};

const outputDir = path.join(__dirname, '../src/content/blog');

function createSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function generateBlogs() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const cat of categories) {
    const titles = seoTitles[cat.name];
    for (let i = 0; i < titles.length; i++) {
      const seoTitle = titles[i];
      const shortTitle = seoTitle.split(' ').slice(0, 5).join(' '); // A shorter title for the card
      const slug = createSlug(seoTitle) + '-' + (i + 1);
      const fileName = `${slug}.mdx`;
      const filePath = path.join(outputDir, fileName);

      const content = `---
title: "${shortTitle}..."
seoTitle: "${seoTitle}"
description: "Learn ${shortTitle.toLowerCase()} with this comprehensive guide containing source code and step-by-step instructions."
date: "2026-06-0${i + 1}"
category: "${cat.name}"
tags: ${JSON.stringify(cat.tags)}
image: "/images/posts/default-coding.png"
featured: false
hasDemo: true
author: "CodesCompiler"
---

Welcome to this tutorial on **${seoTitle}**. This is an automatically generated post based on popular examples to help you learn and implement this concept.

## HTML Structure

Here is the basic HTML structure for this project:

\`\`\`html
<div class="${createSlug(cat.name)}-container">
  <h1>${cat.name} Example</h1>
  <!-- Add your HTML content here -->
</div>
\`\`\`

## CSS Styling

Style your component using the following CSS:

\`\`\`css
.${createSlug(cat.name)}-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: 'Inter', sans-serif;
}
\`\`\`

## JavaScript Logic (if applicable)

For dynamic behavior, you can use the following JavaScript snippet:

\`\`\`javascript
document.addEventListener('DOMContentLoaded', () => {
    console.log('${cat.name} initialized successfully!');
    // Add your logic here
});
\`\`\`

Feel free to customize this code for your own projects!
`;

      fs.writeFileSync(filePath, content);
      console.log(`Created: ${fileName}`);
    }
  }
  
  console.log("Successfully generated 60 blog posts!");
}

generateBlogs();
