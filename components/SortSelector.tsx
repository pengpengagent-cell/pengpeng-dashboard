'use client';

import { SortOption } from '../types/news';

interface SortSelectorProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'relevant', label: 'Most Relevant' },
];

export default function SortSelector({ selectedSort, onSortChange }: SortSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-slate-300 text-sm">Sort by:</label>
      <select
        value={selectedSort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded text-slate-200 focus:outline-none focus:border-purple-500/50 transition-all cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
