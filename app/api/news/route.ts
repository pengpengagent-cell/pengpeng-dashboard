import { NextResponse } from 'next/server';
import { getAllNews } from '../../../lib/newsData';

export async function GET() {
  try {
    const articles = await getAllNews();
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error in /api/news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
