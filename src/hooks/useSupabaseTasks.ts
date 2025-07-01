import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { taskToDbTask, dbTaskToTask } from '../types/database';
import type { Task } from '../types/tasks';

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
      const dbTask = taskToDbTask(task);
      
      const { error: insertError } = await supabase
        .from('tasks')
        .insert([dbTask]);

      if (insertError) {
        throw insertError;
      }

      // Refresh tasks to get the latest data
      await refreshTasks();
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err instanceof Error ? err.message : 'Error adding task');
      throw err;
    }
  }, [refreshTasks]);

  // Update an existing task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      
      // Convert Task updates to database format
      const dbUpdates: any = {};
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
        throw updateError;
      }

      // Refresh tasks to get the latest data
      await refreshTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Error updating task');
      throw err;
    }
  }, [refreshTasks]);

  // Delete a task
  const deleteTask = useCallback(async (id: string) => {
    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh tasks to get the latest data
      await refreshTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Error deleting task');
      throw err;
    }
  }, [refreshTasks]);

  // Toggle task completion for a specific date
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

      await updateTask(id, { completedDates: newCompletedDates });
    } catch (err) {
      console.error('Error toggling task completion:', err);
      setError(err instanceof Error ? err.message : 'Error toggling task completion');
      throw err;
    }
  }, [tasks, updateTask]);

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
        (payload) => {
          // Refresh tasks when any change occurs
          refreshTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshTasks]);

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