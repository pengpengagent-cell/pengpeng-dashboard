import { NewsArticle, NewsCategory } from '../types/news';

// カテゴリー自動判定ロジック
export function detectCategory(
  title: string,
  content: string
): NewsCategory {
  const text = `${title} ${content}`.toLowerCase();

  // model-release: 特定のモデル名 + release/launchキーワード
  const modelKeywords = ['claude', 'gpt', 'gemini'];
  const releaseKeywords = ['release', 'launch', 'launched', 'released'];

  const hasModelKeyword = modelKeywords.some((kw) => text.includes(kw));
  const hasReleaseKeyword = releaseKeywords.some((kw) => text.includes(kw));

  if (hasModelKeyword && hasReleaseKeyword) {
    return 'model-release';
  }

  // api-update: API関連キーワード
  const apiKeywords = ['api', 'update', 'deprecate', 'endpoint', 'version'];
  if (apiKeywords.some((kw) => text.includes(kw))) {
    return 'api-update';
  }

  // news: アナウンス・提携・買収キーワード
  const newsKeywords = ['announce', 'partnership', 'acquisition', 'deal'];
  if (newsKeywords.some((kw) => text.includes(kw))) {
    return 'news';
  }

  return 'other';
}

// タグ抽出（主要な技術キーワード）
export function extractTags(title: string, content: string): string[] {
  const text = `${title} ${content}`;
  const tags: string[] = [];

  // 主要な技術・企業名キーワード
  const keywords = [
    'openclaw',
    'claude',
    'anthropic',
    'openai',
    'gemini',
    'google',
    'meta',
    'vercel',
    'next.js',
    'react',
    'api',
    'saas',
    'agentic',
    'security',
    'vulnerability',
    'india',
    'tata',
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

// ソース抽出（**ソース:** 以降のテキスト）
export function extractSources(content: string): string[] {
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

// AI NewsファイルをパースしてNewsArticle配列に変換
export function parseNewsFile(
  filename: string,
  content: string
): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const date = filename.replace('ai-news-', '').replace('.md', '');

  // セクションごとに分割
  const sections = content.split(/^##\s+/m);

  for (const section of sections) {
    // メインヘッダー以外のセクションを処理
    if (!section.startsWith('📰') && !section.startsWith('🔧') && !section.startsWith('🤖') && !section.startsWith('💥') && !section.startsWith('🔍')) {
      continue;
    }

    // セクション内のニュース項目を分割（### 数字.）
    const items = section.split(/^###\s+\d+\.\s*/m);

    for (const item of items) {
      if (!item.trim()) continue;

      // タイトル抽出（**で囲まれた最初の行）
      const titleMatch = item.match(/^\*\*(.+?)\*\*/);
      let title = titleMatch
        ? titleMatch[1].replace(/\*\*/g, '').trim()
        : 'Untitled';

      // タイトルがUntitledの場合は最初の行をタイトルとして使用
      if (title === 'Untitled') {
        const firstLine = item.split('\n')[0].trim();
        if (firstLine && firstLine.length > 0) {
          title = firstLine.replace(/^#+\s*/, '').trim();
        }
      }

      // コンテンツ抽出（タイトル以降）
      let contentText = item.replace(/^\*\*.+?\*\*/, '').trim();

      // 箇条書きやサブセクションを含める
      const cleanContent = contentText
        .split('\n')
        .filter((line) => line.trim())
        .join('\n');

      if (title === 'Untitled' && cleanContent.length < 20) {
        continue;
      }

      const category = detectCategory(title, cleanContent);
      const tags = extractTags(title, cleanContent);
      const sources = extractSources(item);

      articles.push({
        id: `${date}-${title.replace(/\s+/g, '-').toLowerCase()}`,
        title,
        content: cleanContent.substring(0, 500),
        date,
        category,
        tags,
        sources,
      });
    }
  }

  return articles;
}
