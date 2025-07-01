import { Edit2, Trash2, Calendar, Repeat, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { getTaskStyles, generateTaskInstances, getPriorityLabel, getRecurrenceLabel, getTaskStateColor } from '../../utils/taskUtils';
import { formatDate } from '../../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (taskId: string, date: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const today = new Date();
  const todayString = formatDate(today);
  
  // Check if task has an instance today
  const todayInstances = generateTaskInstances(task, today, today);
  const todayInstance = todayInstances.find(instance => instance.date === todayString);
  


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={getTaskStyles(task)}
            />
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {task.category}
            </span>
          </div>

          {task.description && (
            <p className="text-gray-600 mb-3">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>Prioridad: {getPriorityLabel(task.priority)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Repeat className="w-4 h-4" />
              <span>{getRecurrenceLabel(task.recurrence)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Inicio: {new Date(task.startDate).toLocaleDateString()}</span>
            </div>

            {/* Indicador para tareas infinitas */}
            {!task.endDate && task.recurrence.type !== 'none' && (
              <div className="flex items-center space-x-1">
                <span className="text-blue-600 text-sm font-medium">∞ Continua</span>
              </div>
            )}
          </div>

          {/* Today's Task Status */}
          {todayInstance && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Tarea para hoy</span>
                <button
                  onClick={() => onToggle(task.id, todayString)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    todayInstance.completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                  }`}
                >
                  {todayInstance.completed ? 'Completada' : 'Marcar como completada'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar tarea"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar tarea"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}