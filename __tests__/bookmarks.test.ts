import { parseNotionPage, mockBookmarks } from '../types/bookmark';
import { filterBookmarksByTag, calculateBookmarkStats } from '../lib/notionClient';

describe('Bookmark Utilities', () => {
  describe('parseNotionPage', () => {
    it('parses a Notion page with all properties', () => {
      const mockPage = {
        id: 'test-id',
        created_time: '2026-01-27T10:00:00.000Z',
        properties: {
          URL: { url: 'https://twitter.com/test/status/123' },
          Title: { title: [{ plain_text: 'Test Tweet' }] },
          Tags: { multi_select: [{ name: 'AI' }, { name: 'Tech' }] },
          Analysis: { rich_text: [{ plain_text: 'Summary: Test summary\nKey Points: point1; point2\nSentiment: positive' }] },
          Category: { select: { name: 'Technology' } },
          Author: { rich_text: [{ plain_text: '@testuser' }] },
          TweetID: { rich_text: [{ plain_text: '1234567890' }] },
        },
      };

      const result = parseNotionPage(mockPage);

      expect(result.id).toBe('test-id');
      expect(result.url).toBe('https://twitter.com/test/status/123');
      expect(result.title).toBe('Test Tweet');
      expect(result.tags).toEqual(['AI', 'Tech']);
      expect(result.createdAt).toBe('2026-01-27T10:00:00.000Z');
      expect(result.analysis?.summary).toBe('Test summary');
      expect(result.analysis?.category).toBe('Technology');
      expect(result.analysis?.sentiment).toBe('positive');
      expect(result.analysis?.keyPoints).toEqual(['point1', 'point2']);
      expect(result.author).toBe('@testuser');
      expect(result.tweetId).toBe('1234567890');
    });

    it('handles missing properties gracefully', () => {
      const mockPage = {
        id: 'test-id',
        created_time: '2026-01-27T10:00:00.000Z',
        properties: {},
      };

      const result = parseNotionPage(mockPage);

      expect(result.id).toBe('test-id');
      expect(result.url).toBe('');
      expect(result.title).toBe('No title');
      expect(result.tags).toEqual([]);
      expect(result.analysis).toBeUndefined();
      expect(result.author).toBe('');
      expect(result.tweetId).toBe('');
    });

    it('parses Japanese analysis text', () => {
      const mockPage = {
        id: 'test-id',
        created_time: '2026-01-27T10:00:00.000Z',
        properties: {
          Analysis: { rich_text: [{ plain_text: '要約: テスト要約\nキーポイント: ポイント1; ポイント2\n感情分析: ポジティブ' }] },
          Category: { select: { name: '技術' } },
        },
      };

      const result = parseNotionPage(mockPage);

      expect(result.analysis?.summary).toBe('テスト要約');
      expect(result.analysis?.category).toBe('技術');
      expect(result.analysis?.sentiment).toBe('positive');
      expect(result.analysis?.keyPoints).toEqual(['ポイント1', 'ポイント2']);
    });
  });

  describe('filterBookmarksByTag', () => {
    const bookmarks = mockBookmarks;

    it('filters bookmarks by tag', () => {
      const filtered = filterBookmarksByTag(bookmarks, 'AI');
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(bookmark => {
        expect(bookmark.tags.some(tag => tag.toLowerCase().includes('ai'))).toBe(true);
      });
    });

    it('returns all bookmarks when no tag is specified', () => {
      const filtered = filterBookmarksByTag(bookmarks, '');
      expect(filtered.length).toBe(bookmarks.length);
    });

    it('returns empty array when no matching tags found', () => {
      const filtered = filterBookmarksByTag(bookmarks, 'NonexistentTag');
      expect(filtered.length).toBe(0);
    });

    it('is case-insensitive', () => {
      const filtered1 = filterBookmarksByTag(bookmarks, 'ai');
      const filtered2 = filterBookmarksByTag(bookmarks, 'AI');
      expect(filtered1.length).toBe(filtered2.length);
    });
  });

  describe('calculateBookmarkStats', () => {
    const bookmarks = mockBookmarks;

    it('calculates correct statistics', () => {
      const stats = calculateBookmarkStats(bookmarks);

      expect(stats.total).toBe(bookmarks.length);
      expect(typeof stats.byTag).toBe('object');
      expect(typeof stats.byCategory).toBe('object');
      expect(typeof stats.byDate).toBe('object');

      // Check that all tags are counted
      const allTags = bookmarks.flatMap(b => b.tags);
      allTags.forEach(tag => {
        expect(stats.byTag[tag]).toBeGreaterThan(0);
      });

      // Check that categories are counted
      bookmarks.forEach(bookmark => {
        const category = bookmark.analysis?.category || 'uncategorized';
        expect(stats.byCategory[category]).toBeGreaterThan(0);
      });
    });

    it('handles empty bookmarks array', () => {
      const stats = calculateBookmarkStats([]);

      expect(stats.total).toBe(0);
      expect(Object.keys(stats.byTag).length).toBe(0);
      expect(Object.keys(stats.byCategory).length).toBe(0);
      expect(Object.keys(stats.byDate).length).toBe(0);
    });

    it('counts uncategorized bookmarks correctly', () => {
      const uncategorizedBookmark = {
        ...mockBookmarks[0],
        analysis: undefined,
      };
      const stats = calculateBookmarkStats([uncategorizedBookmark]);

      expect(stats.byCategory['uncategorized']).toBe(1);
    });
  });
});