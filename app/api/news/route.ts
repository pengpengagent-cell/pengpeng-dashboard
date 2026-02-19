import { NextResponse } from 'next/server';
import { NewsArticle } from '../../../types/news';

// 開発環境: ファイルシステムからデータ取得
// 本番環境: 環境変数からデータ取得
async function getNewsData(): Promise<NewsArticle[]> {
  // 本番環境（Vercel）では環境変数からデータを取得
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    const aiNewsData = process.env.AI_NEWS_DATA;
    if (aiNewsData) {
      try {
        return JSON.parse(aiNewsData);
      } catch (error) {
        console.error('Error parsing AI_NEWS_DATA:', error);
        return [];
      }
    }
    return [];
  }
  
  // 開発環境: ファイルシステムから取得
  try {
    const { getAllNews } = await import('../../../lib/newsData');
    return await getAllNews();
  } catch (error) {
    console.error('Error loading news in development:', error);
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
