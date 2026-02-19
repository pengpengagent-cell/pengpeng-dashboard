import { calculateNextRun } from '../app/api/cron-status/route';
import { parseSlackMessage } from '../lib/slackClient';

describe('Cron Status Utilities', () => {
  describe('calculateNextRun', () => {
    it('calculates next run time for valid cron expression', () => {
      const nextRun = calculateNextRun('0 6 * * *', 'Asia/Singapore');
      expect(nextRun).toBeTruthy();
      expect(new Date(nextRun!)).toBeInstanceOf(Date);
      expect(new Date(nextRun!).getTime()).toBeGreaterThan(Date.now());
    });

    it('returns null for invalid cron expression', () => {
      const nextRun = calculateNextRun('invalid', 'Asia/Singapore');
      expect(nextRun).toBeNull();
    });

    it('handles different timezones', () => {
      const sgNextRun = calculateNextRun('0 6 * * *', 'Asia/Singapore');
      const utcNextRun = calculateNextRun('0 6 * * *', 'UTC');
      
      expect(sgNextRun).toBeTruthy();
      expect(utcNextRun).toBeTruthy();
      expect(sgNextRun).not.toBe(utcNextRun);
    });
  });

  describe('parseSlackMessage', () => {
    it('parses success messages', () => {
      expect(parseSlackMessage('✅ Morning Report')).toBe('success');
      expect(parseSlackMessage('✓ Completed')).toBe('success');
      expect(parseSlackMessage('Success: Job completed')).toBe('success');
      expect(parseSlackMessage('完了しました')).toBe('success');
      expect(parseSlackMessage('正常終了')).toBe('success');
    });

    it('parses failure messages', () => {
      expect(parseSlackMessage('❌ Failed to run')).toBe('failure');
      expect(parseSlackMessage('✗ Error occurred')).toBe('failure');
      expect(parseSlackMessage('Failed: Something went wrong')).toBe('failure');
      expect(parseSlackMessage('エラー発生')).toBe('failure');
      expect(parseSlackMessage('失敗しました')).toBe('failure');
    });

    it('returns unknown for ambiguous messages', () => {
      expect(parseSlackMessage('')).toBe('unknown');
      expect(parseSlackMessage('Job ran')).toBe('unknown');
      expect(parseSlackMessage('Some message')).toBe('unknown');
    });

    it('is case-insensitive', () => {
      expect(parseSlackMessage('SUCCESS')).toBe('success');
      expect(parseSlackMessage('error')).toBe('failure');
    });
  });
});
