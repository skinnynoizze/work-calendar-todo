import { Task, TaskInstance } from '../types';
import { formatDate, parseDate, addDays } from './dateUtils';
import { TIME_CONSTANTS, PRIORITY_ORDER, PRIORITY_COLORS, PRIORITY_LABELS, TASK_STATE_COLORS, RECURRENCE_LABELS, LOCALE_NAMES } from './constants';

export const generateTaskInstances = (
  task: Task,
  startDate: Date,
  endDate: Date
): TaskInstance[] => {
  const instances: TaskInstance[] = [];
  const taskStartDate = parseDate(task.startDate);
  
  const taskEndDate = task.endDate ? parseDate(task.endDate) : null;
  
  if (task.recurrence.type === 'none') {
    if (taskStartDate >= startDate && taskStartDate <= endDate) {
      instances.push({
        taskId: task.id,
        date: formatDate(taskStartDate),
        completed: task.completedDates.includes(formatDate(taskStartDate)),
        task
      });
    }
    return instances;
  }

  // Optimización: calcular directamente las fechas válidas en lugar de iterar día por día
  const iterationEndDate = taskEndDate && taskEndDate < endDate ? taskEndDate : endDate;
  
  switch (task.recurrence.type) {
    case 'daily': {
      generateDailyInstances(task, taskStartDate, startDate, iterationEndDate, instances);
      break;
    }
    case 'weekly': {
      generateWeeklyInstances(task, taskStartDate, startDate, iterationEndDate, instances);
      break;
    }
    case 'monthly': {
      generateMonthlyInstances(task, taskStartDate, startDate, iterationEndDate, instances);
      break;
    }
    default: {
      // Fallback to old method for complex cases
      let currentDate = new Date(Math.max(taskStartDate.getTime(), startDate.getTime()));
      while (currentDate <= iterationEndDate) {
        if (shouldGenerateInstance(task, currentDate)) {
          instances.push({
            taskId: task.id,
            date: formatDate(currentDate),
            completed: task.completedDates.includes(formatDate(currentDate)),
            task
          });
        }
        currentDate = addDays(currentDate, 1);
        
        // Safety check
        if (currentDate.getTime() > endDate.getTime() + (TIME_CONSTANTS.SAFETY_LIMIT_DAYS * TIME_CONSTANTS.MILLISECONDS_PER_DAY)) {
          break;
        }
      }
    }
  }
  
  return instances;
};

