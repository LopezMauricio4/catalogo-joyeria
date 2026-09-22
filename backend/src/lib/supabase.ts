import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

export const getSupabase = (admin = false) => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = admin ? process.env.SUPABASE_SERVICE_ROLE_KEY :
    (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) {
    throw Object.assign(new Error('La autenticación no está configurada en el servidor.'), { status: 503 });
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};
