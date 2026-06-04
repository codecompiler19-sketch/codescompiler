const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../src/content/blog');
const demosDir = path.join(__dirname, '../public/demos');

// Define beautiful premium templates for each category
const templates = {
  'HTML & CSS': {
    html: `<div class="premium-layout">
  <header class="header"><h1>__TITLE__</h1></header>
  <main class="grid-content">
    <section class="card"><h3>Flexbox Area</h3><p>Smooth glassmorphism and modern shadows.</p></section>
    <section class="card"><h3>CSS Grid Area</h3><p>Responsive layout structure.</p></section>
  </main>
</div>`,
    css: `.premium-layout { min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 2rem; font-family: 'Segoe UI', sans-serif; }
.header h1 { text-align: center; color: #2c3e50; font-weight: 800; font-size: 2.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
.grid-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto; }
.card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border-radius: 20px; padding: 2rem; box-shadow: 0 15px 35px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.5); transition: transform 0.3s, box-shadow 0.3s; }
.card:hover { transform: translateY(-10px); box-shadow: 0 25px 45px rgba(0,0,0,0.15); }
.card h3 { color: #34495e; margin-bottom: 1rem; }`,
    js: `console.log('HTML & CSS layout initialized.');`
  },
  'Navigation Bar': {
    html: `<nav class="glass-nav">
  <div class="logo">__TITLE__</div>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">Features</a></li>
    <li><a href="#">Pricing</a></li>
    <li><a href="#" class="cta-btn">Get Started</a></li>
  </ul>
</nav>
<div class="hero">Scroll down to see the navbar effect!</div>`,
    css: `body { margin: 0; font-family: 'Inter', sans-serif; height: 200vh; background: #0f172a; color: #fff; }
.glass-nav { position: fixed; top: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 5%; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 1000; transition: padding 0.3s; box-sizing: border-box; }
.glass-nav.scrolled { padding: 1rem 5%; background: rgba(15, 23, 42, 0.95); box-shadow: 0 4px 30px rgba(0,0,0,0.5); }
.logo { font-size: 1.5rem; font-weight: 800; background: linear-gradient(45deg, #00f2fe, #4facfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { list-style: none; display: flex; gap: 2rem; margin: 0; padding: 0; align-items: center; }
.nav-links a { color: #cbd5e1; text-decoration: none; font-weight: 500; transition: color 0.3s; }
.nav-links a:hover { color: #fff; }
.cta-btn { background: #3b82f6; padding: 0.75rem 1.5rem; border-radius: 30px; color: #fff !important; font-weight: 600; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); transition: transform 0.2s; }
.cta-btn:hover { transform: translateY(-2px); background: #2563eb; }
.hero { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 2rem; font-weight: 700; opacity: 0.5; }`,
    js: `window.addEventListener('scroll', () => {
  const nav = document.querySelector('.glass-nav');
  if (window.scrollY > 50) { nav.classList.add('scrolled'); }
  else { nav.classList.remove('scrolled'); }
});`
  },
  'JavaScript Projects': {
    html: `<div class="app-container">
  <h2>__TITLE__</h2>
  <div class="input-group">
    <input type="text" id="item-input" placeholder="Enter an item...">
    <button id="add-btn">Add</button>
  </div>
  <ul id="item-list" class="item-list"></ul>
</div>`,
    css: `body { background: #1e1e2f; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Segoe UI', sans-serif; margin: 0; }
.app-container { background: #2a2a40; padding: 2.5rem; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); width: 100%; max-width: 450px; color: #fff; border: 1px solid rgba(255,255,255,0.05); }
h2 { text-align: center; margin-top: 0; color: #00e5ff; margin-bottom: 2rem; }
.input-group { display: flex; gap: 10px; margin-bottom: 2rem; }
input { flex: 1; padding: 12px 20px; border-radius: 30px; border: none; background: #1e1e2f; color: #fff; font-size: 1rem; outline: none; box-shadow: inset 0 2px 5px rgba(0,0,0,0.2); }
button { padding: 12px 25px; border-radius: 30px; border: none; background: #00e5ff; color: #1e1e2f; font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 1rem; }
button:hover { background: #00b3cc; transform: scale(1.05); }
.item-list { list-style: none; padding: 0; margin: 0; }
.item-list li { background: #383854; padding: 15px 20px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; animation: fadeIn 0.3s ease; }
.delete-btn { background: #ff4757; color: #fff; padding: 5px 12px; border-radius: 8px; font-size: 0.8rem; border: none; cursor: pointer; }
.delete-btn:hover { background: #ff6b81; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`,
    js: `const input = document.getElementById('item-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('item-list');

addBtn.addEventListener('click', addItem);
input.addEventListener('keypress', (e) => { if(e.key === 'Enter') addItem(); });

function addItem() {
  if(!input.value.trim()) return;
  const li = document.createElement('li');
  li.innerHTML = '<span>' + input.value + '</span> <button class="delete-btn">X</button>';
  li.querySelector('.delete-btn').addEventListener('click', () => li.remove());
  list.appendChild(li);
  input.value = '';
}`
  },
  'Form Validation': {
    html: `<div class="form-wrapper">
  <h2>__TITLE__</h2>
  <form id="val-form">
    <div class="form-control">
      <label>Email Address</label>
      <input type="email" id="email" placeholder="john@example.com">
      <small>Error message</small>
    </div>
    <div class="form-control">
      <label>Password</label>
      <input type="password" id="password" placeholder="Min 8 characters">
      <small>Error message</small>
    </div>
    <button type="submit" class="submit-btn">Register</button>
  </form>
</div>`,
    css: `body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
.form-wrapper { background: #fff; padding: 40px; border-radius: 15px; box-shadow: 0 15px 30px rgba(0,0,0,0.2); width: 100%; max-width: 400px; box-sizing: border-box; }
h2 { text-align: center; color: #333; margin-bottom: 30px; }
.form-control { margin-bottom: 20px; position: relative; }
.form-control label { display: block; margin-bottom: 8px; color: #666; font-weight: 500; font-size: 0.9rem; }
.form-control input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; box-sizing: border-box; transition: border-color 0.3s; }
.form-control input:focus { outline: none; border-color: #667eea; }
.form-control.error input { border-color: #e74c3c; }
.form-control.success input { border-color: #2ecc71; }
.form-control small { color: #e74c3c; position: absolute; bottom: -20px; left: 0; visibility: hidden; font-size: 0.8rem; }
.form-control.error small { visibility: visible; }
.submit-btn { width: 100%; padding: 14px; border: none; border-radius: 8px; background: #667eea; color: #fff; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background 0.3s; margin-top: 10px; }
.submit-btn:hover { background: #5a67d8; }`,
    js: `const form = document.getElementById('val-form');
const email = document.getElementById('email');
const password = document.getElementById('password');

form.addEventListener('submit', e => {
  e.preventDefault();
  checkInputs();
});

function checkInputs() {
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  
  if(emailValue === '') { setError(email, 'Email cannot be blank'); }
  else if (!/^\\S+@\\S+\\.\\S+$/.test(emailValue)) { setError(email, 'Not a valid email'); }
  else { setSuccess(email); }
  
  if(passwordValue === '') { setError(password, 'Password cannot be blank'); }
  else if(passwordValue.length < 8) { setError(password, 'Min 8 characters required'); }
  else { setSuccess(password); }
}

function setError(input, message) {
  const formControl = input.parentElement;
  formControl.className = 'form-control error';
  formControl.querySelector('small').innerText = message;
}

function setSuccess(input) {
  const formControl = input.parentElement;
  formControl.className = 'form-control success';
}`
  },
  'Preloader or Loader': {
    html: `<div class="loader-bg">
  <div class="loader-container">
    <div class="spinner"></div>
    <h3>__TITLE__</h3>
  </div>
</div>`,
    css: `body { margin: 0; background: #111; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: 'Inter', sans-serif; color: #fff; }
.loader-container { display: flex; flex-direction: column; align-items: center; gap: 2rem; }
.spinner { width: 80px; height: 80px; border-radius: 50%; border: 8px solid rgba(255,255,255,0.1); border-top-color: #00ff88; animation: spin 1s linear infinite; box-shadow: 0 0 20px rgba(0, 255, 136, 0.4); }
@keyframes spin { 100% { transform: rotate(360deg); } }
h3 { margin: 0; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #00ff88; text-shadow: 0 0 10px rgba(0, 255, 136, 0.5); }`,
    js: `console.log('Loader animation running natively via CSS.');`
  },
  'Card Design': {
    html: `<div class="card-container">
  <div class="modern-card">
    <div class="card-img"></div>
    <div class="card-info">
      <h3>__TITLE__</h3>
      <p>A beautiful premium card design featuring hover transitions, modern typography, and clean layouts.</p>
      <button class="card-btn">Read More</button>
    </div>
  </div>
</div>`,
    css: `body { background: #e2e8f0; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: 'Segoe UI', sans-serif; margin: 0; }
.modern-card { background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 320px; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; }
.modern-card:hover { transform: translateY(-15px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.card-img { height: 200px; background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); position: relative; }
.card-info { padding: 25px; text-align: center; }
.card-info h3 { margin: 0 0 10px 0; color: #2d3748; font-size: 1.2rem; }
.card-info p { color: #718096; font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px; }
.card-btn { background: #ff758c; color: white; border: none; padding: 10px 25px; border-radius: 30px; font-weight: bold; cursor: pointer; transition: background 0.3s, transform 0.2s; }
.card-btn:hover { background: #ff5e78; transform: scale(1.05); }`,
    js: `console.log('Card Component Initialized');`
  },
  'CSS Buttons': {
    html: `<div class="btn-container">
  <h2>__TITLE__</h2>
  <div class="buttons">
    <button class="btn btn-glow">Glow Button</button>
    <button class="btn btn-swipe">Swipe Hover</button>
    <button class="btn btn-neumorphic">Neumorphic</button>
  </div>
</div>`,
    css: `body { background: #1f2029; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: 'Inter', sans-serif; margin: 0; color: #fff; text-align: center;}
h2 { margin-bottom: 3rem; color: #818cf8; }
.buttons { display: flex; gap: 2rem; flex-wrap: wrap; justify-content: center; }
.btn { border: none; padding: 15px 30px; font-size: 1.1rem; font-weight: 600; cursor: pointer; border-radius: 12px; transition: all 0.3s ease; position: relative; overflow: hidden; }
.btn-glow { background: transparent; color: #00e5ff; border: 2px solid #00e5ff; text-transform: uppercase; box-shadow: 0 0 10px transparent; }
.btn-glow:hover { box-shadow: 0 0 20px #00e5ff, inset 0 0 20px #00e5ff; background: rgba(0, 229, 255, 0.1); }
.btn-swipe { background: #818cf8; color: #fff; z-index: 1; }
.btn-swipe::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: #4f46e5; transition: left 0.4s ease; z-index: -1; }
.btn-swipe:hover::before { left: 0; }
.btn-neumorphic { background: #1f2029; color: #a5b4fc; box-shadow: 8px 8px 16px #15161c, -8px -8px 16px #292a36; }
.btn-neumorphic:hover { box-shadow: inset 6px 6px 12px #15161c, inset -6px -6px 12px #292a36; color: #c7d2fe; }`,
    js: `console.log('Buttons ready for action!');`
  },
  'Login Form': {
    html: `<div class="login-container">
  <form class="glass-form">
    <h2>__TITLE__</h2>
    <div class="input-box">
      <input type="text" required>
      <label>Username</label>
    </div>
    <div class="input-box">
      <input type="password" required>
      <label>Password</label>
    </div>
    <button type="submit" class="login-btn">Login</button>
  </form>
</div>`,
    css: `body { background: url('https://source.unsplash.com/random/1920x1080/?abstract,dark') no-repeat center center/cover; margin: 0; height: 100vh; display: flex; justify-content: center; align-items: center; font-family: 'Poppins', sans-serif; }
.login-container { width: 400px; }
.glass-form { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.2); padding: 40px; border-radius: 20px; box-shadow: 0 25px 45px rgba(0,0,0,0.2); }
h2 { color: #fff; text-align: center; margin-bottom: 30px; font-size: 24px; }
.input-box { position: relative; margin-bottom: 30px; }
.input-box input { width: 100%; padding: 10px 0; font-size: 16px; color: #fff; border: none; border-bottom: 2px solid #fff; outline: none; background: transparent; }
.input-box label { position: absolute; top: 0; left: 0; padding: 10px 0; font-size: 16px; color: rgba(255,255,255,0.7); pointer-events: none; transition: .5s; }
.input-box input:focus ~ label, .input-box input:valid ~ label { top: -20px; color: #00e5ff; font-size: 12px; }
.login-btn { width: 100%; background: #fff; color: #333; border: none; padding: 12px; border-radius: 30px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; }
.login-btn:hover { background: #00e5ff; color: #fff; }`,
    js: `document.querySelector('.glass-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Login attempted!');
});`
  },
  'JavaScript': {
    html: `<div class="js-container">
  <h1>__TITLE__</h1>
  <div class="interactive-box" id="i-box">Hover or Click Me!</div>
  <p class="status">Status: Waiting...</p>
</div>`,
    css: `body { background: #0f172a; color: #f8fafc; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
.js-container { max-width: 600px; padding: 2rem; background: #1e293b; border-radius: 1rem; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
h1 { font-size: 1.5rem; color: #38bdf8; margin-top: 0; }
.interactive-box { width: 200px; height: 200px; background: #475569; margin: 2rem auto; display: flex; justify-content: center; align-items: center; border-radius: 1rem; cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); font-weight: bold; }
.interactive-box.active { background: #10b981; transform: scale(1.1) rotate(10deg); box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
.status { color: #94a3b8; font-size: 1.1rem; }`,
    js: `const box = document.getElementById('i-box');
const status = document.querySelector('.status');

box.addEventListener('mouseenter', () => { status.textContent = 'Status: Hovering...'; });
box.addEventListener('mouseleave', () => { status.textContent = 'Status: Waiting...'; box.classList.remove('active'); });
box.addEventListener('click', () => { 
  box.classList.add('active');
  status.textContent = 'Status: Clicked! Animation triggered.';
});`
  }
};

