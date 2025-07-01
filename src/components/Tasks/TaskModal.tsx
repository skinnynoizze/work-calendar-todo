import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getUniqueCategories } from '../../utils/taskUtils';
import { LOCALE_NAMES } from '../../utils/constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'completedDates'>) => void;
  editingTask?: Task;
  existingTasks: Task[];
}

export default function TaskModal({ isOpen, onClose, onSave, editingTask, existingTasks }: TaskModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    recurrence: {
      type: 'none' | 'daily' | 'weekly' | 'monthly';
      interval: number;
      daysOfWeek: number[];
      dayOfMonth?: number;
    };
    startDate: string;
    endDate: string;
    color: string;
  }>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    recurrence: {
      type: 'none',
      interval: 1,
      daysOfWeek: [],
      dayOfMonth: undefined,
    },
    startDate: formatDate(new Date()),
    endDate: '',
    color: '#3B82F6',
  });

  // Estados para el selector de categorías
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  
  // Obtener categorías únicas existentes
  const existingCategories = getUniqueCategories(existingTasks);
  
  // Filtrar categorías basado en el término de búsqueda
  const filteredCategories = existingCategories.filter(cat => 
    cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        category: editingTask.category,
        priority: editingTask.priority,
        recurrence: {
          ...editingTask.recurrence,
          daysOfWeek: editingTask.recurrence.daysOfWeek || [],
        },
        startDate: editingTask.startDate,
        endDate: editingTask.endDate || '',
        color: editingTask.color,
      });
      setCategorySearchTerm(editingTask.category);
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        recurrence: {
          type: 'none',
          interval: 1,
          daysOfWeek: [],
          dayOfMonth: undefined,
        },
        startDate: formatDate(new Date()),
        endDate: '',
        color: '#3B82F6',
      });
      setCategorySearchTerm('');
    }
    setShowCategoryDropdown(false);
  }, [editingTask, isOpen]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.category-selector')) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategoryDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      completed: false,
    });
    onClose();
  };

  const handleRecurrenceChange = (field: string, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: value,
      },
    }));
  };

  const handleDayOfWeekToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        daysOfWeek: prev.recurrence.daysOfWeek.includes(day)
          ? prev.recurrence.daysOfWeek.filter(d => d !== day)
          : [...prev.recurrence.daysOfWeek, day],
      },
    }));
  };

  const setWeekdays = () => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      },
    }));
  };

  const setWeekends = () => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        daysOfWeek: [0, 6], // Sunday and Saturday
      },
    }));
  };

  const setAllDays = () => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // All days
      },
    }));
  };

  const clearDays = () => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        daysOfWeek: [],
      },
    }));
  };

  // Funciones para manejar categorías
  const handleCategorySelect = (categoryName: string, categoryColor: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryName,
      color: categoryColor
    }));
    setCategorySearchTerm('');
    setShowCategoryDropdown(false);
  };

  const handleCategoryInputChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
    setCategorySearchTerm(value);
    setShowCategoryDropdown(value.length > 0);
  };

  if (!isOpen) return null;

  const { dayNamesLong: dayNames } = LOCALE_NAMES;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre de la tarea"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descripción opcional"
            />
          </div>

          {/* Selector inteligente de categorías */}
          <div className="space-y-4">
            <div className="relative category-selector">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => handleCategoryInputChange(e.target.value)}
                  onFocus={() => setShowCategoryDropdown(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Escribir categoría o elegir existente"
                />
                
                {/* Dropdown de categorías existentes */}
                {showCategoryDropdown && filteredCategories.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => handleCategorySelect(category.name, category.color)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm text-gray-900">{category.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100">
                          Usar
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color de Categoría
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{formData.color}</span>
                {existingCategories.find(cat => cat.name === formData.category) && (
                  <span className="text-xs text-green-600 ml-2">✓ Color de categoría existente</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repetición
            </label>
            <select
              value={formData.recurrence.type}
              onChange={(e) => handleRecurrenceChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">Sin repetición</option>
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>

          {formData.recurrence.type !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalo
              </label>
              <input
                type="number"
                min="1"
                value={formData.recurrence.interval}
                onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.recurrence.type === 'daily' && 'Cada cuántos días'}
                {formData.recurrence.type === 'weekly' && 'Cada cuántas semanas'}
                {formData.recurrence.type === 'monthly' && 'Cada cuántos meses'}
              </p>
            </div>
          )}

          {(formData.recurrence.type === 'weekly' || formData.recurrence.type === 'daily') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de la semana
              </label>
              
              {/* Quick selection buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={setWeekdays}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                >
                  Días laborables (L-V)
                </button>
                <button
                  type="button"
                  onClick={setWeekends}
                  className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
                >
                  Fines de semana
                </button>
                <button
                  type="button"
                  onClick={setAllDays}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200 transition-colors"
                >
                  Todos los días
                </button>
                <button
                  type="button"
                  onClick={clearDays}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                >
                  Limpiar
                </button>
              </div>

              {/* Individual day selection */}
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayOfWeekToggle(index)}
                    className={`p-2 text-xs rounded transition-colors ${
                      formData.recurrence.daysOfWeek.includes(index)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              
              {formData.recurrence.daysOfWeek.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  Seleccionados: {formData.recurrence.daysOfWeek.map(d => dayNames[d].slice(0, 3)).join(', ')}
                </p>
              )}
            </div>
          )}

          {formData.recurrence.type === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Día del mes
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.recurrence.dayOfMonth || ''}
                onChange={(e) => handleRecurrenceChange('dayOfMonth', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Día del mes (opcional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si no se especifica, usará el día de la fecha de inicio
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional. Sin fecha fin, la tarea se repetirá continuamente (ideal para hábitos y rutinas)
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editingTask ? 'Actualizar' : 'Crear'} Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}