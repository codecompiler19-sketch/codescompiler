const fs = require('fs');

const courses = [
  { slug: '/tutorial/html-introduction', title: 'HTML Foundations', icon: '&lt;/&gt;', c: 'orange', desc: 'Structure content and build the web.' },
  { slug: '/tutorial/css-introduction', title: 'CSS Styling', icon: '{ }', c: 'blue', desc: 'Master layouts, colors, and animations.' },
  { slug: '/tutorial/javascript-introduction', title: 'JavaScript', icon: 'JS', c: 'yellow', desc: 'Bring pages to life with real logic.' }
];
const features = [
  { emoji: '⚡', title: 'Instant Live Editor', desc: 'Write code and see the results immediately.' },
  { emoji: '📱', title: 'Any Device', desc: 'Completely responsive learning on the go.' },
  { emoji: '🆓', title: 'Always Free', desc: 'No paywalls, no subscriptions.' }
];

function getAppends(layoutNum) {
  if (layoutNum === 4) {
    return `
{theme.showTutorialCategories !== false && (
<section class="w-full bg-[#f4f4f5] py-10 px-5">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-end justify-between mb-8">
      <div>
        <h2 class="text-3xl font-black text-gray-900" set:html={theme.coursesTitle || 'Start Learning'} />
        <p class="text-gray-500 mt-2" set:html={theme.coursesSubtitle || 'Choose a path below.'} />
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${courses.map(c => `
      <a href="${c.slug}" class="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-start group">
        <div class="w-16 h-16 rounded-2xl bg-${c.c}-100 text-${c.c}-600 flex items-center justify-center text-2xl font-black mb-6 group-hover:scale-110 transition-transform">${c.icon}</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">${c.title}</h3>
        <p class="text-gray-500 text-sm">${c.desc}</p>
      </a>`).join('')}
    </div>
  </div>
</section>
)}
{theme.showFeaturedSection !== false && (
<section class="w-full bg-[#f4f4f5] py-10 px-5">
  <div class="max-w-6xl mx-auto bg-slate-900 rounded-3xl p-10 sm:p-14 text-white overflow-hidden relative">
    <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
      <div class="md:col-span-3 mb-4">
        <h2 class="text-3xl font-black" set:html={theme.featuresTitle || 'Why Choose Us'} />
        <p class="text-slate-400 mt-2" set:html={theme.featuresSubtitle || 'Everything you need to master code.'} />
      </div>
      ${features.map(f => `
      <div class="flex flex-col gap-4">
        <div class="text-4xl">${f.emoji}</div>
        <h3 class="text-xl font-bold text-white">${f.title}</h3>
        <p class="text-slate-400 text-sm leading-relaxed">${f.desc}</p>
      </div>`).join('')}
    </div>
  </div>
</section>
)}
`;
  }
  
  if (layoutNum === 5) {
    return `
{theme.showTutorialCategories !== false && (
<section class="w-full bg-black py-20 px-5 border-t border-white/10 relative overflow-hidden">
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent pointer-events-none"></div>
  <div class="max-w-4xl mx-auto relative z-10">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-black text-white tracking-tighter" set:html={theme.coursesTitle || 'Learning Paths'} />
      <p class="text-gray-400 mt-3 text-lg" set:html={theme.coursesSubtitle || 'Select a language to master.'} />
    </div>
    <div class="space-y-4">
      ${courses.map(c => `
      <a href="${c.slug}" class="group block p-1 rounded-2xl bg-gradient-to-r hover:from-${c.c}-500/50 hover:to-transparent transition-all duration-500">
        <div class="bg-zinc-900/90 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="w-14 h-14 rounded-lg bg-zinc-800 text-white flex items-center justify-center text-xl font-black border border-white/5">${c.icon}</div>
            <div>
              <h3 class="text-2xl font-bold text-white group-hover:text-${c.c}-400 transition-colors">${c.title}</h3>
              <p class="text-gray-400 mt-1">${c.desc}</p>
            </div>
          </div>
          <div class="hidden sm:block text-white opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">→</div>
        </div>
      </a>`).join('')}
    </div>
  </div>
</section>
)}
`;
  }

  if (layoutNum === 6) {
    return `
{theme.showTutorialCategories !== false && (
<section class="w-full bg-white py-20 px-5 border-b-8 border-black">
  <div class="max-w-6xl mx-auto">
    <div class="mb-12 border-l-8 border-[#FFE500] pl-6">
      <h2 class="text-5xl font-black text-black uppercase" set:html={theme.coursesTitle || 'Curriculum'} />
      <p class="text-xl font-bold mt-2" set:html={theme.coursesSubtitle || 'Choose your weapon.'} />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      ${courses.map((c, i) => {
        const bgColors = ['bg-[#FF90E8]', 'bg-[#00E5FF]', 'bg-[#FFE500]'];
        return `
      <a href="${c.slug}" class="block border-4 border-black ${bgColors[i]} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
        <div class="text-4xl font-black mb-6 bg-white inline-block border-2 border-black px-4 py-2">${c.icon}</div>
        <h3 class="text-2xl font-black text-black uppercase mb-4">${c.title}</h3>
        <p class="text-black font-bold text-lg">${c.desc}</p>
      </a>`;
      }).join('')}
    </div>
  </div>
</section>
)}
`;
  }

  if (layoutNum === 7) {
    return `
{theme.showTutorialCategories !== false && (
<section class="w-full bg-[#FAF9F6] py-24 px-5">
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-20">
      <h2 class="text-4xl font-serif text-[#2C3E50]" set:html={theme.coursesTitle || 'Curated Paths'} />
      <div class="w-12 h-0.5 bg-[#04AA6D] mx-auto mt-6 mb-6"></div>
      <p class="text-[#7F8C8D] italic text-lg" set:html={theme.coursesSubtitle || 'Select a discipline to master.'} />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
      ${courses.map(c => `
      <a href="${c.slug}" class="group block bg-white p-10 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500">
        <div class="text-3xl font-light text-gray-300 mb-6 group-hover:text-[#04AA6D] transition-colors">${c.icon}</div>
        <h3 class="text-xl font-serif text-[#2C3E50] mb-4">${c.title}</h3>
        <p class="text-[#7F8C8D] text-sm leading-relaxed">${c.desc}</p>
        <div class="mt-8 text-xs tracking-widest uppercase text-gray-400 group-hover:text-[#2C3E50] transition-colors">Begin →</div>
      </a>`).join('')}
    </div>
  </div>
</section>
)}
`;
  }

  if (layoutNum === 8) {
    return `
{theme.showTutorialCategories !== false && (
<section class="w-full bg-[#1E293B] py-20 px-5 border-y border-slate-800">
  <div class="max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
      <div>
        <h2 class="text-3xl font-extrabold text-white" set:html={theme.coursesTitle || 'Training Modules'} />
        <p class="text-slate-400 mt-2" set:html={theme.coursesSubtitle || 'Enterprise-grade curriculum.'} />
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${courses.map(c => `
      <a href="${c.slug}" class="bg-[#0F172A] border border-slate-700 p-6 rounded hover:border-blue-500 transition-colors group">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-blue-400 font-mono text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">${c.icon}</div>
          <h3 class="text-lg font-bold text-white">${c.title}</h3>
        </div>
        <p class="text-slate-400 text-sm">${c.desc}</p>
      </a>`).join('')}
    </div>
  </div>
</section>
)}
`;
  }

  return '';
}

for (let i = 4; i <= 8; i++) {
  const filePath = `src/components/home/HomeLayout${i}.astro`;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const toAppend = getAppends(i);
  
  if (!content.includes('theme.showTutorialCategories')) {
    content = content + '\\n' + toAppend;
    fs.writeFileSync(filePath, content);
    console.log(`Updated Layout ${i}`);
  } else {
    console.log(`Layout ${i} already has courses section.`);
  }
}
