require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

async function main() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  data.users.forEach(user => {
    console.log(
      `Email: ${user.email} | display_name: ${user.raw_user_meta_data?.display_name || ''}`
    );
  });
}

main(); 