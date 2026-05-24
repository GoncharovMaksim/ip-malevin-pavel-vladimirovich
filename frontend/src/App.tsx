import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { HardHat, Plus } from 'lucide-react';
import {
  createWorkLog,
  deleteWorkLog,
  fetchWorkLogs,
  fetchWorkTypes,
  updateWorkLog,
} from './api';
import type { SortField, WorkLog, WorkLogPayload } from './types';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FilterBar } from './components/FilterBar';
import { LogFormModal } from './components/LogFormModal';
import { LogTable } from './components/LogTable';
import { StatsCards } from './components/StatsCards';

const rootQueryClient = new QueryClient();

function ConstructionDashboard() {
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formServerError, setFormServerError] = useState('');

  const { data: workTypes = [] } = useQuery({
    queryKey: ['workTypes'],
    queryFn: fetchWorkTypes,
  });

  const {
    data: workLogs = [],
    isLoading: isLoadingLogs,
    isError: isErrorLogs,
  } = useQuery({
    queryKey: ['workLogs', startDate, endDate],
    queryFn: () => fetchWorkLogs({ startDate, endDate }),
  });

  const createMutation = useMutation({
    mutationFn: createWorkLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      queryClient.invalidateQueries({ queryKey: ['workTypes'] });
      closeFormModal();
    },
    onError: (error: Error) => {
      setFormServerError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkLogPayload }) =>
      updateWorkLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      queryClient.invalidateQueries({ queryKey: ['workTypes'] });
      closeFormModal();
    },
    onError: (error: Error) => {
      setFormServerError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workLogs'] });
      setDeleteConfirmId(null);
    },
  });

  const openAddModal = () => {
    setEditingLog(null);
    setFormServerError('');
    setIsModalOpen(true);
  };

  const openEditModal = (log: WorkLog) => {
    setEditingLog(log);
    setFormServerError('');
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingLog(null);
    setFormServerError('');
  };

  const handleFormSubmit = (payload: WorkLogPayload) => {
    setFormServerError('');
    if (editingLog) {
      updateMutation.mutate({ id: editingLog.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedWorkLogs = [...workLogs].sort((a, b) => {
    if (sortBy === 'date') {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortOrder === 'asc' ? diff : -diff;
    }
    if (sortBy === 'workType') {
      const valA = a.workType?.name ?? '';
      const valB = b.workType?.name ?? '';
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (sortBy === 'performer') {
      return sortOrder === 'asc'
        ? a.performer.localeCompare(b.performer)
        : b.performer.localeCompare(a.performer);
    }
    // volume
    const diff = a.volume - b.volume;
    return sortOrder === 'asc' ? diff : -diff;
  });

  const totalVolume = workLogs.reduce((acc, log) => acc + log.volume, 0);
  const uniquePerformers = new Set(workLogs.map((log) => log.performer)).size;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-10 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">Журнал Работ</h1>
            <p className="text-[10px] md:text-xs text-slate-400">Управление строительными объектами</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/15 transition-all duration-200 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Внести запись</span>
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        <StatsCards
          totalLogs={workLogs.length}
          uniquePerformers={uniquePerformers}
          totalVolume={totalVolume}
          isLoading={isLoadingLogs}
        />

        <FilterBar
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearFilters={() => { setStartDate(''); setEndDate(''); }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderToggle={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
        />

        {isErrorLogs && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium text-center">
            Не удалось загрузить данные. Проверьте соединение с сервером.
          </div>
        )}

        <LogTable
          logs={sortedWorkLogs}
          isLoading={isLoadingLogs}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={openEditModal}
          onDelete={setDeleteConfirmId}
        />
      </main>

      <LogFormModal
        isOpen={isModalOpen}
        editingLog={editingLog}
        workTypes={workTypes}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        serverError={formServerError}
      />

      <DeleteConfirmModal
        deleteId={deleteConfirmId}
        isPending={deleteMutation.isPending}
        onConfirm={deleteMutation.mutate}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={rootQueryClient}>
      <ConstructionDashboard />
    </QueryClientProvider>
  );
}
