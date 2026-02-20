export interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  createdAt: string;
  analysis?: {
    summary: string;
    category: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    keyPoints: string[];
  };
  source?: string;
  author?: string;
  tweetId?: string;
}

export interface BookmarkStats {
  total: number;
  byTag: Record<string, number>;
  byCategory: Record<string, number>;
  byDate: Record<string, number>;
}

// Notion APIから取得したページをパースする関数
export function parseNotionPage(page: any): Bookmark {
  const properties = page.properties || {};
  
  // プロパティの抽出（Notionのプロパティ構造に基づく）
  // タイトル: properties.title または properties.Title をチェック
  const title = properties.title?.title?.[0]?.plain_text || 
                properties.Title?.title?.[0]?.plain_text || 
                'No title';
  
  // URL: properties.URL または properties.url をチェック
  const url = properties.URL?.url || properties.url?.url || '';
  
  // タグ: properties.Tags または properties.tags をチェック
  const tags = properties.Tags?.multi_select?.map((tag: any) => tag.name) || 
               properties.tags?.multi_select?.map((tag: any) => tag.name) || 
               [];
  
  const createdAt = page.created_time || new Date().toISOString();
  
  // 分析結果の抽出（Notionのプロパティ構造に基づく）
  const analysisText = properties.Analysis?.rich_text?.[0]?.plain_text || 
                       properties.analysis?.rich_text?.[0]?.plain_text || 
                       '';
  
  const category = properties.Category?.select?.name || 
                   properties.category?.select?.name || 
                   'uncategorized';
  
  // 分析結果のパース（Geminiの出力形式を想定）
  let summary = '';
  let keyPoints: string[] = [];
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  
  if (analysisText) {
    // 簡易パース（実際のデータ構造に合わせて調整が必要）
    const lines = analysisText.split('\n');
    for (const line of lines) {
      if (line.includes('Summary:') || line.includes('要約:')) {
        summary = line.replace(/^(Summary:|要約:)\s*/, '');
      } else if (line.includes('Key Points:') || line.includes('キーポイント:')) {
        const pointsText = line.replace(/^(Key Points:|キーポイント:)\s*/, '');
        keyPoints = pointsText.split(';').map((p: string) => p.trim()).filter((p: string) => p);
      } else if (line.includes('Sentiment:') || line.includes('感情分析:')) {
        const sentimentText = line.replace(/^(Sentiment:|感情分析:)\s*/, '').toLowerCase();
        if (sentimentText.includes('positive') || sentimentText.includes('ポジティブ')) {
          sentiment = 'positive';
        } else if (sentimentText.includes('negative') || sentimentText.includes('ネガティブ')) {
          sentiment = 'negative';
        }
      }
    }
  }
  
  // 著者とツイートIDの抽出
  const author = properties.Author?.rich_text?.[0]?.plain_text || 
                 properties.author?.rich_text?.[0]?.plain_text || 
                 '';
  
  const tweetId = properties.TweetID?.rich_text?.[0]?.plain_text || 
                  properties.tweetId?.rich_text?.[0]?.plain_text || 
                  '';
  
  return {
    id: page.id,
    url,
    title,
    tags,
    createdAt,
    analysis: analysisText ? {
      summary,
      category,
      sentiment,
      keyPoints
    } : undefined,
    source: 'X (Twitter)',
    author,
    tweetId,
  };
}

// モックデータ（開発用）
export const mockBookmarks: Bookmark[] = [
  {
    id: 'mock-1',
    url: 'https://twitter.com/hyperbrowser/status/1234567890',
    title: '@hyperbrowser: AIエージェント向けに最適化されたクラウドブラウザ環境の提供',
    tags: ['AI', 'Browser', 'Cloud'],
    createdAt: '2026-01-27T10:00:00.000Z',
    analysis: {
      summary: 'AIエージェント向けのクラウドブラウザ環境を提供するサービス',
      category: 'Infrastructure',
      sentiment: 'positive',
      keyPoints: ['検知回避（ステルス性）', 'スケーラビリティ', 'クラウド最適化']
    },
    source: 'X (Twitter)',
    author: '@hyperbrowser',
    tweetId: '1234567890'
  },
  {
    id: 'mock-2',
    url: 'https://twitter.com/ryancarson/status/1234567891',
    title: '@ryancarson: 創業者は将来、AIを用いて人間特有の「試行錯誤のループ」を24時間365日、高速に自動実行するように',
    tags: ['AI', 'Entrepreneurship', 'Automation'],
    createdAt: '2026-01-29T11:00:00.000Z',
    analysis: {
      summary: 'AIによる試行錯誤の自動化が創業者の仕事を変える',
      category: 'Business',
      sentiment: 'positive',
      keyPoints: ['24時間365日稼働', '高速試行錯誤', '創業者効率化']
    },
    source: 'X (Twitter)',
    author: '@ryancarson',
    tweetId: '1234567891'
  },
  {
    id: 'mock-3',
    url: 'https://twitter.com/AI_masaou/status/1234567892',
    title: '@AI_masaou: Google WorkspaceをCLIで操作できる「gogcli」の紹介',
    tags: ['Google', 'CLI', 'Automation'],
    createdAt: '2026-01-30T12:00:00.000Z',
    analysis: {
      summary: 'Google Workspaceをコマンドラインから操作するツール',
      category: 'Tools',
      sentiment: 'positive',
      keyPoints: ['JSON出力対応', 'セキュリティ考慮', '自動化可能']
    },
    source: 'X (Twitter)',
    author: '@AI_masaou',
    tweetId: '1234567892'
  }
];