import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Ticket } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { TICKET_PRIORITY_LABELS, TICKET_STATUS_LABELS, DEFAULT_TICKET_CATEGORIES } from '../../utils/constants';
import { getUniqueTicketCategories } from '../../utils/ticketUtils';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingTicket?: Ticket;
  existingTickets: Ticket[];
}

export default function TicketModal({ isOpen, onClose, onSave, editingTicket, existingTickets }: TicketModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    reporter: string;
    phone: string;
    reportedAt: string;
    notes: string;
    resolution: string;
    resolvedAt: string;
    category: string;
    status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo: string;
    color: string;
  }>({
    title: '',
    description: '',
    reporter: '',
    phone: '',
    reportedAt: formatDate(new Date()),
    notes: '',
    resolution: '',
    resolvedAt: '',
    category: '',
    status: 'open',
    priority: 'medium',
    assignedTo: '',
    color: '#3B82F6',
  });

  // Estados para el selector de categorías
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  
  // Obtener categorías únicas existentes y combinar con las por defecto
  const existingCategories = getUniqueTicketCategories(existingTickets);
  const defaultCategories = DEFAULT_TICKET_CATEGORIES;
  
  // Combinar categorías sin duplicados
  const allCategories = [...defaultCategories];
  existingCategories.forEach(existing => {
    if (!allCategories.some(cat => cat.name === existing.name)) {
      allCategories.push(existing);
    }
  });
  
  // Filtrar categorías: si no hay término de búsqueda, mostrar todas
  const filteredCategories = categorySearchTerm.trim() === ''
    ? allCategories
    : allCategories.filter(cat => 
        cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
      );

  useEffect(() => {
    if (editingTicket) {
      setFormData({
        title: editingTicket.title,
        description: editingTicket.description,
        reporter: editingTicket.reporter,
        phone: editingTicket.phone,
        reportedAt: editingTicket.reportedAt.split('T')[0], // Extract date part for input
        notes: editingTicket.notes || '',
        resolution: editingTicket.resolution || '',
        resolvedAt: editingTicket.resolvedAt ? editingTicket.resolvedAt.split('T')[0] : '',
        category: editingTicket.category,
        status: editingTicket.status,
        priority: editingTicket.priority,
        assignedTo: editingTicket.assignedTo || '',
        color: editingTicket.color,
      });
      setCategorySearchTerm(editingTicket.category);
    } else {
      setFormData({
        title: '',
        description: '',
        reporter: '',
        phone: '',
        reportedAt: formatDate(new Date()),
        notes: '',
        resolution: '',
        resolvedAt: '',
        category: '',
        status: 'open',
        priority: 'medium',
        assignedTo: '',
        color: '#3B82F6',
      });
      setCategorySearchTerm('');
    }
    setShowCategoryDropdown(false);
  }, [editingTicket, isOpen]);

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
    
    const ticketData = {
      ...formData,
      reportedAt: new Date(formData.reportedAt).toISOString(),
      resolvedAt: formData.resolvedAt ? new Date(formData.resolvedAt).toISOString() : undefined,
      notes: formData.notes || undefined,
      resolution: formData.resolution || undefined,
      assignedTo: formData.assignedTo || undefined,
    };
    
    onSave(ticketData);
    onClose();
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
    // Mantener dropdown abierto una vez que se abre (solo se cierra al seleccionar o clic fuera)
  };

  // Auto-actualizar resolvedAt cuando el status cambia a resolved
  const handleStatusChange = (status: string) => {
    const newFormData = { ...formData, status: status as 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed' };
    
    if (status === 'resolved' && !formData.resolvedAt) {
      newFormData.resolvedAt = formatDate(new Date());
    } else if (status !== 'resolved') {
      newFormData.resolvedAt = '';
    }
    
    setFormData(newFormData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTicket ? 'Editar Ticket' : 'Nuevo Ticket'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Título del ticket"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Reporte *
              </label>
              <input
                type="date"
                required
                value={formData.reportedAt}
                onChange={(e) => setFormData(prev => ({ ...prev, reportedAt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descripción detallada del problema o incidencia"
            />
          </div>

          {/* Información del reporter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario que reporta *
              </label>
              <input
                type="text"
                required
                value={formData.reporter}
                onChange={(e) => setFormData(prev => ({ ...prev, reporter: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre del usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono/Ext *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ext. 123 o teléfono"
              />
            </div>
          </div>

          {/* Clasificación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(TICKET_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de categorías */}
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
                {allCategories.find(cat => cat.name === formData.category) && (
                  <span className="text-xs text-green-600 ml-2">✓ Color de categoría existente</span>
                )}
              </div>
            </div>
          </div>

          {/* Asignación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Técnico Asignado
            </label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre del técnico (opcional)"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Notas adicionales (opcional)"
            />
          </div>

          {/* Resolución - Solo visible si está resuelto */}
          {(formData.status === 'resolved' || formData.status === 'closed') && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolución *
                </label>
                <textarea
                  required
                  value={formData.resolution}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descripción de la resolución aplicada"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Resolución
                </label>
                <input
                  type="date"
                  value={formData.resolvedAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolvedAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingTicket ? 'Actualizar' : 'Crear'} Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 