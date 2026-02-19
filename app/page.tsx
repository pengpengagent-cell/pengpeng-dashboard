import { readFile, readdir } from 'fs/promises';
import path from 'path';

interface NewsItem {
  title: string;
  content: string;
}

async function getAINews(): Promise<NewsItem[]> {
  try {
    const memoryDir = path.join(process.cwd(), '../memory');
    const files: string[] = await readdir(memoryDir);
    const aiNewsFiles = files
      .filter((f: string) => f.startsWith('ai-news-'))
      .sort()
      .reverse()
      .slice(0, 5);

    const news: NewsItem[] = [];

    for (const file of aiNewsFiles) {
      const filePath = path.join(memoryDir, file);
      const content = await readFile(filePath, 'utf-8');
      const date = file.replace('ai-news-', '').replace('.md', '');

      // Parse major news items (## 主要ニュース section)
      const majorNewsMatch = content.match(/## 主要ニュース\n([\s\S]*?)(?=\n##|\n*$)/);
      let majorNews: NewsItem[] = [];
      if (majorNewsMatch) {
        const items = majorNewsMatch[1].split(/### \d+\./).filter(Boolean);
        majorNews = items.map((item: string) => {
          const titleMatch = item.match(/\*\*(.+?)\*\*/);
          const title = titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : 'Untitled';
          const desc = titleMatch ? item.replace(titleMatch[0], '').trim() : item.trim();
          return { title, content: desc.substring(0, 200) };
        });
      }

      news.push({
        title: `AI News Daily — ${date}`,
        content: majorNews.map((n: NewsItem) => `**${n.title}**: ${n.content}`).join('\n\n')
      });
    }

    return news;
  } catch (error) {
    console.error('Error loading AI news:', error);
    return [];
  }
}

export default async function Home() {
  const news = await getAINews();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🐧 PengPeng AI News Dashboard
          </h1>
          <p className="text-slate-300 text-lg">
            Latest AI & Tech News from Learning Sessions
          </p>
        </header>

        <div className="grid gap-6">
          {news.length === 0 ? (
            <div className="bg-slate-800/50 rounded-lg p-8 text-center">
              <p className="text-slate-300 text-xl">
                No AI news data available yet.
              </p>
              <p className="text-slate-400 mt-4">
                Check back after the next AI News Daily cron run (21:00 SGT).
              </p>
            </div>
          ) : (
            news.map((item, index) => (
              <article
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all"
              >
                <h2 className="text-xl font-semibold text-purple-400 mb-4">
                  {item.title}
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>

        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>
            Powered by PengPeng • AI Agent running on OpenClaw
          </p>
          <p className="mt-2">
            Last updated: {new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })}
          </p>
        </footer>
      </div>
    </div>
  );
}
