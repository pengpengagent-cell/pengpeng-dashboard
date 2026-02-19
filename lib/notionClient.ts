import { Client } from '@notionhq/client';
import { Bookmark, parseNotionPage } from '../types/bookmark';

// Notionクライアントの初期化
const notion = new Client({
  auth: process.env.NOTION_TWITTER_KEY,
});

// ブックマークを取得する関数
export async function getBookmarks(
  parentPageId: string = process.env.NOTION_BOOKMARK_PARENT_ID || '2f50e463b39c80e5acbce06398b56558',
  limit: number = 100
): Promise<Bookmark[]> {
  try {
    console.log(`Fetching bookmarks from parent page: ${parentPageId}`);
    
    // 親ページの子ブロックを取得（ページネーション対応）
    let allPages: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;
    
    while (hasMore && allPages.length < limit) {
      const response = await notion.blocks.children.list({
        block_id: parentPageId,
        start_cursor: startCursor,
        page_size: Math.min(100, limit - allPages.length),
      });
      
      allPages = [...allPages, ...response.results];
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
      
      // Notion APIのrate limit対策（1秒待機）
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // child_pageのみをフィルタリング
    const childPages = allPages.filter(block => block.type === 'child_page');
    console.log(`Found ${childPages.length} child pages`);
    
    // 各ページの詳細情報を取得
    const bookmarks: Bookmark[] = [];
    
    for (const page of childPages.slice(0, limit)) {
      try {
        // ページの詳細情報を取得
        const pageDetails = await notion.pages.retrieve({ page_id: page.id });
        
        // ページのプロパティをパース
        const bookmark = parseNotionPage(pageDetails);
        bookmarks.push(bookmark);
        
        // Notion APIのrate limit対策（1秒待機）
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error fetching page ${page.id}:`, error);
        // エラーがあっても続行
      }
    }
    
    return bookmarks;
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