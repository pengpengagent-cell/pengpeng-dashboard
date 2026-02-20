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
      console.error('Notion client not initialized - check NOTION_TWITTER_KEY environment variable');
      console.error('Available NOTION env vars:', Object.keys(process.env).filter(k => k.includes('NOTION')));
      throw new Error('Notion client not initialized - check NOTION_TWITTER_KEY environment variable');
    }
    
    // デバッグ: 環境変数が設定されているか確認
    console.log(`Notion client initialized: ${!!notion}`);
    console.log(`Parent page ID: ${parentPageId}`);
    console.log(`Limit: ${limit}`);
    
    // すべてのchild_pageを取得（ページネーション対応）
    let allChildPages: any[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;
    let totalFetched = 0;
    
    while (hasMore && totalFetched < 500) { // 安全のため最大500件
      const response = await notion.blocks.children.list({
        block_id: parentPageId,
        page_size: 100,
        start_cursor: cursor,
      });
      
      // child_pageのみをフィルタリング
      const childPages = response.results.filter(block => {
        const blockType = (block as any).type;
        return blockType === 'child_page';
      });
      
      allChildPages.push(...childPages);
      totalFetched += response.results.length;
      
      hasMore = response.has_more;
      cursor = response.next_cursor || undefined;
      
      console.log(`Fetched ${childPages.length} child pages (total: ${allChildPages.length}), has_more: ${hasMore}`);
    }
    
    const totalChildPages = allChildPages.length;
    console.log(`Found ${totalChildPages} child pages in total`);
    
    // created_timeで降順ソート（新しい順）
    allChildPages.sort((a, b) => {
      const timeA = new Date(a.created_time || 0).getTime();
      const timeB = new Date(b.created_time || 0).getTime();
      return timeB - timeA; // 降順
    });
    
    // limit件に制限
    const limitedChildPages = allChildPages.slice(0, limit);
    
    // 最初のchild_pageのタイトルを取得
    let firstChildTitle = '';
    if (limitedChildPages.length > 0) {
      const firstChild = limitedChildPages[0] as any;
      firstChildTitle = firstChild.child_page?.title || 'No title';
      console.log(`First child page title: ${firstChildTitle}, created: ${firstChild.created_time}`);
    }
    
    // 各ページの詳細情報を取得（並列処理）
    const bookmarks: Bookmark[] = [];
    const pagePromises = limitedChildPages.map(async (page) => {
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
    
    // created_timeで降順ソート（新しい順）
    bookmarks.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // 降順
    });
    
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
    
    // 詳細なエラー情報を構造化
    const errorInfo: any = {
      timestamp: new Date().toISOString(),
      parentPageId,
    };
    
    if (error instanceof Error) {
      errorInfo.name = error.name;
      errorInfo.message = error.message;
      errorInfo.stack = error.stack?.split('\n').slice(0, 3).join('\n');
      
      // エラータイプに基づく分類
      if (error.message.includes('API token') || error.message.includes('unauthorized')) {
        errorInfo.type = 'AUTH_ERROR';
        errorInfo.suggestion = 'Check NOTION_TWITTER_KEY environment variable';
      } else if (error.message.includes('permission') || error.message.includes('access')) {
        errorInfo.type = 'PERMISSION_ERROR';
        errorInfo.suggestion = 'Check if the integration has access to the page';
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorInfo.type = 'RATE_LIMIT_ERROR';
        errorInfo.suggestion = 'Rate limit exceeded, wait before retrying';
      } else if (error.message.includes('not_found')) {
        errorInfo.type = 'NOT_FOUND_ERROR';
        errorInfo.suggestion = 'Check parent page ID';
      } else if (error.message.includes('timeout') || error.name === 'AbortError') {
        errorInfo.type = 'TIMEOUT_ERROR';
        errorInfo.suggestion = 'Notion API request timed out';
      } else {
        errorInfo.type = 'UNKNOWN_ERROR';
      }
    } else {
      errorInfo.type = 'NON_ERROR_OBJECT';
      errorInfo.rawError = String(error);
    }
    
    console.error('Structured error info:', JSON.stringify(errorInfo, null, 2));
    
    // エラーを再スロー（呼び出し元で処理）
    throw new Error(`Notion API error: ${errorInfo.type} - ${errorInfo.message || 'Unknown error'}`);
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