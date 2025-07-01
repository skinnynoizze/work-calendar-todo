import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { taskToDbTask, dbTaskToTask, type Database } from '../types/database';
import type { Task } from '../types';

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
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Error fetching tasks');
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
      setTimeout(() => setIsLocalUpdate(false), 100);
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err instanceof Error ? err.message : 'Error adding task');
      setIsLocalUpdate(false);
      throw err;
    }
  }, []);

  // Update an existing task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      setIsLocalUpdate(true);
      
      // Guardar estado actual por si necesitamos revertir
      const previousTasks = tasks;
      
      // Actualización optimista: actualizar estado local inmediatamente
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
      
      // Convert Task updates to database format
      const dbUpdates: Partial<Database['public']['Tables']['tasks']['Update']> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.recurrence !== undefined) dbUpdates.recurrence = updates.recurrence;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.completedDates !== undefined) dbUpdates.completed_dates = updates.completedDates;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      
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
      setTimeout(() => setIsLocalUpdate(false), 100);
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Error updating task');
      setIsLocalUpdate(false);
      throw err;
    }
  }, [tasks]);

  // Delete a task
  const deleteTask = useCallback(async (id: string) => {
    try {
      setError(null);
      setIsLocalUpdate(true);

      // Guardar estado actual por si necesitamos revertir
      const previousTasks = tasks;
      
      // Actualización optimista: remover de estado local inmediatamente
      setTasks(prev => prev.filter(t => t.id !== id));
      
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
      setTimeout(() => setIsLocalUpdate(false), 100);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Error deleting task');
      setIsLocalUpdate(false);
      throw err;
    }
  }, [tasks]);

  // Toggle task completion for a specific date with optimistic updates
  const toggleTaskCompletion = useCallback(async (id: string, date: string) => {
    try {
      setError(null);
      
      const task = tasks.find(t => t.id === id);
      if (!task) {
        throw new Error('Task not found');
      }

      const isCompleted = task.completedDates.includes(date);
      const newCompletedDates = isCompleted
        ? task.completedDates.filter(d => d !== date)
        : [...task.completedDates, date];

      // Optimistic update: actualizar estado local inmediatamente
      const updatedTasks = tasks.map(t => 
        t.id === id 
          ? { ...t, completedDates: newCompletedDates }
          : t
      );
      setTasks(updatedTasks);

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
        // Si hay error, revertir el cambio optimista
        setTasks(tasks);
        throw updateError;
      }

      // Resetear flag después de un breve delay
      setTimeout(() => setIsLocalUpdate(false), 100);
    } catch (err) {
      console.error('Error toggling task completion:', err);
      setError(err instanceof Error ? err.message : 'Error toggling task completion');
      throw err;
    }
  }, [tasks]);

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