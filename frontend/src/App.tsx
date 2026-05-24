import React, { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  HardHat,
  Layers,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  createWorkLog,
  deleteWorkLog,
  fetchWorkLogs,
  fetchWorkTypes,
  updateWorkLog,
} from './api';
import type { WorkLog } from './types';

const queryClient = new QueryClient();

function ConstructionDashboard() {
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);

  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    volume: '',
    performer: '',
    workTypeId: '',
  });

  const { data: workTypes = [] } = useQuery({
    queryKey: ['workTypes'],
    queryFn: fetchWorkTypes,
  });

  const { data: workLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['workLogs', startDate, endDate, sortOrder],
    queryFn: () => fetchWorkLogs({ startDate, endDate, sortOrder }),
  });

  const createMutation = useMutation({
    mutationFn: createWorkLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      closeFormModal();
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateWorkLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      closeFormModal();
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
    },
  });

  const openAddModal = () => {
    setEditingLog(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      volume: '',
      performer: '',
      workTypeId: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (log: WorkLog) => {
    setEditingLog(log);
    setFormData({
      date: new Date(log.date).toISOString().split('T')[0],
      volume: log.volume.toString(),
      performer: log.performer,
      workTypeId: log.workTypeId.toString(),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingLog(null);
    setFormError('');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const { date, volume, performer, workTypeId } = formData;

    if (!date || !volume || !performer || !workTypeId) {
      setFormError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const volumeNum = parseFloat(volume);
    if (isNaN(volumeNum) || volumeNum <= 0) {
      setFormError('Объем работ должен быть положительным числом');
      return;
    }

    const payload = {
      date: new Date(date).toISOString(),
      volume: volumeNum,
      performer: performer.trim(),
      workTypeId: parseInt(workTypeId, 10),
    };

    if (editingLog) {
      updateMutation.mutate({ id: editingLog.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const selectedWorkType = workTypes.find(
    (t) => t.id === parseInt(formData.workTypeId, 10)
  );

  const totalVolume = workLogs.reduce((acc, log) => acc + log.volume, 0);
  const uniquePerformers = new Set(workLogs.map((log) => log.performer)).size;

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Журнал Работ</h1>
            <p className="text-xs text-slate-400">Управление строительными объектами</p>
          </div>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/15 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Внести запись</span>
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-slate-400 font-medium">Всего записей</span>
              <span className="text-3xl font-bold tracking-tight text-white">
                {isLoadingLogs ? '...' : workLogs.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-slate-400 font-medium">Активных исполнителей</span>
              <span className="text-3xl font-bold tracking-tight text-white">
                {isLoadingLogs ? '...' : uniquePerformers}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-slate-400 font-medium">Общий объем работ</span>
              <span className="text-3xl font-bold tracking-tight text-white">
                {isLoadingLogs ? '...' : totalVolume.toLocaleString()}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>Фильтр по дате:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
              <span className="text-slate-600">—</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 hover:bg-slate-850 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Сбросить</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Сортировка:</span>
            <button
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <span>По дате</span>
              {sortOrder === 'asc' ? (
                <ChevronUp className="w-4 h-4 text-indigo-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-indigo-400" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-900/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Дата выполнения</th>
                  <th className="px-6 py-4">Вид работы</th>
                  <th className="px-6 py-4">Объём</th>
                  <th className="px-6 py-4">Исполнитель</th>
                  <th className="px-6 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                <AnimatePresence mode="popLayout">
                  {isLoadingLogs ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`skel-${i}`} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-slate-900 rounded w-24"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-slate-900 rounded w-48"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-slate-900 rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-slate-900 rounded w-32"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-900 rounded w-12 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : workLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                        Записи не найдены. Внесите новую запись о выполненных работах.
                      </td>
                    </tr>
                  ) : (
                    workLogs.map((log) => (
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
                          {log.workType?.name || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 font-semibold">
                            {log.volume} {log.workType?.unit || ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-slate-550 border border-slate-800">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span>{log.performer}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(log)}
                              className="p-1.5 hover:bg-slate-900 hover:text-white rounded-lg text-slate-500 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Вы уверены, что хотите удалить эту запись?')) {
                                  deleteMutation.mutate(log.id);
                                }
                              }}
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
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFormModal}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">
                  {editingLog ? 'Редактировать запись' : 'Новая запись журнала'}
                </h3>
                <button
                  onClick={closeFormModal}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Вид работы *
                  </label>
                  <select
                    name="workTypeId"
                    value={formData.workTypeId}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
                  >
                    <option value="">Выберите работу из справочника</option>
                    {workTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Объём *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        name="volume"
                        value={formData.volume}
                        onChange={handleInputChange}
                        required
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-12 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-indigo-400">
                        {selectedWorkType ? selectedWorkType.unit : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Дата выполнения *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    ФИО исполнителя *
                  </label>
                  <input
                    type="text"
                    name="performer"
                    value={formData.performer}
                    onChange={handleInputChange}
                    required
                    placeholder="Например, Петров А.В."
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div className="border-t border-slate-800 pt-4 mt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="px-4 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-sm font-semibold rounded-xl text-slate-300 hover:text-white transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all duration-200"
                  >
                    {editingLog ? 'Сохранить изменения' : 'Внести'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConstructionDashboard />
    </QueryClientProvider>
  );
}
