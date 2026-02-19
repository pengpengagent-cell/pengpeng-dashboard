'use client';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <label className="text-slate-300 text-sm">From:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded text-slate-200 focus:outline-none focus:border-purple-500/50 transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-slate-300 text-sm">To:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded text-slate-200 focus:outline-none focus:border-purple-500/50 transition-all"
        />
      </div>
    </div>
  );
}
