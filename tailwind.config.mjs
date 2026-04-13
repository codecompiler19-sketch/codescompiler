/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#f5f7fa',
          DEFAULT: '#2563eb',
          dark: '#1e3a8a',
        },
        sidebar: {
          bg: '#111827',
          hover: '#1f2937',
          text: '#e5e7eb'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'monospace'],
      }
    },
  },
  plugins: [],
}
