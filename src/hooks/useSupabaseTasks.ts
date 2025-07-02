import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { taskToDbTask, dbTaskToTask, type Database } from '../types/database';
import type { Task } from '../types';
import { logError, createErrorMessage } from '../utils/errorUtils';

interface UseSupabaseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string, date: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export function useSupabaseTasks(): UseSupabaseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocalUpdate, setIsLocalUpdate] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper para resetear el flag de manera segura
  const scheduleLocalUpdateReset = useCallback(() => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Programar nuevo timeout
    timeoutRef.current = setTimeout(() => {
      setIsLocalUpdate(false);
      timeoutRef.current = null;
    }, 100);
     }, []);

  // Cleanup timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Fetch all tasks from Supabase
  const refreshTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const mappedTasks = data?.map(dbTaskToTask) || [];
      setTasks(mappedTasks);
    } catch (err) {
      logError(err, { operation: 'fetch-tasks' });
      setError(createErrorMessage('obtener tareas', err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new task
  const addTask = useCallback(async (task: Task) => {
    try {
      setError(null);
      setIsLocalUpdate(true);
      
      const dbTask = taskToDbTask(task);
      
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert([dbTask])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Actualización optimista: agregar la tarea al estado local
      if (data) {
        const newTask = dbTaskToTask(data);
        setTasks(prev => [newTask, ...prev]);
      }

      // Resetear flag después de un breve delay
      scheduleLocalUpdateReset();
    } catch (err) {
      logError(err, { operation: 'add-task', metadata: { title: task.title } });
      setError(createErrorMessage('crear tarea', err));
      setIsLocalUpdate(false);
      throw err;
    }
  }, [scheduleLocalUpdateReset]);

  // Update an existing task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      setIsLocalUpdate(true);
      
      // Actualización optimista: actualizar estado local inmediatamente
      let previousTasks: Task[] = [];
      setTasks(prev => {
        previousTasks = prev; // Capturar estado actual
        return prev.map(task => 
          task.id === id ? { ...task, ...updates } : task
        );
      });
      
      // Convert Task updates to database format
      const dbUpdates: Partial<Database['public']['Tables']['tasks']['Update']> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description || null;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.recurrence !== undefined) dbUpdates.recurrence = updates.recurrence;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate || null;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.completedDates !== undefined) dbUpdates.completed_dates = updates.completedDates;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.backupRotation !== undefined) dbUpdates.backup_rotation = updates.backupRotation || null;
      
      dbUpdates.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id);

      if (updateError) {
        // Revertir si hay error
        setTasks(previousTasks);
        throw updateError;
      }

      // Resetear flag después de un breve delay
      scheduleLocalUpdateReset();
    } catch (err) {
      logError(err, { operation: 'update-task', taskId: id, metadata: { updates } });
      setError(createErrorMessage('actualizar tarea', err));
      setIsLocalUpdate(false);
      throw err;
    }
  }, [scheduleLocalUpdateReset]); // Dependencia necesaria para el helper

  // Delete a task
  const deleteTask = useCallback(async (id: string) => {
    try {
      setError(null);
      setIsLocalUpdate(true);

      // Actualización optimista: remover de estado local inmediatamente  
      let previousTasks: Task[] = [];
      setTasks(prev => {
        previousTasks = prev; // Capturar estado actual
        return prev.filter(t => t.id !== id);
      });
      
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Revertir si hay error
        setTasks(previousTasks);
        throw deleteError;
      }

      // Resetear flag después de un breve delay
      scheduleLocalUpdateReset();
    } catch (err) {
      logError(err, { operation: 'delete-task', taskId: id });
      setError(createErrorMessage('eliminar tarea', err));
      setIsLocalUpdate(false);
      throw err;
    }
  }, [scheduleLocalUpdateReset]); // Dependencia necesaria para el helper

  // Toggle task completion for a specific date with optimistic updates
  const toggleTaskCompletion = useCallback(async (id: string, date: string) => {
    try {
      setError(null);
      
      // Optimistic update usando functional update para evitar stale closure
      let newCompletedDates: string[] = [];
      setTasks(prev => {
        const task = prev.find(t => t.id === id);
        if (!task) {
          throw new Error('Task not found');
        }

        const isCompleted = task.completedDates.includes(date);
        newCompletedDates = isCompleted
          ? task.completedDates.filter(d => d !== date)
          : [...task.completedDates, date];

        return prev.map(t => 
          t.id === id 
            ? { ...t, completedDates: newCompletedDates }
            : t
        );
      });

      // Marcar como actualización local para evitar doble refresh
      setIsLocalUpdate(true);

      // Actualizar en la base de datos en background
      const dbUpdates: Partial<Database['public']['Tables']['tasks']['Update']> = {
        completed_dates: newCompletedDates,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id);

      if (updateError) {
        // Si hay error, refrescar desde la base de datos para asegurar consistencia
        await refreshTasks();
        throw updateError;
      }

      // Resetear flag después de un breve delay
      scheduleLocalUpdateReset();
    } catch (err) {
      logError(err, { operation: 'toggle-task-completion', taskId: id, metadata: { date } });
      setError(createErrorMessage('actualizar estado de tarea', err));
      throw err;
    }
  }, [scheduleLocalUpdateReset, refreshTasks]); // Dependencias necesarias

  // Load tasks on mount
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  // Set up real-time subscription for tasks
  useEffect(() => {
    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks' 
        }, 
        () => {
          // Solo refresh si no acabamos de hacer una actualización local
          if (!isLocalUpdate) {
            refreshTasks();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshTasks, isLocalUpdate]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    refreshTasks,
  };
} 