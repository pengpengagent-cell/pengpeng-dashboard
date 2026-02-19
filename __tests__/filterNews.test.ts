import { filterNews } from '../lib/filterNews';
import { NewsArticle } from '../types/news';

describe('filterNews', () => {
  const mockArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'OpenAI releases GPT-5',
      content: 'OpenAI has released GPT-5',
      date: '2026-02-19',
      category: 'model-release',
      tags: ['OpenAI'],
      sources: ['TechCrunch'],
    },
    {
      id: '2',
      title: 'Anthropic updates API',
      content: 'Anthropic has updated their API',
      date: '2026-02-18',
      category: 'api-update',
      tags: ['Anthropic'],
      sources: ['Anthropic Blog'],
    },
    {
      id: '3',
      title: 'Google announces partnership',
      content: 'Google announces partnership',
      date: '2026-02-17',
      category: 'news',
      tags: ['Google'],
      sources: ['Google Blog'],
    },
    {
      id: '4',
      title: 'Other news',
      content: 'Some other news',
      date: '2026-02-16',
      category: 'other',
      tags: [],
      sources: ['Unknown'],
    },
  ];

  it('returns all articles when no filter', () => {
    const result = filterNews(mockArticles, {});
    expect(result).toHaveLength(4);
  });

  it('filters by category', () => {
    const result = filterNews(mockArticles, { category: 'model-release' });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('OpenAI releases GPT-5');
  });

  it('filters by category "all"', () => {
    const result = filterNews(mockArticles, { category: 'all' });
    expect(result).toHaveLength(4);
  });

  it('filters by start date', () => {
    const result = filterNews(mockArticles, { startDate: '2026-02-18' });
    expect(result).toHaveLength(2); // 2026-02-18 and 2026-02-19
  });

  it('filters by end date', () => {
    const result = filterNews(mockArticles, { endDate: '2026-02-17' });
    expect(result).toHaveLength(2); // 2026-02-16 and 2026-02-17
  });

  it('filters by date range', () => {
    const result = filterNews(mockArticles, { 
      startDate: '2026-02-17', 
      endDate: '2026-02-18' 
    });
    expect(result).toHaveLength(2); // 2026-02-17 and 2026-02-18
  });

  it('filters by category and date range', () => {
    const result = filterNews(mockArticles, { 
      category: 'model-release',
      startDate: '2026-02-18',
      endDate: '2026-02-19'
    });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('OpenAI releases GPT-5');
  });
});
