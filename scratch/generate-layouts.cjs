const fs = require('fs');
const path = require('path');

const frontmatter = `---
import { getCollection } from 'astro:content';
import themeRaw from '../../theme-settings.json';

const theme = themeRaw || {};
const allPosts = await getCollection('blog');
const latestPosts = allPosts
  .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
  .slice(0, 3);

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  'HTML & CSS':           { color: '#E34F26', bg: '#fff4f0' },
  'JavaScript':           { color: '#ca8a04', bg: '#fefce8' },
  'HTML CSS JavaScript':  { color: '#04AA6D', bg: '#f0fff8' },
};
---`;

const l4 = `${frontmatter}
<section class="w-full bg-[#f4f4f5] py-20 px-5">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-3xl p-10 sm:p-14 shadow-sm border border-gray-200 flex flex-col justify-center">
        {theme.heroTitle ? <h1 class="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6" set:html={theme.heroTitle} /> : <h1 class="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-6">The New Standard for <br/><span class="text-[#04AA6D]">Web Developers</span></h1>}
        {theme.heroSubtitle ? <p class="text-gray-500 text-lg sm:text-xl mb-10 max-w-lg" set:html={theme.heroSubtitle} /> : <p class="text-gray-500 text-lg sm:text-xl mb-10 max-w-lg">Experience a modern, bento-grid inspired learning platform designed for speed and simplicity.</p>}
        <div class="flex gap-4">
          <a href={theme.heroBtnUrl || "/tutorial/html-introduction"} class="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all">{theme.heroBtnText || "Start Learning Free"}</a>
        </div>
      </div>
      <div class="bg-[#04AA6D] rounded-3xl p-10 text-white flex flex-col justify-between shadow-sm">
        <div class="text-4xl font-black">100%<br/><span class="text-green-200 text-2xl">Free</span></div>
        <div class="text-green-100 font-medium">No subscriptions, no hidden fees. Just pure knowledge.</div>
      </div>
      <div class="bg-blue-600 rounded-3xl p-10 text-white flex flex-col justify-between shadow-sm">
        <div class="text-4xl font-black">200+<br/><span class="text-blue-200 text-2xl">Examples</span></div>
        <div class="text-blue-100 font-medium">Learn by doing with live code editors.</div>
      </div>
      <div class="lg:col-span-2 bg-slate-900 rounded-3xl p-10 text-white overflow-hidden relative shadow-sm">
        <div class="text-slate-400 font-mono text-sm mb-4">// Try it yourself</div>
        <pre class="text-green-400 font-mono"><code>console.log('Ready to build something amazing?');</code></pre>
      </div>
    </div>
  </div>
</section>
`;

const l5 = `${frontmatter}
<section class="w-full bg-black min-h-[90vh] flex items-center justify-center relative overflow-hidden px-5 py-24">
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#04AA6D]/20 via-black to-black"></div>
  
  <div class="relative z-10 max-w-4xl mx-auto text-center">
    <div class="inline-block border border-white/10 bg-white/5 rounded-full px-4 py-1.5 backdrop-blur-md text-gray-300 text-xs font-semibold uppercase tracking-widest mb-8">Next-Gen Learning</div>
    {theme.heroTitle ? <h1 class="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter mb-8 leading-none" set:html={theme.heroTitle} /> : <h1 class="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter mb-8 leading-none">Build The Future</h1>}
    {theme.heroSubtitle ? <p class="text-gray-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed" set:html={theme.heroSubtitle} /> : <p class="text-gray-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">A sleek, dark-mode focused experience engineered for maximum focus. Master modern web development.</p>}
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <a href={theme.heroBtnUrl || "/tutorial/html-introduction"} class="bg-white text-black px-8 py-4 rounded-md font-bold hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">{theme.heroBtnText || "Start Building"}</a>
    </div>
  </div>
</section>
`;

const l6 = `${frontmatter}
<section class="w-full bg-[#FAFAFA] border-b-8 border-black py-20 px-5">
  <div class="max-w-6xl mx-auto">
    <div class="border-4 border-black bg-[#FFE500] p-10 sm:p-20 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center gap-10">
      <div class="flex-1">
        <div class="border-2 border-black bg-white inline-block px-3 py-1 font-bold mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">WARNING: HIGHLY ADDICTIVE</div>
        {theme.heroTitle ? <h1 class="text-6xl sm:text-8xl font-black text-black leading-none uppercase mb-6" set:html={theme.heroTitle} /> : <h1 class="text-6xl sm:text-8xl font-black text-black leading-none uppercase mb-6">Code<br/>Like A<br/>Rebel.</h1>}
        {theme.heroSubtitle ? <p class="text-black text-xl font-medium mb-10 border-l-4 border-black pl-4" set:html={theme.heroSubtitle} /> : <p class="text-black text-xl font-medium mb-10 border-l-4 border-black pl-4">Neo-brutalist design for developers who want to stand out. Learn to code differently.</p>}
        <a href={theme.heroBtnUrl || "/tutorial/html-introduction"} class="bg-black text-white px-10 py-5 font-black text-xl border-4 border-black hover:bg-[#FFE500] hover:text-black transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 hover:translate-y-2 hover:translate-x-2 inline-block">{theme.heroBtnText || "START NOW"}</a>
      </div>
      <div class="flex-1 w-full bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div class="font-mono text-xl font-bold">> init_rebel_mode()</div>
        <div class="font-mono text-lg mt-4">Loading skills... [OK]</div>
        <div class="font-mono text-lg mt-2">Injecting knowledge... [OK]</div>
      </div>
    </div>
  </div>
</section>
`;

