import { readdir, readFile } from 'fs/promises';
import path from 'path';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'model-release' | 'api-update' | 'news' | 'other';
  tags: string[];
  sources: string[];
}

// カテゴリー自動判定ロジック
function detectCategory(title: string, content: string): 'model-release' | 'api-update' | 'news' | 'other' {
  const text = `${title} ${content}`.toLowerCase();

  // model-release: モデル名 + リリース関連キーワード
  const modelKeywords = ['claude', 'gpt', 'gemini', 'model', 'llm', 'sonnet', 'haiku'];
  const releaseKeywords = ['release', 'launch', 'launched', 'released', 'version', 'v2026', 'v2025'];
  
  // api-update: API関連キーワード
  const apiKeywords = ['api', 'endpoint', 'sdk', 'deprecate', 'deprecated', 'integration'];
  
  // news: ニュース・提携関連キーワード
  const newsKeywords = ['announce', 'announced', 'partnership', 'acquisition', 'deal', 'summit', 'conference', 'event'];

  // まずmodel-releaseをチェック
  const hasModelKeyword = modelKeywords.some((kw) => text.includes(kw));
  const hasReleaseKeyword = releaseKeywords.some((kw) => text.includes(kw));
  
  if (hasModelKeyword && hasReleaseKeyword) {
    return 'model-release';
  }

  // 次にapi-updateをチェック
  const hasApiKeyword = apiKeywords.some((kw) => text.includes(kw));
  if (hasApiKeyword) {
    return 'api-update';
  }

  // 最後にnewsをチェック
  const hasNewsKeyword = newsKeywords.some((kw) => text.includes(kw));
  if (hasNewsKeyword) {
    return 'news';
  }

  return 'other';
}

// タグ抽出
function extractTags(title: string, content: string): string[] {
  const text = `${title} ${content}`;
  const tags: string[] = [];

  const keywords = [
    'openclaw', 'claude', 'anthropic', 'openai', 'gemini', 'google',
    'meta', 'vercel', 'next.js', 'react', 'api', 'saas', 'agentic',
    'security', 'vulnerability', 'india', 'tata', 'microsoft',
  ];

  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    if (regex.test(text)) {
      const tag = kw.charAt(0).toUpperCase() + kw.slice(1);
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
  });

  return tags;
}

// ソース抽出
function extractSources(content: string): string[] {
  const sources: string[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('**ソース**:') || line.includes('**ソース**')) {
      const sourceText = line.replace(/\*\*ソース\*\*:?\s*/, '').trim();
      if (sourceText) {
        sources.push(sourceText);
      }
    }
  }

  return sources.length > 0 ? sources : ['Unknown'];
}

// AI Newsファイルをパース
function parseNewsFile(filename: string, content: string): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const date = filename.replace('ai-news-', '').replace('.md', '');

  // ### 1. Title の形式で分割
  const lines = content.split('\n');
  let currentArticle: Partial<NewsArticle> = {};
  let inArticle = false;
  let articleContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ### 数字. で始まる行を見つける
    const titleMatch = line.match(/^###\s+\d+\.\s+(.+)$/);
    if (titleMatch) {
      // 前の記事があれば保存
      if (currentArticle.title && articleContent.length > 0) {
        const fullContent = articleContent.join('\n');
        const category = detectCategory(currentArticle.title!, fullContent);
        const tags = extractTags(currentArticle.title!, fullContent);
        const sources = extractSources(fullContent);

        articles.push({
          id: `${date}-${currentArticle.title!.replace(/\s+/g, '-').toLowerCase()}`,
          title: currentArticle.title!,
          content: fullContent.substring(0, 500),
          date,
          category,
          tags,
          sources,
        });
      }

      // 新しい記事を開始
      currentArticle = { title: titleMatch[1].trim() };
      articleContent = [];
      inArticle = true;
      continue;
    }

    // 記事の中身を収集
    if (inArticle) {
      // 次の### 数字. または ## で終了
      if (line.match(/^###\s+\d+\./) || line.match(/^##\s+/)) {
        inArticle = false;
        continue;
      }

      // 空行以外を追加
      if (line.trim() !== '') {
        articleContent.push(line);
      }
    }
  }

  // 最後の記事を保存
  if (currentArticle.title && articleContent.length > 0) {
    const fullContent = articleContent.join('\n');
    const category = detectCategory(currentArticle.title!, fullContent);
    const tags = extractTags(currentArticle.title!, fullContent);
    const sources = extractSources(fullContent);

    articles.push({
      id: `${date}-${currentArticle.title!.replace(/\s+/g, '-').toLowerCase()}`,
      title: currentArticle.title!,
      content: fullContent.substring(0, 500),
      date,
      category,
      tags,
      sources,
    });
  }

  return articles;
}

export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const memoryDir = path.join(process.cwd(), '../memory');
    const files: string[] = await readdir(memoryDir);
    const aiNewsFiles = files
      .filter((f: string) => f.startsWith('ai-news-'))
      .sort()
      .reverse();

    const allArticles: NewsArticle[] = [];

    for (const file of aiNewsFiles) {
      const filePath = path.join(memoryDir, file);
      const content = await readFile(filePath, 'utf-8');
      const articles = parseNewsFile(file, content);
      allArticles.push(...articles);
    }

    return allArticles;
  } catch (error) {
    console.error('Error loading AI news:', error);
    return [];
  }
}

export async function getLatestNews(limit: number = 5): Promise<NewsArticle[]> {
  const allNews = await getAllNews();
  return allNews.slice(0, limit);
}
