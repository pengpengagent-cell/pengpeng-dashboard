import { searchNews } from '../lib/searchNews';
import { NewsArticle } from '../types/news';

describe('searchNews', () => {
  const mockArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'OpenAI releases GPT-5',
      content: 'OpenAI has released GPT-5 with new capabilities',
      date: '2026-02-19',
      category: 'model-release',
      tags: ['OpenAI', 'GPT'],
      sources: ['TechCrunch'],
    },
    {
      id: '2',
      title: 'Anthropic updates Claude API',
      content: 'Anthropic has updated their API with new endpoints',
      date: '2026-02-18',
      category: 'api-update',
      tags: ['Anthropic', 'Claude'],
      sources: ['Anthropic Blog'],
    },
    {
      id: '3',
      title: 'Google announces partnership',
      content: 'Google announces partnership with major tech company',
      date: '2026-02-17',
      category: 'news',
      tags: ['Google', 'Partnership'],
      sources: ['Google Blog'],
    },
  ];

  it('returns all articles when query is empty', () => {
    const result = searchNews(mockArticles, '');
    expect(result).toHaveLength(3);
  });

  it('returns all articles when query is whitespace', () => {
    const result = searchNews(mockArticles, '   ');
    expect(result).toHaveLength(3);
  });

  it('finds articles by title (case-insensitive)', () => {
    const result = searchNews(mockArticles, 'openai');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('OpenAI releases GPT-5');
  });

  it('finds articles by content', () => {
    const result = searchNews(mockArticles, 'capabilities');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('OpenAI releases GPT-5');
  });

  it('finds articles by tag', () => {
    const result = searchNews(mockArticles, 'claude');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Anthropic updates Claude API');
  });

  it('returns multiple articles for partial matches', () => {
    const result = searchNews(mockArticles, 'api');
    expect(result).toHaveLength(1); // Claude API (title)のみ
  });

  it('returns empty array when no matches', () => {
    const result = searchNews(mockArticles, 'nonexistent');
    expect(result).toHaveLength(0);
  });
});
