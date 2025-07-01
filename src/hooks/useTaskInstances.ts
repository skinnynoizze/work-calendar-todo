import { useMemo } from 'react';
import { Task, TaskInstance, TaskInstancesResult } from '../types';
import { generateTaskInstances } from '../utils/taskUtils';
import { formatDate } from '../utils/dateUtils';

// Rangos optimizados por vista
const VIEW_SPECIFIC_RANGES = {
  DASHBOARD: {
    DAYS_BACK: 1,   // Solo ayer para contexto
    DAYS_FORWARD: 14 // 2 semanas adelante
  },
  CALENDAR_MONTH: {
    DAYS_BACK: 7,   // Días del mes anterior
    DAYS_FORWARD: 42 // Días del mes actual + siguiente (6 semanas max)
  },
  TASKS_LIST: {
    DAYS_BACK: 0,   // No necesita histórico
    DAYS_FORWARD: 7 // Solo próxima semana para "upcoming"
  }
} as const;

// Función helper para crear el resultado de instancias (elimina duplicación)
function createTaskInstancesResult(tasks: Task[], rangeStart: Date, rangeEnd: Date): TaskInstancesResult {
  const allInstances = tasks.flatMap(task => 
    generateTaskInstances(task, rangeStart, rangeEnd)
  );

  const byDate = allInstances.reduce((acc, instance) => {
    const date = instance.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(instance);
    return acc;
  }, {} as Record<string, TaskInstance[]>);

  return {
    all: allInstances,
    byDate,
    getForDate: (date: Date) => byDate[formatDate(date)] || [],
    getForDateRange: (start: Date, end: Date) => {
      const startStr = formatDate(start);
      const endStr = formatDate(end);
      return allInstances.filter(instance => 
        instance.date >= startStr && instance.date <= endStr
      );
    }
  };
}

// Hook optimizado para Dashboard (60-75 instancias vs 1,500+)
export function useTaskInstancesForDashboard(tasks: Task[]): TaskInstancesResult {
  return useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { all: [], byDate: {}, getForDate: () => [], getForDateRange: () => [] };
    }

    const today = new Date();
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - VIEW_SPECIFIC_RANGES.DASHBOARD.DAYS_BACK);
    
    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + VIEW_SPECIFIC_RANGES.DASHBOARD.DAYS_FORWARD);

    return createTaskInstancesResult(tasks, rangeStart, rangeEnd);
  }, [tasks]);
}

// Hook optimizado para Calendar (140-175 instancias vs 1,500+)
export function useTaskInstancesForCalendar(tasks: Task[], currentMonth: Date): TaskInstancesResult {
  return useMemo(() => {
    if (!tasks || tasks.length === 0 || !currentMonth) {
      return { all: [], byDate: {}, getForDate: () => [], getForDateRange: () => [] };
    }

    // Calcular rango del mes con días adyacentes para completar semanas
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Expandir para incluir días de meses adyacentes que se muestran en el calendario
    const rangeStart = new Date(monthStart);
    rangeStart.setDate(rangeStart.getDate() - VIEW_SPECIFIC_RANGES.CALENDAR_MONTH.DAYS_BACK);
    
    const rangeEnd = new Date(monthEnd);
    rangeEnd.setDate(rangeEnd.getDate() + VIEW_SPECIFIC_RANGES.CALENDAR_MONTH.DAYS_FORWARD);

    return createTaskInstancesResult(tasks, rangeStart, rangeEnd);
  }, [tasks, currentMonth]);
} 