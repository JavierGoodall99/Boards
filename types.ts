export interface Task {
  id: string;
  content: string;
  description?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}

export type DragItem = {
  id: string;
  columnId?: string; // Optional because columns don't belong to a column
  index: number;
  type: 'TASK' | 'COLUMN';
};