// 統合ユーティリティ: 検索 → フィルター → ソート
import { NewsArticle, NewsFilter, SortOption } from '../types/news';
import { searchNews } from './searchNews';
import { filterNews } from './filterNews';
import { sortNews } from './sortNews';

export function processNews(
  articles: NewsArticle[],
  filter: NewsFilter,
  sortOption: SortOption
): NewsArticle[] {
  // 1. 検索
  let result = searchNews(articles, filter.searchQuery || '');

  // 2. フィルター
  result = filterNews(result, filter);

  // 3. ソート
  result = sortNews(result, sortOption, filter.searchQuery || '');

  return result;
}

// カテゴリー表示名
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'model-release': 'Model Releases',
    'api-update': 'API Updates',
    'news': 'News',
    'other': 'Other',
  };
  return labels[category] || category;
}

// カテゴリーカラー
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'model-release': 'text-blue-400',
    'api-update': 'text-yellow-400',
    'news': 'text-green-400',
    'other': 'text-slate-400',
  };
  return colors[category] || 'text-slate-400';
}

// カテゴリーバックグラウンド
export function getCategoryBgColor(category: string): string {
  const colors: Record<string, string> = {
    'model-release': 'bg-blue-500/20',
    'api-update': 'bg-yellow-500/20',
    'news': 'bg-green-500/20',
    'other': 'bg-slate-500/20',
  };
  return colors[category] || 'bg-slate-500/20';
}
