import { getSupabase } from '../lib/supabase.js';

// Promueve una cuenta existente y confirmada. Nunca crea ni cambia contraseñas.
const userId = process.argv[2];
if (!userId) throw new Error('Uso: npm run admin:grant -- UUID_DEL_USUARIO_SUPABASE');
const client = getSupabase(true);
const { data, error } = await client.auth.admin.getUserById(userId);
if (error || !data.user) throw new Error('No se encontró el usuario en Supabase.');
if (!data.user.email_confirmed_at) throw new Error('Confirma el correo antes de asignar permisos.');
const { error: updateError } = await client.auth.admin.updateUserById(userId, {
  app_metadata: { ...data.user.app_metadata, role: 'admin' },
});
if (updateError) throw new Error('No se pudieron asignar permisos administrativos.');
console.log('Administrador configurado. Cierra sesión y vuelve a entrar.');
