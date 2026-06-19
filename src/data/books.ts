export interface BookInfoTab {
  id: string;
  label: string;
  content: string;
}

export interface Book {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  coverImage: string | null;
  pages: number;
  downloads: string;
  updated: string;
  level: string;
  rating: number;       // e.g. 4.5
  ratingCount: string;  // e.g. "1,234 ratings"
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  bgGradient: string;
  learnList: string[];
  infoTabs: BookInfoTab[];
  whatsappUrl: string;
  youtubeUrl: string;
  pdfUrl: string;
}

const WA = 'https://whatsapp.com/channel/0029VbDJ9Lc0VycCT9PJuu0W';
const YT = 'https://www.youtube.com/@CodeCompiler19';

export const books: Book[] = [
  {
    slug: 'html-for-kids',
    title: 'HTML for Kids',
    tagline: 'A Fun and Easy Guide to Learn HTML and Build Your Own Websites',
    description: 'Step into the exciting world of web development! This book guides kids aged 8–15 through the essentials of building websites from scratch using simple language, colorful illustrations, and hands-on projects. Perfect for beginners with zero coding experience.',
    coverImage: '/images/books/html-for-kids.png',
    pages: 50,
    downloads: '2,350',
    updated: 'June 2026',
    level: 'Beginner Friendly',
    rating: 4.8,
    ratingCount: '1,240 ratings',
    accentColor: '#E34F26',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
    bgGradient: 'from-orange-500 to-red-600',
    whatsappUrl: WA,
    youtubeUrl: YT,
    pdfUrl: '/downloads/books/html-for-kids.pdf',
    learnList: [
      'How web browsers read HTML tags to display web pages',
      'Formatting text, headings, and paragraphs with styles',
      'Adding beautiful images, colors, and interactive multimedia',
      'Creating links to connect different web pages',
      'Designing custom lists, buttons, and user forms',
      'Building a complete personal website profile project'
    ],
    infoTabs: [
      {
        id: 'overview',
        label: '📖 Overview',
        content: `<h3>About This Book</h3>
<p>HTML for Kids is the ultimate beginner's guide that transforms complete coding newcomers into confident web builders. Written in a friendly, conversational style with colourful examples, every chapter builds on the last so no child is left behind.</p>
<p>The book is structured into <strong>10 modules</strong> and <strong>50 bite-sized lessons</strong> covering more than <strong>150 topics</strong>. Each lesson ends with a "Your Turn!" mini-challenge to reinforce what was just learned.</p>
<h3>Who Is This Book For?</h3>
<ul>
  <li>✅ Kids and teenagers aged <strong>8 – 15 years</strong></li>
  <li>✅ Parents and teachers looking for a structured first coding curriculum</li>
  <li>✅ Complete beginners with <strong>zero prior coding experience</strong></li>
  <li>✅ Anyone curious about how websites are built</li>
</ul>
<h3>Key Highlights</h3>
<ul>
  <li>🎨 <strong>Colorful, illustrated pages</strong> designed for young readers</li>
  <li>🏗️ <strong>10 Modules</strong> covering every core HTML concept</li>
  <li>🎯 <strong>50 Lessons</strong> with step-by-step instructions</li>
  <li>🚀 <strong>Fun Projects</strong> — build real pages, not just theory</li>
  <li>🧩 <strong>Quizzes & Challenges</strong> at the end of every module</li>
  <li>📱 <strong>Beginner Friendly</strong> — Perfect for ages 8–15</li>
</ul>`
      },
      {
        id: 'contents',
        label: '📋 Table of Contents',
        content: `<h3>Module Breakdown</h3>
<ol>
  <li><strong>Module 1 — Welcome to HTML</strong><br/><em>What is HTML · How browsers work · Your first HTML file · The DOCTYPE declaration</em></li>
  <li><strong>Module 2 — Building Blocks: Tags & Elements</strong><br/><em>Opening & closing tags · Nesting elements · Block vs inline elements · Self-closing tags</em></li>
  <li><strong>Module 3 — Headings, Paragraphs & Text</strong><br/><em>H1–H6 headings · Paragraphs · Bold, italic & underline · Line breaks & horizontal rules</em></li>
  <li><strong>Module 4 — Lists & Tables</strong><br/><em>Ordered & unordered lists · Definition lists · Creating data tables · Table headers & rows</em></li>
  <li><strong>Module 5 — Links & Navigation</strong><br/><em>Hyperlinks · Internal vs external links · Anchor tags · Email links · Target attributes</em></li>
  <li><strong>Module 6 — Images & Media</strong><br/><em>Embedding images · Alt text & accessibility · Video & audio tags · Responsive images</em></li>
  <li><strong>Module 7 — Forms & Input</strong><br/><em>Text inputs · Buttons · Radio & checkboxes · Dropdowns · Form submission basics</em></li>
  <li><strong>Module 8 — Page Structure & Semantics</strong><br/><em>header, nav, main, footer · Article & section · div & span · Semantic best practices</em></li>
  <li><strong>Module 9 — Styling with Inline CSS</strong><br/><em>Color, font, size · Background styles · Borders & spacing · Introduction to CSS</em></li>
  <li><strong>Module 10 — Final Project: Build Your Website!</strong><br/><em>Planning your page · Writing the full HTML · Adding images, links & forms · Publishing tips</em></li>
</ol>`
      },
      {
        id: 'details',
        label: '📊 Book Details',
        content: `<table style="width:100%; border-collapse:collapse;">
  <tr><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;color:#1b1b2f;">Detail</th><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;color:#1b1b2f;">Info</th></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Publisher</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">CodesCompiler Educational Press</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Language</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">English</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Pages</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">50 Pages</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Edition</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">1st Edition (2026)</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">File Format</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">PDF (High Quality)</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Age Group</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">8 – 15 Years</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Skill Level</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">Absolute Beginner</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Updated</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">June 2026</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Downloads</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">2,350+ verified downloads</td></tr>
  <tr><td style="padding:10px 12px;color:#64748b;font-weight:600;">Price</td><td style="padding:10px 12px;font-weight:700;color:#04AA6D;">FREE — No sign-up required</td></tr>
</table>`
      },
      {
        id: 'author',
        label: '✍️ About Author',
        content: `<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
  <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#04AA6D,#1b1b2f);display:flex;align-items:center;justify-content:center;font-size:24px;color:white;font-weight:700;flex-shrink:0;">CC</div>
  <div>
    <h3 style="margin:0 0 4px;font-size:1.15rem;">CodesCompiler Team</h3>
    <p style="margin:0;color:#64748b;font-size:0.85rem;">Educational Content Writers & Web Development Educators</p>
  </div>
</div>
<p>The CodesCompiler team is a group of passionate web developers, educators, and instructional designers who believe that coding should be accessible, engaging, and fun for everyone — especially children and beginners.</p>
<p>Our authors have <strong>combined experience of over 25 years</strong> in web development, computer science education, and curriculum design. We have helped over <strong>50,000 students</strong> start their coding journeys through our online platform at <strong>codescompiler.com</strong>.</p>
<h3>Our Mission</h3>
<p>To provide the highest-quality, most accessible coding education for the next generation of web builders — completely free of charge, without any sign-up barriers.</p>`
      }
    ]
  },
  {
    slug: 'css-for-kids',
    title: 'CSS for Kids',
    tagline: 'Style Your Webpages with Colors, Layouts, and Animations!',
    description: 'Make your websites look absolutely stunning! Learn how to style HTML pages with custom layouts, vibrant colors, fonts, and simple animations that bring your code to life. Turn dry text into a visual masterpiece.',
    coverImage: null,
    pages: 160,
    downloads: '1,840',
    updated: 'June 2026',
    level: 'Beginner Friendly',
    rating: 4.7,
    ratingCount: '980 ratings',
    accentColor: '#1572B6',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    bgGradient: 'from-blue-500 to-indigo-600',
    whatsappUrl: WA,
    youtubeUrl: YT,
    pdfUrl: '/downloads/books/css-for-kids.pdf',
    learnList: [
      'Connecting CSS styles to your HTML pages',
      'Working with colors, backgrounds, and custom gradients',
      'Mastering the Box Model: margins, borders, and padding',
      'Designing layouts using Flexbox',
      'Adding hover effects, shadows, and smooth transitions',
      'Coding a fully responsive page for mobile phones'
    ],
    infoTabs: [
      {
        id: 'overview',
        label: '📖 Overview',
        content: `<h3>About This Book</h3>
<p>CSS for Kids transforms plain HTML skeletons into visually stunning web pages. Kids learn to think like designers — choosing colors, controlling spacing, creating beautiful layouts, and adding smooth animations.</p>
<h3>Who Is This Book For?</h3>
<ul>
  <li>✅ Kids who have completed basic HTML and want to make things look great</li>
  <li>✅ Ages <strong>9 – 15 years</strong></li>
  <li>✅ Parents and school teachers adding design to their coding curriculum</li>
</ul>
<h3>Key Highlights</h3>
<ul>
  <li>🎨 Learn about <strong>color theory</strong> and how to pick beautiful palettes</li>
  <li>📦 Master the <strong>CSS Box Model</strong> — the foundation of all web layouts</li>
  <li>⚡ Use <strong>Flexbox</strong> to build responsive, modern layouts easily</li>
  <li>🌟 Add <strong>hover effects</strong>, transitions and keyframe animations</li>
  <li>📱 Make pages that look perfect on <strong>phones, tablets, and desktops</strong></li>
</ul>`
      },
      {
        id: 'contents',
        label: '📋 Table of Contents',
        content: `<ol>
  <li><strong>Module 1 — What is CSS?</strong><br/><em>Linking CSS to HTML · Selectors · Properties & values</em></li>
  <li><strong>Module 2 — Colors & Backgrounds</strong><br/><em>Named colors · Hex · RGB · Gradients · Background images</em></li>
  <li><strong>Module 3 — Typography</strong><br/><em>Font families · Size · Weight · Line-height · Google Fonts</em></li>
  <li><strong>Module 4 — The Box Model</strong><br/><em>Content · Padding · Border · Margin · Box-sizing</em></li>
  <li><strong>Module 5 — Flexbox Layouts</strong><br/><em>Flex container · justify-content · align-items · flex-wrap</em></li>
  <li><strong>Module 6 — Hover & Transitions</strong><br/><em>:hover pseudo-class · transition property · timing functions</em></li>
  <li><strong>Module 7 — Keyframe Animations</strong><br/><em>@keyframes · animation-name · duration · iteration-count</em></li>
  <li><strong>Module 8 — Responsive Design</strong><br/><em>Media queries · Mobile-first design · Breakpoints</em></li>
  <li><strong>Module 9 — Borders, Shadows & Effects</strong><br/><em>border-radius · box-shadow · text-shadow · opacity</em></li>
  <li><strong>Module 10 — Final Project</strong><br/><em>Style a full webpage from scratch — portfolio-ready result!</em></li>
</ol>`
      },
      {
        id: 'details',
        label: '📊 Book Details',
        content: `<table style="width:100%; border-collapse:collapse;">
  <tr><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;">Detail</th><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;">Info</th></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Publisher</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">CodesCompiler Educational Press</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Pages</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">160 Pages</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Age Group</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">9 – 15 Years</td></tr>
  <tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Skill Level</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">Beginner (Requires HTML basics)</td></tr>
  <tr><td style="padding:10px 12px;color:#64748b;font-weight:600;">Price</td><td style="padding:10px 12px;font-weight:700;color:#04AA6D;">FREE — No sign-up required</td></tr>
</table>`
      },
      { id: 'author', label: '✍️ About Author', content: `<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;"><div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#04AA6D,#1b1b2f);display:flex;align-items:center;justify-content:center;font-size:24px;color:white;font-weight:700;flex-shrink:0;">CC</div><div><h3 style="margin:0 0 4px;font-size:1.15rem;">CodesCompiler Team</h3><p style="margin:0;color:#64748b;font-size:0.85rem;">Educational Content Writers & Web Development Educators</p></div></div><p>The CodesCompiler team brings together web developers, designers and educators with a shared mission: making professional-grade coding education available to every child on the planet — for free.</p>` }
    ]
  },
  {
    slug: 'javascript-for-kids',
    title: 'JavaScript for Kids',
    tagline: 'Make Your Websites Interactive, Play Sound, and Build Games!',
    description: 'Bring your code to life! Learn JavaScript, the programming language that makes websites interactive. Click buttons, play sounds, create popups, and build real playable browser games like Whack-a-Mole and memory matching.',
    coverImage: null,
    pages: 180,
    downloads: '2,110',
    updated: 'June 2026',
    level: 'Intermediate',
    rating: 4.9,
    ratingCount: '1,560 ratings',
    accentColor: '#F7DF1E',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-700',
    bgGradient: 'from-amber-400 to-yellow-600',
    whatsappUrl: WA,
    youtubeUrl: YT,
    pdfUrl: '/downloads/books/javascript-for-kids.pdf',
    learnList: [
      'Writing variables, functions, and conditional statements',
      'Handling mouse clicks, keypresses, and game events',
      'Changing HTML and CSS dynamically on the fly',
      'Working with arrays, loops, and math utilities',
      'Playing sound effects and tracking high scores',
      'Building a fully playable interactive game from scratch'
    ],
    infoTabs: [
      { id: 'overview', label: '📖 Overview', content: `<h3>About This Book</h3><p>JavaScript for Kids is where code becomes magic. Young coders discover how to make their websites think, respond, and play. Every chapter features interactive mini-projects that run directly in any web browser — no installation needed.</p><h3>Who Is This Book For?</h3><ul><li>✅ Kids who already know basic HTML & CSS</li><li>✅ Ages <strong>10 – 16 years</strong></li><li>✅ Anyone who wants to build real games and interactive apps</li></ul><h3>Key Highlights</h3><ul><li>🎮 Build <strong>3 complete games</strong> from scratch</li><li>🖱️ Learn to handle <strong>events</strong> — clicks, keys, touches</li><li>🧠 Understand <strong>logic and algorithms</strong> through play</li><li>🔊 Add <strong>sound effects</strong> and <strong>animations</strong></li><li>💾 Save scores with <strong>localStorage</strong></li></ul>` },
      { id: 'contents', label: '📋 Table of Contents', content: `<ol><li><strong>Module 1 — Hello, JavaScript!</strong><br/><em>Script tags · console.log · Variables · Data types</em></li><li><strong>Module 2 — Making Decisions</strong><br/><em>if/else · comparison operators · logical operators · switch</em></li><li><strong>Module 3 — Repeating with Loops</strong><br/><em>for loops · while loops · break & continue · nested loops</em></li><li><strong>Module 4 — Functions</strong><br/><em>Defining functions · Parameters · Return values · Arrow functions</em></li><li><strong>Module 5 — Arrays & Collections</strong><br/><em>Creating arrays · push/pop · map/filter · Looping arrays</em></li><li><strong>Module 6 — The DOM</strong><br/><em>getElementById · querySelector · innerHTML · Changing styles</em></li><li><strong>Module 7 — Events</strong><br/><em>addEventListener · click · keydown · mouseover · Event objects</em></li><li><strong>Module 8 — Timers & Animation</strong><br/><em>setTimeout · setInterval · requestAnimationFrame · Game loops</em></li><li><strong>Module 9 — Sound & Media</strong><br/><em>Audio API · Playing sounds on events · Volume control</em></li><li><strong>Module 10 — Final Game Project</strong><br/><em>Design your game · Build the logic · Add polish · Share it!</em></li></ol>` },
      { id: 'details', label: '📊 Book Details', content: `<table style="width:100%; border-collapse:collapse;"><tr><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;">Detail</th><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;">Info</th></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Pages</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">180 Pages</td></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Age Group</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">10 – 16 Years</td></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Skill Level</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">Intermediate (Needs HTML/CSS basics)</td></tr><tr><td style="padding:10px 12px;color:#64748b;font-weight:600;">Price</td><td style="padding:10px 12px;font-weight:700;color:#04AA6D;">FREE — No sign-up required</td></tr></table>` },
      { id: 'author', label: '✍️ About Author', content: `<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;"><div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#04AA6D,#1b1b2f);display:flex;align-items:center;justify-content:center;font-size:24px;color:white;font-weight:700;flex-shrink:0;">CC</div><div><h3 style="margin:0 0 4px;font-size:1.15rem;">CodesCompiler Team</h3><p style="margin:0;color:#64748b;font-size:0.85rem;">Educational Content Writers & Web Development Educators</p></div></div><p>The CodesCompiler team has crafted JavaScript for Kids drawing from years of experience teaching beginner coding workshops. Every project in this book has been tested with real students aged 10–16.</p>` }
    ]
  },
  {
    slug: 'python-for-kids',
    title: 'Python for Kids',
    tagline: 'Learn Python Programming through Fun Quizzes, Art, and Mini-Games!',
    description: 'The ultimate beginner-friendly programming language! Python is perfect for young coders. Create colorful turtle graphics, write text-based adventures, and build your foundation for AI, automation, and game design.',
    coverImage: '/images/books/python-for-kids.png',
    pages: 50,
    downloads: '2,890',
    updated: 'June 2026',
    level: 'Beginner Friendly',
    rating: 4.8,
    ratingCount: '2,010 ratings',
    accentColor: '#3776AB',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    bgGradient: 'from-emerald-500 to-teal-700',
    whatsappUrl: WA,
    youtubeUrl: YT,
    pdfUrl: '/downloads/books/python-for-kids.pdf',
    learnList: [
      'Installing Python and running print commands',
      'Creating beautiful artwork using the Turtle module',
      'Making decisions in code with if/else conditions',
      'Grouping commands using reusable functions',
      'Writing loops, lists, and interactive quizzes',
      'Building a Text-Based Adventure game from scratch'
    ],
    infoTabs: [
      { id: 'overview', label: '📖 Overview', content: `<h3>About This Book</h3><p>Python for Kids is one of the most downloaded books in our library. Python is globally recognized as the <strong>#1 recommended first programming language</strong> for children and beginners, and this book makes learning it an absolute adventure.</p><h3>Who Is This Book For?</h3><ul><li>✅ Complete beginners with no coding knowledge</li><li>✅ Ages <strong>8 – 15 years</strong></li><li>✅ Parents looking for a structured learning path toward AI and data science</li></ul><h3>Key Highlights</h3><ul><li>🐍 The same language used by <strong>Google, NASA, and Netflix</strong></li><li>🎨 Create stunning <strong>turtle graphics art</strong> with code</li><li>🤖 Foundation concepts used in <strong>Artificial Intelligence</strong></li><li>📚 Step-by-step Text Adventure game project</li><li>🧪 Fun "try it yourself" experiments throughout every chapter</li></ul>` },
      { id: 'contents', label: '📋 Table of Contents', content: `<ol><li><strong>Module 1 — Why Python?</strong><br/><em>Installing Python · IDLE · print() · Comments</em></li><li><strong>Module 2 — Variables & Data Types</strong><br/><em>Strings · Integers · Floats · Booleans · Type conversion</em></li><li><strong>Module 3 — Turtle Graphics</strong><br/><em>import turtle · forward/left/right · Colors · Drawing shapes</em></li><li><strong>Module 4 — Getting Input</strong><br/><em>input() function · Converting types · Interactive programs</em></li><li><strong>Module 5 — Making Decisions</strong><br/><em>if · elif · else · Comparison operators · Nested conditions</em></li><li><strong>Module 6 — Loops</strong><br/><em>for loops · while loops · range() · Loop control</em></li><li><strong>Module 7 — Functions</strong><br/><em>def keyword · Parameters · Return values · Scope</em></li><li><strong>Module 8 — Lists & Dictionaries</strong><br/><em>Creating lists · append/remove · Dictionaries · Key-value pairs</em></li><li><strong>Module 9 — File Handling Basics</strong><br/><em>Reading text files · Writing files · Error handling intro</em></li><li><strong>Module 10 — Final Project: Text Adventure Game</strong><br/><em>Game map design · Inventory system · Story branching · Win conditions</em></li></ol>` },
      { id: 'details', label: '📊 Book Details', content: `<table style="width:100%; border-collapse:collapse;"><tr><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;">Detail</th><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;">Info</th></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Pages</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">50 Pages</td></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Age Group</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">8 – 15 Years</td></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Skill Level</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">Absolute Beginner</td></tr><tr><td style="padding:10px 12px;color:#64748b;font-weight:600;">Price</td><td style="padding:10px 12px;font-weight:700;color:#04AA6D;">FREE — No sign-up required</td></tr></table>` },
      { id: 'author', label: '✍️ About Author', content: `<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;"><div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#04AA6D,#1b1b2f);display:flex;align-items:center;justify-content:center;font-size:24px;color:white;font-weight:700;flex-shrink:0;">CC</div><div><h3 style="margin:0 0 4px;font-size:1.15rem;">CodesCompiler Team</h3><p style="margin:0;color:#64748b;font-size:0.85rem;">Educational Content Writers & Web Development Educators</p></div></div><p>Our Python curriculum was developed in collaboration with experienced Python developers and school science teachers. The lessons have been classroom-tested with over 5,000 students across India and worldwide.</p>` }
    ]
  },
  {
    slug: 'c-programming-for-kids',
    title: 'C Programming for Kids',
    tagline: 'A Fun Introduction to the Language that Powers Operating Systems!',
    description: 'Get closer to the metal! Learn the foundational concepts of computer system architectures. C is the root language behind modern OS development. Understand memory cells, files, and how computers execute instructions.',
    coverImage: null,
    pages: 140,
    downloads: '1,250',
    updated: 'June 2026',
    level: 'Intermediate to Advanced',
    rating: 4.6,
    ratingCount: '720 ratings',
    accentColor: '#A8B9CC',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    bgGradient: 'from-purple-600 to-indigo-800',
    whatsappUrl: WA,
    youtubeUrl: YT,
    pdfUrl: '/downloads/books/c-programming-for-kids.pdf',
    learnList: [
      'The anatomy of a C program and compiling files',
      'Understanding variables, data types, and inputs',
      'Control flow: loops, decisions, and structures',
      'Pointers, memory addresses, and RAM layout',
      'Working with arrays, strings, and custom structs',
      'Creating a simple math calculator program'
    ],
    infoTabs: [
      { id: 'overview', label: '📖 Overview', content: `<h3>About This Book</h3><p>C Programming for Kids demystifies one of the most foundational and powerful programming languages ever created. While C may look intimidating at first, this book breaks every concept down into digestible, illustrated lessons suitable for curious young minds.</p><h3>Who Is This Book For?</h3><ul><li>✅ Kids with some previous programming experience</li><li>✅ Ages <strong>12 – 17 years</strong></li><li>✅ Students interested in systems programming, game engines, or embedded electronics</li></ul><h3>Key Highlights</h3><ul><li>🏛️ Learn the language that built <strong>Windows, Linux, and macOS</strong></li><li>🧠 Understand <strong>how computers manage memory</strong> at a fundamental level</li><li>⚡ Write programs that run at <strong>blazing native speed</strong></li><li>🔢 Develop strong <strong>algorithmic thinking</strong> skills</li></ul>` },
      { id: 'contents', label: '📋 Table of Contents', content: `<ol><li><strong>Module 1 — The C Language Story</strong><br/><em>History of C · Compilers · Your first program · printf & scanf</em></li><li><strong>Module 2 — Variables & Data Types</strong><br/><em>int · float · char · double · Declaring & initializing</em></li><li><strong>Module 3 — Operators & Expressions</strong><br/><em>Arithmetic · Comparison · Logical · Bitwise operators</em></li><li><strong>Module 4 — Control Flow</strong><br/><em>if/else · switch · for loops · while · do-while</em></li><li><strong>Module 5 — Functions</strong><br/><em>Defining & calling · Parameters · Return types · Scope</em></li><li><strong>Module 6 — Arrays & Strings</strong><br/><em>1D arrays · String functions · Character arrays · strlen/strcpy</em></li><li><strong>Module 7 — Pointers</strong><br/><em>Address operator & · Pointer declaration · Dereferencing · Pointer arithmetic</em></li><li><strong>Module 8 — Structs</strong><br/><em>Defining structs · Nested structs · Arrays of structs</em></li><li><strong>Module 9 — File I/O</strong><br/><em>fopen/fclose · fread/fwrite · Text vs binary files</em></li><li><strong>Module 10 — Final Project: Calculator App</strong><br/><em>Menu-driven program · All four operations · Input validation</em></li></ol>` },
      { id: 'details', label: '📊 Book Details', content: `<table style="width:100%; border-collapse:collapse;"><tr><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;">Detail</th><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;">Info</th></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Pages</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">140 Pages</td></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Age Group</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">12 – 17 Years</td></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Skill Level</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">Intermediate to Advanced</td></tr><tr><td style="padding:10px 12px;color:#64748b;font-weight:600;">Price</td><td style="padding:10px 12px;font-weight:700;color:#04AA6D;">FREE — No sign-up required</td></tr></table>` },
      { id: 'author', label: '✍️ About Author', content: `<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;"><div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#04AA6D,#1b1b2f);display:flex;align-items:center;justify-content:center;font-size:24px;color:white;font-weight:700;flex-shrink:0;">CC</div><div><h3 style="margin:0 0 4px;font-size:1.15rem;">CodesCompiler Team</h3><p style="margin:0;color:#64748b;font-size:0.85rem;">Educational Content Writers & Systems Programmers</p></div></div><p>The C programming curriculum was developed by systems programmers and CS educators who are passionate about helping young minds understand the deep mechanics of computers — not just the surface level.</p>` }
    ]
  },
  {
    slug: 'scratch-for-kids',
    title: 'Scratch for Kids',
    tagline: 'Drag-and-Drop Coding to Create Custom Games, Stories, and Music!',
    description: 'No typing required! Scratch is the perfect first step into coding. Drag-and-drop colorful blocks to make your own animated stories, play instruments, and build arcade games. Perfect for kids ages 6-12.',
    coverImage: null,
    pages: 130,
    downloads: '3,120',
    updated: 'June 2026',
    level: 'Absolute Beginner',
    rating: 4.9,
    ratingCount: '2,340 ratings',
    accentColor: '#F58220',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    bgGradient: 'from-orange-400 to-rose-600',
    whatsappUrl: WA,
    youtubeUrl: YT,
    pdfUrl: '/downloads/books/scratch-for-kids.pdf',
    learnList: [
      'Navigating the Scratch editor, stage, and sprite list',
      'Dragging event blocks, motion controls, and sounds',
      'Animating sprites and changing backdrops dynamically',
      'Using variables for scores, lives, and timer conditions',
      'Broadcasting messages to link sprite reactions',
      'Coding a fully playable arcade game (Fruit Catching!)'
    ],
    infoTabs: [
      { id: 'overview', label: '📖 Overview', content: `<h3>About This Book</h3><p>Scratch for Kids is our most downloaded beginner book — and for good reason. Scratch, developed by the MIT Media Lab, is the world's most popular visual programming platform with over <strong>100 million registered users</strong>. This book is your child's perfect gateway into the world of coding.</p><h3>Who Is This Book For?</h3><ul><li>✅ Complete beginners — <strong>no typing required!</strong></li><li>✅ Ages <strong>6 – 12 years</strong></li><li>✅ Parents & early childhood educators introducing coding to young children</li></ul><h3>Key Highlights</h3><ul><li>🧱 Visual block-based coding — impossible to make typing errors!</li><li>🎭 Create animated <strong>stories, plays, and cartoons</strong></li><li>🎵 Compose <strong>music and sound effects</strong> with code</li><li>🕹️ Build real <strong>arcade games</strong> from scratch</li><li>🌍 Used in thousands of schools globally as first coding curriculum</li></ul>` },
      { id: 'contents', label: '📋 Table of Contents', content: `<ol><li><strong>Module 1 — Welcome to Scratch!</strong><br/><em>The Scratch interface · Sprites & backdrops · Stage area · Costume editor</em></li><li><strong>Module 2 — Motion Blocks</strong><br/><em>Move steps · Turn · Go to position · Glide smoothly</em></li><li><strong>Module 3 — Events & Triggers</strong><br/><em>When green flag clicked · Key press events · Sprite click events</em></li><li><strong>Module 4 — Looks & Sounds</strong><br/><em>Say/think blocks · Switch costumes · Play sounds · Change size</em></li><li><strong>Module 5 — Control Flow</strong><br/><em>Forever loops · Repeat N times · Wait blocks · if/else blocks</em></li><li><strong>Module 6 — Sensing Blocks</strong><br/><em>Touching color · Distance to sprite · Key pressed? · Mouse position</em></li><li><strong>Module 7 — Variables</strong><br/><em>Creating variables · Score counter · Lives system · High scores</em></li><li><strong>Module 8 — Broadcasts</strong><br/><em>Broadcast message · When I receive · Coordinating multiple sprites</em></li><li><strong>Module 9 — Drawing & Pen</strong><br/><em>Pen down · Change pen color · Stamp · Drawing geometric patterns</em></li><li><strong>Module 10 — Final Game Project: Fruit Catcher!</strong><br/><em>Game design · Spawning fruits · Catching logic · Score & lives</em></li></ol>` },
      { id: 'details', label: '📊 Book Details', content: `<table style="width:100%; border-collapse:collapse;"><tr><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;">Detail</th><th style="text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-weight:700;">Info</th></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Pages</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">130 Pages</td></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Age Group</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">6 – 12 Years</td></tr><tr><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;">Skill Level</td><td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">Absolute Beginner — No typing needed!</td></tr><tr><td style="padding:10px 12px;color:#64748b;font-weight:600;">Price</td><td style="padding:10px 12px;font-weight:700;color:#04AA6D;">FREE — No sign-up required</td></tr></table>` },
      { id: 'author', label: '✍️ About Author', content: `<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;"><div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#04AA6D,#1b1b2f);display:flex;align-items:center;justify-content:center;font-size:24px;color:white;font-weight:700;flex-shrink:0;">CC</div><div><h3 style="margin:0 0 4px;font-size:1.15rem;">CodesCompiler Team</h3><p style="margin:0;color:#64748b;font-size:0.85rem;">Early Childhood Coding Educators</p></div></div><p>The Scratch curriculum at CodesCompiler was developed with elementary school teachers and early-childhood education specialists. Every lesson was piloted with children ages 6–12 before being included in this book.</p>` }
    ]
  }
];

export function formatDownloads(raw: string | number): string {
  const num = parseInt(String(raw).replace(/,/g, ''), 10);
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  return String(raw) + '+';
}

export function starsArray(rating: number): string[] {
  return [1, 2, 3, 4, 5].map((i) => {
    if (rating >= i) return 'full';
    if (rating >= i - 0.5) return 'half';
    return 'empty';
  });
}
