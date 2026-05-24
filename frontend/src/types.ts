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
  workType: WorkType;
  createdAt: string;
  updatedAt: string;
}
