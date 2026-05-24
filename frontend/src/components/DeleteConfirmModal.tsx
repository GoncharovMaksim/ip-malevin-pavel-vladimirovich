import { AnimatePresence, motion } from 'framer-motion';

interface DeleteConfirmModalProps {
  deleteId: number | null;
  isPending: boolean;
  onConfirm: (id: number) => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  deleteId,
  isPending,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 text-center sm:text-left"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-base md:text-lg font-bold text-white">Удаление записи</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Вы действительно хотите удалить эту запись из журнала? Это действие необратимо.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-xs md:text-sm font-semibold rounded-xl text-slate-300 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => onConfirm(deleteId)}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs md:text-sm font-semibold rounded-xl transition-all duration-200"
              >
                {isPending ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
