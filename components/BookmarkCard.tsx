import { Bookmark } from '../types/bookmark';

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export default function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      {/* Card Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {bookmark.title}
            </h3>
            {bookmark.author && (
              <p className="text-sm text-gray-600 mt-1">by {bookmark.author}</p>
            )}
          </div>
          {bookmark.analysis?.sentiment && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(bookmark.analysis.sentiment)}`}>
              {bookmark.analysis.sentiment}
            </span>
          )}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {bookmark.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Analysis Summary */}
        {bookmark.analysis?.summary && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {bookmark.analysis.summary}
            </p>
          </div>
        )}

        {/* Key Points */}
        {bookmark.analysis?.keyPoints && bookmark.analysis.keyPoints.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Points</h4>
            <ul className="space-y-1">
              {bookmark.analysis.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Category */}
        {bookmark.analysis?.category && bookmark.analysis.category !== 'uncategorized' && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Category</h4>
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
              {bookmark.analysis.category}
            </span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Saved on {formatDate(bookmark.createdAt)}
        </div>
        <div className="flex gap-2">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            View Tweet
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}