export interface WorkType {
  id: number;
  name: string;
  unit: string;
}

export interface WorkLog {
  id: number;
  date: string;
  volume: number;
  performer: string;
  workTypeId: number;
  workType: WorkType | null;
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'date' | 'workType' | 'volume' | 'performer';

export interface WorkLogPayload {
  date: string;
  volume: number;
  performer: string;
  workTypeId?: number;
  customWorkName?: string;
  customWorkUnit?: string;
}
