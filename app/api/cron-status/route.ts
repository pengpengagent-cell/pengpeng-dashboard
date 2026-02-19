import { NextResponse } from 'next/server';
import { getAllCronJobs, CronJob, CronStatus } from '../../../types/cron';
import { getLatestCronMessage } from '../../../lib/slackClient';

// Calculate next run time from cron expression
export function calculateNextRun(cronExpression: string, timezone: string): string | null {
  try {
    // Simple cron parser implementation for common patterns
    const now = new Date();
    const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');
    
    // Create next run date (simplified implementation)
    const nextRun = new Date(now);
    
    // Handle common patterns
    if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      // Every minute
      nextRun.setMinutes(nextRun.getMinutes() + 1);
    } else if (minute === '0' && hour === '*/4' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      // Every 4 hours
      nextRun.setHours(nextRun.getHours() + 4);
      nextRun.setMinutes(0);
    } else if (minute === '0' && hour === '6' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      // Daily at 6:00
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(6);
      nextRun.setMinutes(0);
    } else if (minute === '0' && hour === '13' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      // Daily at 13:00 (21:00 SGT)
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(13);
      nextRun.setMinutes(0);
    } else if (minute === '0' && hour === '15' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      // Daily at 15:00 (23:00 SGT)
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(15);
      nextRun.setMinutes(0);
    } else {
      // Default: next day at same time
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun.toISOString();
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
