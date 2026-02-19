import { NewsArticle } from '../types/news';

export function searchNews(articles: NewsArticle[], query: string): NewsArticle[] {
  if (!query || query.trim() === '') {
    return articles;
  }

  const lowerQuery = query.toLowerCase();

  return articles.filter((article) => {
    const titleMatch = article.title.toLowerCase().includes(lowerQuery);
    const contentMatch = article.content.toLowerCase().includes(lowerQuery);
    const tagMatch = article.tags.some((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    );

    return titleMatch || contentMatch || tagMatch;
  });
}
