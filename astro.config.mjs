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

// Custom Vite plugin to ignore HMR reloads on content & sitemap changes during bulk admin uploads
const ignoreContentHMR = () => ({
  name: 'ignore-content-hmr',
  handleHotUpdate({ file }) {
    if (
      file.includes('sitemap') ||
      file.includes('nav.json') ||
      file.includes('site-settings.json') ||
      file.includes('src/content') ||
      file.includes('src\\content')
    ) {
      return [];
    }
  }
});

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/tutorial/js-introduction': '/tutorial/javascript-introduction',
    '/tutorial/python-guide': '/tutorial/python-introduction',
    '/tutorial/sql-guide': '/tutorial/sql-introduction',
    '/tutorial/seo-overview': '/tutorial/seo-introduction',
    '/tutorial/php-guide': '/tutorial/php-introduction',
  },
  vite: {
    server: {
      watch: {
        ignored: [
          '**/public/sitemap*.xml',
          '**/src/data/**',
          '**/src/nav.json',
          '**/src/site-settings.json',
          '**/src/ads-config.json'
        ]
      },
      plugins: [ignoreContentHMR()]
    },
    plugins: [ignoreContentHMR()]
  },
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