const shouldGenerateInstance = (task: Task, date: Date): boolean => {
  const taskStartDate = parseDate(task.startDate);
  const dayOfWeek = date.getDay();
  
  switch (task.recurrence.type) {
    case 'daily': {
      const daysDiff = Math.floor((date.getTime() - taskStartDate.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_DAY);
      const isDayIntervalMatch = daysDiff >= 0 && daysDiff % task.recurrence.interval === 0;
      
      // If specific days of week are selected, check if current day matches
      if (task.recurrence.daysOfWeek && task.recurrence.daysOfWeek.length > 0) {
        return isDayIntervalMatch && task.recurrence.daysOfWeek.includes(dayOfWeek);
      }
      
      // If no specific days selected, use interval only
      return isDayIntervalMatch;
    }
    
    case 'weekly': {
      const weeksDiff = Math.floor((date.getTime() - taskStartDate.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_WEEK);
      
      // For weekly tasks, we need to check if we're in the right week interval
      // and if the day of week matches the selected days
      if (task.recurrence.daysOfWeek && task.recurrence.daysOfWeek.length > 0) {
        // Calculate which week this date falls into relative to start date
        const startDayOfWeek = taskStartDate.getDay();
        
        // Find the start of the week for the task start date
        const startOfStartWeek = new Date(taskStartDate);
        startOfStartWeek.setDate(startOfStartWeek.getDate() - startDayOfWeek);
        
        // Find the start of the week for the current date
        const startOfCurrentWeek = new Date(date);
        startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - dayOfWeek);
        
        // Calculate week difference
        const actualWeeksDiff = Math.floor((startOfCurrentWeek.getTime() - startOfStartWeek.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_WEEK);
        
        return actualWeeksDiff >= 0 && 
               actualWeeksDiff % task.recurrence.interval === 0 && 
               task.recurrence.daysOfWeek.includes(dayOfWeek);
      }
      
      return weeksDiff >= 0 && weeksDiff % task.recurrence.interval === 0;
    }
    
    case 'monthly': {
      const monthsDiff = (date.getFullYear() - taskStartDate.getFullYear()) * 12 + 
                        (date.getMonth() - taskStartDate.getMonth());
      const dayOfMonth = task.recurrence.dayOfMonth || taskStartDate.getDate();
      
      return monthsDiff >= 0 && 
             monthsDiff % task.recurrence.interval === 0 && 
             date.getDate() === dayOfMonth;
    }
    
    default:
      return false;
  }
};

export const getTaskColor = (priority: string): string => {
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.default;
};

// Nuevas funciones para el esquema: borde = prioridad, fondo = categoría
export const getTaskBackgroundColor = (task: Task): string => {
  // Color de fondo basado en la categoría (color personalizado)
  return task.color || TASK_STATE_COLORS.default;
};

export const getTaskBorderColor = (task: Task): string => {
  // Color de borde basado en la prioridad
  return getTaskColor(task.priority);
};

export const getTaskStyles = (task: Task): { backgroundColor: string; borderColor: string; borderWidth: string } => {
  return {
    backgroundColor: getTaskBackgroundColor(task),
    borderColor: getTaskBorderColor(task),
    borderWidth: '2px'
  };
};

// Función helper para obtener estadísticas de instancias pre-calculadas
export const getStatsFromInstances = (instances: TaskInstance[], targetDate: string): {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
} => {
  const todayInstances = instances.filter(instance => instance.date === targetDate);
  const completed = todayInstances.filter(instance => instance.completed).length;
  const total = todayInstances.length;
  
  return {
    total,
    completed,
    pending: total - completed,
    completionRate: total > 0 ? (completed / total) * 100 : 0
  };
};

export const getTaskStats = (
  tasks: Task[], 
  preCalculatedInstances?: TaskInstance[]
): {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
} => {
  const today = formatDate(new Date());
  
  // Si hay instancias pre-calculadas, usarlas (comportamiento optimizado)
  if (preCalculatedInstances) {
    return getStatsFromInstances(preCalculatedInstances, today);
  }
  
  // Fallback: calcular instancias solo para hoy (comportamiento original)
  const todayDate = new Date();
  const allTodayInstances = tasks.flatMap(task => 
    generateTaskInstances(task, todayDate, todayDate)
  );
  
  return getStatsFromInstances(allTodayInstances, today);
};

export const sortTasksByPriority = (tasks: TaskInstance[]): TaskInstance[] => {
  return [...tasks].sort((a, b) => {
    const aPriority = PRIORITY_ORDER[a.task.priority as keyof typeof PRIORITY_ORDER] ?? 3;
    const bPriority = PRIORITY_ORDER[b.task.priority as keyof typeof PRIORITY_ORDER] ?? 3;
    
    // Si tienen la misma prioridad, ordenar por nombre alfabéticamente
    if (aPriority === bPriority) {
      return a.task.title.localeCompare(b.task.title);
    }
    
    return aPriority - bPriority;
  });
};

export const sortPlainTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const aPriority = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 3;
    const bPriority = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 3;
    
    // Si tienen la misma prioridad, ordenar por nombre alfabéticamente
    if (aPriority === bPriority) {
      return a.title.localeCompare(b.title);
    }
    
    return aPriority - bPriority;
  });
};

// Función para obtener categorías únicas con sus colores
export const getUniqueCategories = (tasks: Task[]): Array<{ name: string; color: string }> => {
  const categoryMap = new Map<string, string>();
  
  tasks.forEach(task => {
    if (task.category && !categoryMap.has(task.category)) {
      categoryMap.set(task.category, task.color || '#3B82F6');
    }
  });
  
  return Array.from(categoryMap.entries()).map(([name, color]) => ({ name, color }));
};

// Función para obtener etiqueta de prioridad legible
export const getPriorityLabel = (priority: string): string => {
  return PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS] || priority;
};

// Función para obtener color de fondo según el estado de la tarea
export const getTaskStateColor = (completed: boolean, task: Task): string => {
  return completed ? TASK_STATE_COLORS.completed : getTaskBackgroundColor(task);
};

// Función para formatear porcentaje de completado de forma consistente
export const formatCompletionRate = (rate: number): string => {
  return `${Math.round(rate)}%`;
};

// Función para obtener etiqueta de recurrencia completa
export const getRecurrenceLabel = (recurrence: Task['recurrence']): string => {
  if (recurrence.type === 'none') return RECURRENCE_LABELS.none;
  
  let label = '';
  switch (recurrence.type) {
    case 'daily':
      label = recurrence.interval === 1 ? RECURRENCE_LABELS.daily : `Cada ${recurrence.interval} días`;
      break;
    case 'weekly':
      label = recurrence.interval === 1 ? RECURRENCE_LABELS.weekly : `Cada ${recurrence.interval} semanas`;
      break;
    case 'monthly':
      label = recurrence.interval === 1 ? RECURRENCE_LABELS.monthly : `Cada ${recurrence.interval} meses`;
      if (recurrence.dayOfMonth) {
        label += ` el día ${recurrence.dayOfMonth}`;
      }
      break;
  }

  // Agregar información de días de la semana si aplica
  if ((recurrence.type === 'weekly' || recurrence.type === 'daily') && recurrence.daysOfWeek?.length) {
    const selectedDays = recurrence.daysOfWeek.sort((a, b) => a - b);
    
    // Detectar patrones comunes
    if (JSON.stringify(selectedDays) === JSON.stringify([1, 2, 3, 4, 5])) {
      label += ' - Días laborales (L-V)';
    } else if (JSON.stringify(selectedDays) === JSON.stringify([0, 6])) {
      label += ' - Fines de semana';
    } else if (selectedDays.length === 7) {
      label += ' - Todos los días';
    } else {
      const days = selectedDays.map(d => LOCALE_NAMES.dayNames[d]).join(', ');
      label += ` - ${days}`;
    }
  }
  
  return label;
};

