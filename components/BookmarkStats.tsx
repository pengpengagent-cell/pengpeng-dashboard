import { Bookmark } from '../types/bookmark';

interface BookmarkStatsProps {
  bookmarks: Bookmark[];
}

export default function BookmarkStats({ bookmarks }: BookmarkStatsProps) {
  if (bookmarks.length === 0) {
    return null;
  }

  // 統計情報の計算
  const totalBookmarks = bookmarks.length;
  
  // タグ別統計（トップ10）
  const tagCounts: Record<string, number> = {};
  bookmarks.forEach(bookmark => {
    bookmark.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  
  // カテゴリー別統計
  const categoryCounts: Record<string, number> = {};
  bookmarks.forEach(bookmark => {
    const category = bookmark.analysis?.category || 'uncategorized';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  // 感情分析統計
  const sentimentCounts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };
  
  bookmarks.forEach(bookmark => {
    const sentiment = bookmark.analysis?.sentiment || 'neutral';
    sentimentCounts[sentiment]++;
  });

  // 日付範囲
  const dates = bookmarks.map(b => new Date(b.createdAt));
  const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  const formatDateRange = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookmark Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookmarks */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">{totalBookmarks}</div>
          <div className="text-sm text-blue-600 font-medium">Total Bookmarks</div>
          <div className="text-xs text-blue-500 mt-1">
            {formatDateRange(oldestDate)} - {formatDateRange(newestDate)}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">
            {sentimentCounts.positive}
          </div>
          <div className="text-sm text-green-600 font-medium">Positive Sentiment</div>
          <div className="text-xs text-green-500 mt-1">
            {((sentimentCounts.positive / totalBookmarks) * 100).toFixed(1)}% of total
          </div>
        </div>

        {/* Categories */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-700">
            {Object.keys(categoryCounts).length}
          </div>
          <div className="text-sm text-purple-600 font-medium">Categories</div>
          <div className="text-xs text-purple-500 mt-1">
            Most common: {Object.entries(categoryCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-700">
            {Object.keys(tagCounts).length}
          </div>
          <div className="text-sm text-orange-600 font-medium">Unique Tags</div>
          <div className="text-xs text-orange-500 mt-1">
            Most used: {topTags[0]?.[0] || 'N/A'} ({topTags[0]?.[1] || 0})
          </div>
        </div>
      </div>

      {/* Top Tags Visualization */}
      {topTags.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Top Tags</h3>
          <div className="space-y-2">
            {topTags.map(([tag, count]) => {
              const percentage = (count / totalBookmarks) * 100;
              return (
                <div key={tag} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600 truncate">{tag}</div>
                  <div className="flex-1 ml-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm text-gray-700">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sentiment Breakdown */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{sentimentCounts.positive}</div>
          <div className="text-xs text-gray-600">Positive</div>
          <div className="text-xs text-gray-500">
            {((sentimentCounts.positive / totalBookmarks) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-600">{sentimentCounts.neutral}</div>
          <div className="text-xs text-gray-600">Neutral</div>
          <div className="text-xs text-gray-500">
            {((sentimentCounts.neutral / totalBookmarks) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{sentimentCounts.negative}</div>
          <div className="text-xs text-gray-600">Negative</div>
          <div className="text-xs text-gray-500">
            {((sentimentCounts.negative / totalBookmarks) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}