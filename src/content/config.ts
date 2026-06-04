import { defineCollection, z } from 'astro:content';

const tutorialsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.enum(['html', 'css', 'javascript', 'seo', 'python', 'sql', 'php']),
    order: z.number(),
    group: z.string().optional(),
    seoTitle: z.string().optional(),
    permalink: z.string().optional(),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Decap CMS saves dates as unquoted strings which YAML parses as Date objects.
    // Existing posts have quoted strings. This accepts both.
    date: z.union([z.string(), z.date()]),
    // Post status — draft/scheduled posts are hidden from listings & sitemaps
    status: z.enum(['draft', 'published', 'scheduled']).optional().default('published'),
    category: z.enum([
      'HTML & CSS', 'JavaScript', 'JavaScript Projects', 'Login Form',
      'Card Design', 'Navigation Bar', 'Blog', 'Website Designs',
      'Image Slider', 'API Projects', 'Sidebar Menu', 'CSS Buttons',
      'JavaScript Games', 'Preloader or Loader', 'Form Validation',
      'Accordion', 'Bootstrap', 'Tabs', 'Calendar'
    ]),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().optional().default(false),
    hasDemo: z.boolean().optional().default(false),
    author: z.string().optional().default('CodesCompiler'),
    // SEO fields
    seoTitle: z.string().optional(),
    canonicalUrl: z.string().optional(),
    ogImage: z.string().optional(),
    noindex: z.boolean().optional().default(false),
    permalink: z.string().optional(),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seoTitle: z.string().optional(),
    noindex: z.boolean().optional().default(false),
  }),
});

export const collections = {
  'tutorials': tutorialsCollection,
  'blog': blogCollection,
  'pages': pagesCollection,
};


