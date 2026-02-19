import { NextRequest, NextResponse } from 'next/server';
import { getBookmarks, filterBookmarksByTag, calculateBookmarkStats, getMockBookmarks } from '../../../lib/notionClient';

// 開発環境か本番環境かを判定
const isDevelopment = process.env.NODE_ENV === 'development';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const includeStats = searchParams.get('stats') === 'true';

    console.log(`Fetching bookmarks with tag: "${tag}", limit: ${limit}`);

    let bookmarks;
    
    if (isDevelopment || !process.env.NOTION_TWITTER_KEY) {
      // 開発環境またはNotionキーがない場合はモックデータを使用
      console.log('Using mock data for bookmarks');
      bookmarks = await getMockBookmarks();
    } else {
      // 本番環境: Notion APIからデータを取得
      try {
        bookmarks = await getBookmarks(undefined, limit);
      } catch (error) {
        console.error('Error fetching from Notion API, falling back to mock data:', error);
        bookmarks = await getMockBookmarks();
      }
    }

    // タグでフィルタリング
    if (tag) {
      bookmarks = filterBookmarksByTag(bookmarks, tag);
    }

    // レスポンスデータの構築
    const responseData: any = {
      bookmarks,
      count: bookmarks.length,
      filters: {
        tag,
        limit
      }
    };

    // 統計情報を含める場合
    if (includeStats) {
      responseData.stats = calculateBookmarkStats(bookmarks);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in /api/bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Vercelサーバーレス環境のタイムアウト設定
export const maxDuration = 60;