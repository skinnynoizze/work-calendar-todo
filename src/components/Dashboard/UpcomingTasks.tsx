import { Clock, AlertTriangle } from 'lucide-react';
import { TaskInstancesResult } from '../../types';
import { sortTasksByPriority, getTaskStyles } from '../../utils/taskUtils';
import { formatDate, getRelativeDateLabel } from '../../utils/dateUtils';
import { UI_LIMITS } from '../../utils/constants';

interface UpcomingTasksProps {
  taskInstances: TaskInstancesResult;
  onToggleTask: (taskId: string, date: string) => void;
}

export default function UpcomingTasks({ taskInstances, onToggleTask }: UpcomingTasksProps) {
  const today = new Date();

  // Get today's pending tasks using pre-calculated instances
  const todayTasks = sortTasksByPriority(
    taskInstances.getForDate(today).filter(instance => !instance.completed)
  );

  // Get upcoming high priority tasks (next 14 days)
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  
  const upcomingHighPriorityTasks = taskInstances.getForDateRange(today, twoWeeks)
    .filter(instance => 
      !instance.completed && 
      instance.task.priority === 'high' &&
      instance.date > formatDate(today) // Solo futuras, no hoy
    )
    .sort((a, b) => {
      // Primero ordenar por fecha
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      
      // Si es la misma fecha, ordenar alfabéticamente
      return a.task.title.localeCompare(b.task.title);
    })
    .slice(0, UI_LIMITS.UPCOMING_HIGH_PRIORITY);

  // Get overdue tasks using pre-calculated instances
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const overdueTasks = sortTasksByPriority(
    taskInstances.getForDateRange(weekAgo, yesterday)
      .filter(instance => !instance.completed)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tareas Importantes</h3>
      
      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h4 className="text-sm font-medium text-red-700">Tareas Atrasadas</h4>
          </div>
          <div className="space-y-2">
            {overdueTasks.slice(0, UI_LIMITS.OVERDUE_TASKS_PREVIEW).map((task) => (
              <div
                key={`overdue-${task.taskId}-${task.date}`}
                className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">{task.task.title}</p>
                  <p className="text-xs text-red-600">
                    {new Date(task.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onToggleTask(task.taskId, task.date)}
                  className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition-colors"
                >
                  Completar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-medium text-blue-700">Pendientes Hoy</h4>
          </div>
          <div className="space-y-2">
            {todayTasks.slice(0, UI_LIMITS.TODAY_TASKS_PREVIEW).map((task) => (
              <div
                key={`today-${task.taskId}-${task.date}`}
                className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getTaskStyles(task.task).borderColor }}
                    />
                    <p className="text-sm font-medium text-blue-900">{task.task.title}</p>
                  </div>
                  <p className="text-xs text-blue-600">{task.task.category}</p>
                </div>
                <button
                  onClick={() => onToggleTask(task.taskId, task.date)}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors"
                >
                  Completar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming High Priority Tasks */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <h4 className="text-sm font-medium text-orange-700">Próximas de Alta Prioridad</h4>
        </div>
        
        {upcomingHighPriorityTasks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No hay tareas de alta prioridad próximas</p>
          </div>
        ) : (
          upcomingHighPriorityTasks.map((task) => {
            const taskDate = new Date(task.date);
            const dateLabel = getRelativeDateLabel(taskDate, today);

            return (
              <div
                key={`upcoming-${task.taskId}-${task.date}`}
                className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getTaskStyles(task.task).borderColor }}
                    />
                    <p className="text-sm font-medium text-orange-900">{task.task.title}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-orange-600">{dateLabel}</p>
                    <span className="text-xs text-orange-400">•</span>
                    <p className="text-xs text-orange-600">{task.task.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => onToggleTask(task.taskId, task.date)}
                  className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded hover:bg-orange-200 transition-colors"
                >
                  Completar
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}