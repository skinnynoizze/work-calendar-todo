import { useState, useCallback } from 'react';
import { useSupabaseTasks } from './useSupabaseTasks';
import { Task } from '../types';
import { logError } from '../utils/errorUtils';
import { CONFIRMATION_MESSAGES } from '../utils/constants';

/**
 * Hook UI para tasks - encapsula modal state y CRUD handlers
 * 
 * Separa la lógica de UI (modals, handlers) de la lógica de datos (useSupabaseTasks)
 * Incluye: estado de modal, handlers de create/edit/save/delete/toggle, error handling
 * 
 * @example
 * const tasksUI = useTasksUI();
 * return (
 *   <>
 *     <TasksList {...tasksUI} />
 *     <TaskModal {...tasksUI} />
 *   </>
 * );
 * 
 * @returns {object} Datos de tasks + estado de modal + handlers UI
 */
export function useTasksUI() {
  const { 
    tasks, 
    loading, 
    error, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion 
  } = useSupabaseTasks();
  
  // Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // UI handlers que usan los hooks de datos existentes
  const handleCreateTask = useCallback(() => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }, []);

  const handleSaveTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'completedDates'>) => {
    try {
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, taskData);
      } else {
        // Create new task - Supabase generates ID, createdAt, and initializes completedDates
        const newTask = {
          ...taskData,
          completedDates: [],
        };
        await addTask(newTask);
      }
      setIsTaskModalOpen(false);
    } catch (error) {
      logError(error, { operation: 'save-task-ui', metadata: { isEdit: !!editingTask } });
    }
  }, [editingTask, updateTask, addTask]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (confirm(CONFIRMATION_MESSAGES.deleteTask)) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        logError(error, { operation: 'delete-task-ui', taskId });
      }
    }
  }, [deleteTask]);

  const handleToggleTask = useCallback(async (taskId: string, date: string) => {
    try {
      await toggleTaskCompletion(taskId, date);
    } catch (error) {
      logError(error, { operation: 'toggle-task-ui', taskId, metadata: { date } });
    }
  }, [toggleTaskCompletion]);

  const closeTaskModal = useCallback(() => setIsTaskModalOpen(false), []);

  return {
    // Data from supabase hook
    tasks,
    loading,
    error,
    
    // UI state
    isTaskModalOpen,
    editingTask,
    
    // UI handlers
    handleCreateTask,
    handleEditTask,
    handleSaveTask,
    handleDeleteTask,
    handleToggleTask,
    closeTaskModal
  };
} 