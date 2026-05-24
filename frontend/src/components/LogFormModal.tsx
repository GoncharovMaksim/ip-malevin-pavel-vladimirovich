import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { WorkLog, WorkLogPayload, WorkType } from '../types';

interface FormState {
  date: string;
  volume: string;
  performer: string;
  workTypeId: string;
  customWorkName: string;
  customWorkUnit: string;
}

interface LogFormModalProps {
  isOpen: boolean;
  editingLog: WorkLog | null;
  workTypes: WorkType[];
  onClose: () => void;
  onSubmit: (payload: WorkLogPayload) => void;
  isPending: boolean;
  serverError: string;
}

function makeEmptyForm(): FormState {
  return {
    date: new Date().toISOString().split('T')[0],
    volume: '',
    performer: '',
    workTypeId: '',
    customWorkName: '',
    customWorkUnit: '',
  };
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

export function LogFormModal({
  isOpen,
  editingLog,
  workTypes,
  onClose,
  onSubmit,
  isPending,
  serverError,
}: LogFormModalProps) {
  const [formData, setFormData] = useState<FormState>(makeEmptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (editingLog) {
      setFormData({
        date: new Date(editingLog.date).toISOString().split('T')[0],
        volume: editingLog.volume.toString(),
        performer: editingLog.performer,
        workTypeId: editingLog.workTypeId.toString(),
        customWorkName: '',
        customWorkUnit: '',
      });
    } else {
      setFormData(makeEmptyForm());
    }

    setFormErrors({});
  }, [isOpen, editingLog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const { date, volume, performer, workTypeId, customWorkName, customWorkUnit } = formData;

    if (!workTypeId) {
      errors.workTypeId = 'Выберите вид работы из списка';
    }

    if (workTypeId === 'custom') {
      if (!customWorkName.trim()) errors.customWorkName = 'Укажите наименование новой работы';
      if (!customWorkUnit.trim()) errors.customWorkUnit = 'Укажите единицу измерения';
    }

    if (!volume) {
      errors.volume = 'Укажите объем выполненных работ';
    } else {
      const v = parseFloat(volume);
      if (isNaN(v) || v <= 0) errors.volume = 'Объем должен быть числом больше 0';
    }

    if (!date) errors.date = 'Выберите дату выполнения';
    if (!performer.trim()) errors.performer = 'Укажите ФИО ответственного исполнителя';

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const { date, volume, performer, workTypeId, customWorkName, customWorkUnit } = formData;

    const payload: WorkLogPayload = {
      date: new Date(date).toISOString(),
      volume: parseFloat(volume),
      performer: performer.trim(),
    };

    if (workTypeId === 'custom') {
      payload.customWorkName = customWorkName.trim();
      payload.customWorkUnit = customWorkUnit.trim();
    } else {
      payload.workTypeId = parseInt(workTypeId, 10);
    }

    onSubmit(payload);
  };

  const selectedWorkType = workTypes.find(
    (t) => t.id === parseInt(formData.workTypeId, 10),
  );

  const inputClass = (field: string) =>
    `bg-slate-950 border ${
      formErrors[field] ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
    } rounded-xl px-3.5 py-2 text-xs md:text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 md:p-6 overflow-y-auto max-h-[90vh] flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base md:text-lg font-bold text-white">
                {editingLog ? 'Редактировать запись' : 'Новая запись журнала'}
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {serverError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Вид работы *
                </label>
                <select
                  name="workTypeId"
                  value={formData.workTypeId}
                  onChange={handleChange}
                  className={inputClass('workTypeId') + ' cursor-pointer'}
                >
                  <option value="">Выберите работу из справочника</option>
                  {workTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.unit})
                    </option>
                  ))}
                  <option value="custom" className="text-indigo-400 font-semibold">
                    + Ввести работу вручную...
                  </option>
                </select>
                {formErrors.workTypeId && (
                  <span className="text-[10px] text-red-500 font-medium">{formErrors.workTypeId}</span>
                )}
              </div>

              <AnimatePresence>
                {formData.workTypeId === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Название новой работы *
                      </label>
                      <input
                        type="text"
                        name="customWorkName"
                        value={formData.customWorkName}
                        onChange={handleChange}
                        placeholder="Например, Монтаж вентиляции"
                        className={inputClass('customWorkName')}
                      />
                      {formErrors.customWorkName && (
                        <span className="text-[10px] text-red-500 font-medium">{formErrors.customWorkName}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Ед. измерения *
                      </label>
                      <input
                        type="text"
                        name="customWorkUnit"
                        value={formData.customWorkUnit}
                        onChange={handleChange}
                        placeholder="Например, шт или м²"
                        className={inputClass('customWorkUnit')}
                      />
                      {formErrors.customWorkUnit && (
                        <span className="text-[10px] text-red-500 font-medium">{formErrors.customWorkUnit}</span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Объём *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      name="volume"
                      value={formData.volume}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`w-full ${inputClass('volume')} pl-3.5 pr-14`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[10px] md:text-xs font-semibold text-indigo-400">
                      {formData.workTypeId === 'custom'
                        ? formData.customWorkUnit || '—'
                        : selectedWorkType
                          ? selectedWorkType.unit
                          : '—'}
                    </div>
                  </div>
                  {formErrors.volume && (
                    <span className="text-[10px] text-red-500 font-medium">{formErrors.volume}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Дата выполнения *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    onClick={openDatePicker}
                    className={inputClass('date') + ' cursor-pointer'}
                  />
                  {formErrors.date && (
                    <span className="text-[10px] text-red-500 font-medium">{formErrors.date}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ФИО исполнителя *
                </label>
                <input
                  type="text"
                  name="performer"
                  value={formData.performer}
                  onChange={handleChange}
                  placeholder="Например, Петров А.В."
                  className={inputClass('performer')}
                />
                {formErrors.performer && (
                  <span className="text-[10px] text-red-500 font-medium">{formErrors.performer}</span>
                )}
              </div>

              <div className="border-t border-slate-800 pt-4 mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-xs md:text-sm font-semibold rounded-xl text-slate-300 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs md:text-sm font-semibold rounded-xl transition-all duration-200"
                >
                  {editingLog ? 'Сохранить изменения' : 'Внести'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
