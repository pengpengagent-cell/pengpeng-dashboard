import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NOTION_TWITTER_KEY: process.env.NOTION_TWITTER_KEY ? '***' + process.env.NOTION_TWITTER_KEY.slice(-4) : 'not set',
    NOTION_API_KEY: process.env.NOTION_API_KEY ? '***' + process.env.NOTION_API_KEY.slice(-4) : 'not set',
    NOTION_KEY: process.env.NOTION_KEY ? '***' + process.env.NOTION_KEY.slice(-4) : 'not set',
    NOTION_TOKEN: process.env.NOTION_TOKEN ? '***' + process.env.NOTION_TOKEN.slice(-4) : 'not set',
    NOTION_BOOKMARK_PARENT_ID: process.env.NOTION_BOOKMARK_PARENT_ID || 'not set',
  };

  const allEnvKeys = Object.keys(process.env).filter(k => k.includes('NOTION'));
  
  return NextResponse.json({
    environment: envVars,
    allNotionKeys: allEnvKeys,
    timestamp: new Date().toISOString(),
  });
}