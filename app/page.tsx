'use client';

import { useState, useEffect } from 'react';
import { NewsArticle, NewsCategory, SortOption } from '../types/news';
import { processNews } from '../lib/newsUtils';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import DateRangeFilter from '../components/DateRangeFilter';
import SortSelector from '../components/SortSelector';
import MobileFilter from '../components/MobileFilter';

// 初期データ取得用API Route
async function fetchNewsData(): Promise<NewsArticle[]> {
  const response = await fetch('/api/news');
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
}

export default function Home() {
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);

  // フィルター・ソート状態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // 初回データ取得
  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      try {
        const articles = await fetchNewsData();
        setAllArticles(articles);
        setFilteredArticles(articles);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  // 検索・フィルター・ソートの適用
  useEffect(() => {
    const result = processNews(allArticles, {
      searchQuery,
      category: selectedCategory,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }, sortOption);

    setFilteredArticles(result);
  }, [searchQuery, selectedCategory, startDate, endDate, sortOption, allArticles]);

  // モバイルフィルター状態
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // リセットボタン
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStartDate('');
    setEndDate('');
    setSortOption('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🐧 PengPeng AI News Dashboard v2
              </h1>
              <p className="text-slate-300 text-lg">
                Latest AI & Tech News with Search, Filters, and Categories
              </p>
            </div>
            
            <div className="flex gap-2">
              <a
                href="/cron-status"
                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cron Status
              </a>
            </div>
          </div>
        </header>

        {/* 検索・フィルター・ソートコントロール */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 mb-8 border border-slate-700/50">
          {/* モバイルフィルターボタン（lg以下で表示） */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Show Filters</span>
            </button>
          </div>

          {/* デスクトップフィルター（lg以上で表示） */}
          <div className="hidden lg:block">
            {/* 検索バー */}
            <div className="mb-6">
              <SearchBar onSearch={setSearchQuery} />
            </div>

            {/* カテゴリーフィルター */}
            <div className="mb-6">
              <h3 className="text-slate-300 text-sm font-medium mb-3">Category</h3>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* 日付範囲フィルター */}
            <div className="mb-6">
              <h3 className="text-slate-300 text-sm font-medium mb-3">Date Range</h3>
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>

            {/* ソートとリセット */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <SortSelector
                selectedSort={sortOption}
                onSortChange={setSortOption}
              />
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* 結果カウント */}
        <div className="mb-4 text-slate-400">
          Showing {filteredArticles.length} of {allArticles.length} articles
        </div>

        {/* ニュースリスト */}
        {loading ? (
          <div className="bg-slate-800/50 rounded-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <p className="text-slate-300 mt-4">Loading news...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-slate-800/50 rounded-lg p-8 text-center">
            <p className="text-slate-300 text-xl">No articles match your criteria.</p>
            <p className="text-slate-400 mt-4">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>Powered by PengPeng • AI Agent running on OpenClaw</p>
          <p className="mt-2">
            Last updated:{' '}
            {new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })}
          </p>
        </footer>

        {/* モバイルフィルターパネル */}
        <MobileFilter
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
        >
          <div className="space-y-6">
            {/* 検索バー */}
            <div>
              <h3 className="text-slate-300 text-sm font-medium mb-3">Search</h3>
              <SearchBar onSearch={setSearchQuery} />
            </div>

            {/* カテゴリーフィルター */}
            <div>
              <h3 className="text-slate-300 text-sm font-medium mb-3">Category</h3>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* 日付範囲フィルター */}
            <div>
              <h3 className="text-slate-300 text-sm font-medium mb-3">Date Range</h3>
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>

            {/* ソート */}
            <div>
              <h3 className="text-slate-300 text-sm font-medium mb-3">Sort</h3>
              <SortSelector
                selectedSort={sortOption}
                onSortChange={setSortOption}
              />
            </div>
          </div>
        </MobileFilter>
      </div>
    </div>
  );
}
