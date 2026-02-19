import { getAllNews } from '../lib/newsData';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

async function generateNewsJson() {
  try {
    console.log('Generating news.json...');
    
    // ニュースデータを取得
    const articles = await getAllNews();
    console.log(`Found ${articles.length} articles`);
    
    // public/data ディレクトリを作成
    const dataDir = join(process.cwd(), 'public', 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
      console.log(`Created directory: ${dataDir}`);
    }
    
    // JSONファイルに書き出し
    const outputPath = join(dataDir, 'news.json');
    const jsonData = JSON.stringify(articles, null, 2);
    writeFileSync(outputPath, jsonData, 'utf-8');
    
    console.log(`Successfully wrote ${articles.length} articles to ${outputPath}`);
    console.log(`File size: ${jsonData.length} bytes`);
    
    // 最初の記事を表示
    if (articles.length > 0) {
      console.log('\nFirst article:');
      console.log(`  Title: ${articles[0].title}`);
      console.log(`  Date: ${articles[0].date}`);
      console.log(`  Category: ${articles[0].category}`);
    }
    
  } catch (error) {
    console.error('Error generating news.json:', error);
    process.exit(1);
  }
}

// スクリプト実行
generateNewsJson();