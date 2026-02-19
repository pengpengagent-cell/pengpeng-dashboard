'use client';

import { NewsArticle } from '../types/news';
import { getCategoryLabel, getCategoryColor, getCategoryBgColor } from '../lib/newsUtils';

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <article className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBgColor(
            article.category
          )} ${getCategoryColor(article.category)}`}
        >
          {getCategoryLabel(article.category)}
        </span>
        <span className="text-slate-400 text-sm">{article.date}</span>
      </div>

      <h2 className="text-xl font-semibold text-purple-400 mb-3">
        {article.title}
      </h2>

      <p className="text-slate-200 whitespace-pre-line leading-relaxed mb-4">
        {article.content}
      </p>

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {article.sources.length > 0 && (
        <div className="text-slate-400 text-sm">
          <span className="font-medium">Source:</span>{' '}
          {article.sources.join(', ')}
        </div>
      )}
    </article>
  );
}