// ===== FUNCIONES OPTIMIZADAS PARA GENERACIÓN DE INSTANCIAS =====

function generateDailyInstances(
  task: Task, 
  taskStartDate: Date, 
  startDate: Date, 
  endDate: Date, 
  instances: TaskInstance[]
): void {
  const interval = task.recurrence.interval;
  const selectedDays = task.recurrence.daysOfWeek;
  
  // Optimización: calcular primer día válido
  let currentDate = new Date(Math.max(taskStartDate.getTime(), startDate.getTime()));
  
  while (currentDate <= endDate) {
    const daysDiff = Math.floor((currentDate.getTime() - taskStartDate.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_DAY);
    const isDayIntervalMatch = daysDiff >= 0 && daysDiff % interval === 0;
    
    if (isDayIntervalMatch) {
      const dayOfWeek = currentDate.getDay();
      
      // Si hay días específicos seleccionados, verificar
      if (!selectedDays || selectedDays.length === 0 || selectedDays.includes(dayOfWeek)) {
        instances.push({
          taskId: task.id,
          date: formatDate(currentDate),
          completed: task.completedDates.includes(formatDate(currentDate)),
          task
        });
      }
    }
    
    // Optimización: saltar al siguiente intervalo en lugar de día por día
    currentDate = addDays(currentDate, interval);
  }
}

function generateWeeklyInstances(
  task: Task, 
  taskStartDate: Date, 
  startDate: Date, 
  endDate: Date, 
  instances: TaskInstance[]
): void {
  const interval = task.recurrence.interval;
  const selectedDays = task.recurrence.daysOfWeek || [];
  
  if (selectedDays.length === 0) {
    // Si no hay días específicos, usar el día de la semana de inicio
    selectedDays.push(taskStartDate.getDay());
  }
  
  // Optimización: calcular semanas válidas y luego días específicos
  const weekStart = new Date(taskStartDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Inicio de semana
  
  while (weekStart <= endDate) {
    const weeksDiff = Math.floor((weekStart.getTime() - (new Date(taskStartDate.getTime() - taskStartDate.getDay() * TIME_CONSTANTS.MILLISECONDS_PER_DAY)).getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_WEEK);
    
    if (weeksDiff >= 0 && weeksDiff % interval === 0) {
      // Generar instancias para los días seleccionados de esta semana
      selectedDays.forEach(dayOfWeek => {
        const instanceDate = new Date(weekStart);
        instanceDate.setDate(instanceDate.getDate() + dayOfWeek);
        
        if (instanceDate >= startDate && instanceDate <= endDate && instanceDate >= taskStartDate) {
          instances.push({
            taskId: task.id,
            date: formatDate(instanceDate),
            completed: task.completedDates.includes(formatDate(instanceDate)),
            task
          });
        }
      });
    }
    
    // Saltar al siguiente intervalo de semanas
    weekStart.setDate(weekStart.getDate() + (interval * 7));
  }
}

function generateMonthlyInstances(
  task: Task, 
  taskStartDate: Date, 
  startDate: Date, 
  endDate: Date, 
  instances: TaskInstance[]
): void {
  const interval = task.recurrence.interval;
  const dayOfMonth = task.recurrence.dayOfMonth || taskStartDate.getDate();
  
  // Optimización: iterar por meses en lugar de por días
  const currentMonth = new Date(taskStartDate.getFullYear(), taskStartDate.getMonth(), 1);
  
  while (currentMonth <= endDate) {
    const monthsDiff = (currentMonth.getFullYear() - taskStartDate.getFullYear()) * 12 + 
                      (currentMonth.getMonth() - taskStartDate.getMonth());
    
    if (monthsDiff >= 0 && monthsDiff % interval === 0) {
      const instanceDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOfMonth);
      
      // Verificar que la fecha sea válida (ej: 31 de febrero se ajusta)
      if (instanceDate.getMonth() === currentMonth.getMonth() && 
          instanceDate >= startDate && 
          instanceDate <= endDate && 
          instanceDate >= taskStartDate) {
        instances.push({
          taskId: task.id,
          date: formatDate(instanceDate),
          completed: task.completedDates.includes(formatDate(instanceDate)),
          task
        });
      }
    }
    
    // Saltar al siguiente intervalo de meses
    currentMonth.setMonth(currentMonth.getMonth() + interval);
  }
}