const l7 = `${frontmatter}
<section class="w-full bg-[#FAF9F6] py-32 px-5">
  <div class="max-w-4xl mx-auto text-center">
    <div class="text-gray-400 uppercase tracking-[0.2em] text-sm mb-6 font-semibold">Elegant & Refined</div>
    {theme.heroTitle ? <h1 class="text-5xl sm:text-7xl font-serif text-[#2C3E50] leading-tight mb-8" set:html={theme.heroTitle} /> : <h1 class="text-5xl sm:text-7xl font-serif text-[#2C3E50] leading-tight mb-8">The Art of <br/><span class="italic text-[#04AA6D]">Web Development</span></h1>}
    {theme.heroSubtitle ? <p class="text-[#7F8C8D] text-xl max-w-2xl mx-auto mb-14 font-light leading-relaxed" set:html={theme.heroSubtitle} /> : <p class="text-[#7F8C8D] text-xl max-w-2xl mx-auto mb-14 font-light leading-relaxed">A sophisticated approach to learning code. Minimalist, breathable, and designed for deep focus.</p>}
    <a href={theme.heroBtnUrl || "/tutorial/html-introduction"} class="bg-[#2C3E50] text-white px-10 py-4 rounded-full font-medium hover:bg-[#1A252F] transition-colors">{theme.heroBtnText || "Begin Journey"}</a>
    
    <div class="mt-20 rounded-t-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden h-64 border-b-0">
      <div class="bg-gray-50 border-b border-gray-100 px-6 py-3 flex gap-2">
        <div class="w-3 h-3 rounded-full bg-gray-300"></div><div class="w-3 h-3 rounded-full bg-gray-300"></div><div class="w-3 h-3 rounded-full bg-gray-300"></div>
      </div>
    </div>
  </div>
</section>
`;

const l8 = `${frontmatter}
<section class="w-full bg-[#0F172A] py-24 px-5 overflow-hidden">
  <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
    <div class="text-left z-10">
      <div class="text-blue-400 font-bold tracking-wider uppercase text-sm mb-4">Enterprise Grade</div>
      {theme.heroTitle ? <h1 class="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6" set:html={theme.heroTitle} /> : <h1 class="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">Build Scalable Web Applications</h1>}
      {theme.heroSubtitle ? <p class="text-slate-400 text-lg mb-10 leading-relaxed" set:html={theme.heroSubtitle} /> : <p class="text-slate-400 text-lg mb-10 leading-relaxed">Professional training for the modern enterprise developer. Master the tools used by Fortune 500 companies.</p>}
      <div class="flex gap-4">
        <a href={theme.heroBtnUrl || "/tutorial/html-introduction"} class="bg-blue-600 text-white px-8 py-3 rounded text-sm font-bold hover:bg-blue-700 transition-colors">{theme.heroBtnText || "Get Started"}</a>
        <a href={theme.heroSecondaryBtnUrl || "#courses"} class="bg-transparent border border-slate-700 text-white px-8 py-3 rounded text-sm font-bold hover:bg-slate-800 transition-colors">{theme.heroSecondaryBtnText || "View Curriculum"}</a>
      </div>
    </div>
    <div class="relative">
      <div class="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
      <div class="relative bg-[#1E293B] border border-slate-700 rounded-lg p-8 shadow-2xl">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-slate-800 h-24 rounded border border-slate-700 p-4">
             <div class="w-8 h-8 bg-blue-500/20 rounded mb-2"></div>
             <div class="h-2 bg-slate-600 rounded w-1/2"></div>
          </div>
          <div class="bg-slate-800 h-24 rounded border border-slate-700 p-4">
             <div class="w-8 h-8 bg-green-500/20 rounded mb-2"></div>
             <div class="h-2 bg-slate-600 rounded w-1/2"></div>
          </div>
        </div>
        <div class="bg-slate-800 h-32 rounded border border-slate-700 p-4">
          <div class="h-2 bg-slate-600 rounded w-3/4 mb-4"></div>
          <div class="h-2 bg-slate-600 rounded w-full mb-2"></div>
          <div class="h-2 bg-slate-600 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
</section>
`;

fs.writeFileSync('src/components/home/HomeLayout4.astro', l4);
fs.writeFileSync('src/components/home/HomeLayout5.astro', l5);
fs.writeFileSync('src/components/home/HomeLayout6.astro', l6);
fs.writeFileSync('src/components/home/HomeLayout7.astro', l7);
fs.writeFileSync('src/components/home/HomeLayout8.astro', l8);
