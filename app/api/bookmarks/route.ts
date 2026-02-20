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
    const debug = searchParams.get('debug') === 'true';

    console.log(`Fetching bookmarks with tag: "${tag}", limit: ${limit}`);

    let bookmarks;
    let source = 'unknown';
    let errorDetails: any = null;
    
    // 環境変数の詳細チェック
    const nodeEnv = process.env.NODE_ENV;
    const isDev = nodeEnv === 'development';
    
    // 利用可能なNotion関連環境変数をチェック
    const notionEnvVars = Object.keys(process.env).filter(k => k.includes('NOTION'));
    console.log(`Environment check: NODE_ENV=${nodeEnv}, Notion env vars: ${notionEnvVars.join(', ')}`);
    
    if (isDev || notionEnvVars.length === 0) {
      // 開発環境またはNotionキーがない場合はモックデータを使用
      source = `mock (${isDev ? 'development' : 'missing key'})`;
      console.log(`Using mock data: ${source}`);
      bookmarks = await getMockBookmarks();
    } else {
      // 本番環境: Notion APIからデータを取得
      try {
        source = 'notion';
        console.log(`Attempting to fetch from Notion API with env vars: ${notionEnvVars.join(', ')}`);
        
        // タイムアウト設定を追加（Vercelのデフォルト10秒以内に収める）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒タイムアウト
        
        try {
          const result = await getBookmarks(undefined, Math.min(limit, 20)); // 最大20件に制限
          bookmarks = result.bookmarks;
          const debugInfo = result.debugInfo;
          console.log(`Successfully fetched ${bookmarks.length} bookmarks from Notion`);
          console.log(`Debug info: ${JSON.stringify(debugInfo)}`);
          
          // デバッグ情報を保存
          if (debug) {
            errorDetails = {
              ...(errorDetails || {}),
              childPages: debugInfo.totalChildPages,
              firstChildTitle: debugInfo.firstChildTitle,
              parentPageId: debugInfo.parentPageId,
              blocksApiSuccess: debugInfo.blocksApiSuccess
            };
          }
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        source = 'mock (notion error)';
        errorDetails = error;
        console.error('Error fetching from Notion API:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        
        // タイムアウトエラーの場合
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Notion API request timed out after 10 seconds');
          errorDetails = 'Request timeout - Notion API took too long to respond';
        }
        
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
      },
      source,
      environment: process.env.NODE_ENV || 'unknown',
      notionKeyExists: !!process.env.NOTION_TWITTER_KEY
    };

    // デバッグ情報を含める場合
    if (debug) {
      responseData.debug = {
        source,
        environment: process.env.NODE_ENV,
        notionKeyExists: !!process.env.NOTION_TWITTER_KEY,
        notionKeyPrefix: process.env.NOTION_TWITTER_KEY ? 
          process.env.NOTION_TWITTER_KEY.substring(0, 10) + '...' : 'none',
        error: errorDetails ? (typeof errorDetails === 'object' ? JSON.stringify(errorDetails) : String(errorDetails)) : null
      };
      
      // 追加デバッグ情報がある場合は追加
      if (errorDetails && typeof errorDetails === 'object') {
        responseData.debug = {
          ...responseData.debug,
          ...errorDetails
        };
      }
    }

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