const defaultTemplate = templates['HTML & CSS'];
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx'));
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(path.join(blogDir, file), 'utf8');
  
  if (content.includes('// Add your logic here')) {
    const catMatch = content.match(/category:\\s*"(.*?)"/);
    const category = catMatch ? catMatch[1] : 'HTML & CSS';
    const titleMatch = content.match(/seoTitle:\\s*"(.*?)"/);
    const seoTitle = titleMatch ? titleMatch[1] : file.replace('.mdx', '');
    
    const tpl = templates[category] || defaultTemplate;
    const replacedHtml = tpl.html.replace(/__TITLE__/g, seoTitle);
    
    // Replace markdown blocks
    content = content.replace(/\\`\\`\\`html[\\s\\S]*?\\`\\`\\`/, '\\`\\`\\`html\\n' + replacedHtml + '\\n\\`\\`\\`');
    content = content.replace(/\\`\\`\\`css[\\s\\S]*?\\`\\`\\`/, '\\`\\`\\`css\\n' + tpl.css + '\\n\\`\\`\\`');
    content = content.replace(/\\`\\`\\`javascript[\\s\\S]*?\\`\\`\\`/, '\\`\\`\\`javascript\\n' + tpl.js + '\\n\\`\\`\\`');
    
    fs.writeFileSync(path.join(blogDir, file), content);
    
    const slug = file.replace('.mdx', '');
    const demoPath = path.join(demosDir, slug + '.html');
    
    // Use string concatenation
    const demoHtmlContent = '<!DOCTYPE html>\\n' +
'<html lang="en">\\n' +
'<head>\\n' +
'  <meta charset="UTF-8">\\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\\n' +
'  <title>' + seoTitle + ' - Live Demo</title>\\n' +
'  <style>\\n' +
tpl.css + '\\n' +
'  </style>\\n' +
'</head>\\n' +
'<body>\\n' +
replacedHtml + '\\n' +
'  <script>\\n' +
tpl.js + '\\n' +
'  </script>\\n' +
'</body>\\n' +
'</html>';

    fs.writeFileSync(demoPath, demoHtmlContent);
    console.log('Fixed broken demo: ' + slug);
    count++;
  }
});

console.log('Successfully fixed ' + count + ' broken placeholder components!');
