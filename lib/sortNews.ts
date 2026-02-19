import { NewsArticle, SortOption } from '../types/news';

// 関連度スコア計算（クエリに対する）
export function calculateRelevanceScore(article: NewsArticle, query: string): number {
  if (!query || query.trim() === '') {
    return 0;
  }

  const lowerQuery = query.toLowerCase();
  let score = 0;

  // タイトルマッチ: 10点
  if (article.title.toLowerCase().includes(lowerQuery)) {
    score += 10;
  }

  // タグマッチ: 5点/タグ
  article.tags.forEach((tag) => {
    if (tag.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }
  });

  // コンテンツマッチ: 1点
  if (article.content.toLowerCase().includes(lowerQuery)) {
    score += 1;
  }

  return score;
}

export function sortNews(articles: NewsArticle[], option: SortOption, query: string = ''): NewsArticle[] {
  const sorted = [...articles];

  switch (option) {
    case 'newest':
      // 新しい順
      return sorted.sort((a, b) => b.date.localeCompare(a.date));

    case 'oldest':
      // 古い順
      return sorted.sort((a, b) => a.date.localeCompare(b.date));

    case 'relevant':
      // 関連度順（検索クエリあり）
      return sorted.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, query);
        const scoreB = calculateRelevanceScore(b, query);

        // スコアが同じ場合は新しい順
        if (scoreA === scoreB) {
          return b.date.localeCompare(a.date);
        }

        return scoreB - scoreA;
      });

    default:
      return sorted;
  }
}
