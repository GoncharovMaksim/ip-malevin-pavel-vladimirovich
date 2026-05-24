import { Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { SortField } from '../types';

interface FilterBarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearFilters: () => void;
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
  onSortByChange: (field: SortField) => void;
  onSortOrderToggle: () => void;
}

function openDatePicker(e: React.MouseEvent<HTMLInputElement>) {
  const input = e.target as HTMLInputElement;
  if ('showPicker' in input) {
    try {
      input.showPicker();
    } catch {
      // API not supported in this browser
    }
  }
}

export function FilterBar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderToggle,
}: FilterBarProps) {
  return (
    <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 shrink-0">
          <Calendar className="w-4 h-4" />
          <span>Фильтр по дате:</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            onClick={openDatePicker}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs md:text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all w-full sm:w-auto cursor-pointer"
          />
          <span className="text-slate-600">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            onClick={openDatePicker}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs md:text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all w-full sm:w-auto cursor-pointer"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={onClearFilters}
            className="text-[10px] md:text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-850 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors w-full sm:w-auto mt-1 sm:mt-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Сбросить</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <span className="text-xs md:text-sm text-slate-400">Сортировать по:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortField)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 pr-8 py-1.5 text-xs md:text-sm text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
        >
          <option value="date">Дате выполнения</option>
          <option value="workType">Виду работы</option>
          <option value="volume">Объёму</option>
          <option value="performer">Исполнителю</option>
        </select>
        <button
          onClick={onSortOrderToggle}
          className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl hover:text-white hover:border-slate-700 transition-all shrink-0"
        >
          {sortOrder === 'asc' ? (
            <ChevronUp className="w-4 h-4 text-indigo-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-indigo-400" />
          )}
        </button>
      </div>
    </div>
  );
}
