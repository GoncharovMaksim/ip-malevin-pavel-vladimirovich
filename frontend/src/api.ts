import type { WorkLog, WorkType } from './types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchWorkTypes(): Promise<WorkType[]> {
  const res = await fetch(`${API_URL}/work-types`);
  if (!res.ok) throw new Error('Ошибка при загрузке видов работ');
  return res.json();
}

export async function fetchWorkLogs(filters?: {
  startDate?: string;
  endDate?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<WorkLog[]> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const res = await fetch(`${API_URL}/work-logs?${params.toString()}`);
  if (!res.ok) throw new Error('Ошибка при загрузке журнала работ');
  return res.json();
}

export async function createWorkLog(data: {
  date: string;
  volume: number;
  performer: string;
  workTypeId: number;
}): Promise<WorkLog> {
  const res = await fetch(`${API_URL}/work-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при создании записи');
  }
  return res.json();
}

export async function updateWorkLog(
  id: number,
  data: {
    date?: string;
    volume?: number;
    performer?: string;
    workTypeId?: number;
  },
): Promise<WorkLog> {
  const res = await fetch(`${API_URL}/work-logs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка при обновлении записи');
  }
  return res.json();
}

export async function deleteWorkLog(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/work-logs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Ошибка при удалении записи');
}
