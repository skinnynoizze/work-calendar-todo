import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export interface Technician {
  id: string;
  email: string;
  display_name: string;
}

export function useTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTechnicians() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('No session token');
        const res = await fetch('/.netlify/functions/get-users', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) throw new Error(await res.text());
        const { users } = await res.json();
        setTechnicians(users);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTechnicians();
  }, []);

  return { technicians, loading, error };
} 