import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://codescompiler.com',
  output: 'static',           // Required for GitHub Pages
  compressHTML: true,         // Removes whitespace/comments for highly compressed code
  integrations: [tailwind(), mdx()],
  prefetch: true,
});
