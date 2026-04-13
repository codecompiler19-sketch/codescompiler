import { z, defineCollection } from 'astro:content';

const tutorialCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['html', 'css', 'javascript']), // Used for grouping in the sidebar
    order: z.number(), // Used for sorting chapters
    date: z.date().optional(),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().optional(),
    author: z.string().optional(),
    date: z.date().optional(),
    seoTitle: z.string().optional(),
    focusKeyword: z.string().optional(),
  }),
});

export const collections = {
  'tutorials': tutorialCollection,
  'blog': blogCollection,
};
