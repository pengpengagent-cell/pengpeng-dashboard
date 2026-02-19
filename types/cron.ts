export interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string; // cron expression
  channel: string; // Slack channel ID
  timezone: string; // e.g., 'Asia/Singapore'
}

export interface CronStatus {
  jobId: string;
  lastRun: {
    timestamp: string | null;
    status: 'success' | 'failure' | 'unknown';
    duration?: number; // in seconds
    message?: string;
  };
  nextRun: string | null;
  uptime: number; // percentage (0-100)
}

export const CRON_JOBS: CronJob[] = [
  {
    id: 'morning-report',
    name: 'Morning Report',
    description: '毎朝6:00 SGTに実行される朝のレポート',
    schedule: '0 6 * * *', // 6:00 AM SGT (22:00 UTC)
    channel: 'C0AF0A30DD4', // #morning-report
    timezone: 'Asia/Singapore',
  },
  {
    id: 'learning-session',
    name: 'Learning Session',
    description: '4時間ごとに実行される学習セッション',
    schedule: '0 */4 * * *', // Every 4 hours
    channel: 'C0AF3CBNEJE', // #learning-session
    timezone: 'UTC',
  },
  {
    id: 'ai-news-daily',
    name: 'AI News Daily',
    description: '毎日21:00 SGTに実行されるAIニュース収集',
    schedule: '0 13 * * *', // 13:00 UTC (21:00 SGT)
    channel: 'C0AEZV4RR0V', // #ai-news
    timezone: 'Asia/Singapore',
  },
  {
    id: 'workspace-backup',
    name: 'Workspace Backup',
    description: '毎日23:00 SGTに実行されるワークスペースバックアップ',
    schedule: '0 15 * * *', // 15:00 UTC (23:00 SGT)
    channel: 'C0AF5MM9SUB', // Pengu's DM
    timezone: 'Asia/Singapore',
  },
  {
    id: 'openclaw-monitor',
    name: 'OpenClaw Monitor',
    description: '継続的なOpenClaw監視',
    schedule: '0 13 * * *', // 13:20 UTC (21:20 SGT)
    channel: 'C0AF5MM9SUB', // Pengu's DM
    timezone: 'Asia/Singapore',
  },
];

// Helper function to get cron job by ID
export function getCronJob(id: string): CronJob | undefined {
  return CRON_JOBS.find(job => job.id === id);
}

// Helper function to get all cron jobs
export function getAllCronJobs(): CronJob[] {
  return CRON_JOBS;
}
