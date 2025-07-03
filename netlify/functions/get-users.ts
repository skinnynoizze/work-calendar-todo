import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Tipo para usuario de Supabase Admin API
type SupabaseUser = {
  id: string;
  email: string;
  user_metadata?: { display_name?: string };
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const handler: Handler = async (event) => {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Supabase configuration.' }),
    };
  }

  // Leer el token del header Authorization
  const authHeader = event.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return { statusCode: 401, body: 'Unauthorized: No token provided' };
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  // Verificar el token
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return { statusCode: 401, body: 'Unauthorized: Invalid token' };
  }

  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }
    // Map only necessary fields
    const users = (data.users as SupabaseUser[]).map((user) => ({
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name || '',
    }));
    return {
      statusCode: 200,
      body: JSON.stringify({ users }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};

export { handler }; 