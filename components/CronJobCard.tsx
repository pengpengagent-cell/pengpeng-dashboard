'use client';

interface CronJobCardProps {
  status: {
    jobId: string;
    lastRun: {
      timestamp: string | null;
      status: 'success' | 'failure' | 'unknown';
      message?: string;
    };
    nextRun: string | null;
    uptime: number;
    job: {
      id: string;
      name: string;
      description: string;
      schedule: string;
      channel: string;
      timezone: string;
    } | null;
  };
}

export default function CronJobCard({ status }: CronJobCardProps) {
  const { job, lastRun, nextRun, uptime } = status;
  
  if (!job) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <p className="text-slate-300">Job information not available</p>
      </div>
    );
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  // Format next run time
  const formatNextRun = (nextRun: string | null) => {
    if (!nextRun) return 'Unknown';
    
    const date = new Date(nextRun);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: job.timezone,
      });
    }
  };

  // Get status color and icon
  const getStatusConfig = (status: 'success' | 'failure' | 'unknown') => {
    switch (status) {
      case 'success':
        return {
          icon: '✅',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          label: 'Success',
        };
      case 'failure':
        return {
          icon: '❌',
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          label: 'Failed',
        };
      default:
        return {
          icon: '❓',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          label: 'Unknown',
        };
    }
  };

  const statusConfig = getStatusConfig(lastRun.status);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">{job.name}</h3>
          <p className="text-slate-300 text-sm">{job.description}</p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
          {statusConfig.icon} {statusConfig.label}
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-4">
        {/* Last Run */}
        <div>
          <h4 className="text-slate-400 text-sm font-medium mb-1">Last Run</h4>
          <div className="flex items-center gap-2">
            <span className={`text-lg ${statusConfig.color}`}>
              {statusConfig.icon}
            </span>
            <div>
              <p className="text-white">
                {lastRun.timestamp ? formatTimestamp(lastRun.timestamp) : 'Never'}
              </p>
              {lastRun.message && (
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                  {lastRun.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Run */}
        <div>
          <h4 className="text-slate-400 text-sm font-medium mb-1">Next Run</h4>
          <div className="flex items-center gap-2">
            <span className="text-lg text-blue-400">⏰</span>
            <p className="text-white">{formatNextRun(nextRun)}</p>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Schedule: <code className="bg-slate-700/50 px-1 py-0.5 rounded">{job.schedule}</code>
          </p>
        </div>

        {/* Uptime */}
        <div>
          <h4 className="text-slate-400 text-sm font-medium mb-1">Uptime</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${uptime}%` }}
              />
            </div>
            <span className="text-white font-medium">{uptime.toFixed(1)}%</span>
          </div>
        </div>

        {/* Channel Link */}
        <div className="pt-4 border-t border-slate-700/50">
          <a
            href={`https://app.slack.com/client/T0AF5MM9S/${job.channel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 15a2 2 0 1 1-2-2c0-1.11.89-2 2-2 1.11 0 2 .89 2 2 0 1.11-.89 2-2 2m0-6a2 2 0 1 1-2-2c0-1.11.89-2 2-2 1.11 0 2 .89 2 2 0 1.11-.89 2-2 2m6 6a2 2 0 1 1-2-2c0-1.11.89-2 2-2 1.11 0 2 .89 2 2 0 1.11-.89 2-2 2m6-6a2 2 0 1 1-2-2c0-1.11.89-2 2-2 1.11 0 2 .89 2 2 0 1.11-.89 2-2 2m-6-6a2 2 0 1 1-2-2c0-1.11.89-2 2-2 1.11 0 2 .89 2 2 0 1.11-.89 2-2 2m6 0a2 2 0 1 1-2-2c0-1.11.89-2 2-2 1.11 0 2 .89 2 2 0 1.11-.89 2-2 2" />
            </svg>
            View in Slack
          </a>
        </div>
      </div>
    </div>
  );
}
