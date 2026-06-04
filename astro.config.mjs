import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import fs from 'node:fs';

// Post-build hook to duplicate sitemap-index.xml as sitemap.xml
const copySitemap = () => ({
  name: 'copy-sitemap',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const fromPath = new URL('sitemap-index.xml', dir);
      const toPath = new URL('sitemap.xml', dir);
      if (fs.existsSync(fromPath)) {
        fs.copyFileSync(fromPath, toPath);
        console.log('  ✅ Successfully duplicated sitemap-index.xml to sitemap.xml');
      }
    }
  }
});

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
    sitemap({
      // Exclude draft/scheduled posts from sitemap automatically
      filter: (page) => !page.includes('/admin'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    tailwind(),
    copySitemap()
  ],
  site: 'https://codescompiler.com',
});
