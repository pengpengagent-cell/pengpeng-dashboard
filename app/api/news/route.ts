import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NewsArticle } from '../../../types/news';

// 開発環境: ファイルシステムからデータ取得
// 本番環境: public/data/news.json からデータ取得
async function getNewsData(): Promise<NewsArticle[]> {
  try {
    // public/data/news.json のパス
    const newsJsonPath = join(process.cwd(), 'public', 'data', 'news.json');
    
    // JSONファイルを読み込む
    const fileContent = readFileSync(newsJsonPath, 'utf-8');
    const articles = JSON.parse(fileContent);
    
    return articles;
  } catch (error) {
    console.error('Error loading news data:', error);
    
    // 開発環境: ファイルシステムから取得（フォールバック）
    if (process.env.NODE_ENV === 'development') {
      try {
        const { getAllNews } = await import('../../../lib/newsData');
        return await getAllNews();
      } catch (devError) {
        console.error('Error loading news in development:', devError);
      }
    }
    
    return [];
  }
}

export async function GET() {
  try {
    const articles = await getNewsData();
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error in /api/news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

// Vercelサーバーレス環境のタイムアウト設定
export const maxDuration = 60;
