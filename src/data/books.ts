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
  image: string | null;
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
  isPremium?: boolean;
  price?: string;
  amazonUrl?: string;
  checkoutUrl?: string;
}

const bookFiles = import.meta.glob('./books/*.json', { eager: true });
export const books: Book[] = Object.entries(bookFiles).map(([filepath, file]: [string, any]) => {
  const data = file.default;
  // Automatically generate the slug from the filename (e.g. "./books/my-book.json" -> "my-book")
  const slug = filepath.split('/').pop()?.replace('.json', '') || data.slug;
  return { ...data, slug };
});

export function formatDownloads(raw: string | number | undefined): string {
  if (!raw) return '0';
  const num = parseInt(String(raw).replace(/,/g, ''), 10);
  if (isNaN(num)) return '0';
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
