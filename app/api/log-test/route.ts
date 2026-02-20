import { NextResponse } from 'next/server';
import { getBookmarks } from '../../../lib/notionClient';

export async function GET() {
  console.log('=== LOG TEST START ===');
  
  try {
    const result = await getBookmarks(undefined, 1);
    console.log('Success:', result.bookmarks.length, 'bookmarks');
    
    return NextResponse.json({
      success: true,
      count: result.bookmarks.length,
      firstBookmark: result.bookmarks[0] || null,
      debugInfo: result.debugInfo
    });
  } catch (error) {
    console.error('Error in log-test:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}