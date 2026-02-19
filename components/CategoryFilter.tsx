'use client';

import { NewsCategory } from '../types/news';
import { getCategoryLabel } from '../lib/newsUtils';

interface CategoryFilterProps {
  selectedCategory: NewsCategory | 'all';
  onCategoryChange: (category: NewsCategory | 'all') => void;
}

const categories: (NewsCategory | 'all')[] = ['all', 'model-release', 'api-update', 'news', 'other'];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isSelected
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        );
      })}
    </div>
  );
}
