import { NewsArticle, NewsFilter } from '../types/news';

export function filterNews(articles: NewsArticle[], filter: NewsFilter): NewsArticle[] {
  return articles.filter((article) => {
    // カテゴリーフィルター
    if (filter.category && filter.category !== 'all') {
      if (article.category !== filter.category) {
        return false;
      }
    }

    // 日付範囲フィルター
    if (filter.startDate && article.date < filter.startDate) {
      return false;
    }

    if (filter.endDate && article.date > filter.endDate) {
      return false;
    }

    return true;
  });
}
