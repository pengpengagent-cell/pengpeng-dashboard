'use client';

import { useState, useEffect } from 'react';
import CronJobCard from '../../components/CronJobCard';

interface CronJobStatus {
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
}

export default function CronStatusPage() {
  const [statuses, setStatuses] = useState<CronJobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCronStatus() {
      try {
        setLoading(true);
        const response = await fetch('/api/cron-status');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch cron status: ${response.status}`);
        }
        
        const data = await response.json();
        setStatuses(data);
      } catch (err) {
        console.error('Error fetching cron status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchCronStatus();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchCronStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cron-status');
      const data = await response.json();
      setStatuses(data);
    } catch (err) {
      console.error('Error refreshing cron status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall stats
  const totalJobs = statuses.length;
  const successfulJobs = statuses.filter(s => s.lastRun.status === 'success').length;
  const averageUptime = statuses.length > 0 
    ? statuses.reduce((sum, s) => sum + s.uptime, 0) / statuses.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🕒 PengPeng Cron Status Dashboard
              </h1>
              <p className="text-slate-300 text-lg">
                Monitor PengPeng&apos;s automated cron jobs
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={refreshStatus}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
              
              <a
                href="/"
                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-all"
              >
                ← Back to News
              </a>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-slate-300 text-sm font-medium mb-2">Total Jobs</h3>
            <p className="text-3xl font-bold text-white">{totalJobs}</p>
            <p className="text-slate-400 text-sm mt-2">Automated cron jobs</p>
          </div>
          
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-slate-300 text-sm font-medium mb-2">Successful Runs</h3>
            <p className="text-3xl font-bold text-green-400">
              {successfulJobs}/{totalJobs}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {totalJobs > 0 ? `${((successfulJobs / totalJobs) * 100).toFixed(1)}% success rate` : 'No data'}
            </p>
          </div>
          
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-slate-300 text-sm font-medium mb-2">Average Uptime</h3>
            <p className="text-3xl font-bold text-blue-400">
              {averageUptime.toFixed(1)}%
            </p>
            <p className="text-slate-400 text-sm mt-2">Overall reliability</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-400 hover:text-red-300 text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Cron Jobs Grid */}
        {loading ? (
          <div className="bg-slate-800/50 rounded-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            <p className="text-slate-300 mt-4">Loading cron job status...</p>
          </div>
        ) : statuses.length === 0 ? (
          <div className="bg-slate-800/50 rounded-lg p-8 text-center">
            <p className="text-slate-300 text-xl">No cron jobs found.</p>
            <p className="text-slate-400 mt-4">Check if the API is running correctly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statuses.map((status) => (
              <CronJobCard key={status.jobId} status={status} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>Powered by PengPeng • AI Agent running on OpenClaw</p>
          <p className="mt-2">
            Data updates every 5 minutes • Last updated:{' '}
            {new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })}
          </p>
          <div className="mt-4 text-xs text-slate-500">
            <p>
              Note: This dashboard uses mock data when SLACK_BOT_TOKEN is not configured.
              Contact Owner to set up Slack API integration for real-time monitoring.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
