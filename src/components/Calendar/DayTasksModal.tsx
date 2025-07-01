import { X } from 'lucide-react';
import { TaskInstance } from '../../types';
import { getTaskStyles, sortTasksByPriority, getPriorityLabel, getTaskStateColor } from '../../utils/taskUtils';
import { formatDate } from '../../utils/dateUtils';

interface DayTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  tasks: TaskInstance[];
  onToggleTask: (taskId: string, date: string) => void;
}

export default function DayTasksModal({ 
  isOpen, 
  onClose, 
  date, 
  tasks, 
  onToggleTask 
}: DayTasksModalProps) {
  if (!isOpen) return null;

  const dateString = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const dateKey = formatDate(date);
  
  // Asegurar que las tareas estén ordenadas por prioridad
  const sortedTasks = sortTasksByPriority(tasks);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {dateString}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {sortedTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay tareas para este día
            </p>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((taskInstance, index) => (
                <div
                  key={`${taskInstance.taskId}-${index}`}
                  onClick={() => onToggleTask(taskInstance.taskId, dateKey)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    taskInstance.completed 
                      ? 'bg-green-50 border-green-200 opacity-75' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{
                ...getTaskStyles(taskInstance.task),
                backgroundColor: getTaskStateColor(taskInstance.completed, taskInstance.task)
              }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-gray-900 ${
                        taskInstance.completed ? 'line-through' : ''
                      }`}>
                        {taskInstance.task.title}
                      </h3>
                      
                      {taskInstance.task.description && (
                        <p className={`text-sm text-gray-600 mt-1 ${
                          taskInstance.completed ? 'line-through' : ''
                        }`}>
                          {taskInstance.task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                          {taskInstance.task.category}
                        </span>
                        <span>
                          Prioridad: {getPriorityLabel(taskInstance.task.priority)}
                        </span>
                        {/* Indicador para tareas infinitas */}
                        {!taskInstance.task.endDate && taskInstance.task.recurrence.type !== 'none' && (
                          <span className="text-blue-600 text-xs font-medium">∞ Continua</span>
                        )}
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      taskInstance.completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {taskInstance.completed ? 'Completada' : 'Pendiente'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
} 