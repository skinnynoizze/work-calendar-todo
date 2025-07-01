export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  recurrence: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number; // Every X days/weeks/months
    daysOfWeek?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
    dayOfMonth?: number; // For monthly: which day of month
  };
  startDate: string; // ISO date string
  endDate?: string; // Optional end date for recurrence
  completed: boolean;
  completedDates: string[]; // Array of completed dates (ISO strings)
  createdAt: string;
  color: string;
}

export interface TaskInstance {
  taskId: string;
  date: string; // ISO date string
  completed: boolean;
  task: Task;
}

export interface TaskInstancesResult {
  all: TaskInstance[];
  byDate: Record<string, TaskInstance[]>;
  getForDate: (date: Date) => TaskInstance[];
  getForDateRange: (start: Date, end: Date) => TaskInstance[];
}

export type ViewMode = 'calendar' | 'tasks' | 'dashboard';