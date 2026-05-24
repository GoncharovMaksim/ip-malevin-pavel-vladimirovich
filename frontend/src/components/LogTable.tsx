import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, RefreshCw, Trash2, User } from 'lucide-react';
import type { SortField, WorkLog } from '../types';

interface LogTableProps {
  logs: WorkLog[];
  isLoading: boolean;
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  onEdit: (log: WorkLog) => void;
  onDelete: (id: number) => void;
}

interface SortIconProps {
  field: SortField;
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
}

function SortIcon({ field, sortBy, sortOrder }: SortIconProps) {
  if (sortBy !== field) return null;
  return sortOrder === 'asc'
    ? <ChevronUp className="w-4 h-4 text-indigo-400" />
    : <ChevronDown className="w-4 h-4 text-indigo-400" />;
}

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'date', label: 'Дата выполнения' },
  { field: 'workType', label: 'Вид работы' },
  { field: 'volume', label: 'Объём' },
  { field: 'performer', label: 'Исполнитель' },
];

export function LogTable({
  logs,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: LogTableProps) {
  return (
    <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-900/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {COLUMNS.map(({ field, label }) => (
                <th
                  key={field}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-900/50 hover:text-white transition-all select-none"
                  onClick={() => onSort(field)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{label}</span>
                    <SortIcon field={field} sortBy={sortBy} sortOrder={sortOrder} />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/50">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-900 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-900 rounded w-48" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-900 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-900 rounded w-32" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-900 rounded w-12 ml-auto" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                    Записи не найдены. Внесите новую запись о выполненных работах.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-slate-900/10 transition-colors group text-sm text-slate-300"
                  >
                    <td className="px-6 py-4 font-medium text-slate-400">
                      {new Date(log.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {log.workType?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 font-semibold">
                        {log.volume} {log.workType?.unit ?? ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span>{log.performer}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(log)}
                          className="p-1.5 hover:bg-slate-900 hover:text-white rounded-lg text-slate-500 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(log.id)}
                          className="p-1.5 hover:bg-red-950/20 hover:text-red-400 rounded-lg text-slate-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden p-4">
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skel-card-${i}`}
                  className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 animate-pulse flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-900 rounded w-20" />
                    <div className="h-6 bg-slate-900 rounded w-16" />
                  </div>
                  <div className="h-5 bg-slate-900 rounded w-2/3" />
                  <div className="h-4 bg-slate-900 rounded w-1/3" />
                </div>
              ))
            ) : logs.length === 0 ? (
              <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-8 text-center text-slate-500 text-xs">
                Записи не найдены. Внесите новую запись.
              </div>
            ) : (
              logs.map((log) => (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 flex flex-col gap-2 group relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(log.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                        {log.workType?.name ?? '—'}
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold shrink-0">
                        {log.volume} {log.workType?.unit ?? ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{log.performer}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-900/50 pt-2 mt-1.5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(log)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 hover:text-white rounded-lg text-[10px] font-bold text-slate-400 flex items-center gap-1 transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Изм.</span>
                    </button>
                    <button
                      onClick={() => onDelete(log.id)}
                      className="px-3 py-1.5 bg-red-950/10 hover:bg-red-950/20 hover:text-red-400 rounded-lg text-[10px] font-bold text-slate-400 flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Удал.</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
