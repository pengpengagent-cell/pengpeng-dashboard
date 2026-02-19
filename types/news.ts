export type NewsCategory = 'model-release' | 'api-update' | 'news' | 'other';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD format
  category: NewsCategory;
  tags: string[];
  sources: string[];
}

export interface NewsFilter {
  category?: NewsCategory | 'all';
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export type SortOption = 'newest' | 'oldest' | 'relevant';
