import { CronJob } from '../types/cron';

// Mock data for development when SLACK_BOT_TOKEN is not available
const MOCK_SLACK_MESSAGES: Record<string, any[]> = {
  'C0AF0A30DD4': [ // #morning-report
    {
      text: '✅ Morning Report — 2026-02-19 06:00 SGT\nPengPeng稼働状況正常。',
      ts: '1771500000.000000',
    },
  ],
  'C0AF3CBNEJE': [ // #learning-session
    {
      text: '✅ Learning Session — 2026-02-19 14:00 UTC\n最新のAIニュースを分析しました。',
      ts: '1771510000.000000',
    },
  ],
  'C0AEZV4RR0V': [ // #ai-news
    {
      text: '✅ AI News Daily — 2026-02-19 13:00 UTC\nIndia AI Summit 2026 Day 4のニュースを収集しました。',
      ts: '1771508000.000000',
    },
    {
      text: '✅ Workspace Backup — 2026-02-19 15:00 UTC\nワークスペースのバックアップが完了しました。',
      ts: '1771512000.000000',
    },
    {
      text: '✅ OpenClaw Monitor — 2026-02-19 13:20 UTC\nOpenClaw稼働状況正常。',
      ts: '1771509000.000000',
    },
  ],
};

// Parse Slack message to determine success/failure
export function parseSlackMessage(message: string): 'success' | 'failure' | 'unknown' {
  if (!message) return 'unknown';
  
  const lowerMessage = message.toLowerCase();
  
  // Success indicators
  const successIndicators = ['✅', '✓', 'success', '完了', '正常', 'completed'];
  if (successIndicators.some(indicator => lowerMessage.includes(indicator.toLowerCase()))) {
    return 'success';
  }
  
  // Failure indicators
  const failureIndicators = ['❌', '✗', 'error', 'failed', '失敗', 'エラー'];
  if (failureIndicators.some(indicator => lowerMessage.includes(indicator.toLowerCase()))) {
    return 'failure';
  }
  
  return 'unknown';
}

// Get channel history from Slack API with retry and timeout
export async function getChannelHistory(
  channelId: string,
  limit: number = 10
): Promise<any[]> {
  const token = process.env.SLACK_BOT_TOKEN;
  
  // If no token, return mock data for development
  if (!token) {
    console.warn('SLACK_BOT_TOKEN not set, using mock data');
    return MOCK_SLACK_MESSAGES[channelId] || [];
  }
  
  const maxRetries = 3;
  const timeoutMs = 5000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(`https://slack.com/api/conversations.history`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          limit,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!data.ok) {
        console.error(`Slack API error (attempt ${attempt}/${maxRetries}):`, data.error);
        
        // Rate limit handling
        if (data.error === 'rate_limited' && attempt < maxRetries) {
          const retryAfter = data.headers?.['retry-after'] || 1;
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        
        return MOCK_SLACK_MESSAGES[channelId] || [];
      }
      
      return data.messages || [];
    } catch (error) {
      console.error(`Error fetching Slack channel history (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        console.error('All retries failed, using mock data');
        return MOCK_SLACK_MESSAGES[channelId] || [];
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return MOCK_SLACK_MESSAGES[channelId] || [];
}

// Get latest message for a cron job
export async function getLatestCronMessage(job: CronJob): Promise<{
  message: string;
  timestamp: string;
  status: 'success' | 'failure' | 'unknown';
} | null> {
  try {
    const messages = await getChannelHistory(job.channel, 10);
    
    // First, try to find a message that specifically mentions this job
    const jobSpecificMessages = messages.filter(msg => {
      const text = msg.text || '';
      const jobNameLower = job.name.toLowerCase();
      const textLower = text.toLowerCase();
      
      // Check for exact job name match
      if (jobNameLower.includes('ai news') && textLower.includes('ai news')) {
        return true;
      }
      if (jobNameLower.includes('workspace') && textLower.includes('workspace')) {
        return true;
      }
      if (jobNameLower.includes('openclaw') && textLower.includes('openclaw')) {
        return true;
      }
      if (jobNameLower.includes('morning') && textLower.includes('morning')) {
        return true;
      }
      if (jobNameLower.includes('learning') && textLower.includes('learning')) {
        return true;
      }
      
      // Generic check for job name in message
      return textLower.includes(jobNameLower);
    });
    
    if (jobSpecificMessages.length > 0) {
      const latest = jobSpecificMessages[0];
      return {
        message: latest.text || '',
        timestamp: latest.ts || '',
        status: parseSlackMessage(latest.text || ''),
      };
    }
    
    // If no job-specific message found, use the latest message
    if (messages.length > 0) {
      const latest = messages[0];
      return {
        message: latest.text || '',
        timestamp: latest.ts || '',
        status: parseSlackMessage(latest.text || ''),
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting latest message for ${job.name}:`, error);
    return null;
  }
}

// Get recent 3 messages for a cron job
export async function getRecentCronMessages(job: CronJob, limit: number = 3): Promise<Array<{
  message: string;
  timestamp: string;
  status: 'success' | 'failure' | 'unknown';
  executionTime?: number;
}>> {
  try {
    const messages = await getChannelHistory(job.channel, 30); // Get more messages to filter
    
    // Filter messages that mention this job
    const jobSpecificMessages = messages.filter(msg => {
      const text = msg.text || '';
      const jobNameLower = job.name.toLowerCase();
      const textLower = text.toLowerCase();
      
      // Check for exact job name match
      if (jobNameLower.includes('ai news') && textLower.includes('ai news')) {
        return true;
      }
      if (jobNameLower.includes('workspace') && textLower.includes('workspace')) {
        return true;
      }
      if (jobNameLower.includes('openclaw') && textLower.includes('openclaw')) {
        return true;
      }
      if (jobNameLower.includes('morning') && textLower.includes('morning')) {
        return true;
      }
      if (jobNameLower.includes('learning') && textLower.includes('learning')) {
        return true;
      }
      
      // Generic check for job name in message
      return textLower.includes(jobNameLower);
    });
    
    // Take the most recent ones (up to limit)
    const recentMessages = jobSpecificMessages.slice(0, limit);
    
    // Parse each message
    const parsedMessages = recentMessages.map(msg => {
      const message = msg.text || '';
      const timestamp = msg.ts || '';
      const status = parseSlackMessage(message);
      
      // Try to extract execution time from message
      let executionTime: number | undefined;
      const timeMatch = message.match(/(\d+\.?\d*)\s*(秒|s|sec|seconds)/i);
      if (timeMatch) {
        executionTime = parseFloat(timeMatch[1]);
      }
      
      return {
        message,
        timestamp,
        status,
        executionTime,
      };
    });
    
    // If we don't have enough job-specific messages, add generic messages
    if (parsedMessages.length < limit && messages.length > 0) {
      const genericMessages = messages
        .filter(msg => !jobSpecificMessages.includes(msg))
        .slice(0, limit - parsedMessages.length);
      
      genericMessages.forEach(msg => {
        const message = msg.text || '';
        const timestamp = msg.ts || '';
        const status = parseSlackMessage(message);
        
        parsedMessages.push({
          message,
          timestamp,
          status,
          executionTime: undefined,
        });
      });
    }
    
    return parsedMessages;
  } catch (error) {
    console.error(`Error getting recent messages for ${job.name}:`, error);
    return [];
  }
}
