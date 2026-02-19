import { NextResponse } from 'next/server';
import { parseExpression } from 'cron-parser';
import { getAllCronJobs, CronJob, CronStatus } from '../../../types/cron';
import { getLatestCronMessage } from '../../../lib/slackClient';

// Calculate next run time from cron expression
export function calculateNextRun(cronExpression: string, timezone: string): string | null {
  try {
    const options = {
      currentDate: new Date(),
      tz: timezone,
    };
    
    const interval = parseExpression(cronExpression, options);
    const nextDate = interval.next();
    
    return nextDate.toISOString();
  } catch (error) {
    console.error('Error calculating next run:', error);
    return null;
  }
}

// Calculate uptime percentage (mock implementation)
function calculateUptime(jobId: string): number {
  // Mock uptime calculation
  const uptimeMap: Record<string, number> = {
    'morning-report': 98.5,
    'learning-session': 99.2,
    'ai-news-daily': 97.8,
    'workspace-backup': 99.9,
    'openclaw-monitor': 99.5,
  };
  
  return uptimeMap[jobId] || 95.0;
}

// Get status for a single cron job
async function getCronJobStatus(job: CronJob): Promise<CronStatus> {
  const latestMessage = await getLatestCronMessage(job);
  
  let lastRunStatus: CronStatus['lastRun'] = {
    timestamp: null,
    status: 'unknown',
  };
  
  if (latestMessage) {
    // Convert Slack timestamp to ISO string
    const timestamp = latestMessage.timestamp 
      ? new Date(parseFloat(latestMessage.timestamp) * 1000).toISOString()
      : null;
    
    lastRunStatus = {
      timestamp,
      status: latestMessage.status,
      message: latestMessage.message,
    };
  }
  
  const nextRun = calculateNextRun(job.schedule, job.timezone);
  const uptime = calculateUptime(job.id);
  
  return {
    jobId: job.id,
    lastRun: lastRunStatus,
    nextRun,
    uptime,
  };
}

// Main API handler
export async function GET() {
  try {
    const jobs = getAllCronJobs();
    
    // Get status for all jobs in parallel
    const statusPromises = jobs.map(job => getCronJobStatus(job));
    const statuses = await Promise.all(statusPromises);
    
    // Add job details to each status
    const result = statuses.map(status => {
      const job = jobs.find(j => j.id === status.jobId);
      return {
        ...status,
        job: job ? {
          id: job.id,
          name: job.name,
          description: job.description,
          schedule: job.schedule,
          channel: job.channel,
          timezone: job.timezone,
        } : null,
      };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/cron-status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cron status' },
      { status: 500 }
    );
  }
}

// Vercel serverless environment timeout setting
export const maxDuration = 60;
