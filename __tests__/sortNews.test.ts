import { sortNews } from '../lib/sortNews';
import { NewsArticle } from '../types/news';

describe('sortNews', () => {
  const mockArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'Article A',
      content: 'Content about OpenAI',
      date: '2026-02-16',
      category: 'other',
      tags: ['OpenAI'],
      sources: ['Test'],
    },
    {
      id: '2',
      title: 'Article B',
      content: 'Content about Claude',
      date: '2026-02-18',
      category: 'other',
      tags: ['Claude'],
      sources: ['Test'],
    },
    {
      id: '3',
      title: 'Article C',
      content: 'Content about both',
      date: '2026-02-17',
      category: 'other',
      tags: ['OpenAI', 'Claude'],
      sources: ['Test'],
    },
  ];

  it('sorts by newest first', () => {
    const result = sortNews(mockArticles, 'newest');
    expect(result[0].date).toBe('2026-02-18');
    expect(result[1].date).toBe('2026-02-17');
    expect(result[2].date).toBe('2026-02-16');
  });

  it('sorts by oldest first', () => {
    const result = sortNews(mockArticles, 'oldest');
    expect(result[0].date).toBe('2026-02-16');
    expect(result[1].date).toBe('2026-02-17');
    expect(result[2].date).toBe('2026-02-18');
  });

  it('sorts by relevance with query', () => {
    const result = sortNews(mockArticles, 'relevant', 'openai');
    // Article A has OpenAI in tags (5 points) and content (1 point) = 6 points
    // Article C has OpenAI in tags (5 points) = 5 points
    // Article B has no OpenAI = 0 points
    expect(result[0].title).toBe('Article A');
    expect(result[1].title).toBe('Article C');
    expect(result[2].title).toBe('Article B');
  });

  it('sorts by relevance with tie-breaking (newest first)', () => {
    const articlesWithSameScore: NewsArticle[] = [
      {
        id: '1',
        title: 'Article X',
        content: 'Content',
        date: '2026-02-16',
        category: 'other',
        tags: [],
        sources: ['Test'],
      },
      {
        id: '2',
        title: 'Article Y',
        content: 'Content',
        date: '2026-02-18',
        category: 'other',
        tags: [],
        sources: ['Test'],
      },
    ];
    
    const result = sortNews(articlesWithSameScore, 'relevant', 'nonexistent');
    expect(result[0].date).toBe('2026-02-18'); // Newest first when scores are equal
    expect(result[1].date).toBe('2026-02-16');
  });
});
