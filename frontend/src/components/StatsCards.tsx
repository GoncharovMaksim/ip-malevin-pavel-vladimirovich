import { Layers, TrendingUp, Users } from 'lucide-react';

interface StatsCardsProps {
  totalLogs: number;
  uniquePerformers: number;
  totalVolume: number;
  isLoading: boolean;
}

export function StatsCards({
  totalLogs,
  uniquePerformers,
  totalVolume,
  isLoading,
}: StatsCardsProps) {
  const val = (v: number) => (isLoading ? '...' : v);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs md:text-sm text-slate-400 font-medium">Всего записей</span>
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {val(totalLogs)}
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs md:text-sm text-slate-400 font-medium">Активных исполнителей</span>
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {val(uniquePerformers)}
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs md:text-sm text-slate-400 font-medium">Общий объем работ</span>
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {isLoading ? '...' : totalVolume.toLocaleString()}
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
