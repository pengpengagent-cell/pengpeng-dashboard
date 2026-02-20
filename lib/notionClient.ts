import { Client } from '@notionhq/client';
import { Bookmark, parseNotionPage } from '../types/bookmark';

// Notionクライアントの初期化
// 複数の環境変数名を試す
function getNotionApiKey(): string | undefined {
  const possibleKeys = [
    'NOTION_TWITTER_KEY',
    'NOTION_API_KEY', 
    'NOTION_KEY',
    'NOTION_TOKEN'
  ];
  
  for (const key of possibleKeys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      console.log(`Using Notion API key from environment variable: ${key}`);
      return value;
    }
  }
  
  console.log('No Notion API key found in environment variables');
  console.log('Available environment variables:', Object.keys(process.env).filter(k => k.includes('NOTION')));
  return undefined;
}

const notionApiKey = getNotionApiKey();
const notion = notionApiKey ? new Client({ auth: notionApiKey }) : null;

// ブックマークを取得する関数
export async function getBookmarks(
  parentPageId: string = process.env.NOTION_BOOKMARK_PARENT_ID || '2f50e463b39c80e5acbce06398b56558',
  limit: number = 100
): Promise<{bookmarks: Bookmark[], debugInfo: any}> {
  try {
    console.log(`Fetching bookmarks from parent page: ${parentPageId}`);
    
    if (!notion) {
      throw new Error('Notion client not initialized - check NOTION_TWITTER_KEY environment variable');
    }
    
    // デバッグ: 環境変数が設定されているか確認
    console.log(`Notion client initialized: ${!!notion}`);
    console.log(`Parent page ID: ${parentPageId}`);
    console.log(`Limit: ${limit}`);
    
    // 親ページの子ブロックを取得（最新limit件のみ、ページネーションなし）
    const response = await notion.blocks.children.list({
      block_id: parentPageId,
      page_size: Math.min(100, limit),
    });
    
    // child_pageのみをフィルタリング
    const childPages = response.results.filter(block => block.type === 'child_page');
    const totalChildPages = childPages.length;
    console.log(`Found ${totalChildPages} child pages`);
    
    // 最初のchild_pageのタイトルを取得
    let firstChildTitle = '';
    if (childPages.length > 0) {
      const firstChild = childPages[0];
      firstChildTitle = firstChild.child_page?.title || 'No title';
      console.log(`First child page title: ${firstChildTitle}`);
    }
    
    // 各ページの詳細情報を取得（並列処理）
    const bookmarks: Bookmark[] = [];
    const pagePromises = childPages.slice(0, limit).map(async (page) => {
      try {
        // ページの詳細情報を取得
        const pageDetails = await notion.pages.retrieve({ page_id: page.id });
        
        // ページのプロパティをパース
        const bookmark = parseNotionPage(pageDetails);
        return bookmark;
      } catch (error) {
        console.error(`Error fetching page ${page.id}:`, error);
        return null;
      }
    });
    
    // すべてのページ取得を並列実行
    const results = await Promise.all(pagePromises);
    for (const result of results) {
      if (result) {
        bookmarks.push(result);
      }
    }
    
    return {
      bookmarks,
      debugInfo: {
        totalChildPages,
        firstChildTitle,
        parentPageId,
        blocksApiSuccess: true
      }
    };
  } catch (error) {
    console.error('Error fetching bookmarks from Notion:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    // より詳細なエラー情報を提供
    if (error instanceof Error) {
      if (error.message.includes('API token') || error.message.includes('unauthorized')) {
        console.error('API token error - check NOTION_TWITTER_KEY environment variable');
      } else if (error.message.includes('permission') || error.message.includes('access')) {
        console.error('Permission error - check if the integration has access to the page');
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        console.error('Rate limit exceeded');
      } else if (error.message.includes('not_found')) {
        console.error('Page not found - check parent page ID');
      }
    }
    
    throw error;
  }
}

// タグでフィルタリングする関数
export function filterBookmarksByTag(bookmarks: Bookmark[], tag: string): Bookmark[] {
  if (!tag) return bookmarks;
  return bookmarks.filter(bookmark => 
    bookmark.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

// 統計情報を計算する関数
export function calculateBookmarkStats(bookmarks: Bookmark[]) {
  const stats = {
    total: bookmarks.length,
    byTag: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byDate: {} as Record<string, number>,
  };
  
  bookmarks.forEach(bookmark => {
    // タグ別統計
    bookmark.tags.forEach(tag => {
      stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
    });
    
    // カテゴリー別統計
    const category = bookmark.analysis?.category || 'uncategorized';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    
    // 日付別統計（YYYY-MM-DD形式）
    const date = bookmark.createdAt.split('T')[0];
    stats.byDate[date] = (stats.byDate[date] || 0) + 1;
  });
  
  return stats;
}

// 開発環境用のモックデータを返す関数
export async function getMockBookmarks(): Promise<Bookmark[]> {
  const { mockBookmarks } = await import('../types/bookmark');
  return mockBookmarks;
}